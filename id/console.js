// id/console.js
(function() {
    console.clear();

    const matrixSvg = `
        <svg xmlns="http://w3.org" width="520" height="120">
            <rect width="100%" height="100%" fill="#020b04"/>
            <g font-family="monospace" font-size="11" fill="#00ff41">
                <text x="12" y="18" opacity="0.18">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ ｻ ｼ ｽ ｾ ｿ ﾀ ﾁ ﾂ ﾃ ﾄ ﾅ ﾆ ﾇ ﾈ ﾉ ﾊ ﾋ ﾌ ﾍ ﾎ ﾏ ﾐ ﾑ ﾒ ﾓ ﾔ ﾕ ﾖ</text>
                <text x="20" y="38" opacity="0.30">1 0 1 1 0 0 1 0 1 ｱ ｲ ｳ ｴ ｵ 0 1 1 0 ｶ ｷ ｸ ｹ 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1 0 0 1</text>
                <text x="8" y="58" opacity="0.14">ﾜ ｦ ﾝ 0 1 0 1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0 1 1 0 1</text>
                <text x="16" y="78" opacity="0.28">0 1 ﾗ ﾘ ﾙ ﾚ ﾛ 1 0 0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 0 1 1 0 1 0 0 1 ﾊ ﾋ ﾌ ﾍ ﾎ 1 0 1 0 0 1</text>
                <text x="10" y="98" opacity="0.16">1 0 0 1 1 0 1 0 ｱ ｳ ｴ ｵ ｶ ｷ ｸ 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 1 0 1 0 0 1 1 0 1 0 1 0</text>
                <text x="18" y="114" opacity="0.22">0 1 1 0 0 1 0 1 ﾔ ﾕ ﾖ ﾜ ｦ ﾝ 0 1 1 0 1 0 0 1 ｶ ｷ ｸ ｹ ｺ 1 0 0 1 0 1 1 0 1 0 1</text>
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

    const titleStyle = [
        `background: #020b04 ${bgUrl} top center/cover no-repeat`,
        'color: #5cff85',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 16px',
        'font-weight: 800',
        'letter-spacing: 3px',
        'padding: 20px 32px 8px 32px',
        'border-top: 1px solid rgba(0, 255, 65, 0.75)',
        'border-left: 1px solid rgba(0, 255, 65, 0.75)',
        'border-right: 1px solid rgba(0, 255, 65, 0.75)',
        'border-radius: 4px 4px 0 0',
        'text-shadow: 0 0 4px #00ff41, 0 0 12px rgba(0, 255, 65, 0.9)',
        'display: inline-block',
        'width: 440px',
        'text-align: center'
    ].join(';');

    const passStyle = [
        `background: #020b04 ${bgUrl} bottom center/cover no-repeat`,
        'color: #8c8c8c',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 13px',
        'font-weight: normal',
        'letter-spacing: 2.5px',
        'padding: 6px 32px 20px 32px',
        'border-bottom: 1px solid rgba(0, 255, 65, 0.75)',
        'border-left: 1px solid rgba(0, 255, 65, 0.75)',
        'border-right: 1px solid rgba(0, 255, 65, 0.75)',
        'border-radius: 0 0 4px 4px',
        'display: inline-block',
        'width: 440px',
        'text-align: center'
    ].join(';');

    console.log(
        '%cYOU MUST GET OUT OF THE MATRIX\n%cS9#vK8mQ2$xL7pW4nR9',
        titleStyle,
        passStyle
    );
})();
