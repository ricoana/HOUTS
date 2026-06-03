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

    const showAuthModal = (mode, user = null) => {
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
            document.getElementById('auth-form').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            
            const switchLogin = document.getElementById('switch-to-login');
            if (switchLogin) switchLogin.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
        } else if (mode === 'login') {
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
            // Get current username or fall back to email prefix
            const currentUsername = user.displayName || user.email.split('@')[0];

            modal.innerHTML = `
                <h3 style="margin-top:0; font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main);">Account Settings</h3>
                <p style="text-align:left; margin-bottom: 1.5rem; color: var(--text-muted);">View and manage your HOUTS user details.</p>
                
                <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                    <div>
                        <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Current Username</p>
                        <span id="display-username-text" style="font-size: 1.1rem; font-weight: 600; color: var(--primary);">${currentUsername}</span>
                    </div>

                    <div>
                        <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Registered Email</p>
                        <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">${user.email}</span>
                    </div>

                    <hr style="border:none; border-top: 1px solid var(--glass-border); margin: 0.5rem 0;">

                    <form id="username-update-form" style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size:0.85rem; font-weight:600; color:var(--text-main);">Change Username</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="new-username-input" placeholder="Enter new username" required style="flex-grow: 1; padding:0.6rem 1rem; border-radius:12px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.6); outline:none; font-size:0.95rem;">
                            <button type="submit" id="username-save-btn" style="background:var(--primary); color:white; border:none; padding:0 1rem; border-radius:12px; font-size:0.9rem; font-weight:600; cursor:pointer;">Update</button>
                        </div>
                    </form>
                </div>
                
                <button id="close-settings-modal" style="width:100%; background:var(--text-main); color:white; border:none; padding:0.8rem; border-radius:12px; font-size:0.95rem; font-weight:600; cursor:pointer; margin-top: 1.5rem;">Close Settings</button>
            `;

            document.getElementById('close-settings-modal').addEventListener('click', hideAuthModal);

            // Handle the submission of the username change
            document.getElementById('username-update-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const newUsername = document.getElementById('new-username-input').value.trim();
                const saveBtn = document.getElementById('username-save-btn');

                if (newUsername) {
                    user.updateProfile({
                        displayName: newUsername
                    }).then(() => {
                        // Dynamically update the text in the modal right away
                        document.getElementById('display-username-text').textContent = newUsername;
                        document.getElementById('new-username-input').value = '';
                        
                        // Visual success indicator on button
                        saveBtn.textContent = 'Updated! ✓';
                        saveBtn.style.background = '#22c55e';
                        setTimeout(() => {
                            saveBtn.textContent = 'Update';
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
                // 1. Inject Account Settings link
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

                // 2. Inject Logout link
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
