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
    // Keep it secure in localStorage under a relevant workspace hook
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
        appendMessageRow("<strong>Workspace Setup Required:</strong> It looks like your OpenRouter API Key isn't configured yet. Please open your <strong>Account Settings</strong> dashboard, head over to the system settings tab, and provide your secure OpenRouter key to activate the DeepSeek architecture pipeline.", "ai");
        if (typeof scrollToBottom === 'function') scrollToBottom();
        return;
    }
    
    const liveLoaderTrackingId = appendAiLoader();
    if (typeof scrollToBottom === 'function') scrollToBottom();

    // Push the new user prompt into our conversational history array
    chatHistoryArray.push({
        role: "user",
        content: userPromptText
    });

    try {
        // Direct secure fetch request to OpenRouter endpoints targeting DeepSeek V3
        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${activeOpenRouterApiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin, // Required by OpenRouter rules
                "X-Title": "HOUTS Workspace"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat:free", // Targets completely free DeepSeek V3 engine
                messages: chatHistoryArray,
                temperature: 0.3, // Keeps the HTML framework strict and valid
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
            // Append assistant response to chat log history
            chatHistoryArray.push({
                role: "assistant",
                content: rawContent
            });

            let rawCode = rawContent.trim();
            // Clean up any stray markdown wrappers if the model leaks them
            rawCode = rawCode.replace(/^```html\s*/i, '');
            rawCode = rawCode.replace(/```$/, '');
            
            const codeBlob = new Blob([rawCode], { type: 'text/html' });
            const liveHostedUrl = URL.createObjectURL(codeBlob);
            
            const actionHtml = `
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box; position: relative; z-index: 10;">
                    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #fff; font-size: 1rem;">🌐 Website Generated Successfully!</p>
                    <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #a1a1aa; line-height: 1.4;">DeepSeek-V3 has successfully compiled a brand-new cohesive architecture layout template.</p>
                    <div style="width: 100%; height: 44px; position: relative; z-index: 20; cursor: pointer; box-sizing: border-box;">
                        <a href="${liveHostedUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%; line-height: 44px; text-align: center; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; position: absolute; top: 0; left: 0; pointer-events: auto; WebkitTapHighlightColor: transparent;">Open Live Preview</a>
                    </div>
                </div>
            `;
            appendMessageRow(actionHtml, 'ai');
        } else {
            appendMessageRow("The DeepSeek engine responded successfully but returned an empty structural canvas. Please try adjusting your layout parameters.", 'ai');
        }

    } catch (chatError) {
        console.error("OpenRouter Gateway Exception:", chatError);
        if (typeof removeAiLoader === 'function') removeAiLoader(liveLoaderTrackingId);
        
        const rawErrorString = chatError.toString().toLowerCase();
        
        // Error intercepts tailored to OpenRouter exceptions
        if (rawErrorString.includes("rate_limit") || rawErrorString.includes("quota") || rawErrorString.includes("429")) {
            appendMessageRow(`
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #ef4444; font-size: 1rem;">⚠️ OpenRouter Free Tier Limit</p>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
                        Your free daily query threshold has temporarily paused or servers are experiencing heavy traffic. Please wait a minute before requesting another design layout.
                    </p>
                </div>
            `, 'ai');
        } else if (rawErrorString.includes("invalid") || rawErrorString.includes("authentication") || rawErrorString.includes("401")) {
            appendMessageRow(`
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #ef4444; font-size: 1rem;">🔑 Authentication Refused</p>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
                        OpenRouter rejected your API authorization key. Verify your workspace credentials inside the account panel settings.
                    </p>
                </div>
            `, 'ai');
        } else {
            appendMessageRow(`
                <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); padding: 1.25rem; border-radius: 12px; margin-top: 0.5rem; box-sizing: border-box;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #f43f5e; font-size: 1rem;">🌐 Edge Network Routing Issue</p>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
                        Could not reach OpenRouter server nodes: ${chatError.message || "Unknown proxy flag"}. Check connection status and try again.
                    </p>
                </div>
            `, 'ai');
        }
    }

    if (typeof scrollToBottom === 'function') scrollToBottom();
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    initializeLocalOpenRouter();

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
            :root.light-mode .modal-main-content { background: #fafafa; }
            .modal-sidebar-btn {
                width: 100%; background: transparent; color: #a1a1aa; border: none;
                padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem;
                cursor: pointer; text-align: left; display: flex; align-items: center; gap: 0.5rem;
                box-sizing: border-box; transition: all 0.2s;
            }
            .modal-sidebar-btn.active { background: rgba(255, 255, 255, 0.06); color: #ffffff; }
            :root.light-mode .modal-sidebar-btn.active { background: rgba(0, 0, 0, 0.04); color: #0a0a0c; }
            .modal-sidebar-btn:hover:not(.active) { color: #f4f4f5; background: rgba(255,255,255,0.02); }
            :root.light-mode .modal-sidebar-btn:hover:not(.active) { color: #0a0a0c; background: rgba(0,0,0,0.02); }
            
            .modal-close-x {
                position: absolute; top: 20px; right: 20px; background: transparent;
                border: none; color: #52525b; cursor: pointer; font-size: 1.2rem; transition: color 0.2s;
            }
            .modal-close-x:hover { color: #f4f4f5; }
            :root.light-mode .modal-close-x:hover { color: #0a0a0c; }
            
            .modal-input-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
            .modal-input-group label { font-size: 0.85rem; color: #a1a1aa; font-weight: 500; }
            :root.light-mode .modal-input-group label { color: #52525b; }
            .modal-input-group input {
                background: #18181c; border: 1px solid rgba(255,255,255,0.08);
                padding: 0.75rem 1rem; border-radius: 8px; color: #ffffff; font-size: 0.95rem;
                outline: none; transition: border 0.2s; box-sizing: border-box; width:100%;
            }
            :root.light-mode .modal-input-group input { background: #ffffff; border: 1px solid rgba(0,0,0,0.15); color: #0a0a0c; }
            .modal-input-group input:focus { border-color: #6366f1; }
            
            .modal-submit-btn {
                background: #6366f1; color: white; padding: 0.85rem; border: none;
                border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer;
                width: 100%; margin-top: 0.5rem; transition: background 0.2s;
            }
            .modal-submit-btn:hover { background: #4f46e5; }
            
            .modal-tab-pane { display: none; }
            .modal-tab-pane.active { display: block; }
            
            .settings-info-row {
                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
                padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; color: #a1a1aa;
                line-height: 1.5;
            }
            :root.light-mode .settings-info-row { background: rgba(0,0,0,0.01); border: 1px solid rgba(0,0,0,0.05); color: #52525b; }
        `;
        document.head.appendChild(styleTag);

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        overlay.innerHTML = `
            <div class="modal-login-card" id="modal-container-anchor">
                </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModalPipeline();
        });
    };
    injectModalHTML();

    const closeModalPipeline = () => {
        const overlay = document.getElementById('auth-modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    };

    window.showAuthModal = function(type, activeUser = null) {
        injectModalHTML();
        const overlay = document.getElementById('auth-modal-overlay');
        const container = document.getElementById('modal-container-anchor');
        if (!overlay || !container) return;

        if (type === 'login' || type === 'signup') {
            container.className = 'modal-login-card';
            container.innerHTML = `
                <button class="modal-close-x" onclick="closeModalPipeline()">✕</button>
                <h3>${type === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                <p>${type === 'login' ? 'Sign in to access your digital architect workspace.' : 'Start engineering professional layouts in minutes.'}</p>
                <form id="modal-auth-form">
                    <div class="modal-input-group">
                        <label>Email Address</label>
                        <input type="email" id="modal-email" required placeholder="name@domain.com">
                    </div>
                    <div class="modal-input-group">
                        <label>Password</label>
                        <input type="password" id="modal-password" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="modal-submit-btn">${type === 'login' ? 'Sign In' : 'Register'}</button>
                </form>
                <p style="margin: 1.5rem 0 0 0; font-size: 0.85rem; text-align: center;">
                    ${type === 'login' ? "Don't have an account? <a href='#' id='switch-to-signup' style='color:#6366f1; text-decoration:none; font-weight:600;'>Sign up</a>" : "Already have an account? <a href='#' id='switch-to-login' style='color:#6366f1; text-decoration:none; font-weight:600;'>Log in</a>"}
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
                    showToast(type === 'login' ? '🔒 Session authenticated cleanly.' : '🎉 Welcome to the HOUTS framework!', true);
                }).catch(err => {
                    alert(err.message);
                });
            });
        } else if (type === 'account' && activeUser) {
            container.className = 'modal-dashboard-layout';
            container.innerHTML = `
                <button class="modal-close-x" style="z-index:100;" onclick="closeModalPipeline()">✕</button>
                <div class="modal-sidebar">
                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        <button class="modal-sidebar-btn active" id="tab-btn-profile">👤 Profile</button>
                        <button class="modal-sidebar-btn" id="tab-btn-sys">⚙️ Architecture Config</button>
                    </div>
                    <div style="font-size:0.75rem; color:#52525b; text-align:left; padding-left:1rem;">Workspace v2.1</div>
                </div>
                <div class="modal-main-content">
                    <div id="pane-profile" class="modal-tab-pane active">
                        <h3 style="margin-top:0;">Account Profile</h3>
                        <p>Manage your linked user profiles and authentication nodes.</p>
                        <div class="settings-info-row">
                            <strong>Authenticated Email:</strong><br>${activeUser.email}<br><br>
                            <strong>Workspace Access Tier:</strong><br>Developer Sandbox (Unlimited local compilation)
                        </div>
                    </div>
                    <div id="pane-sys" class="modal-tab-pane">
                        <h3 style="margin-top:0;">Architecture Config</h3>
                        <p>Configure routing components and endpoint authentication parameters.</p>
                        <div class="settings-info-row" style="margin-bottom:1rem;">
                            <strong>Active Layout LLM Proxy Node:</strong><br>
                            OpenRouter Edge Gateway running DeepSeek-V3
                        </div>
                        <div class="modal-input-group">
                            <label>Secure OpenRouter API Key</label>
                            <input type="password" id="sys-groq-key" placeholder="sk-or-v1-••••••••">
                        </div>
                        <button class="modal-submit-btn" id="save-sys-settings" style="width:auto; padding-left:2rem; padding-right:2rem;">Save Engine Variables</button>
                    </div>
                </div>
            `;

            const keyInput = document.getElementById('sys-groq-key');
            if (keyInput) {
                // Read from localStorage (it fallbacks gracefully for either key)
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
                localStorage.setItem('HOUTS_SECURE_GROQ_KEY', updatedVal); // maintain sync
                initializeLocalOpenRouter();
                showToast("⚡ Environment variables compiled and loaded successfully.");
                closeModalPipeline();
            });
        }

        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
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

        // Strip previous dynamic entries before repainting
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
