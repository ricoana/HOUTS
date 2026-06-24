import { GoogleGenAI } from "@google/genai";

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
    const cachedKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY');
    if (!cachedKey || cachedKey.trim() === "") {
        aiInstance = null;
        chatSessionInstance = null;
        return false;
    }

    try {
        // FIXED: Explicit pass mapping for the official @google/genai client initialization
        aiInstance = new GoogleGenAI({ apiKey: cachedKey.trim() });
        chatSessionInstance = aiInstance.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: "You are HOUTS, an elite AI architecture workspace assistant. Help users structure clean digital web layouts."
            }
        });
        return true;
    } catch(err) {
        console.error("Initialization anomaly:", err);
        aiInstance = null;
        chatSessionInstance = null;
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
        const response = await chatSessionInstance.sendMessage({
            message: tailoredPrompt
        });
        
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);

        if (response && response.text) {
            let rawCode = response.text.trim();
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
        
        // Extract diagnostic message directly from the response object
        const errorDetails = chatError.message || chatError.toString();
        
        appendMessageRow(`<strong>Engine Exception:</strong> Connection refused by Google Cloud Server.<br><br><span style="color: #f87171; font-family: monospace; background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 6px; display: inline-block; font-size: 0.85rem; border: 1px solid rgba(248,113,113,0.2);">Error Details: ${errorDetails}</span><br><br>If this mentions an authentication failure, please re-check that your pasted key contains no trailing spaces or formatting symbols from your clipboard.`, 'ai');
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
                width: 100%; padding: 0.8rem 1rem; border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.08); background: #1a1a1e;
                color: #ffffff; margin-bottom: 1.25rem; outline: none; font-size: 1rem;
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
                position: absolute; top: 1.5rem; right: 1.5rem; background: none; 
                border: none; color: #71717a; font-size: 1.5rem; cursor: pointer; 
                font-weight: 400; transition: color 0.2s; z-index: 10;
            }
            .close-icon-btn:hover { color: #ffffff; }
            :root.light-mode .close-icon-btn:hover { color: #0a0a0c; }

            .theme-toggle-container {
                background: #111113; border: 1px solid rgba(255, 255, 255, 0.04); 
                padding: 1rem 1.25rem; border-radius: 12px; display: flex; 
                justify-content: space-between; align-items: center; margin-top: 0.5rem;
            }
            :root.light-mode .theme-toggle-container {
                background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.06);
                box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            }
            .switch-shell {
                position: relative; display: inline-block; width: 46px; height: 24px;
            }
            .switch-shell input { opacity: 0; width: 0; height: 0; }
            .switch-slider {
                position: absolute; cursor: pointer; inset: 0; background-color: #27272a;
                transition: .3s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 34px;
            }
            :root.light-mode .switch-slider { background-color: #e4e4e7; }
            .switch-slider:before {
                position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
                background-color: white; transition: .3s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 50%;
                box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            }
            input:checked + .switch-slider { background-color: #6366f1; }
            input:checked + .switch-slider:before { transform: translateX(22px); }

            @media (max-width: 768px) {
                #auth-modal-overlay { padding: 0; }
                .modal-dashboard-layout { 
                    grid-template-columns: 1fr; 
                    grid-template-rows: auto 1fr; 
                    width: 100vw; 
                    height: 100vh; 
                    max-height: 100vh; 
                    border-radius: 0; 
                    border: none; 
                }
                .modal-sidebar { 
                    flex-direction: row; 
                    padding: 3.5rem 1.5rem 1rem 1.5rem; 
                    border-right: none; 
                    border-bottom: 1px solid rgba(255,255,255,0.05); 
                    height: auto; 
                    align-items: center;
                    gap: 1rem;
                }
                :root.light-mode .modal-sidebar { border-bottom: 1px solid rgba(0,0,0,0.05); }
                .modal-main-content { padding: 2.5rem 1.5rem; }
                .modal-sidebar-btn { width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; }
                .sidebar-brand-title { display: none !important; }
            }
        `;
        document.head.appendChild(styleTag);

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        document.body.appendChild(overlay);
    };

    const showAuthModal = (mode, user = null) => {
        injectModalHTML();
        const overlay = document.getElementById('auth-modal-overlay');
        
        if (mode === 'signup' || mode === 'login') {
            overlay.innerHTML = `
                <div class="modal-login-card">
                    <button id="close-login-modal" class="close-icon-btn">&times;</button>
                    <h3>${mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h3>
                    <p>${mode === 'signup' ? 'Join HOUTS to build your project for real.' : 'Log into your live profile dashboard.'}</p>
                    <form id="modal-auth-form">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem;">Email Address</label>
                        <input type="email" id="modal-auth-email" required class="modal-input-field">
                        
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem;">Password</label>
                        <input type="password" id="modal-auth-password" required class="modal-input-field">
                        
                        <button type="submit" class="modal-btn-primary">${mode === 'signup' ? 'Sign Up' : 'Log In'}</button>
                    </form>
                    <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; text-align:center;">
                        ${mode === 'signup' ? 'Already registered? <a href="#" id="change-modal-view" style="color:#6366f1; font-weight:600; text-decoration:none;">Log In</a>' : 'New to HOUTS? <a href="#" id="change-modal-view" style="color:#6366f1; font-weight:600; text-decoration:none;">Create Account</a>'}
                    </p>
                </div>
            `;
            
            document.getElementById('modal-auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            document.getElementById('close-login-modal').addEventListener('click', hideAuthModal);
            document.getElementById('change-modal-view').addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal(mode === 'signup' ? 'login' : 'signup');
            });

        } else if (mode === 'account' && user) {
            overlay.innerHTML = `
                <div class="modal-dashboard-layout">
                    <button id="close-dashboard-btn" class="close-icon-btn" aria-label="Close Dashboard">&times;</button>
                    
                    <div class="modal-sidebar">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%; flex-direction: inherit;">
                            <div class="sidebar-brand-title" style="margin-bottom: 1.5rem; padding-left: 0.5rem;">
                                <h2 style="margin: 0; font-size: 1.1rem; font-weight: 700; letter-spacing:-0.3px;">HOUTS CORE</h2>
                                <p style="margin: 0; font-size: 0.75rem; color: #71717a;">Workspace Dashboard</p>
                            </div>
                            <button id="db-tab-profile" class="modal-sidebar-btn active">👤 Profile</button>
                            <button id="db-tab-settings" class="modal-sidebar-btn">⚙️ Settings</button>
                        </div>
                    </div>

                    <div class="modal-main-content">
                        <div id="db-panel-profile" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div>
                                <h1 style="margin: 0 0 0.25rem 0; font-size: 1.75rem; font-weight: 700; letter-spacing:-0.5px;">Profile Config</h1>
                                <p style="margin: 0; font-size: 0.9rem; color: #a1a1aa;">Manage your database username profiles.</p>
                            </div>
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0;">
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 600; color: #71717a; text-transform: uppercase;">Current Username</p>
                                <span id="db-username-text" style="font-size: 1.2rem; font-weight: 600;">Loading index...</span>
                            </div>
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 600; color: #71717a; text-transform: uppercase;">Registered Email</p>
                                <span style="font-size: 1rem;">${user.email}</span>
                            </div>
                            <form id="db-username-form" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                                <label style="font-size:0.85rem; font-weight:500;">Change Username</label>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <input type="text" id="db-username-input" placeholder="New username" required style="flex: 1; min-width: 160px; padding:0.65rem 1rem; border-radius:8px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); outline:none; font-size:0.95rem;">
                                    <button type="submit" id="db-username-save-btn" style="background:#6366f1; color:#ffffff; border:none; padding: 0 1.5rem; height: 38px; border-radius:8px; font-size:0.9rem; font-weight:600; cursor:pointer; white-space: nowrap;">Save</button>
                                </div>
                            </form>
                        </div>

                        <div id="db-panel-settings" style="display: none; flex-direction: column; gap: 1.5rem;">
                            <div>
                                <h1 style="margin: 0 0 0.25rem 0; font-size: 1.75rem; font-weight: 700; letter-spacing:-0.5px;">System Design</h1>
                                <p style="margin: 0; font-size: 0.9rem; color: #a1a1aa;">Customize your workspace environment style.</p>
                            </div>
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0;">
                            
                            <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 12px; margin-bottom: 0.5rem;">
                                <label style="display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Local Gemini API Key</label>
                                <p style="margin: 0 0 1rem 0; font-size: 0.8rem; color: #71717a;">Saved cleanly inside your personal device storage layer. Never leaves this browser.</p>
                                <div style="display: flex; gap: 0.5rem;">
                                    <input type="password" id="local-api-key-input" placeholder="Paste your API key here..." style="flex: 1; padding: 0.65rem 1rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); outline: none; font-size: 0.9rem;">
                                    <button id="local-api-key-save-btn" style="background: #6366f1; color: white; border: none; padding: 0 1.25rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer;">Apply</button>
                                </div>
                            </div>

                            <div class="theme-toggle-container">
                                <div>
                                    <p style="margin: 0; font-weight: 600; font-size: 0.95rem;">Light Mode Interface</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: #71717a;">Convert layout to crisp high-contrast white.</p>
                                </div>
                                <label class="switch-shell">
                                    <input type="checkbox" id="theme-mode-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const textNode = document.getElementById('db-username-text');
            db.collection('users').doc(user.uid).get().then((doc) => {
                textNode.textContent = (doc.exists && doc.data().username) ? doc.data().username : user.email.split('@')[0];
            }).catch(() => { textNode.textContent = "Error"; });

            const tabProf = document.getElementById('db-tab-profile');
            const tabSet = document.getElementById('db-tab-settings');
            const panelProf = document.getElementById('db-panel-profile');
            const panelSet = document.getElementById('db-panel-settings');

            tabProf.addEventListener('click', () => {
                tabProf.classList.add('active'); tabSet.classList.remove('active');
                panelProf.style.display = 'flex'; panelSet.style.display = 'none';
            });
            
            tabSet.addEventListener('click', () => {
                tabSet.classList.add('active'); tabProf.classList.remove('active');
                panelProf.style.display = 'none'; panelSet.style.display = 'flex';
                
                const checkbox = document.getElementById('theme-mode-checkbox');
                checkbox.checked = document.documentElement.classList.contains('light-mode');
                
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        document.documentElement.classList.add('light-mode');
                        localStorage.setItem('site-theme', 'light');
                    } else {
                        document.documentElement.classList.remove('light-mode');
                        localStorage.setItem('site-theme', 'dark');
                    }
                });

                const apiKeyInput = document.getElementById('local-api-key-input');
                const apiKeySaveBtn = document.getElementById('local-api-key-save-btn');
                const existingKey = localStorage.getItem('HOUTS_SECURE_GEMINI_KEY');
                if (existingKey) {
                    apiKeyInput.value = existingKey;
                }

                apiKeySaveBtn.addEventListener('click', () => {
                    const freshKeyValue = apiKeyInput.value.trim();
                    if(freshKeyValue) {
                        localStorage.setItem('HOUTS_SECURE_GEMINI_KEY', freshKeyValue);
                        initializeLocalGenAI();
                        apiKeySaveBtn.textContent = 'Saved!';
                        apiKeySaveBtn.style.background = '#22c55e';
                        setTimeout(() => {
                            apiKeySaveBtn.textContent = 'Apply';
                            apiKeySaveBtn.style.background = '#6366f1';
                        }, 2000);
                    } else {
                        localStorage.removeItem('HOUTS_SECURE_GEMINI_KEY');
                        aiInstance = null;
                        chatSessionInstance = null;
                        showToast("Key cleared from device storage.");
                    }
                });
            });

            document.getElementById('close-dashboard-btn').addEventListener('click', hideAuthModal);

            document.getElementById('db-username-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = document.getElementById('db-username-input').value.trim();
                const saveBtn = document.getElementById('db-username-save-btn');

                if (newName) {
                    db.collection('users').doc(user.uid).set({
                        username: newName,
                        email: user.email,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true })
                    .then(() => {
                        textNode.textContent = newName;
                        document.getElementById('db-username-input').value = '';
                        saveBtn.textContent = 'Saved! ✓'; saveBtn.style.background = '#22c55e'; saveBtn.style.color = '#ffffff';
                        setTimeout(() => { saveBtn.textContent = 'Save'; saveBtn.style.background = '#6366f1'; saveBtn.style.color = '#ffffff'; }, 2000);
                    });
                }
            });
        }

        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    };

    const hideAuthModal = () => {
        const overlay = document.getElementById('auth-modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    };

    const handleAuthSubmit = (e, mode) => {
        e.preventDefault();
        const email = document.getElementById('modal-auth-email').value.trim();
        const password = document.getElementById('modal-auth-password').value;

        if (mode === 'signup') {
            auth.createUserWithEmailAndPassword(email, password)
                .then((result) => {
                    const defaultName = email.split('@')[0];
                    return db.collection('users').doc(result.user.uid).set({
                        username: defaultName,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        hideAuthModal();
                        showToast('🎉 Thank you for signing up!', true);
                    });
                })
                .catch((error) => alert(error.message));
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then((result) => {
                    hideAuthModal();
                    return db.collection('users').doc(result.user.uid).get();
                })
                .then((doc) => {
                    const currentUsername = (doc.exists && doc.data().username) ? doc.data().username : email.split('@')[0];
                    showToast(`👋 Welcome back, ${currentUsername}!`, false);
                })
                .catch((error) => alert(error.message));
        }
    };

    const setupAuthListeners = () => {
        const loginButtons = document.querySelectorAll('.auth-link-login');
        const signupButtons = document.querySelectorAll('.nav-cta-btn');

        loginButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        signupButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll('.auth-link-login').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
        });
        document.querySelectorAll('.nav-cta-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
        });
    };

    auth.onAuthStateChanged((user) => {
        const navMenuContainers = document.querySelectorAll('.nav-menu');
        
        navMenuContainers.forEach(navMenuContainer => {
            const oldSettings = navMenuContainer.querySelector('#settings-menu-btn');
            const oldLogout = navMenuContainer.querySelector('#logout-btn');
            if (oldSettings) oldSettings.remove();
            if (oldLogout) oldLogout.remove();

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
