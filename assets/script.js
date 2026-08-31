// ===================== Configuración =====================
// Pega acá tu Client ID de Google (pasos en assets/README-AUTH.md)
const GOOGLE_CLIENT_ID = ''; // TODO: tu client.id de Google Cloud

// ===================== Partículas del fondo =====================
(function () {
    const container = document.getElementById('particles-container');
    if (!container) return;
    const symbols = ['⛏', '⚔', '🛡', '💎', '✦', '★', '☄'];
    for (let i = 0; i < 16; i++) {
        const s = document.createElement('span');
        s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        s.style.left = (Math.random() * 100) + '%';
        s.style.bottom = '-40px';
        s.style.animationDuration = (9 + Math.random() * 10) + 's';
        s.style.animationDelay = (Math.random() * 8) + 's';
        s.style.fontSize = (14 + Math.random() * 20) + 'px';
        container.appendChild(s);
    }
})();

// ===================== Utilities =====================
function copyIp() {
    const ip = document.getElementById('ipServer')?.value || 'mc.familynetwork.site';
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(ip).then(() => showToast('✅ IP copiada: ' + ip));
    } else {
        const ta = document.createElement('textarea');
        ta.value = ip;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('✅ IP copiada: ' + ip);
    }
}

let toastTimer;
function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function toggleSidebar() {
    const nav = document.getElementById('toggle-mobile-nav');
    if (!nav) return;
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
}
function toggleLi(el) {
    const li = el.closest('li');
    li.classList.toggle('toggle-open');
}

// ===================== Nav superior móvil (hamburguesa + dropdowns por tap) =====================
const NAV_MQ = window.matchMedia('(max-width: 968px)');

function initTopNav() {
    const nav = document.querySelector('.triplezone__second--nav');
    if (!nav) return;

    // Botón hamburguesa (si no existe)
    if (!nav.querySelector('.nav-toggle')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-toggle';
        btn.setAttribute('aria-label', 'Abrir menú');
        btn.innerHTML = '<i class="fas fa-bars"></i>';
        nav.prepend(btn);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('nav-open');
        });
    }

    // Dropdown de cada categoría: en móvil abre al tocar el enlace
    nav.querySelectorAll('.list__second--nav').forEach((li) => {
        const link = li.querySelector('.list__second__category--link');
        if (!link || !li.querySelector('.triplezone__second--dropdown')) return;
        link.addEventListener('click', (e) => {
            if (NAV_MQ.matches) {
                e.preventDefault();
                li.classList.toggle('dropdown-open');
                // cerrar los demás
                nav.querySelectorAll('.list__second--nav.dropdown-open').forEach((o) => {
                    if (o !== li) o.classList.remove('dropdown-open');
                });
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopNav);
} else {
    initTopNav();
}

// ===================== Sesión (localStorage, sin backend) =====================
const SESSION_KEY = 'fn_google_user';

function getStoredUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function storeUser(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }

function renderUser(user) {
    const img = document.getElementById('avatar_MC');
    if (img) img.src = user.picture || ('https://minotar.net/avatar/' + encodeURIComponent(user.name || 'MHF_Question') + '/64');
    const title = document.querySelector('.profile-title');
    if (title) title.textContent = user.displayName || user.givenName || user.name || 'Usuario';
    const sub = document.querySelector('.profile-description-text');
    if (sub) sub.textContent = 'Conectado';
}

// ===================== Modal de Google Sign-In =====================
function ensureGoogleScript() {
    if (typeof google !== 'undefined') return;
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    document.body.appendChild(s);
}

function buildAuthModal() {
    const old = document.getElementById('auth-modal');
    if (old) { old.parentNode.removeChild(old); }

    const user = getStoredUser();
    const overlay = document.createElement('div');
    overlay.id = 'auth-modal';
    overlay.className = 'modal-overlay';
    if (user) {
        overlay.innerHTML = `
          <div class="login-panel">
            <span class="close-x" onclick="closeLogin()">✕</span>
            <p class="login-title">Sesión activa</p>
            <p class="login-description">Estás conectado como:</p>
            <div class="session-info">
              <img src="${user.avatar || 'https://minotar.net/avatar/MHF_Question/64'}" alt="avatar" width="56" height="56">
              <div>
                <p class="session-name">${user.displayName || user.name}</p>
                <p class="session-mail">${user.email || ''}</p>
              </div>
            </div>
            <button class="auth-logout" onclick="logout()">Cerrar sesión</button>
          </div>`;
    } else {
        overlay.innerHTML = `
          <div class="login-panel">
            <span class="close-x" onclick="closeLogin()">✕</span>
            <p class="login-title">Iniciar sesión</p>
            <p class="login-description">Usá tu cuenta de Google para entrar a la tienda.</p>
            <div id="g_id_onload" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>
            <div id="g_id_button"></div>
            <p class="auth-hint">Tu orden se vincula a tu sesión de Google.</p>
          </div>`;
    }
    document.body.appendChild(overlay);
    return overlay;
}

function initGoogleButton() {
    if (!GOOGLE_CLIENT_ID) return;
    if (typeof google === 'undefined' || !google.accounts) return;
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });
    const btn = document.getElementById('g_id_button');
    if (btn) google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: 340 });
}

window.handleCredentialResponse = function (res) {
    try {
        const u = decodeJwt(res.credential);
        const user = {
            sub: u.sub,
            name: (u.name || u.email || '').split('@')[0],
            displayName: u.name || u.email,
            givenName: u.given_name || '',
            email: u.email || '',
            avatar: u.picture || ''
        };
        storeUser(user);
        renderUser(user);
        closeLogin();
        showToast('👋 Bienvenido, ' + user.name);
    } catch (e) {
        showToast('⚠️ No se pudo iniciar sesión');
    }
};

function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    if (typeof google !== 'undefined' && google.accounts) google.accounts.id.disableAutoSelect();
    const img = document.getElementById('avatar_MC');
    if (img) img.src = 'https://minotar.net/avatar/MHF_Question/64';
    const title = document.querySelector('.profile-title');
    if (title) title.textContent = 'Invitado';
    const sub = document.querySelector('.profile-description-text');
    if (sub) sub.textContent = 'Inicia sesión';
    closeLogin();
    showToast('🔒 Sesión cerrada');
}

function openLogin() {
    const m = buildAuthModal();
    m.classList.add('open');
    const user = getStoredUser();
    if (user) return;
    if (!GOOGLE_CLIENT_ID) {
        showToast('⚠️ Google Sign-In no está configurado (falta el Client ID)');
        return;
    }
    ensureGoogleScript();
    // Esperar a que cargue la librería y dibujar el botón
    if (typeof google !== 'undefined' && google.accounts) initGoogleButton();
    else setTimeout(initGoogleButton, 400);
}
function closeLogin() {
    const m = document.getElementById('auth-modal');
    if (m) m.classList.remove('open');
}

// Recargar sesión guardada
document.addEventListener('click', (e) => {
    const m = document.getElementById('auth-modal');
    if (m && m.classList.contains('open') && e.target === m) closeLogin();
});

(function () {
    const u = getStoredUser();
    if (u) renderUser(u);
})();
