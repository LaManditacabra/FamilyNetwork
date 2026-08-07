(() => {
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const ipButton = document.getElementById('btnIP');
    const playerCount = document.getElementById('player-count');
    const toast = document.getElementById('copyToast');

    const updateNavbar = () => {
        nav?.classList.toggle('navbar-scrolled', window.scrollY > 24);
    };

    const closeMenu = () => {
        navMenu?.classList.remove('open');
        navToggle?.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
    };

    navToggle?.addEventListener('click', () => {
        const willOpen = !navMenu?.classList.contains('open');
        navMenu?.classList.toggle('open', willOpen);
        navToggle.classList.toggle('open', willOpen);
        navToggle.setAttribute('aria-expanded', String(willOpen));
    });

    navMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    ipButton?.addEventListener('click', async () => {
        const serverIp = ipButton.dataset.serverIp || 'stank-tara.tun.ply.gg';
        try {
            await navigator.clipboard.writeText(serverIp);
        } catch {
            const input = document.createElement('textarea');
            input.value = serverIp;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }

        const label = ipButton.querySelector('.button-label');
        if (label) label.textContent = 'IP copiada';
        toast?.classList.add('show');
        window.setTimeout(() => {
            if (label) label.textContent = 'Copiar IP';
            toast?.classList.remove('show');
        }, 2200);
    });

    const loadPlayerCount = async () => {
        if (!playerCount) return;
        try {
            const response = await fetch('https://api.mcsrvstat.us/3/stank-tara.tun.ply.gg', { cache: 'no-store' });
            if (!response.ok) throw new Error('Respuesta inválida');
            const data = await response.json();
            if (data.online) {
                const online = Number(data.players?.online ?? 0);
                playerCount.textContent = `${online.toLocaleString('es-ES')} jugadores`;
            } else {
                playerCount.textContent = 'Java · stank-tara.tun.ply.gg';
            }
        } catch {
            playerCount.textContent = 'Java · stank-tara.tun.ply.gg';
        }
    };

    loadPlayerCount();
})();