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

        const links = navMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
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
            display: block; width: 90%; max-width: 400px; border-radius: 24px;
            border: 1px solid var(--glass-border); padding: 2.5rem 2rem;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08); text-align: left;
            transform: scale(0.9); transition: transform 0.3s ease; position: relative;
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideAuthModal();
        });
    };

    const showAuthModal = (mode) => {
        injectModalHTML();
        const modal = document.getElementById('auth-modal-card');
        const overlay = document.getElementById('auth-modal-overlay');
        
        if (mode === 'signup') {
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
        } else {
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
        }

        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        modal.style.transform = 'scale(1)';

        document.getElementById('auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
        
        const switchLogin = document.getElementById('switch-to-login');
        if (switchLogin) switchLogin.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
        
        const switchSignup = document.getElementById('switch-to-signup');
        if (switchSignup) switchSignup.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
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
    const navLinks = document.querySelectorAll('.nav-menu a');
    let loginBtn = null;
    let signupBtn = null;

    navLinks.forEach(link => {
        if (link.textContent.trim() === 'Login') loginBtn = link;
        if (link.textContent.trim() === 'Sign Up') signupBtn = link;
    });

    const heroContent = document.querySelector('.hero-content');

    auth.onAuthStateChanged((user) => {
        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';

            if (!document.getElementById('logout-btn') && loginBtn) {
                const logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn';
                logoutBtn.href = '#';
                logoutBtn.textContent = 'Logout';
                logoutBtn.style.cursor = 'pointer';
                
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => window.location.reload());
                });
                loginBtn.parentNode.appendChild(logoutBtn);
            }

            renderProfileDashboard(user);
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            const existingLogout = document.getElementById('logout-btn');
            if (existingLogout) existingLogout.remove();
        }
    });

    if (signupBtn) signupBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
    if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });

    // --- 5. NEW CUSTOM SETTINGS TAB DASHBOARD PANEL ENGINE ---
    const renderProfileDashboard = (user) => {
        if (!heroContent) return;

        const username = user.email.split('@')[0];

        // Clean layout container for settings dashboard
        heroContent.innerHTML = `
            <h1 style="font-size: 2.8rem; margin-bottom: 0.5rem;">Welcome Back, <span>${username}!</span></h1>
            <p class="hero-subtitle" style="margin-bottom: 2rem;">Manage your live cloud configuration and workspace.</p>
            
            <div class="dropdown-inner-card" style="display: flex; flex-direction: row; border-radius: 24px; border: 1px solid var(--glass-border); padding: 0; width: 100%; max-width: 680px; text-align: left; overflow: hidden; box-shadow: var(--glass-shadow); min-height: 340px;">
                
                <div style="width: 30%; background: rgba(255,255,255,0.3); border-right: 1px solid var(--glass-border); padding: 1.5rem 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <button id="tab-btn-profile" class="active-tab" style="width: 100%; background: var(--primary); color: white; border: none; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer; text-align: left; font-size: 0.9rem; transition: all 0.2s;">
                        👤 Profile
                    </button>
                    <button id="tab-btn-settings" style="width: 100%; background: transparent; color: var(--text-main); border: none; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer; text-align: left; font-size: 0.9rem; transition: all 0.2s;">
                        ⚙️ Preferences
                    </button>
                </div>

                <div style="width: 70%; padding: 2rem; display: flex; flex-direction: column; justify-content: flex-start; position: relative;">
                    
                    <div id="panel-profile" style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
                        <h3 style="margin: 0; font-size: 1.3rem; color: var(--text-main);">Verified HOUTS Developer Profile</h3>
                        <hr style="border: none; border-top: 1px solid var(--glass-border); margin: 0.2rem 0;">
                        <div>
                            <p style="margin: 0 0 0.2rem 0; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">User ID Reference</p>
                            <span style="font-size: 0.85rem; word-break: break-all; font-family: monospace; background: rgba(0,0,0,0.05); padding: 0.3rem 0.6rem; border-radius: 6px; color: var(--text-main); display: block;">${user.uid}</span>
                        </div>
                        <div>
                            <p style="margin: 0 0 0.2rem 0; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Connected Cloud Database</p>
                            <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">${user.email}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <span style="width: 10px; height: 10px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #22c55e;"></span>
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Security Engine Handshake Verified</span>
                        </div>
                    </div>

                    <div id="panel-settings" style="display: none; flex-direction: column; gap: 1.2rem; width: 100%;">
                        <h3 style="margin: 0; font-size: 1.3rem; color: var(--text-main);">Workspace Preferences</h3>
                        <hr style="border: none; border-top: 1px solid var(--glass-border); margin: 0.2rem 0;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: var(--text-main);">Interface Optimization</p>
                                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Toggle dark contrast backdrop canvas rules.</p>
                            </div>
                            <input type="checkbox" id="pref-dark" style="width: 40px; height: 20px; cursor: pointer; accent-color: var(--primary);">
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: var(--text-main);">Cloud Communications</p>
                                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Receive git build alerts and webhook pings.</p>
                            </div>
                            <input type="checkbox" id="pref-notify" checked style="width: 40px; height: 20px; cursor: pointer; accent-color: var(--primary);">
                        </div>

                        <button id="save-settings-btn" style="margin-top: 0.5rem; background: var(--text-main); color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 0.85rem; align-self: flex-start; transition: opacity 0.2s;">
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        `;

        // Interactive UI Tab Controller Elements Logic Setup
        const btnProfile = document.getElementById('tab-btn-profile');
        const btnSettings = document.getElementById('tab-btn-settings');
        const panelProfile = document.getElementById('panel-profile');
        const panelSettings = document.getElementById('panel-settings');
        const saveBtn = document.getElementById('save-settings-btn');

        // Tab Switching Event Actions
        btnProfile.addEventListener('click', () => {
            panelProfile.style.display = 'flex';
            panelSettings.style.display = 'none';
            btnProfile.style.background = 'var(--primary)';
            btnProfile.style.color = 'white';
            btnSettings.style.background = 'transparent';
            btnSettings.style.color = 'var(--text-main)';
        });

        btnSettings.addEventListener('click', () => {
            panelProfile.style.display = 'none';
            panelSettings.style.display = 'flex';
            btnSettings.style.background = 'var(--primary)';
            btnSettings.style.color = 'white';
            btnProfile.style.background = 'transparent';
            btnProfile.style.color = 'var(--text-main)';
        });

        // Simulating functional preference adjustments state notifications
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = 'Saved Successfully! ✓';
            saveBtn.style.background = '#22c55e';
            setTimeout(() => {
                saveBtn.textContent = 'Save Changes';
                saveBtn.style.background = 'var(--text-main)';
            }, 2000);
        });
    };
});
