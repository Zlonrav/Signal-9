(function() {
    const hasAccess = localStorage.getItem('s9_access_granted') === 'true';
    const path = window.location.pathname;

    // СТРАНИЦЫ-ИСКЛЮЧЕНИЯ (Сюда можно заходить без ключа)
    const isLoginPage = path.includes('login.html');
    const isToolsPage = path.includes('tools.html');

    // ЛОГИКА: 
    // Если ключа нет И мы пытаемся зайти НЕ на логин И НЕ в терминал -> ВЫГОНЯЕМ
    if (!hasAccess && !isLoginPage && !isToolsPage) {
        window.location.replace('login.html');
    }
    
    // Если ключ есть и мы на логине — уходим на главную
    if (hasAccess && isLoginPage) {
        window.location.replace('index.html');
    }
})();