// --- 1. INITIALIZE REAL FIREBASE ---
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
    
    // Mobile navigation active class controls
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // --- 2. MODAL SYSTEM INJECTION ENGINE ---
    const injectModalHTML = () => {
        if (document.getElementById('auth-modal-overlay')) return;

        const styleTag = document.createElement('style');
        styleTag.id = 'modal-core-styles';
        styleTag.innerHTML = `
            #auth-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(10, 10, 12, 0.75); backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px); z-index: 99999;
                display: flex; justify-content: center; align-items: center;
                opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
                box-sizing: border-box;
            }
            .modal-box-card {
                background: #121214; border: 1px solid rgba(255, 255, 255, 0.08);
                width: 90%; max-width: 400px; border-radius: 16px; padding: 2.25rem 1.75rem;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5); color: #ffffff;
                box-sizing: border-box; position: relative;
            }
            .modal-dashboard-layout {
                background: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.05);
                width: 92%; max-width: 760px; height: 85vh; max-height: 600px;
                border-radius: 20px; display: grid; grid-template-columns: 240px 1fr;
                box-shadow: 0 30px 70px rgba(0,0,0,0.6); color: #ffffff;
                overflow: hidden; box-sizing: border-box; position: relative;
            }
            .modal-sidebar {
                background: #111113; border-right: 1px solid rgba(255, 255, 255, 0.05);
                padding: 2rem 1.25rem; display: flex; flex-direction: column;
                justify-content: space-between; box-sizing: border-box;
            }
            .modal-main-view {
                padding: 2.5rem; overflow-y: auto; background: #0c0c0e; box-sizing: border-box;
            }
            .tab-btn {
                width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none;
                background: transparent; color: #a1a1aa; font-weight: 600; font-size: 0.9rem;
                cursor: pointer; text-align: left; display: flex; align-items: center; gap: 0.5rem;
                transition: all 0.2s ease; box-sizing: border-box;
            }
            .tab-btn.active { background: rgba(255, 255, 255, 0.06); color: #ffffff; }
            .modal-input {
                width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1); background: #1a1a1e;
                color: #ffffff; outline: none; margin-bottom: 1.25rem; font-size: 0.95rem;
                box-sizing: border-box;
            }
            .modal-submit-btn {
                width: 100%; background: #ffffff; color: #000000; font-weight: 700;
                border: none; padding: 0.85rem; border-radius: 8px; cursor: pointer;
                font-size: 0.95rem; transition: opacity 0.2s ease;
            }
            .modal-submit-btn:hover { opacity: 0.9; }
            @media (max-width: 680px) {
                .modal-dashboard-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: 90vh; }
                .modal-sidebar { flex-direction: row; padding: 1rem; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .modal-main-view { padding: 1.5rem; }
                .tab-btn { width: auto; padding: 0.5rem 0.75rem; }
                .brand-meta { display: none !important; }
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
                <div class="modal-box-card">
                    <button id="close-modal-x" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:#71717a; font-size:1.2rem; cursor:pointer; font-weight:700;">&times;</button>
                    <h3 style="font-size: 1.6rem; margin-bottom: 0.4rem; font-weight:700;">${mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h3>
                    <p style="color:#a1a1aa; font-size:0.9rem; margin-bottom:1.5rem;">${mode === 'signup' ? 'Join HOUTS to deploy projects.' : 'Access your profile instance portal.'}</p>
                    <form id="modal-form-action">
                        <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Email Address</label>
                        <input type="email" id="modal-email" required class="modal-input">
                        <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:#e4e4e7;">Password</label>
                        <input type="password" id="modal-password" required class="modal-input">
                        <button type="submit" class="modal-submit-btn">${mode === 'signup' ? 'Sign Up' : 'Log In'}</button>
                    </form>
                    <p style="margin-top:1.25rem; font-size:0.85rem; color:#71717a; text-align:center;">
                        ${mode === 'signup' ? 'Already registered? <a href="#" id="modal-toggle-view" style="color:#ffffff; font-weight:600; text-decoration:none;">Log In</a>' : 'New to HOUTS? <a href="#" id="modal-toggle-view" style="color:#ffffff; font-weight:600; text-decoration:none;">Create Account</a>'}
                    </p>
                </div>
            `;

            document.getElementById('modal-form-action').addEventListener('submit', (e) => handleAuthSubmit(e, mode));
            document.getElementById('close-modal-x').addEventListener('click', hideAuthModal);
            document.getElementById('modal-toggle-view').addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal(mode === 'signup' ? 'login' : 'signup');
            });

        } else if (mode === 'account' && user) {
            overlay.innerHTML = `
                <div class="modal-dashboard-layout">
                    <div class="modal-sidebar">
                        <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%;">
                            <div class="brand-meta" style="margin-bottom:1.25rem; padding-left:0.5rem;">
                                <h2 style="font-size:1rem; font-weight:700; margin:0; letter-spacing:-0.3px;">HOUTS INSTANCE</h2>
                                <p style="font-size:0.75rem; color:#71717a; margin:0;">Cloud Account Engine</p>
                            </div>
                            <button id="tab-profile-trigger" class="tab-btn active">👤 Profile</button>
                            <button id="tab-settings-trigger" class="tab-btn">⚙️ System</button>
                        </div>
                        <button id="modal-dashboard-close" style="background:#1a1a1e; color:#ffffff; border:1px solid rgba(255,255,255,0.08); padding:0.6rem; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer; margin-top:1rem; width:100%;">Close Dashboard</button>
                    </div>
                    <div class="modal-main-view">
                        <div id="panel-profile-view" style="display:flex; flex-direction:column; gap:1.5rem;">
                            <div>
                                <h1 style="font-size:1.6rem; font-weight:700; margin:0 0 0.25rem 0;">Account Profile</h1>
                                <p style="color:#a1a1aa; font-size:0.9rem; margin:0;">Manage and rewrite database username sync fields.</p>
                            </div>
                            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.06); margin:0;">
                            <div>
                                <p style="font-size:0.7rem; font-weight:600; color:#71717a; text-transform:uppercase; margin-bottom:0.25rem;">Active Username Handle</p>
                                <span id="dash-username-display" style="font-size:1.15rem; font-weight:600; color:#ffffff;">Loading index...</span>
                            </div>
                            <div>
                                <p style="font-size:0.7rem; font-weight:600; color:#71717a; text-transform:uppercase; margin-bottom:0.25rem;">User Account Core Email</p>
                                <span style="font-size:1rem; color:#e4e4e7;">${user.email}</span>
                            </div>
                            <form id="dash-username-form" style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
                                <label style="font-size:0.85rem; color:#e4e4e7;">Update Workspace Handle</label>
                                <div style="display:flex; gap:0.5rem;">
                                    <input type="text" id="dash-username-input" placeholder="Enter clean alphanumeric name" required style="flex:1; padding:0.6rem 1rem; background:#141416; border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:#ffffff; outline:none;">
                                    <button type="submit" id="dash-save-btn" style="background:#ffffff; color:#000000; border:none; padding:0 1.25rem; border-radius:8px; font-weight:600; cursor:pointer;">Save</button>
                                </div>
                            </form>
                        </div>
                        <div id="panel-settings-view" style="display:none; flex-direction:column; gap:1.5rem;">
                            <div>
                                <h1 style="font-size:1.6rem; font-weight:700; margin:0 0 0.25rem 0;">System Context</h1>
                                <p style="color:#a1a1aa; font-size:0.9rem; margin:0;">Cloud ecosystem node validations.</p>
                            </div>
                            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.06); margin:0;">
                            <div style="background:#111113; padding:1rem; border-radius:10px; display:flex; justify-content:between; align-items:center; border:1px solid rgba(255,255,255,0.04);">
                                <div style="flex:1;"><p style="margin:0; font-size:0.9rem; font-weight:600;">Ecosystem Routing Core</p></div>
                                <span style="font-size:0.7rem; background:rgba(34,197,94,0.1); color:#22c55e; padding:0.25rem 0.5rem; border-radius:5px; font-weight:700;">SECURE NODE</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Read live handle
            const userDisplayNode = document.getElementById('dash-username-display');
            db.collection('users').doc(user.uid).get().then((doc) => {
                userDisplayNode.textContent = (doc.exists && doc.data().username) ? doc.data().username : user.email.split('@')[0];
            }).catch(() => { userDisplayNode.textContent = "Error sync node"; });

            // Tab logic controls
            const tProf = document.getElementById('tab-profile-trigger');
            const tSet = document.getElementById('tab-settings-trigger');
            const vProf = document.getElementById('panel-profile-view');
            const vSet = document.getElementById('panel-settings-view');

            tProf.addEventListener('click', () => {
                tProf.classList.add('active'); tSet.classList.remove('active');
                vProf.style.display = 'flex'; vSet.style.display = 'none';
            });
            tSet.addEventListener('click', () => {
                tSet.classList.add('active'); tProf.classList.remove('active');
                vProf.style.display = 'none'; vSet.style.display = 'flex';
            });

            document.getElementById('modal-dashboard-close').addEventListener('click', hideAuthModal);

            // Write permanent custom handles
            document.getElementById('dash-username-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const newHandle = document.getElementById('dash-username-input').value.trim();
                const saveBtn = document.getElementById('dash-save-btn');

                if (newHandle) {
                    db.collection('users').doc(user.uid).set({
                        username: newHandle,
                        email: user.email,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true })
                    .then(() => {
                        userDisplayNode.textContent = newHandle;
                        document.getElementById('dash-username-input').value = '';
                        saveBtn.textContent = 'Saved! ✓'; saveBtn.style.background = '#22c55e'; saveBtn.style.color = '#ffffff';
                        setTimeout(() => { saveBtn.textContent = 'Save'; saveBtn.style.background = '#ffffff'; saveBtn.style.color = '#000000'; }, 2000);
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

    // --- 3. RUN LIFECYCLE EVENT ACTIONS ---
    const handleAuthSubmit = (e, mode) => {
        e.preventDefault();
        const email = document.getElementById('modal-email').value.trim();
        const password = document.getElementById('modal-password').value;

        if (mode === 'signup') {
            auth.createUserWithEmailAndPassword(email, password)
                .then((result) => {
                    return db.collection('users').doc(result.user.uid).set({
                        username: email.split('@')[0],
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => hideAuthModal())
                .catch((error) => alert(error.message));
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => hideAuthModal())
                .catch((error) => alert(error.message));
        }
    };

    // --- 4. NAVIGATION BAR CONTROLLER ---
    const navMenuContainer = document.querySelector('.nav-menu');
    let loginBtn = null, signupBtn = null;

    if (navMenuContainer) {
        navMenuContainer.querySelectorAll('a').forEach(link => {
            if (link.textContent.trim() === 'Login') loginBtn = link;
            if (link.textContent.trim() === 'Sign Up') signupBtn = link;
        });
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
                settingsBtn.textContent = 'Account Settings';
                settingsBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('account', user); });
                navMenuContainer.appendChild(settingsBtn);

                const logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn';
                logoutBtn.href = '#';
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
