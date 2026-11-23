// id/console.js
(function() {
    console.clear();

    const matrixSvg = `
        <svg xmlns="http://w3.org" width="500" height="300">
            <rect width="100%" height="100%" fill="#020804"/>
            <g font-family="monospace" font-size="12" fill="#00ff41">
                <text x="15" y="25" opacity="0.18">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ ｻ ｼ ｽ ｾ ｿ ﾀ ﾁ ﾂ ﾃ ﾄ ﾅ ﾆ ﾇ ﾈ ﾉ ﾊ ﾋ ﾌ ﾍ ﾎ ﾏ ﾐ ﾑ ﾒ ﾓ</text>
                <text x="30" y="55" opacity="0.28">1 0 1 1 0 0 1 0 1 ｱ ｲ ｳ ｴ ｵ 0 1 1 0 ｶ ｷ ｸ ｹ 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1</text>
                <text x="10" y="85" opacity="0.14">ﾜ ｦ ﾝ 0 1 0 1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0</text>
                <text x="25" y="115" opacity="0.25">0 1 ﾗ ﾘ ﾙ ﾚ ﾛ 1 0 0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 0 1 1 0 1 0 0 1 ﾊ ﾋ ﾌ ﾍ ﾎ 1 0</text>
                <text x="12" y="145" opacity="0.15">1 0 0 1 1 0 1 0 ｱ ｳ ｴ ｵ ｶ ｷ ｸ 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 1 0 1 0 0 1 1 0</text>
                <text x="22" y="175" opacity="0.24">0 1 1 0 0 1 0 1 ﾔ ﾕ ﾖ ﾜ ｦ ﾝ 0 1 1 0 1 0 0 1 ｶ ｷ ｸ ｹ ｺ 1 0 0 1 0 1 1</text>
                <text x="18" y="205" opacity="0.16">1 0 ｱ ｲ ｳ ｴ ｵ 1 0 1 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 0 1 ﾀ ﾁ ﾂ ﾃ ﾄ 1 0 0 1 1 0</text>
                <text x="28" y="235" opacity="0.26">0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 1 0 0 1 0 1 1 0 ﾗ ﾘ ﾙ ﾚ ﾛ 0 1 1 0 1 0 0 1 0 1</text>
                <text x="14" y="265" opacity="0.15">1 1 0 0 1 0 1 0 ﾊ ﾋ ﾌ ﾍ ﾎ 0 1 1 0 1 0 0 1 ﾜ ｦ ﾝ 1 0 1 0 0 1 1 0 1 0</text>
                <text x="20" y="290" opacity="0.20">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ 1 0 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1 0 0 1 1 0</text>
            </g>
        </svg>
    `.trim().replace(/\s+/g, ' ');

    const bgUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(matrixSvg)}")`;

    const fullScreenMatrixStyle = [
        `background: #020804 ${bgUrl} repeat`,
        'color: #5cff85',
        'font-family: "JetBrains Mono", "Consolas", monospace',
        'font-size: 16px',
        'font-weight: 800',
        'letter-spacing: 3.5px',
        'padding: 180px 260px',
        'margin: -20px',
        'text-shadow: 0 0 5px #00ff41, 0 0 15px #00ff41, 0 0 28px #008f11',
        'display: inline-block'
    ].join(';');

    console.log('%cYOU BROKE FREE FROM THE MATRIX', fullScreenMatrixStyle);
})();
