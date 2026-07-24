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

function initializeLocalGenAI() {
    // Keep exact key reference so users do not have to re-enter keys
    const cachedKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY');
    if (!cachedKey) return false;

    try {
        // Set up OpenRouter configurations inside your original instances
        aiInstance = { apiKey: cachedKey };
        chatSessionInstance = {
            model: "deepseek/deepseek-chat", // OpenRouter DeepSeek-V3 ID
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
    
    const liveLoaderTrackingId = appendAiLoader();
    if (typeof scrollToBottom === 'function') scrollToBottom();

    const tailoredPrompt = userPromptText + " (CRITICAL: Return ONLY valid HTML with embedded CSS/JS inside <style> and <script> tags. Do not explain the code, do not use markdown code blocks, do not include any conversational text.)";

    try {
        // Execute an HTTP Pipeline directly to OpenRouter endpoint
        const responseJson = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${aiInstance.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: chatSessionInstance.model,
                messages: [
                    { role: "system", content: chatSessionInstance.systemInstruction },
                    { role: "user", content: tailoredPrompt }
                ]
            })
        });

        const data = await responseJson.json();
        
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            let rawCode = data.choices[0].message.content.trim();
            rawCode = rawCode.replace(/^```html\s*/i, '');
            rawCode = rawCode.replace(/```$/, '');
            
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
        appendMessageRow("An engineering exception occurred connecting to the runtime. Ensure your local device environment key configuration values match up correctly.", 'ai');
    }

    if (typeof scrollToBottom === 'function') scrollToBottom();
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    initializeLocalGenAI();

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

    const triggerConfetti = () => {
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

    const showToast = (message, hasConfetti = false) => {
        const toast = document.createElement('div');
        toast.className = 'houts-toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        if (hasConfetti) triggerConfetti();

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    };

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
                -webkit-backdrop-filter: blur(24px); z-index: 999999;
                display: flex; justify-content: center; align-items: center;
                opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
                box-sizing: border-box;
            }
            :root.light-mode #auth-modal-overlay {
                background: rgba(244, 244, 245, 0.85);
            }
            .modal-login-card {
                background: #121215; border: 1px solid rgba(255, 255, 255, 0.08);
                width: 90%; max-width: 400px; border-radius: 16px; padding: 2.5rem 2rem;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6); text-align: left;
                position: relative; color: #ffffff; font-family: sans-serif;
                box-sizing: border-box;
            }
            :root.light-mode .modal-login-card {
                background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08);
                color: #121215; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.1);
            }
            .modal-login-card h3 { margin: 0 0 0.5rem 0; font-size: 1.75rem; font-weight:700; text-align:left; letter-spacing: -0.5px;}
            :root.light-mode .modal-login-card h3 { color: #0a0a0c; }
            .modal-login-card p { text-align:left; margin: 0 0 1.5rem 0; color: #a1a1aa; font-size: 0.95rem; }
            :root.light-mode .modal-login-card p { color: #52525b; }
            
            .modal-dashboard-layout {
                display: grid; grid-template-columns: 240px minmax(0, 1fr);
                width: 90%; max-width: 840px; height: 80vh; max-height: 580px;
                background: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.5);
                position: relative; color: #ffffff; font-family: sans-serif;
                box-sizing: border-box;
            }
            :root.light-mode .modal-dashboard-layout {
                background: #f4f4f5; border: 1px solid rgba(0, 0, 0, 0.06);
                box-shadow: 0 30px 70px rgba(0,0,0,0.15); color: #0a0a0c;
            }
            .modal-sidebar {
                background: #121215; border-right: 1px solid rgba(255, 255, 255, 0.05);
                padding: 2rem 1.25rem; display: flex; flex-direction: column;
                justify-content: space-between; box-sizing: border-box; height: 100%;
            }
            :root.light-mode .modal-sidebar {
                background: #ffffff; border-right: 1px solid rgba(0, 0, 0, 0.05);
            }
            .modal-main-content {
                height: 100%; overflow-y: auto; padding: 3rem 2.5rem;
                background: #0c0c0e; box-sizing: border-box; text-align: left;
            }
            :root.light-mode .modal-main-content {
                background: #fafafa;
            }
            .modal-sidebar-btn {
                width: 100%; background: transparent; color: #a1a1aa; border: none;
                padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem;
                cursor: pointer; text-align: left; display: flex; align-items: center; gap: 0.5rem;
                box-sizing: border-box; transition: all 0.2s;
            }
            .modal-sidebar-btn.active { background: rgba(255, 255, 255, 0.06); color: #ffffff; }
            :root.light-mode .modal-sidebar-btn.active { background: rgba(0, 0, 0, 0.04); color: #0a0a0c; }
            :root.light-mode .modal-sidebar-btn { color: #52525b; }

            .modal-input-field {
                width: 100%; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
                background: #1a1a1e; color: #ffffff; margin-bottom: 1.25rem; outline: none; font-size: 1rem;
                box-sizing: border-box; display: block; transition: border 0.2s;
            }
            :root.light-mode .modal-input-field {
                border: 1px solid rgba(0,0,0,0.1); background: #ffffff; color: #0a0a0c;
            }
            .modal-input-field:focus { border-color: #6366f1; }
            .modal-btn-primary {
                width: 100%; background: #6366f1; color: #ffffff; border: none;
                padding: 0.9rem; border-radius: 8px; font-size: 1rem; font-weight: 600;
                cursor: pointer; box-sizing: border-box; transition: opacity 0.2s;
            }
            .modal-btn-primary:hover { opacity: 0.95; }
            .close-icon-btn {
                position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none;
                color: #71717a; font-size: 1.5rem; cursor: pointer; font-weight: 400; transition: color 0.2s; z-index: 10;
            }
            .close-icon-btn:hover { color: #ffffff; }
            :root.light-mode .close-icon-btn:hover { color: #0a0a0c; }

            .theme-toggle-container {
                background: #111113; border: 1px solid rgba(255, 255, 255, 0.04);
                padding: 1rem 1.25rem; border-radius: 12px; display: flex;
                align-items: center; justify-content: space-between; margin-bottom: 2rem;
            }
            :root.light-mode .theme-toggle-container {
                background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.06);
            }
            
            .toggle-switch {
                position: relative; display: inline-block; width: 44px; height: 24px;
            }
            .toggle-switch input { opacity: 0; width: 0; height: 0; }
            .slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #27272a; transition: .3s; border-radius: 34px;
            }
            .slider:before {
                position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
                background-color: white; transition: .3s; border-radius: 50%;
            }
            input:checked + .slider { background-color: #6366f1; }
            input:checked + .slider:before { transform: translateX(20px); }
        `;
        document.head.appendChild(styleTag);

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        overlay.innerHTML = `
            <div id="modal-content-box" style="display:flex; justify-content:center; align-items:center; width:100%;"></div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideAuthModal();
        });
    };

    const showAuthModal = (mode, userObj = null) => {
        injectModalHTML();
        const overlay = document.getElementById('auth-modal-overlay');
        const contentBox = document.getElementById('modal-content-box');

        if (mode === 'account' && userObj) {
            const currentSavedKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY') || '';
            const isLight = document.documentElement.classList.contains('light-mode');

            contentBox.innerHTML = `
                <div class="modal-dashboard-layout">
                    <button class="close-icon-btn" id="modal-close">&times;</button>
                    <div class="modal-sidebar">
                        <div>
                            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 2rem; color: var(--text-primary);">HOUTS Control</div>
                            <button class="modal-sidebar-btn active"><span>⚙️</span> Environment Settings</button>
                        </div>
                        <div style="font-size: 0.8rem; color: #52525b;">System Status: <span style="color:#10b981;">Online</span></div>
                    </div>
                    <div class="modal-main-content">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700;">Account Workspace</h3>
                        <p style="margin: 0 0 2rem 0; color: #a1a1aa; font-size: 0.9rem;">Configure environment level access keys and display settings.</p>

                        <div class="theme-toggle-container">
                            <div>
                                <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem;">Light Theme View</div>
                                <div style="font-size: 0.8rem; color: #71717a;">Toggle daytime user interface styles across application</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="modal-theme-toggle" ${isLight ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>

                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.5rem; color:#a1a1aa;">AUTHENTICATED USER</label>
                        <input type="text" class="modal-input-field" value="${userObj.email || userObj.uid}" disabled style="opacity: 0.6; cursor: not-allowed;">

                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.5rem; color:#a1a1aa;">GEMINI API KEY (DIRECT HARDWARE STORE)</label>
                        <input type="password" id="modal-gemini-key-input" class="modal-input-field" placeholder="AIzaSy..." value="${currentSavedKey}">
                        
                        <button class="modal-btn-primary" id="save-settings-btn" style="margin-top: 1rem;">Save Architecture Preferences</button>
                    </div>
                </div>
            `;

            document.getElementById('modal-theme-toggle').addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.documentElement.classList.add('light-mode');
                    localStorage.setItem('site-theme', 'light');
                } else {
                    document.documentElement.classList.remove('light-mode');
                    localStorage.setItem('site-theme', 'dark');
                }
            });

            document.getElementById('save-settings-btn').addEventListener('click', () => {
                const val = document.getElementById('modal-gemini-key-input').value.trim();
                if (val) {
                    localStorage.setItem('HOUTS_SECURE_GEMINI_KEY', val);
                    initializeLocalGenAI();
                    showToast('🎉 Environment API Key Saved!', true);
                } else {
                    localStorage.removeItem('HOUTS_SECURE_GEMINI_KEY');
                    aiInstance = null;
                    chatSessionInstance = null;
                    showToast('API Key Removed');
                }
                hideAuthModal();
            });

        } else if (mode === 'login') {
            contentBox.innerHTML = `
                <div class="modal-login-card">
                    <button class="close-icon-btn" id="modal-close">&times;</button>
                    <h3>Welcome Back</h3>
                    <p>Enter details to access your account workspace.</p>
                    
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#a1a1aa;">EMAIL ADDRESS</label>
                    <input type="email" id="auth-email-input" class="modal-input-field" placeholder="engineer@houts.dev">

                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#a1a1aa;">PASSWORD</label>
                    <input type="password" id="auth-password-input" class="modal-input-field" placeholder="••••••••">

                    <button class="modal-btn-primary" id="auth-submit-btn">Login to Platform</button>
                </div>
            `;

            document.getElementById('auth-submit-btn').addEventListener('click', () => {
                const email = document.getElementById('auth-email-input').value.trim();
                const pass = document.getElementById('auth-password-input').value.trim();
                
                if(!email || !pass) return alert('Please complete email and password fields.');

                auth.signInWithEmailAndPassword(email, pass)
                    .then(() => {
                        hideAuthModal();
                        showToast('⚡ Logged In Successfully!', true);
                    })
                    .catch(err => alert(err.message));
            });

        } else {
            // Sign up mode
            contentBox.innerHTML = `
                <div class="modal-login-card">
                    <button class="close-icon-btn" id="modal-close">&times;</button>
                    <h3>Get Started</h3>
                    <p>Create your credentials to join HOUTS platform.</p>
                    
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#a1a1aa;">EMAIL ADDRESS</label>
                    <input type="email" id="auth-email-input" class="modal-input-field" placeholder="engineer@houts.dev">

                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#a1a1aa;">CREATE PASSWORD</label>
                    <input type="password" id="auth-password-input" class="modal-input-field" placeholder="••••••••">

                    <button class="modal-btn-primary" id="auth-submit-btn">Create Account</button>
                </div>
            `;

            document.getElementById('auth-submit-btn').addEventListener('click', () => {
                const email = document.getElementById('auth-email-input').value.trim();
                const pass = document.getElementById('auth-password-input').value.trim();
                
                if(!email || !pass) return alert('Please complete email and password fields.');

                auth.createUserWithEmailAndPassword(email, pass)
                    .then(() => {
                        hideAuthModal();
                        showToast('🚀 Account Created Successfully!', true);
                    })
                    .catch(err => alert(err.message));
            });
        }

        document.getElementById('modal-close').addEventListener('click', hideAuthModal);

        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
    };

    const hideAuthModal = () => {
        const overlay = document.getElementById('auth-modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    };

    const setupAuthListeners = () => {
        document.querySelectorAll('.auth-link-login').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal('login');
            });
        });

        document.querySelectorAll('.nav-cta-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(btn.getAttribute('href') === '#signup') {
                    e.preventDefault();
                    showAuthModal('signup');
                }
            });
        });
    };

    // Firebase state listener
    auth.onAuthStateChanged(user => {
        const navMenuContainers = document.querySelectorAll('.nav-menu');
        
        navMenuContainers.forEach(navMenuContainer => {
            const existingSettings = navMenuContainer.querySelector('#settings-menu-btn');
            const existingLogout = navMenuContainer.querySelector('#logout-btn');
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

        if (!user) {
            setupAuthListeners();
        }
    });
});
