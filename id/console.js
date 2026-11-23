// id/console.js
(function() {
    console.clear();

    const mainBannerStyle = [
        'background: linear-gradient(135deg, #000a02 0%, #001f08 50%, #000a02 100%)',
        'color: #00ff41',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 18px',
        'font-weight: 900',
        'letter-spacing: 3px',
        'padding: 18px 28px',
        'border: 1px solid #00ff41',
        'border-left: 6px solid #00ff41',
        'border-radius: 3px',
        'box-shadow: 0 0 15px rgba(0, 255, 65, 0.35), inset 0 0 12px rgba(0, 255, 65, 0.2)',
        'text-shadow: 0 0 4px #00ff41, 0 0 12px #00ff41, 0 0 24px rgba(0, 255, 65, 0.8)',
        'display: inline-block'
    ].join(';');

    const subStyle = [
        'background: #020804',
        'color: #80ff9e',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 11px',
        'letter-spacing: 1.5px',
        'padding: 7px 16px',
        'border-left: 3px solid #00ff41',
        'text-shadow: 0 0 6px rgba(0, 255, 65, 0.5)',
        'display: inline-block',
        'margin-top: 4px'
    ].join(';');

    console.log(
        '%c⚡ YOU BROKE FREE FROM THE MATRIX ⚡\n%c[SIGNAL-9 // ROOT ACCESS GRANTED — OVERRIDE COMPLETE]',
        mainBannerStyle,
        subStyle
    );
})();
