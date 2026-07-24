// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBpKAChVSQXsGJzplgsOb8CvTcXKF2jjvU",
  authDomain: "houts-auth.firebaseapp.com",
  projectId: "houts-auth",
  storageBucket: "houts-auth.firebasestorage.app",
  messagingSenderId: "656004224039",
  appId: "1:656004224039:web:6a3e74279d89372790ea02"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 2. LOCAL AI & CHAT MEMORY ENGINE ---
let aiInstance = null;
let chatSessionInstance = null;
let activeUser = null;
let conversationHistory = [];

function initializeLocalGenAI() {
    const cachedKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY');
    if (!cachedKey) return false;

    try {
        aiInstance = { apiKey: cachedKey };
        chatSessionInstance = {
            model: "deepseek/deepseek-chat",
            systemInstruction: "You are HOUTS, an elite AI web architecture workspace assistant. Generate complete HTML with embedded CSS and JS based on user specifications. Remember previous website designs when the user requests changes."
        };
        return true;
    } catch(err) {
        console.error("Initialization anomaly:", err);
        return false;
    }
}

// --- 3. 4-STEP CUSTOM QUESTIONNAIRE SYSTEM ---
const wizardAnswers = {
    name: '',
    colorScheme: '',
    contact: '',
    businessType: ''
};

let currentQuestionStep = 1;

const questions = [
    {
        title: "🌐 Question 1: Website Name",
        badge: "Question 1 of 4",
        progress: "25%",
        placeholder: "Enter website name...",
        key: "name"
    },
    {
        title: "🎨 Question 2: Colour Scheme",
        badge: "Question 2 of 4",
        progress: "50%",
        placeholder: "Enter preferred colour scheme (e.g. Dark Neon Blue, Emerald Green)...",
        key: "colorScheme"
    },
    {
        title: "📍 Question 3: Contact / Address",
        badge: "Question 3 of 4",
        progress: "75%",
        placeholder: "Enter contact email, phone number, or physical address...",
        key: "contact"
    },
    {
        title: "💼 Question 4: What website/business is it?",
        badge: "Question 4 of 4",
        progress: "100%",
        placeholder: "Describe the business or website purpose...",
        key: "businessType"
    }
];

function renderWizardQuestion() {
    const qData = questions[currentQuestionStep - 1];
    const fill = document.getElementById('wizard-progress-fill');
    const title = document.getElementById('wizard-step-title');
    const badge = document.getElementById('wizard-step-badge');
    const content = document.getElementById('wizard-step-content');
    const submitBtn = document.getElementById('wizard-btn-submit');

    if (!content) return;

    fill.style.width = qData.progress;
    title.innerText = qData.title;
    badge.innerText = qData.badge;

    content.innerHTML = `
        <div class="wizard-input-group">
            <input type="text" id="wizard-active-input" class="wizard-text-input" placeholder="${qData.placeholder}" value="${wizardAnswers[qData.key]}" autofocus />
        </div>
    `;

    submitBtn.innerHTML = currentQuestionStep === 4 
        ? `<span>Generate Website</span> <span>⚡</span>` 
        : `<span>Continue</span> <span>→</span>`;

    const activeInput = document.getElementById('wizard-active-input');
    activeInput.focus();
    activeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleNextQuestion();
    });
}

function handleNextQuestion() {
    const activeInput = document.getElementById('wizard-active-input');
    if (activeInput) {
        wizardAnswers[questions[currentQuestionStep - 1].key] = activeInput.value.trim();
    }

    if (currentQuestionStep < 4) {
        currentQuestionStep++;
        renderWizardQuestion();
    } else {
        const wizardBox = document.getElementById('wizard-box');
        if (wizardBox) wizardBox.style.display = 'none';

        const basePrompt = `Website Name: ${wizardAnswers.name || 'Custom Site'}. Colour Scheme: ${wizardAnswers.colorScheme || 'Modern Dark'}. Contact/Address Info: ${wizardAnswers.contact || 'N/A'}. Business Type & Purpose: ${wizardAnswers.businessType || 'General Business'}.`;
        
        executeSecureChatPipeline(basePrompt);
    }
}

// --- 4. SECURE CHAT PIPELINE & FIRESTORE SAVE ---
window.executeSecureChatPipeline = async function(userPromptText) {
    const chatContainer = document.getElementById('chat-messages');

    // INJECT MANDATORY ANIMATION PROMPT AT START
    const formattedUserPrompt = `super animated and very interactive layout and animations ${userPromptText}`;

    appendMessageRow(chatContainer, formattedUserPrompt, 'user');
    conversationHistory.push({ role: 'user', content: formattedUserPrompt });

    if (!chatSessionInstance && !initializeLocalGenAI()) {
        appendMessageRow(chatContainer, "<strong>System Action Required:</strong> No API key detected. Please open Account Settings and save your API Key to activate AI.", "ai");
        scrollToBottom();
        return;
    }

    const loaderId = appendAiLoader(chatContainer);
    scrollToBottom();

    const tailoredSystemPrompt = formattedUserPrompt + " (CRITICAL: Return ONLY valid HTML with embedded CSS and JavaScript inside <style> and <script> tags. Provide super animated and very interactive layout and animations. Do not explain the code or wrap in markdown blocks.)";

    const apiMessages = [
        { role: "system", content: chatSessionInstance.systemInstruction },
        ...conversationHistory.map(m => ({ role: m.role, content: m.content }))
    ];
    apiMessages[apiMessages.length - 1].content = tailoredSystemPrompt;

    try {
        const responseJson = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${aiInstance.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: chatSessionInstance.model,
                messages: apiMessages
            })
        });

        const data = await responseJson.json();
        removeAiLoader(loaderId);

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            let rawCode = data.choices[0].message.content.trim();
            rawCode = rawCode.replace(/^```html\s*/i, '').replace(/```$/, '');

            const codeBlob = new Blob([rawCode], { type: 'text/html' });
            const liveHostedUrl = URL.createObjectURL(codeBlob);

            const aiResponseHtml = `
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box;">
                    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #fff; font-size: 1rem;">🌐 Website Generated / Updated!</p>
                    <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #a1a1aa;">Super animated layout compiled with responsive interaction components.</p>
                    <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.75rem 1.5rem; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">Open Live Preview</a>
                </div>
            `;

            appendMessageRow(chatContainer, aiResponseHtml, 'ai');
            conversationHistory.push({ role: 'assistant', content: rawCode });

            if (activeUser) {
                db.collection('chats').doc(activeUser.uid).set({
                    history: conversationHistory,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        } else {
            appendMessageRow(chatContainer, "Payload error receiving AI code output.", 'ai');
        }

    } catch (chatError) {
        console.error("Chat error:", chatError);
        removeAiLoader(loaderId);
        appendMessageRow(chatContainer, "An exception occurred connecting to the runtime engine.", 'ai');
    }

    scrollToBottom();
};

// --- 5. UI HELPERS ---
function appendMessageRow(container, content, sender = 'user') {
    if (!container) return;
    const row = document.createElement('div');
    row.className = `message-row ${sender}-msg`;
    row.style.cssText = "display: flex; gap: 1.25rem; width: 100%; margin-bottom: 1.5rem;";

    const avatarHtml = sender === 'user' 
        ? '<div style="width:36px; height:36px; border-radius:50%; background:#6366f1; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; flex-shrink:0;">U</div>' 
        : '<div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #a855f7); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; flex-shrink:0;">H</div>';

    row.innerHTML = `
        ${avatarHtml}
        <div class="message-bubble" style="max-width:85%; font-size:1rem; line-height:1.6; color:#f4f4f5;">${content}</div>
    `;
    container.appendChild(row);
}

function appendAiLoader(container) {
    const row = document.createElement('div');
    const id = 'loader-' + Date.now();
    row.id = id;
    row.className = 'message-row ai-msg';
    row.style.cssText = "display: flex; gap: 1.25rem; width: 100%; margin-bottom: 1.5rem;";

    row.innerHTML = `
        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #a855f7); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; flex-shrink:0;">H</div>
        <div style="color:#818cf8; font-weight:600; font-size:0.95rem; display:flex; align-items:center; gap:0.5rem;">
            <span>⚡ HOUTS Architecture Engine Compiling...</span>
        </div>
    `;
    container.appendChild(row);
    return id;
}

function removeAiLoader(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// --- 6. INITIALIZATION & AUTH HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeLocalGenAI();
    renderWizardQuestion();

    const submitBtn = document.getElementById('wizard-btn-submit');
    if (submitBtn) submitBtn.addEventListener('click', handleNextQuestion);

    const textarea = document.getElementById('chat-textarea');
    const sendBtn = document.getElementById('chat-send-btn');

    if (sendBtn && textarea) {
        const sendMsg = () => {
            const txt = textarea.value.trim();
            if (!txt) return;
            textarea.value = '';
            executeSecureChatPipeline(txt);
        };

        sendBtn.addEventListener('click', sendMsg);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMsg();
            }
        });
    }

    // Auto load persistent chat memory from Firestore
    auth.onAuthStateChanged(user => {
        activeUser = user;
        if (user) {
            db.collection('chats').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().history) {
                    conversationHistory = doc.data().history;
                    const wizardBox = document.getElementById('wizard-box');
                    if (wizardBox) wizardBox.style.display = 'none';

                    const chatContainer = document.getElementById('chat-messages');
                    if (chatContainer) {
                        chatContainer.innerHTML = '';
                        conversationHistory.forEach(m => {
                            if (m.role === 'user') {
                                appendMessageRow(chatContainer, m.content, 'user');
                            } else {
                                const codeBlob = new Blob([m.content], { type: 'text/html' });
                                const liveHostedUrl = URL.createObjectURL(codeBlob);
                                const restoredHtml = `
                                    <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px;">
                                        <p style="margin:0 0 1rem 0; font-weight:600; color:#fff;">🌐 Saved Website Session Restored!</p>
                                        <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:0.6rem 1.2rem; background:#6366f1; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">Open Live Preview</a>
                                    </div>
                                `;
                                appendMessageRow(chatContainer, restoredHtml, 'ai');
                            }
                        });
                        scrollToBottom();
                    }
                }
            });
        }
    });
});
