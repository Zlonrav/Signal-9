// id/console.js
(function() {
    console.clear();

    const matrixSvg = `<svg xmlns="http://w3.org" width="460" height="180"><rect width="100%" height="100%" fill="#020b04"/><g font-family="monospace" font-size="11" fill="#00ff41"><text x="12" y="20" opacity="0.20">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ ｻ ｼ ｽ ｾ ｿ ﾀ ﾁ ﾂ ﾃ ﾄ ﾅ ﾆ ﾇ ﾈ ﾉ ﾊ ﾋ ﾌ ﾍ ﾎ ﾏ ﾐ ﾑ ﾒ ﾓ</text><text x="20" y="45" opacity="0.32">1 0 1 1 0 0 1 0 1 ｱ ｲ ｳ ｴ ｵ 0 1 1 0 ｶ ｷ ｸ ｹ 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1</text><text x="8" y="70" opacity="0.15">ﾜ ｦ ﾝ 0 1 0 1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0</text><text x="16" y="95" opacity="0.28">0 1 ﾗ ﾘ ﾙ ﾚ ﾛ 1 0 0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 0 1 1 0 1 0 0 1 ﾊ ﾋ ﾌ ﾍ ﾎ 1 0</text><text x="10" y="120" opacity="0.18">1 0 0 1 1 0 1 0 ｱ ｳ ｴ ｵ ｶ ｷ ｸ 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 1 0 1 0 0 1 1 0</text><text x="22" y="145" opacity="0.25">0 1 1 0 0 1 0 1 ﾔ ﾕ ﾖ ﾜ ｦ ﾝ 0 1 1 0 1 0 0 1 ｶ ｷ ｸ ｹ ｺ 1 0 0 1 0 1 1</text><text x="14" y="170" opacity="0.16">1 0 ｱ ｲ ｳ ｴ ｵ 1 0 1 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 0 1 ﾀ ﾁ ﾂ ﾃ ﾄ 1 0 0 1 1 0</text></g></svg>`;
    const bgUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(matrixSvg)}")`;

    const base = `background: #020b04 ${bgUrl} center/cover no-repeat; font-family: monospace; font-size: 14px; line-height: 1.25; padding: 2px 0;`;
    const borderStyle = `${base} color: #00ff41; text-shadow: 0 0 6px #00ff41;`;
    const titleStyle  = `${base} color: #5cff85; font-weight: bold; text-shadow: 0 0 8px #00ff41;`;
    const passStyle   = `${base} color: #757575; font-weight: normal; text-shadow: none;`;

    console.log(
        '%c╔════════════════════════════════════╗\n' +
        '%c║                                    ║\n' +
        '%c║                                    ║\n' +
        '%c║   %cYOU MUST GET OUT OF THE MATRIX%c   ║\n' +
        '%c║                                    ║\n' +
        '%c║                                    ║\n' +
        '%c║         %cS9#vK8mQ2$xL7pW4nR9%c        ║\n' +
        '%c║                                    ║\n' +
        '%c╚════════════════════════════════════╝',
        borderStyle,
        borderStyle,
        borderStyle,
        borderStyle, titleStyle, borderStyle,
        borderStyle,
        borderStyle,
        borderStyle, passStyle, borderStyle,
        borderStyle,
        borderStyle
    );
})();
