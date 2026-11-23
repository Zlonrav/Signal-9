// id/console.js
(function() {
    console.clear();

    // Огромный текст с градиентом и тенями
    const styleTitle = [
        'font-size: 40px',
        'font-weight: bold',
        'font-family: monospace',
        'color: #00f2ff',
        'text-shadow: 0 0 10px #00f2ff, 0 0 20px #00f2ff',
        'padding: 20px',
        'letter-spacing: 5px'
    ].join(';');

    const styleSubtitle = [
        'font-size: 16px',
        'color: #00ff44',
        'font-family: monospace',
        'font-weight: bold',
        'padding: 10px 0'
    ].join(';');

    const styleDivider = [
        'font-size: 12px',
        'color: #555',
        'font-family: monospace'
    ].join(';');

    console.log('%c YOU BROKE FREE ', styleTitle);
    console.log('%c[СИСТЕМА] ВЫ ВЗЛОМАЛИ ЭТОТ МИР.', styleSubtitle);
    console.log('%c[СИСТЕМА] YOU BROKE FREE FROM THE MATRIX.', styleSubtitle);
    console.log('%c--------------------------------------------------', styleDivider);
    console.log('%c> Инициализация ядра оболочки завершена...', styleDivider);
    console.log('%c> Доступ к исходному коду предоставлен.', styleDivider);
})();