// id/console.js
(function() {
    console.clear();

    const matrixSvg = `
        <svg xmlns="http://w3.org" width="460" height="90">
            <rect width="100%" height="100%" fill="#020b04"/>
            <g font-family="monospace" font-size="11" fill="#00ff41">
                <text x="12" y="16" opacity="0.18">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ ｻ ｼ ｽ ｾ ｿ ﾀ ﾁ ﾂ ﾃ ﾄ ﾅ ﾆ ﾇ ﾈ ﾉ ﾊ ﾋ ﾌ ﾍ ﾎ ﾏ ﾐ ﾑ ﾒ ﾓ ﾔ ﾕ ﾖ</text>
                <text x="20" y="32" opacity="0.32">1 0 1 1 0 0 1 0 1 ｱ ｲ ｳ ｴ ｵ 0 1 1 0 ｶ ｷ ｸ ｹ 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1 0 0 1</text>
                <text x="8" y="48" opacity="0.14">ﾜ ｦ ﾝ 0 1 0 1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0 1 1 0 1</text>
                <text x="16" y="64" opacity="0.28">0 1 ﾗ ﾘ ﾙ ﾚ ﾛ 1 0 0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 0 1 1 0 1 0 0 1 ﾊ ﾋ ﾌ ﾍ ﾎ 1 0 1 0 0 1</text>
                <text x="10" y="80" opacity="0.16">1 0 0 1 1 0 1 0 ｱ ｳ ｴ ｵ ｶ ｷ ｸ 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 1 0 1 0 0 1 1 0 1 0 1 0</text>
            </g>
            <rect width="100%" height="100%" fill="url(#fade)"/>
            <defs>
                <radialGradient id="fade" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stop-color="#00ff41" stop-opacity="0.08"/>
                    <stop offset="100%" stop-color="#010602" stop-opacity="0.88"/>
                </radialGradient>
            </defs>
        </svg>
    `.trim().replace(/\s+/g, ' ');

    const bgUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(matrixSvg)}")`;

    const bannerStyle = [
        `background: #020b04 ${bgUrl} center/cover no-repeat`,
        'color: #5cff85',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 16px',
        'font-weight: 800',
        'letter-spacing: 3.5px',
        'line-height: 1.6',
        'padding: 22px 34px',
        'border: 1px solid rgba(0, 255, 65, 0.75)',
        'border-radius: 4px',
        'box-shadow: 0 0 20px rgba(0, 255, 65, 0.25), inset 0 0 18px rgba(0, 255, 65, 0.18)',
        'text-shadow: 0 0 4px #00ff41, 0 0 12px rgba(0, 255, 65, 0.9)',
        'display: inline-block'
    ].join(';');

    const passStyle = [
        'color: #888888',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 13px',
        'letter-spacing: 2px',
        'padding: 6px 4px',
        'user-select: all'
    ].join(';');

    console.log('%cYOU BROKE FREE FROM THE MATRIX', bannerStyle);
    console.log('%cS9#vK8mQ2$xL7pW4nR9', passStyle);
})();
