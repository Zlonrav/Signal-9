(function() {
    const hasAccess = localStorage.getItem('s9_access_granted') === 'true';
    const path = window.location.pathname;

    const isLoginPage = path.includes('login.html');
    const isToolsPage = path.includes('tools.html');

    // ВАЖНО: map.html больше не в исключениях, но мы убрали проверку isMapPage.
    // Теперь доступ к ней зависит только от hasAccess.
    
    if (!hasAccess && !isLoginPage && !isToolsPage) {
        window.location.replace('login.html');
    }
    
    if (hasAccess && isLoginPage) {
        window.location.replace('index.html');
    }
})();
