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

// --- 2. LOCAL ENVIRONMENT MANAGEMENT ENGINE ---
let aiInstance = null;
let chatSessionInstance = null;
let currentChatId = null;
let currentMessageHistory = [];

window.startNewChat = function(e) {
    if(e) e.preventDefault();
    currentChatId = null;
    currentMessageHistory = [];
    const container = document.getElementById('chat-messages');
    if(container) container.innerHTML = '';
    
    // Hide save button on fresh blank chats
    const saveBtn = document.getElementById('save-chat-btn');
    if(saveBtn) saveBtn.style.display = 'none';

    console.log("New chat session started.");
};

window.restoreChatUI = function() {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    container.innerHTML = '';
    
    currentMessageHistory.forEach(msg => {
        if (msg.role === 'user') {
            appendMessageRow(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            const codeBlob = new Blob([msg.content], { type: 'text/html' });
            const liveHostedUrl = URL.createObjectURL(codeBlob);
            const actionHtml = `
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box; position: relative; z-index: 10;">
                    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #fff; font-size: 1rem;">🌐 Website Generated Successfully!</p>
                    <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #a1a1aa; line-height: 1.4;">HOUTS has compiled your application layout into an isolated sandboxed runtime layer.</p>
                    <div style="width: 100%; height: 44px; position: relative; z-index: 20; cursor: pointer; box-sizing: border-box;">
                        <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%; line-height: 44px; text-align: center; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; position: absolute; top: 0; left: 0; pointer-events: auto; WebkitTapHighlightColor: transparent;">Open Live Preview</a>
                    </div>
                </div>
            `;
            appendMessageRow(actionHtml, 'ai');
        }
    });
    
    // Show save button since a loaded history contains elements
    const saveBtn = document.getElementById('save-chat-btn');
    if(saveBtn) saveBtn.style.display = 'inline-flex';

    if (typeof scrollToBottom === 'function') scrollToBottom();
};

// --- MANUAL WEBSITE SAVING & ACCOUNT SETTINGS MANAGEMENT ---
window.saveCurrentChat = async function() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save your website.");
        return;
    }
    if (!currentMessageHistory || currentMessageHistory.length === 0) {
        alert("There is no website content generated to save yet.");
        return;
    }

    const firstUserMsg = currentMessageHistory.find(m => m.role === 'user');
    const websiteTitle = firstUserMsg ? firstUserMsg.content.substring(0, 35) + (firstUserMsg.content.length > 35 ? '...' : '') : 'My Saved Website';

    const saveBtn = document.getElementById("save-chat-btn");
    if(saveBtn) saveBtn.innerHTML = "💾 Saving...";

    try {
        if (!currentChatId) {
            currentChatId = db.collection('saved_websites').doc().id;
        }

        const websitePayload = {
            userId: user.uid,
            title: websiteTitle,
            chatHistory: currentMessageHistory,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('saved_websites').doc(currentChatId).set(websitePayload, { merge: true });

        if(saveBtn) {
            saveBtn.innerHTML = "✅ Saved!";
            setTimeout(() => {
                saveBtn.innerHTML = "💾 Save Website";
            }, 2500);
        }
    } catch (err) {
        console.error("Website database save error:", err);
        if(saveBtn) saveBtn.innerHTML = "💾 Save Website";
        alert("Failed to save website to your account.");
    }
};

function initializeLocalGenAI() {
    const cachedKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY');
    if (!cachedKey) return false;

    try {
        aiInstance = { apiKey: cachedKey };
        chatSessionInstance = {
            model: "deepseek/deepseek-chat",
            systemInstruction: "You are HOUTS, an elite AI architecture workspace assistant. Help users structure clean digital web layouts."
        };
        return true;
    } catch(err) {
        console.error("Initialization anomaly:", err);
        return false;
    }
}

window.executeSecureChatPipeline = async function(userPromptText) {
    if (typeof appendMessageRow !== 'function' || typeof appendAiLoader !== 'function') {
        return;
    }

    appendMessageRow(userPromptText, 'user');

    if (!chatSessionInstance && !initializeLocalGenAI()) {
        appendMessageRow("<strong>System Action Required:</strong> No API key detected. Please open your Account Settings dashboard on this layout screen and save your Gemini API Key directly to this device's memory to activate the interface securely.", "ai");
        if (typeof scrollToBottom === 'function') scrollToBottom();
        return;
    }
    
    currentMessageHistory.push({ role: "user", content: userPromptText });
    
    const liveLoaderTrackingId = appendAiLoader();
    if (typeof scrollToBottom === 'function') scrollToBottom();

    try {
        const systemPromptOverride = chatSessionInstance.systemInstruction + " CRITICAL: Always return ONLY valid HTML with embedded CSS/JS inside <style> and <script> tags. Do not explain the code, do not use markdown code blocks, do not include any conversational text.";
        
        const payloadMessages = [
            { role: "system", content: systemPromptOverride },
            ...currentMessageHistory
        ];

        const responseJson = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${aiInstance.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: chatSessionInstance.model,
                messages: payloadMessages
            })
        });

        const data = await responseJson.json();
        
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            let rawCode = data.choices[0].message.content.trim();
            rawCode = rawCode.replace(/^```html\s*/i, '');
            rawCode = rawCode.replace(/```$/, '');
            
            currentMessageHistory.push({ role: "assistant", content: rawCode });
            
            const saveBtn = document.getElementById('save-chat-btn');
            if (saveBtn) {
                saveBtn.style.display = 'inline-flex';
            }
            
            const codeBlob = new Blob([rawCode], { type: 'text/html' });
            const liveHostedUrl = URL.createObjectURL(codeBlob);
            
            const actionHtml = `
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box; position: relative; z-index: 10;">
                    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #fff; font-size: 1rem;">🌐 Website Generated Successfully!</p>
                    <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #a1a1aa; line-height: 1.4;">HOUTS has compiled your application layout into an isolated sandboxed runtime layer.</p>
                    <div style="width: 100%; height: 44px; position: relative; z-index: 20; cursor: pointer; box-sizing: border-box;">
                        <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%; line-height: 44px; text-align: center; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; position: absolute; top: 0; left: 0; pointer-events: auto; WebkitTapHighlightColor: transparent;">Open Live Preview</a>
                    </div>
                </div>
            `;
            appendMessageRow(actionHtml, 'ai');
        } else {
            appendMessageRow("I didn't receive a valid text stream payload.", 'ai');
        }

    } catch (chatError) {
        console.error("Direct connection framework issue:", chatError);
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);
        appendMessageRow("An engineering exception occurred connecting to the runtime.", 'ai');
    }

    if (typeof scrollToBottom === 'function') scrollToBottom();
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    initializeLocalGenAI();
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlSiteId = urlParams.get('site');
    if (urlSiteId) {
        auth.onAuthStateChanged(user => {
            if(user) {
                db.collection('saved_websites').doc(urlSiteId).get().then(doc => {
                    if(doc.exists && doc.data().userId === user.uid) {
                        currentChatId = doc.id;
                        currentMessageHistory = doc.data().chatHistory || [];
                        if (typeof window.restoreChatUI === 'function') {
                            window.restoreChatUI();
                        }
                    }
                });
            }
        });
    }

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    const injectModalHTML = () => {
        if (document.getElementById('auth-modal-overlay')) return;

        const styleTag = document.createElement('style');
        styleTag.id = 'modal-standalone-design';
        styleTag.innerHTML = `
            #auth-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(5, 5, 6, 0.85); backdrop-filter: blur(24px);
                z-index: 999999; display: flex; justify-content: center; align-items: center;
                opacity: 0; pointer-events: none; transition: opacity 0.3s ease; box-sizing: border-box;
            }
            #auth-modal-overlay.active { opacity: 1; pointer-events: auto; }
            .modal-login-card {
                background: #121215; border: 1px solid rgba(255, 255, 255, 0.08);
                width: 90%; max-width: 400px; border-radius: 16px; padding: 2.5rem 2rem;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6); color: #ffffff; box-sizing: border-box;
            }
            .modal-dashboard-layout {
                display: flex; flex-direction: column; width: 90%; max-width: 650px;
                max-height: 85vh; background: #121215; border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px; padding: 2rem; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
                color: #ffffff; box-sizing: border-box; overflow-y: auto;
            }
            .modal-close-x {
                background: none; border: none; color: #a1a1aa; font-size: 1.5rem; cursor: pointer;
            }
            .modal-close-x:hover { color: #fff; }
        `;
        document.head.appendChild(styleTag);

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        document.body.appendChild(overlay);
    };

    injectModalHTML();

    function showAuthModal(type, user) {
        const overlay = document.getElementById('auth-modal-overlay');
        if (!overlay) return;

        if (type === 'account' && user) {
            overlay.innerHTML = `
                <div class="modal-dashboard-layout">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="font-size: 1.25rem; font-weight: 700;">Account Settings & Saved Websites</h2>
                        <button class="modal-close-x" id="modal-exit-btn">&times;</button>
                    </div>
                    <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: #a1a1aa;">
                        Signed in as: <strong style="color: #fff;">${user.email}</strong>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: #a1a1aa;">Gemini API Key</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="password" id="modal-apikey-input" placeholder="Enter your Gemini/OpenRouter API key" value="${localStorage.getItem('HOUTS_SECURE_GEMINI_KEY') || ''}" style="flex: 1; background: #0a0a0c; border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1rem; border-radius: 8px; color: #fff; font-size: 0.9rem;">
                            <button id="modal-save-key-btn" style="background: var(--primary); color: #fff; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Save</button>
                        </div>
                    </div>

                    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Your Saved Websites</h3>
                    <div id="modal-saved-websites-list" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; border: 1px solid rgba(255,255,255,0.08); padding: 0.75rem; border-radius: 8px; background: #0a0a0c;">
                        <p style="color: #71717a; text-align: center; padding: 1rem;">Loading saved websites...</p>
                    </div>
                </div>
            `;

            overlay.classList.add('active');

            document.getElementById('modal-exit-btn').onclick = () => overlay.classList.remove('active');
            document.getElementById('modal-save-key-btn').onclick = () => {
                const keyVal = document.getElementById('modal-apikey-input').value.trim();
                if(keyVal) {
                    localStorage.setItem('HOUTS_SECURE_GEMINI_KEY', keyVal);
                    initializeLocalGenAI();
                    alert("API Key saved successfully to your device!");
                }
            };

            // Fetch saved websites
            db.collection('saved_websites').where('userId', '==', user.uid).get().then(snapshot => {
                const listContainer = document.getElementById('modal-saved-websites-list');
                if (!listContainer) return;

                if (snapshot.empty) {
                    listContainer.innerHTML = `<p style="color: #71717a; text-align: center; padding: 1rem;">No saved websites found yet.</p>`;
                    return;
                }

                listContainer.innerHTML = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const item = document.createElement('div');
                    item.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: #18181c; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);`;
                    item.innerHTML = `
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">${escapeHtml(data.title || 'Untitled Website')}</div>
                            <div style="font-size: 0.75rem; color: #71717a;">ID: ${doc.id}</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="load-site-btn" data-id="${doc.id}" style="background: var(--primary); color: #fff; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Edit / View</button>
                            <button class="delete-site-btn" data-id="${doc.id}" style="background: #ef4444; color: #fff; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Delete</button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });

                listContainer.querySelectorAll('.load-site-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const siteId = e.target.getAttribute('data-id');
                        window.location.href = `create.html?site=${siteId}`;
                    };
                });

                listContainer.querySelectorAll('.delete-site-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const siteId = e.target.getAttribute('data-id');
                        if (confirm("Are you sure you want to delete this saved website?")) {
                            db.collection('saved_websites').doc(siteId).delete().then(() => {
                                e.target.closest('div').parentElement.remove();
                            });
                        }
                    };
                });
            });
        }
    }

    function setupAuthListeners() {
        const overlay = document.getElementById('auth-modal-overlay');
        if (!overlay) return;

        document.querySelectorAll('a[href="#login"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.innerHTML = `
                    <div class="modal-login-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                            <h3 style="margin:0;">Welcome Back</h3>
                            <button class="modal-close-x" id="modal-exit-btn">&times;</button>
                        </div>
                        <p>Sign in to manage and edit your saved websites.</p>
                        <form id="login-form">
                            <input type="email" id="login-email" placeholder="Email address" required style="width:100%; padding:0.75rem; margin-bottom:1rem; background:#0a0a0c; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;">
                            <input type="password" id="login-password" placeholder="Password" required style="width:100%; padding:0.75rem; margin-bottom:1.5rem; background:#0a0a0c; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;">
                            <button type="submit" style="width:100%; background:var(--primary); color:#fff; padding:0.75rem; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Sign In</button>
                        </form>
                    </div>
                `;
                overlay.classList.add('active');
                document.getElementById('modal-exit-btn').onclick = () => overlay.classList.remove('active');
                document.getElementById('login-form').onsubmit = (ev) => {
                    ev.preventDefault();
                    const email = document.getElementById('login-email').value;
                    const pass = document.getElementById('login-password').value;
                    auth.signInWithEmailAndPassword(email, pass).then(() => {
                        overlay.classList.remove('active');
                        window.location.reload();
                    }).catch(err => alert(err.message));
                };
            });
        });

        document.querySelectorAll('a[href="#signup"], .nav-cta-btn').forEach(link => {
            link.addEventListener('click', (e) => {
                if(link.getAttribute('href') === '#signup' || link.classList.contains('nav-cta-btn')) {
                    e.preventDefault();
                    overlay.innerHTML = `
                        <div class="modal-login-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                                <h3 style="margin:0;">Get Started</h3>
                                <button class="modal-close-x" id="modal-exit-btn">&times;</button>
                            </div>
                            <p>Create an account to begin saving and building websites.</p>
                            <form id="signup-form">
                                <input type="email" id="signup-email" placeholder="Email address" required style="width:100%; padding:0.75rem; margin-bottom:1rem; background:#0a0a0c; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;">
                                <input type="password" id="signup-password" placeholder="Password (6+ chars)" required style="width:100%; padding:0.75rem; margin-bottom:1.5rem; background:#0a0a0c; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;">
                                <button type="submit" style="width:100%; background:var(--primary); color:#fff; padding:0.75rem; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Create Account</button>
                            </form>
                        </div>
                    `;
                    overlay.classList.add('active');
                    document.getElementById('modal-exit-btn').onclick = () => overlay.classList.remove('active');
                    document.getElementById('signup-form').onsubmit = (ev) => {
                        ev.preventDefault();
                        const email = document.getElementById('signup-email').value;
                        const pass = document.getElementById('signup-password').value;
                        auth.createUserWithEmailAndPassword(email, pass).then(() => {
                            overlay.classList.remove('active');
                            window.location.reload();
                        }).catch(err => alert(err.message));
                    };
                }
            });
        });
    }

    auth.onAuthStateChanged(user => {
        const navMenuContainer = document.querySelector('.nav-menu');
        if (!navMenuContainer) return;

        const existingSettings = document.getElementById('settings-menu-btn');
        const existingLogout = document.getElementById('logout-btn');
        if (existingSettings) existingSettings.remove();
        if (existingLogout) existingLogout.remove();

        const loginBtn = navMenuContainer.querySelector('.auth-link-login');
        const signupBtn = navMenuContainer.querySelector('.nav-cta-btn');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';

            const settingsBtn = document.createElement('a');
            settingsBtn.id = 'settings-menu-btn';
            settingsBtn.href = '#';
            settingsBtn.className = 'nav-link';
            settingsBtn.textContent = 'Account Settings';
            settingsBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                showAuthModal('account', user); 
            });
            navMenuContainer.appendChild(settingsBtn);

            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-btn';
            logoutBtn.href = '#';
            logoutBtn.className = 'nav-link';
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.color = '#ef4444';
            logoutBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                auth.signOut().then(() => window.location.reload()); 
            });
            navMenuContainer.appendChild(logoutBtn);
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            setupAuthListeners();
        }
    });
});

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
