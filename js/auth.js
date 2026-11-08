(function() {
    const hasAccess = localStorage.getItem('s9_access_granted') === 'true';
    const path = window.location.pathname;

    const isLoginPage = path.includes('login.html');
    const isToolsPage = path.includes('tools.html');
    const isEdrPage = path.includes('edr.html');

    // Стандартная проверка авторизации
    if (!hasAccess && !isLoginPage && !isToolsPage) {
        window.location.replace('login.html');
    }
    
    if (hasAccess && isLoginPage) {
        window.location.replace('index.html');
    }

    // Проверка «тюрьмы» EDR
    const isEdrLocked = localStorage.getItem('s9_edr_os_trigger') === 'true' || localStorage.getItem('s9_edr_gateway_trigger') === 'true';
    
    // Если EDR заблокирован, а игрок пытается открыть любую страницу, кроме EDR и логина — возвращаем его
    if (isEdrLocked && !isEdrPage && !isLoginPage) {
        window.location.replace('edr.html');
        return;
    }

    // Route guard: порядок этапов
    const page = path.split('/').pop() || 'index.html';

    const routeRequirements = {
        'map.html':       () => localStorage.getItem('s9_lang_human') === 'true',
        'archive.html':   () => localStorage.getItem('s9_map_visited') === 'true',
        'os.html':        () => localStorage.getItem('s9_archive_fixed') === 'true',
        'core.html':      () => localStorage.getItem('s9_core_overheated') === 'true' || localStorage.getItem('s9_core_fixed') === 'true',
        'telemetry.html': () => localStorage.getItem('s9_core_fixed') === 'true'
    };

    if (routeRequirements[page] && !routeRequirements[page]()) {
        window.location.replace('404.html');
    }
})();
