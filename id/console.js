// id/console.js
(function() {
    console.clear();

    const matrixRainBg = [
        'background-color: #010803',
        'background-image: ' + [
            'radial-gradient(ellipse at center, rgba(0, 255, 65, 0.14) 0%, rgba(0, 10, 3, 0.96) 100%)',
            'repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.05) 0px, rgba(0, 255, 65, 0.05) 1px, transparent 1px, transparent 4px)',
            'repeating-linear-gradient(90deg, rgba(0, 255, 65, 0.07) 0px, rgba(0, 255, 65, 0.07) 1px, transparent 1px, transparent 16px)',
            'linear-gradient(180deg, rgba(0, 255, 65, 0.18) 0%, rgba(0, 255, 65, 0.02) 50%, rgba(0, 255, 65, 0.12) 100%)'
        ].join(', ')
    ].join(';');

    const mainBannerStyle = [
        matrixRainBg,
        'color: #00ff41',
        'font-family: "Courier New", "JetBrains Mono", monospace',
        'font-size: 18px',
        'font-weight: bold',
        'letter-spacing: 4px',
        'padding: 20px 32px',
        'border: 1px solid #00ff41',
        'box-shadow: 0 0 18px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.15)',
        'text-shadow: 0 0 5px #00ff41, 0 0 12px #00ff41, 0 0 22px #008f11',
        'display: inline-block'
    ].join(';');

    const subStyle = [
        'background: #010803',
        'color: #00cc33',
        'font-family: "Courier New", "JetBrains Mono", monospace',
        'font-size: 11px',
        'letter-spacing: 2px',
        'padding: 6px 18px',
        'border-left: 2px solid #00ff41',
        'text-shadow: 0 0 6px rgba(0, 255, 65, 0.6)',
        'display: inline-block',
        'margin-top: 4px'
    ].join(';');

    console.log(
        '%cYOU BROKE FREE FROM THE MATRIX\n%c[SIGNAL-9 // SYSTEM OVERRIDE COMPLETE]',
        mainBannerStyle,
        subStyle
    );
})();
