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

// --- 2. LOCAL ENVIRONMENT MANAGEMENT ENGINE (OPENROUTER DEEPSEEK) ---
let activeOpenRouterApiKey = null;
let chatHistoryArray = []; // Tracks chat history for conversational flow

function initializeLocalOpenRouter() {
    const cachedKey = localStorage.getItem('HOUTS_SECURE_OPENROUTER_KEY') || localStorage.getItem('HOUTS_SECURE_GROQ_KEY');
    if (!cachedKey || cachedKey.trim() === "") {
        activeOpenRouterApiKey = null;
        chatHistoryArray = [];
        return false;
    }

    // Sanitize the key string cleanly
    activeOpenRouterApiKey = cachedKey.trim().replace(/[\n\r\t\s]/g, "");
    
    // Seed system instruction if history is fresh
    if (chatHistoryArray.length === 0) {
        chatHistoryArray.push({
            role: "system",
            content: "You are HOUTS, an elite UI/UX web architect. Build a highly responsive, modern, premium website based on user description. CRITICAL DESIGN STYLES: 1. Use clean CSS layout utilities (Flexbox/Grid), gorgeous typography, and balanced spacing. 2. Elements must have soft shadows and subtle borders to look cohesive. 3. Return ONLY valid, complete HTML with embedded CSS/JS inside <style> and <script> tags. Do not explain the code, do not use markdown code blocks, do not include any conversational text."
        });
    }
    return true;
}

window.executeSecureChatPipeline = async function(userPromptText) {
    if (typeof appendMessageRow !== 'function' || typeof appendAiLoader !== 'function') {
        return;
    }

    appendMessageRow(userPromptText, 'user');

    if (!activeOpenRouterApiKey && !initializeLocalOpenRouter()) {
        appendMessageRow("<strong>Workspace Setup Required:</strong> It looks like your OpenRouter API Key isn't configured yet. Please open your <strong>Account Settings</strong> dashboard, head over to the system settings tab, and provide your secure OpenRouter key.", "ai");
        if (typeof scrollToBottom === 'function') scrollToBottom();
        return;
    }
    
    const liveLoaderTrackingId = appendAiLoader();
    if (typeof scrollToBottom === 'function') scrollToBottom();

    chatHistoryArray.push({
        role: "user",
        content: userPromptText
    });

    try {
        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${activeOpenRouterApiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "HOUTS Workspace"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat:free", // Targets completely free DeepSeek V3 engine
                messages: chatHistoryArray,
                temperature: 0.3,
                max_tokens: 4096
            })
        });

        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);

        if (!apiResponse.ok) {
            const errorPayload = await apiResponse.json().catch(() => ({}));
            throw new Error(errorPayload?.error?.message || `HTTP Status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        const rawContent = data?.choices?.[0]?.message?.content;

        if (rawContent) {
            chatHistoryArray.push({
                role: "assistant",
                content: rawContent
            });

            let rawCode = rawContent.trim();
            rawCode = rawCode.replace(/^```html\s*/i, '');
            rawCode = rawCode.replace(/```$/, '');
            
            const codeBlob = new Blob([rawCode], { type: 'text/html' });
            const liveHostedUrl = URL.createObjectURL(codeBlob);
            
            const actionHtml = `
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box; position: relative; z-index: 10;">
                    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #fff; font-size: 1rem;">🌐 Website Generated Successfully!</p>
                    <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #a1a1aa; line-height: 1.4;">DeepSeek-V3 has successfully compiled a brand-new cohesive architecture layout template.</p>
                    <div style="width: 100%; height: 44px; position: relative; z-index: 20; cursor: pointer; box-sizing: border-box;">
                        <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%; line-height: 44px; text-align: center; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; position: absolute; top: 0; left: 0; pointer-events: auto;">Open Live Preview</a>
                    </div>
                </div>
            `;
            appendMessageRow(actionHtml, 'ai');
            if (typeof triggerConfetti === 'function') triggerConfetti();
            if (typeof showToast === 'function') showToast("🎉 Architecture Canvas Compiled!", true);
        } else {
            appendMessageRow("The DeepSeek engine responded successfully but returned an empty canvas.", 'ai');
        }

    } catch (chatError) {
        console.error("OpenRouter Gateway Exception:", chatError);
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);
        
        const rawErrorString = chatError.toString().toLowerCase();
        if (rawErrorString.includes("rate_limit") || rawErrorString.includes("quota") || rawErrorString.includes("429")) {
            appendMessageRow("⚠️ OpenRouter Free Tier Limit reached. Please try again shortly.", 'ai');
        } else if (rawErrorString.includes("invalid") || rawErrorString.includes("authentication") || rawErrorString.includes("401")) {
            appendMessageRow("🔑 Authentication Refused. Check your API key inside settings.", 'ai');
        } else {
            appendMessageRow(`🌐 Edge Network Routing Issue: ${chatError.message || "Unknown error"}`, 'ai');
        }
    }

    if (typeof scrollToBottom === 'function') scrollToBottom();
};

document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    initializeLocalOpenRouter();

    // Injects the dynamic toast/confetti system rules cleanly if missing
    const injectAnimationStyles = () => {
        if (document.getElementById('houts-animation-styles')) return;
        const style = document.createElement('style');
        style.id = 'houts-animation-styles';
        style.innerHTML = `
            .houts-toast {
                position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-20px);
                background: #121215; border: 1px solid #6366f1; color: #ffffff;
                padding: 1rem 2rem; border-radius: 12px; font-weight: 600; font-size: 1rem;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 9999999;
                opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex; align-items: center; gap: 0.5rem; pointer-events: none;
            }
            :root.light-mode .houts-toast {
                background: #ffffff; border: 1px solid #6366f1; color: #121215;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            .houts-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
            .confetti-particle {
                position: fixed; width: 10px; height: 10px; z-index: 9999998;
                animation: confetti-fall 2.5s ease-out forwards; pointer-events: none;
            }
            @keyframes confetti-fall {
                0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    };
    injectAnimationStyles();

    window.triggerConfetti = function() {
        const colors = ['#6366f1', '#818cf8', '#34d399', '#fbbf24', '#f87171'];
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '-10px';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 3000);
        }
    };

    window.showToast = function(message, hasConfetti = false) {
        const toast = document.createElement('div');
        toast.className = 'houts-toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        if (hasConfetti) window.triggerConfetti();

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    };

    // Mobile Navigation
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

    // Modal Inserter Engine - Safe bindings matching style.css native layout tags
    const injectModalHTML = () => {
        if (document.getElementById('auth-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        overlay.className = 'modal-overlay'; 
        overlay.innerHTML = `<div class="settings-modal" id="modal-container-anchor"></div>`;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModalPipeline();
        });
    };

    const closeModalPipeline = () => {
        const overlay = document.getElementById('auth-modal-overlay');
        if (overlay) overlay.classList.remove('active');
    };

    window.showAuthModal = function(type, activeUser = null) {
        injectModalHTML();
        const overlay = document.getElementById('auth-modal-overlay');
        const container = document.getElementById('modal-container-anchor');
        if (!overlay || !container) return;

        if (type === 'login' || type === 'signup') {
            container.innerHTML = `
                <button class="close-modal-btn" onclick="closeModalPipeline()">✕</button>
                <h3 class="modal-title">${type === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                <p class="modal-subtitle" style="margin-bottom:1.5rem; font-size:0.9rem; color:var(--text-secondary);">${type === 'login' ? 'Sign in to access your digital architect workspace.' : 'Start engineering professional layouts in minutes.'}</p>
                <form id="modal-auth-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                    <div class="input-group">
                        <label class="input-label">Email Address</label>
                        <input type="email" id="modal-email" class="form-input" required placeholder="name@domain.com">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Password</label>
                        <input type="password" id="modal-password" class="form-input" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="save-settings-btn" style="width:100%; justify-content:center; margin-top:0.5rem;">${type === 'login' ? 'Sign In' : 'Register'}</button>
                </form>
                <p style="margin: 1.5rem 0 0 0; font-size: 0.85rem; text-align: center; color:var(--text-secondary);">
                    ${type === 'login' ? "Don't have an account? <a href='#' id='switch-to-signup' style='color:var(--primary); text-decoration:none; font-weight:600;'>Sign up</a>" : "Already have an account? <a href='#' id='switch-to-login' style='color:var(--primary); text-decoration:none; font-weight:600;'>Log in</a>"}
                </p>
            `;

            document.getElementById('switch-to-signup')?.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
            document.getElementById('switch-to-login')?.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });

            document.getElementById('modal-auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('modal-email').value;
                const password = document.getElementById('modal-password').value;

                const authAction = type === 'login' 
                    ? auth.signInWithEmailAndPassword(email, password)
                    : auth.createUserWithEmailAndPassword(email, password);

                authAction.then(() => {
                    closeModalPipeline();
                    window.showToast(type === 'login' ? '🔒 Session authenticated cleanly.' : '🎉 Welcome to HOUTS!', true);
                }).catch(err => {
                    alert(err.message);
                });
            });
        } else if (type === 'account' && activeUser) {
            container.innerHTML = `
                <button class="close-modal-btn" onclick="closeModalPipeline()">✕</button>
                <div class="modal-layout-wrapper">
                    <aside class="tabs-navigation">
                        <button class="tab-nav-link active" id="tab-btn-profile">👤 Profile</button>
                        <button class="tab-nav-link" id="tab-btn-sys">⚙️ Engine Config</button>
                    </aside>
                    <main class="modal-content-area">
                        <div id="pane-profile" class="tab-pane active">
                            <h3 class="modal-title">Account Profile</h3>
                            <p class="modal-subtitle">Manage your linked user profiles and authentication nodes.</p>
                            <div class="info-block" style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border); margin-top:1rem; font-size:0.9rem; line-height:1.6; color:var(--text-secondary);">
                                <strong>Authenticated Email:</strong><br>${activeUser.email}<br><br>
                                <strong>Workspace Access Tier:</strong><br>Developer Sandbox (Unlimited local compilation)
                            </div>
                        </div>
                        <div id="pane-sys" class="tab-pane">
                            <h3 class="modal-title">Architecture Config</h3>
                            <p class="modal-subtitle">Configure routing components and endpoint authentication parameters.</p>
                            <div class="info-block" style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border); margin:1rem 0; font-size:0.9rem; color:var(--text-secondary);">
                                <strong>Active Layout LLM Proxy Node:</strong><br>OpenRouter Edge Gateway running DeepSeek-V3
                            </div>
                            <div class="input-group">
                                <label class="input-label">Secure OpenRouter API Key</label>
                                <input type="password" id="sys-groq-key" class="form-input" placeholder="sk-or-v1-••••••••">
                            </div>
                            <button class="save-settings-btn" id="save-sys-settings" style="margin-top:1.25rem;">Save Engine Variables</button>
                        </div>
                    </main>
                </div>
            `;

            const keyInput = document.getElementById('sys-groq-key');
            if (keyInput) {
                keyInput.value = localStorage.getItem('HOUTS_SECURE_OPENROUTER_KEY') || localStorage.getItem('HOUTS_SECURE_GROQ_KEY') || '';
            }

            const pBtn = document.getElementById('tab-btn-profile');
            const sBtn = document.getElementById('tab-btn-sys');
            const pPane = document.getElementById('pane-profile');
            const sPane = document.getElementById('pane-sys');

            pBtn?.addEventListener('click', () => {
                pBtn.classList.add('active'); sBtn?.classList.remove('active');
                pPane?.classList.add('active'); sPane?.classList.remove('active');
            });
            sBtn?.addEventListener('click', () => {
                sBtn.classList.add('active'); pBtn?.classList.remove('active');
                sPane?.classList.add('active'); pPane?.classList.remove('active');
            });

            document.getElementById('save-sys-settings')?.addEventListener('click', () => {
                const updatedVal = keyInput.value.trim();
                localStorage.setItem('HOUTS_SECURE_OPENROUTER_KEY', updatedVal);
                localStorage.setItem('HOUTS_SECURE_GROQ_KEY', updatedVal); 
                initializeLocalOpenRouter();
                window.showToast("⚡ Environment variables compiled and loaded successfully.", true);
                closeModalPipeline();
            });
        }

        overlay.classList.add('active');
    };

    const setupAuthListeners = () => {
        document.querySelectorAll('.auth-link-login').forEach(el => {
            el.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
        });
        document.querySelectorAll('.nav-cta-btn').forEach(el => {
            if (el.id !== 'dashboard-action-trigger') {
                el.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
            }
        });
    };
    setupAuthListeners();

    auth.onAuthStateChanged((user) => {
        const navMenuContainer = document.querySelector('.nav-menu');
        if (!navMenuContainer) return;

        document.getElementById('settings-menu-btn')?.remove();
        document.getElementById('logout-btn')?.remove();

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
            settingsBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('account', user); });
            navMenuContainer.insertBefore(settingsBtn, navMenuContainer.firstChild);

            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-btn';
            logoutBtn.href = '#';
            logoutBtn.className = 'nav-link';
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.color = '#ef4444';
            logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut().then(() => window.location.reload()); });
            navMenuContainer.appendChild(logoutBtn);
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
        }
    });

    if (!auth.currentUser) {
        setupAuthListeners();
    }
});
