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

    // --- 2. POP-UP MODAL ENGINE ---
    const injectModalHTML = () => {
        if (document.getElementById('auth-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'auth-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(30, 27, 75, 0.2); backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px); z-index: 999;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.id = 'auth-modal-card';
        modal.className = 'dropdown-inner-card';
        modal.style.cssText = `
            display: block; width: 95%; max-width: 580px; border-radius: 24px;
            border: 1px solid var(--glass-border); padding: 0;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08); text-align: left;
            transform: scale(0.9); transition: transform 0.3s ease; position: relative;
            overflow: hidden;
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideAuthModal();
        });
    };

    const showAuthModal = (mode, user = null) => {
        injectModalHTML();
        const modal = document.getElementById('auth-modal-card');
        const overlay = document.getElementById('auth-modal-overlay');
        
        if (mode === 'signup') {
            modal.style.maxWidth = '400px';
            modal.style.padding = '2.5rem 2rem';
            modal.innerHTML = `
                <h3 style="margin-top:0; font-size: 1.75rem; margin-bottom: 0.5rem;">Create Account</h3>
                <p style="text-align:left; margin-bottom: 1.5rem;">Join HOUTS to build your project for real.</p>
                <form id="auth-form">
                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:var(--text-main);">Email Address</label>
                    <input type="email" id="auth-email" required style="width:100%; padding:0.8rem 1rem; border-radius:12px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); margin-bottom:1rem; outline:none; font-size:1rem;">
                    
                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:var(--text-main);">Password</label>
                    <input type="password" id="auth-password" required style="width:100%; padding:0.8rem 1rem; border-radius:12px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); margin-bottom:1.5rem; outline:none; font-size:1rem;">
                    
                    <button type="submit" style="width:100%; background:var(--primary); color:white; border:none; padding:0.9rem; border-radius:12px; font-size:1rem; font-weight:600; cursor:pointer;">Sign Up</button>
                </form>
                <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; color:var(--text-muted);">Already registered? <a href="#" id="switch-to-login" style="color:var(--primary); font-weight:600; text-decoration:none;">Log In</a></p>
            `;
            document.getElementById('auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            
            const switchLogin = document.getElementById('switch-to-login');
            if (switchLogin) switchLogin.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
        } else if (mode === 'login') {
            modal.style.maxWidth = '400px';
            modal.style.padding = '2.5rem 2rem';
            modal.innerHTML = `
                <h3 style="margin-top:0; font-size: 1.75rem; margin-bottom: 0.5rem;">Welcome Back</h3>
                <p style="text-align:left; margin-bottom: 1.5rem;">Log into your live profile dashboard.</p>
                <form id="auth-form">
                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:var(--text-main);">Email Address</label>
                    <input type="email" id="auth-email" required style="width:100%; padding:0.8rem 1rem; border-radius:12px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); margin-bottom:1rem; outline:none; font-size:1rem;">
                    
                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:var(--text-main);">Password</label>
                    <input type="password" id="auth-password" required style="width:100%; padding:0.8rem 1rem; border-radius:12px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); margin-bottom:1.5rem; outline:none; font-size:1rem;">
                    
                    <button type="submit" style="width:100%; background:var(--primary); color:white; border:none; padding:0.9rem; border-radius:12px; font-size:1rem; font-weight:600; cursor:pointer;">Log In</button>
                </form>
                <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; color:var(--text-muted);">New to HOUTS? <a href="#" id="switch-to-signup" style="color:var(--primary); font-weight:600; text-decoration:none;">Create Account</a></p>
            `;
            document.getElementById('auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            
            const switchSignup = document.getElementById('switch-to-signup');
            if (switchSignup) switchSignup.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
        } else if (mode === 'account' && user) {
            modal.style.maxWidth = '580px';
            modal.style.padding = '0';

            const currentUsername = user.displayName || user.email.split('@')[0];

            modal.innerHTML = `
                <div style="display: flex; flex-direction: row; min-height: 360px; width: 100%;">
                    
                    <div style="width: 35%; background: rgba(255,255,255,0.4); border-right: 1px solid var(--glass-border); padding: 2rem 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;">
                        <button id="modal-tab-profile" style="width: 100%; background: var(--primary); color: white; border: none; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer; text-align: left; font-size: 0.85rem; transition: all 0.2s;">
                            👤 Profile Settings
                        </button>
                        <button id="modal-tab-subscription" style="width: 100%; background: transparent; color: var(--text-main); border: none; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer; text-align: left; font-size: 0.85rem; transition: all 0.2s;">
                            💳 Subscription
                        </button>
                        <button id="modal-tab-websites" style="width: 100%; background: transparent; color: var(--text-main); border: none; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer; text-align: left; font-size: 0.85rem; transition: all 0.2s;">
                            🌐 Your Websites
                        </button>
                        
                        <button id="close-settings-modal" style="width:calc(100% - 1.5rem); background:var(--text-main); color:white; border:none; padding:0.65rem; border-radius:10px; font-size:0.8rem; font-weight:600; cursor:pointer; position: absolute; bottom: 1.5rem; left: 0.75rem;">Close Menu</button>
                    </div>

                    <div style="width: 65%; padding: 2.5rem 2rem; display: flex; flex-direction: column; justify-content: flex-start;">
                        
                        <div id="m-panel-profile" style="display: flex; flex-direction: column; gap: 1.2rem; width: 100%;">
                            <h4 style="margin: 0; font-size: 1.3rem; color: var(--text-main);">Profile Settings</h4>
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Current Username</p>
                                <span id="display-username-text" style="font-size: 1.1rem; font-weight: 600; color: var(--primary);">${currentUsername}</span>
                            </div>
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Registered Email</p>
                                <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">${user.email}</span>
                            </div>
                            <form id="username-update-form" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.2rem;">
                                <label style="font-size:0.8rem; font-weight:600; color:var(--text-main);">Update Username</label>
                                <div style="display: flex; gap: 0.5rem;">
                                    <input type="text" id="new-username-input" placeholder="New username" required style="width: 100%; padding:0.5rem 0.8rem; border-radius:10px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); outline:none; font-size:0.9rem;">
                                    <button type="submit" id="username-save-btn" style="background:var(--primary); color:white; border:none; padding:0 0.8rem; border-radius:10px; font-size:0.85rem; font-weight:600; cursor:pointer; white-space: nowrap;">Save</button>
                                </div>
                            </form>
                        </div>

                        <div id="m-panel-subscription" style="display: none; flex-direction: column; gap: 1.2rem; width: 100%;">
                            <h4 style="margin: 0; font-size: 1.3rem; color: var(--text-main);">Subscription Management</h4>
                            <div style="background: rgba(99, 102, 241, 0.08); border: 1px dashed var(--primary); padding: 1rem; border-radius: 12px;">
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.7rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">Active Tier Plan</p>
                                <span style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">HOUTS Standard Free Tier</span>
                            </div>
                            <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">Your cloud sync permissions are unrestricted. Premium enterprise pipeline options will appear here once upgrades become available.</p>
                        </div>

                        <div id="m-panel-websites" style="display: none; flex-direction: column; gap: 1.2rem; width: 100%;">
                            <h4 style="margin: 0; font-size: 1.3rem; color: var(--text-main);">Your Active Websites</h4>
                            
                            <div style="background: rgba(99, 102, 241, 0.04); border: 1px dashed var(--glass-border); padding: 1.5rem; border-radius: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                <span style="font-size: 2rem;">🌐</span>
                                <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: var(--text-main);">Secure Workspace Active</p>
                                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); max-width: 240px; line-height: 1.4;">Your live web application domain is fully connected and authenticated with the HOUTS network.</p>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Core Tab Switching Mechanics Logic
            const tabProfile = document.getElementById('modal-tab-profile');
            const tabSubscription = document.getElementById('modal-tab-subscription');
            const tabWebsites = document.getElementById('modal-tab-websites');

            const pProfile = document.getElementById('m-panel-profile');
            const pSubscription = document.getElementById('m-panel-subscription');
            const pWebsites = document.getElementById('m-panel-websites');

            const clearTabs = () => {
                [tabProfile, tabSubscription, tabWebsites].forEach(btn => {
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--text-main)';
                });
                [pProfile, pSubscription, pWebsites].forEach(panel => {
                    panel.style.display = 'none';
                });
            };

            tabProfile.addEventListener('click', () => {
                clearTabs();
                tabProfile.style.background = 'var(--primary)';
                tabProfile.style.color = 'white';
                pProfile.style.display = 'flex';
            });

            tabSubscription.addEventListener('click', () => {
                clearTabs();
                tabSubscription.style.background = 'var(--primary)';
                tabSubscription.style.color = 'white';
                pSubscription.style.display = 'flex';
            });

            tabWebsites.addEventListener('click', () => {
                clearTabs();
                tabWebsites.style.background = 'var(--primary)';
                tabWebsites.style.color = 'white';
                pWebsites.style.display = 'flex';
            });

            document.getElementById('close-settings-modal').addEventListener('click', hideAuthModal);

            // Live Update Display Name Form Submission Task
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
                        
                        saveBtn.textContent = 'Saved! ✓';
                        saveBtn.style.background = '#22c55e';
                        setTimeout(() => {
                            saveBtn.textContent = 'Save';
                            saveBtn.style.background = 'var(--primary)';
                        }, 2000);
                    }).catch((error) => {
                        alert(error.message);
                    });
                }
            });
        }

        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        modal.style.transform = 'scale(1)';
    };

    const hideAuthModal = () => {
        const overlay = document.getElementById('auth-modal-overlay');
        const modal = document.getElementById('auth-modal-card');
        if (overlay && modal) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            modal.style.transform = 'scale(0.9)';
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
