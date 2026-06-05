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

document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Custom Animation and Toast Styles
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

    // Trigger Confetti Animation
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

    // Trigger System Toast Message
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

    // Mobile Hamburger Dropdown Action
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

    // --- 2. POP-UP MODAL WINDOW STYLES ---
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
            .modal-login-card {
                background: #121215; border: 1px solid rgba(255, 255, 255, 0.08);
                width: 90%; max-width: 400px; border-radius: 16px; padding: 2.5rem 2rem;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6); text-align: left;
                position: relative; color: #ffffff; font-family: sans-serif;
                box-sizing: border-box;
            }
            .modal-login-card h3 { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: #ffffff; font-weight:700; text-align:left; letter-spacing: -0.5px;}
            .modal-login-card p { text-align:left; margin: 0 0 1.5rem 0; color: #a1a1aa; font-size: 0.95rem; }
            
            /* Desktop Layout Configuration */
            .modal-dashboard-layout {
                display: grid; grid-template-columns: 240px minmax(0, 1fr);
                width: 90%; max-width: 840px; height: 80vh; max-height: 580px;
                background: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.5);
                position: relative; color: #ffffff; font-family: sans-serif;
                box-sizing: border-box;
            }
            .modal-sidebar {
                background: #121215; border-right: 1px solid rgba(255, 255, 255, 0.05);
                padding: 2rem 1.25rem; display: flex; flex-direction: column;
                justify-content: space-between; box-sizing: border-box; height: 100%;
            }
            .modal-main-content {
                height: 100%; overflow-y: auto; padding: 3rem 2.5rem;
                background: #0c0c0e; box-sizing: border-box; text-align: left;
            }
            .modal-sidebar-btn {
                width: 100%; background: transparent; color: #a1a1aa; border: none;
                padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem;
                cursor: pointer; text-align: left; display: flex; align-items: center; gap: 0.5rem;
                box-sizing: border-box; transition: all 0.2s;
            }
            .modal-sidebar-btn.active { background: rgba(255, 255, 255, 0.06); color: #ffffff; }
            .modal-input-field {
                width: 100%; padding: 0.8rem 1rem; border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.08); background: #1a1a1e;
                color: #ffffff; margin-bottom: 1.25rem; outline: none; font-size: 1rem;
                box-sizing: border-box; display: block; transition: border 0.2s;
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

            /* Mobile Viewport Overhaul — Full Screen Mode */
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
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Email Address</label>
                        <input type="email" id="modal-auth-email" required class="modal-input-field">
                        
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Password</label>
                        <input type="password" id="modal-auth-password" required class="modal-input-field">
                        
                        <button type="submit" class="modal-btn-primary">${mode === 'signup' ? 'Sign Up' : 'Log In'}</button>
                    </form>
                    <p style="margin-top:1.2rem; font-size:0.85rem; margin-bottom:0; color:#71717a; text-align:center;">
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
                                <h2 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #ffffff; letter-spacing:-0.3px;">HOUTS CORE</h2>
                                <p style="margin: 0; font-size: 0.75rem; color: #71717a;">Workspace Dashboard</p>
                            </div>
                            <button id="db-tab-profile" class="modal-sidebar-btn active">👤 Profile</button>
                            <button id="db-tab-settings" class="modal-sidebar-btn">⚙️ Settings</button>
                        </div>
                    </div>

                    <div class="modal-main-content">
                        <div id="db-panel-profile" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div>
                                <h1 style="margin: 0 0 0.25rem 0; font-size: 1.75rem; font-weight: 700; color: #ffffff; letter-spacing:-0.5px;">Profile Config</h1>
                                <p style="margin: 0; font-size: 0.9rem; color: #a1a1aa;">Manage your database username profiles.</p>
                            </div>
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0;">
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 600; color: #71717a; text-transform: uppercase;">Current Username</p>
                                <span id="db-username-text" style="font-size: 1.2rem; font-weight: 600; color: #ffffff;">Loading index...</span>
                            </div>
                            <div>
                                <p style="margin: 0 0 0.2rem 0; font-size: 0.75rem; font-weight: 600; color: #71717a; text-transform: uppercase;">Registered Email</p>
                                <span style="font-size: 1rem; color: #e4e4e7;">${user.email}</span>
                            </div>
                            <form id="db-username-form" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                                <label style="font-size:0.85rem; font-weight:500; color:#e4e4e7;">Change Username</label>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <input type="text" id="db-username-input" placeholder="New username" required style="flex: 1; min-width: 160px; padding:0.65rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:#141416; color:#ffffff; outline:none; font-size:0.95rem;">
                                    <button type="submit" id="db-username-save-btn" style="background:#6366f1; color:#ffffff; border:none; padding: 0 1.5rem; height: 38px; border-radius:8px; font-size:0.9rem; font-weight:600; cursor:pointer; white-space: nowrap;">Save</button>
                                </div>
                            </form>
                        </div>

                        <div id="db-panel-settings" style="display: none; flex-direction: column; gap: 1.5rem;">
                            <div>
                                <h1 style="margin: 0 0 0.25rem 0; font-size: 1.75rem; font-weight: 700; color: #ffffff; letter-spacing:-0.5px;">System Security</h1>
                                <p style="margin: 0; font-size: 0.9rem; color: #a1a1aa;">Cloud network status trackers.</p>
                            </div>
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 0;">
                            <div style="background: #111113; border: 1px solid rgba(255, 255, 255, 0.04); padding: 1rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <p style="margin: 0; font-weight: 500; font-size: 0.95rem; color: #ffffff;">Cloud Database Sync</p>
                                <span style="font-size: 0.7rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 0.25rem 0.6rem; border-radius: 5px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.2);">ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Read username node
            const textNode = document.getElementById('db-username-text');
            db.collection('users').doc(user.uid).get().then((doc) => {
                textNode.textContent = (doc.exists && doc.data().username) ? doc.data().username : user.email.split('@')[0];
            }).catch(() => { textNode.textContent = "Error"; });

            // Tab toggling rules
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
            });

            document.getElementById('close-dashboard-btn').addEventListener('click', hideAuthModal);

            // Save rules
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

    // --- 3. BAR LINKS LISTENERS ---
    const navMenuContainer = document.querySelector('.nav-menu');
    let loginBtn = null, signupBtn = null;

    if (navMenuContainer) {
        loginBtn = navMenuContainer.querySelector('.auth-link-login');
        signupBtn = navMenuContainer.querySelector('.nav-cta-btn');
    }

    auth.onAuthStateChanged((user) => {
        const oldSettings = document.getElementById('settings-menu-btn');
        const oldLogout = document.getElementById('logout-btn');
        if (oldSettings) oldSettings.remove();
        if (oldLogout) oldLogout.remove();

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';

            if (navMenuContainer) {
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
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
        }
    });

    if (signupBtn) signupBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
    if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
});
