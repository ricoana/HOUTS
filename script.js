// --- 1. INITIALIZE REAL FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBpKAChVSQXsGJzplgsOb8CvTcXKF2jjvU",
  authDomain: "houts-auth.firebaseapp.com",
  projectId: "houts-auth",
  storageBucket: "houts-auth.firebasestorage.app",
  messagingSenderId: "656004224039",
  appId: "1:656004224039:web:6a3e74279d89372790ea02"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    
    // Top right Hamburger active dropdown controller
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

    // Centered learn more dropdown accordion handler
    const dropdownWrapper = document.querySelector('.info-dropdown');
    const dropdownTrigger = document.querySelector('.dropdown-trigger');

    if (dropdownTrigger && dropdownWrapper) {
        dropdownTrigger.addEventListener('click', () => {
            const isOpen = dropdownWrapper.classList.toggle('is-open');
            dropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // --- 2. POP-UP MODAL ENGINE (FULL VIEWPORT WORKSPACE) ---
    const injectModalHTML = () => {
        if (document.getElementById('auth-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 10, 12, 0.6); backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.id = 'auth-modal-card';
        modal.style.cssText = `
            display: block; width: 100%; height: 100%;
            background: #0c0c0e; padding: 0; text-align: left;
            position: relative; overflow: hidden; color: #ffffff; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    };

    const showAuthModal = (mode, user = null) => {
        injectModalHTML();
        const modal = document.getElementById('auth-modal-card');
        const overlay = document.getElementById('auth-modal-overlay');
        
        if (mode === 'signup' || mode === 'login') {
            // Keep credential blocks as centered modules
            modal.style.cssText = `
                display: block; width: 95%; max-width: 400px; height: auto; border-radius: 16px;
                background: #121214; border: 1px solid rgba(255, 255, 255, 0.08); padding: 2.5rem 2rem;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4); text-align: left;
                position: relative; color: #ffffff; font-family: sans-serif;
            `;
            
            if (mode === 'signup') {
                modal.innerHTML = `
                    <h3 style="margin-top:0; font-size: 1.75rem; margin-bottom: 0.5rem; color: #ffffff;">Create Account</h3>
                    <p style="text-align:left; margin-bottom: 1.5rem; color: #a1a1aa;">Join HOUTS to build your project for real.</p>
                    <form id="auth-form">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Email Address</label>
                        <input type="email" id="auth-email" required style="width:100%; padding:0.8rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1a1a1e; color:#ffffff; margin-bottom:1rem; outline:none; font-size:1rem;">
                        
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Password</label>
                        <input type="password" id="auth-password" required style="width:100%; padding:0.8rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1a1a1e; color:#ffffff; margin-bottom:1.5rem; outline:none; font-size:1rem;">
                        
                        <button type="submit" style="width:100%; background:#ffffff; color:#000000; border:none; padding:0.9rem; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer;">Sign Up</button>
                    </form>
                    <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; color:#71717a;">Already registered? <a href="#" id="switch-to-login" style="color:#ffffff; font-weight:600; text-decoration:none;">Log In</a></p>
                `;
            } else {
                modal.innerHTML = `
                    <h3 style="margin-top:0; font-size: 1.75rem; margin-bottom: 0.5rem; color:#ffffff;">Welcome Back</h3>
                    <p style="text-align:left; margin-bottom: 1.5rem; color:#a1a1aa;">Log into your live profile dashboard.</p>
                    <form id="auth-form">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Email Address</label>
                        <input type="email" id="auth-email" required style="width:100%; padding:0.8rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1a1a1e; color:#ffffff; margin-bottom:1rem; outline:none; font-size:1rem;">
                        
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Password</label>
                        <input type="password" id="auth-password" required style="width:100%; padding:0.8rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1a1a1e; color:#ffffff; margin-bottom:1.5rem; outline:none; font-size:1rem;">
                        
                        <button type="submit" style="width:100%; background:#ffffff; color:#000000; border:none; padding:0.9rem; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer;">Log In</button>
                    </form>
                    <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; color:#71717a;">New to HOUTS? <a href="#" id="switch-to-signup" style="color:#ffffff; font-weight:600; text-decoration:none;">Create Account</a></p>
                `;
            }
            document.getElementById('auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            
            const switchLogin = document.getElementById('switch-to-login');
            if (switchLogin) switchLogin.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
            const switchSignup = document.getElementById('switch-to-signup');
            if (switchSignup) switchSignup.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });

        } else if (mode === 'account' && user) {
            // Apply a robust dual-column layout configuration that expands cleanly
            modal.style.cssText = `
                display: grid; grid-template-columns: 260px minmax(0, 1fr);
                width: 100vw; height: 100vh; background: #0c0c0e; padding: 0;
                color: #ffffff; position: relative; box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;

            const currentUsername = user.displayName || user.email.split('@')[0];

            modal.innerHTML = `
                <div style="background: #111113; border-right: 1px solid rgba(255, 255, 255, 0.04); padding: 3rem 1.5rem; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; height: 100vh; overflow-y: auto;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
                        <div style="margin-bottom: 2rem; padding-left: 0.5rem;">
                            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.5px; color: #ffffff; white-space: nowrap;">HOUTS SYSTEM</h2>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #71717a; white-space: nowrap;">Control Center Workspace</p>
                        </div>

                        <button id="modal-tab-profile" style="width: 100%; background: rgba(255, 255, 255, 0.06); color: #ffffff; border: none; padding: 0.85rem 1.2rem; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left; font-size: 0.95rem; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; box-sizing: border-box; white-space: nowrap;">
                            <span style="font-size: 1.1rem; line-height: 1;">👤</span> Profile Settings
                        </button>
                        <button id="modal-tab-settings" style="width: 100%; background: transparent; color: #a1a1aa; border: none; padding: 0.85rem 1.2rem; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left; font-size: 0.95rem; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; box-sizing: border-box; white-space: nowrap;">
                            <span style="font-size: 1.1rem; line-height: 1;">⚙️</span> System Settings
                        </button>
                    </div>
                    
                    <button id="close-settings-modal" style="width: 100%; background: #1a1a1e; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-sizing: border-box; text-align: center; white-space: nowrap;">Exit Dashboard</button>
                </div>

                <div style="height: 100vh; overflow-y: auto; padding: 4.5rem 5% 4.5rem 5%; background: #0c0c0e; box-sizing: border-box; display: flex; flex-direction: column; align-items: flex-start;">
                    <div style="width: 100%; max-width: 680px; display: flex; flex-direction: column; box-sizing: border-box;">
                        
                        <div id="m-panel-profile" style="display: flex; flex-direction: column; gap: 2.5rem; width: 100%; box-sizing: border-box;">
                            <div>
                                <h1 style="margin: 0 0 0.5rem 0; font-size: 2.2rem; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">Profile Configuration</h1>
                                <p style="margin: 0; font-size: 0.95rem; color: #a1a1aa; line-height: 1.5;">Review personal credential metadata allocations mapping to active live endpoints.</p>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0; width: 100%;">

                            <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%; box-sizing: border-box;">
                                <div>
                                    <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Current Developer Handle</p>
                                    <span id="display-username-text" style="font-size: 1.35rem; font-weight: 600; color: #ffffff; word-break: break-all;">${currentUsername}</span>
                                </div>
                                <div>
                                    <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Primary Node Email</p>
                                    <span style="font-size: 1.15rem; font-weight: 400; color: #e4e4e7; word-break: break-all;">${user.email}</span>
                                </div>
                                
                                <form id="username-update-form" style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; width: 100%; box-sizing: border-box;">
                                    <label style="font-size:0.9rem; font-weight:500; color:#e4e4e7;">Modify User Account ID</label>
                                    <div style="display: flex; gap: 0.75rem; width: 100%; flex-wrap: wrap;">
                                        <input type="text" id="new-username-input" placeholder="Enter new handle" required style="flex: 1; min-width: 200px; padding:0.75rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:#141416; color:#ffffff; outline:none; font-size:1rem; box-sizing: border-box;">
                                        <button type="submit" id="username-save-btn" style="background:#ffffff; color:#000000; border:none; padding:0 1.8rem; height: 46px; border-radius:8px; font-size:0.95rem; font-weight:600; cursor:pointer; white-space: nowrap; transition: background 0.2s; box-sizing: border-box;">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div id="m-panel-settings" style="display: none; flex-direction: column; gap: 2.5rem; width: 100%; box-sizing: border-box;">
                            <div>
                                <h1 style="margin: 0 0 0.5rem 0; font-size: 2.2rem; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">System Settings</h1>
                                <p style="margin: 0; font-size: 0.95rem; color: #a1a1aa; line-height: 1.5;">Configure authorization ecosystem preferences and telemetry validation status.</p>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0; width: 100%;">

                            <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; box-sizing: border-box;">
                                <div style="background: #111113; border: 1px solid rgba(255, 255, 255, 0.04); padding: 1.25rem 1.75rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; box-sizing: border-box;">
                                    <div style="flex: 1; min-width: 200px;">
                                        <p style="margin: 0 0 0.2rem 0; font-weight: 500; font-size: 1.05rem; color: #ffffff;">Cloud Ecosystem State</p>
                                        <p style="margin: 0; font-size: 0.85rem; color: #71717a; line-height: 1.4;">Standard unrestricted node connection running efficiently.</p>
                                    </div>
                                    <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 0.35rem 0.8rem; border-radius: 6px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.2); white-space: nowrap;">ONLINE</span>
                                </div>

                                <div style="background: #111113; border: 1px solid rgba(255, 255, 255, 0.04); padding: 1.25rem 1.75rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; box-sizing: border-box;">
                                    <div style="flex: 1; min-width: 200px;">
                                        <p style="margin: 0 0 0.2rem 0; font-weight: 500; font-size: 1.05rem; color: #ffffff;">Security Tokens</p>
                                        <p style="margin: 0; font-size: 0.85rem; color: #71717a; line-height: 1.4;">SSL cryptographic secure handshake keys validated.</p>
                                    </div>
                                    <span style="font-size: 0.75rem; background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 0.35rem 0.8rem; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.2); white-space: nowrap;">ACTIVE</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Tab Navigation Mechanics Logic
            const tabProfile = document.getElementById('modal-tab-profile');
            const tabSettings = document.getElementById('modal-tab-settings');

            const pProfile = document.getElementById('m-panel-profile');
            const pSettings = document.getElementById('m-panel-settings');

            const clearTabs = () => {
                [tabProfile, tabSettings].forEach(btn => {
                    btn.style.background = 'transparent';
                    btn.style.color = '#a1a1aa';
                });
                [pProfile, pSettings].forEach(panel => {
                    panel.style.display = 'none';
                });
            };

            tabProfile.addEventListener('click', () => {
                clearTabs();
                tabProfile.style.background = 'rgba(255, 255, 255, 0.06)';
                tabProfile.style.color = '#ffffff';
                pProfile.style.display = 'flex';
            });

            tabSettings.addEventListener('click', () => {
                clearTabs();
                tabSettings.style.background = 'rgba(255, 255, 255, 0.06)';
                tabSettings.style.color = '#ffffff';
                pSettings.style.display = 'flex';
            });

            const exitBtn = document.getElementById('close-settings-modal');
            exitBtn.addEventListener('mouseenter', () => exitBtn.style.background = '#1e1e24');
            exitBtn.addEventListener('mouseleave', () => exitBtn.style.background = '#1a1a1e');
            exitBtn.addEventListener('click', hideAuthModal);

            // Update Username Logic Action
            document.getElementById('username-update-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const newUsername = document.getElementById('new-username-input').value.trim();
                const saveBtn = document.getElementById('username-save-btn');

                if (newUsername) {
                    user.updateProfile({
                        displayName: newUsername
                    }).then(() => {
                        document.getElementById('display-username-text').textContent = newUsername;
                        document.getElementById('new-username-input').value = '';
                        
                        saveBtn.textContent = 'Saved Handle! ✓';
                        saveBtn.style.background = '#22c55e';
                        saveBtn.style.color = '#ffffff';
                        setTimeout(() => {
                            saveBtn.textContent = 'Save Changes';
                            saveBtn.style.background = '#ffffff';
                            saveBtn.style.color = '#000000';
                        }, 2000);
                    }).catch((error) => {
                        alert(error.message);
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

    // --- 3. LIVE FIREBASE CONTROLLER ACTIONS ---
    const handleAuthSubmit = (e, mode) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        if (mode === 'signup') {
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => hideAuthModal())
                .catch((error) => alert(error.message));
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => hideAuthModal())
                .catch((error) => alert(error.message));
        }
    };

    // --- 4. NAVIGATION RENDERING & STATE ENGINE ---
    const navMenuContainer = document.querySelector('.nav-menu');
    let loginBtn = null;
    let signupBtn = null;

    if (navMenuContainer) {
        const navLinks = navMenuContainer.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.textContent.trim() === 'Login') loginBtn = link;
            if (link.textContent.trim() === 'Sign Up') signupBtn = link;
        });
    }

    auth.onAuthStateChanged((user) => {
        const dynamicSettings = document.getElementById('settings-menu-btn');
        const dynamicLogout = document.getElementById('logout-btn');
        if (dynamicSettings) dynamicSettings.remove();
        if (dynamicLogout) dynamicLogout.remove();

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';

            if (navMenuContainer) {
                // Inject Account Settings link
                const settingsBtn = document.createElement('a');
                settingsBtn.id = 'settings-menu-btn';
                settingsBtn.href = '#';
                settingsBtn.textContent = 'Account Settings';
                settingsBtn.style.cursor = 'pointer';
                settingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuthModal('account', user);
                });
                navMenuContainer.appendChild(settingsBtn);

                // Inject Logout link
                const logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn';
                logoutBtn.href = '#';
                logoutBtn.textContent = 'Logout';
                logoutBtn.style.cursor = 'pointer';
                logoutBtn.style.color = '#ef4444';
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => window.location.reload());
                });
                navMenuContainer.appendChild(logoutBtn);
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
        }
    });

    if (signupBtn) signupBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
    if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
});
