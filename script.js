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

    const renderProfileDashboard = (user) => {
        if (!heroContent) return;

        const username = user.email.split('@')[0];

        heroContent.innerHTML = `
            <h1>Welcome Back, <span>${username}!</span></h1>
            <p class="hero-subtitle">Turn your concept into a dot-com.</p>
            
            <div class="dropdown-inner-card" style="display: block; border-radius: 16px; border: 1px solid var(--glass-border); padding: 1.5rem 2rem; width: 100%; max-width: 400px; text-align: left; margin-top: 1rem;">
                <h3 style="margin-top: 0; margin-bottom: 1rem;">Verified HOUTS Profile</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Firebase User ID:</strong> <span style="font-size:0.75rem; word-break:break-all;">${user.uid}</span></p>
                <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin-bottom: 0;"><strong>Security Status:</strong> Account Verified</p>
            </div>
        `;
    };
});
