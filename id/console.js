// id/console.js
(function() {
    console.clear();

    // Стиль в духе Матрицы (зеленый неон)
    const styleMatrix = [
        'font-size: 20px',
        'font-weight: bold',
        'font-family: monospace',
        'color: #00ff41', // Классический матричный зеленый
        'text-shadow: 0 0 5px #00ff41, 0 0 15px #00ff41',
        'padding: 15px',
        'letter-spacing: 2px'
    ].join(';');

    const styleDivider = [
        'font-size: 12px',
        'color: #555',
        'font-family: monospace'
    ].join(';');

    // Вывод
    console.log('%cYOU BROKE FREE FROM THE MATRIX.', styleMatrix);
    console.log('%c--------------------------------------------------', styleDivider);
    console.log('%c> Инициализация ядра оболочки завершена...', styleDivider);
    console.log('%c> Доступ к исходному коду предоставлен.', styleDivider);
})();