// id/console.js
(function() {

    // Стиль: Черный фон, зеленый текст, зеленое свечение
    const matrixStyle = [
        'background: #000000',
        'color: #00ff41',
        'font-family: monospace',
        'font-size: 16px',
        'font-weight: bold',
        'padding: 15px 20px',
        'text-shadow: 0 0 5px #00ff41, 0 0 10px #00ff41',
        'border: 1px solid #003300',
        'display: inline-block'
    ].join(';');

    const subStyle = [
        'background: #000000',
        'color: #00ff41',
        'font-family: monospace',
        'font-size: 12px',
        'padding: 5px 20px',
        'display: inline-block',
        'border-left: 2px solid #00ff41',
        'margin-top: 5px'
    ].join(';');

    console.log('%c YOU BROKE FREE FROM THE MATRIX ', matrixStyle);
})();