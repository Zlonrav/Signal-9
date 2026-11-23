// id/console.js
(function() {
    console.clear();

    const bannerSvg = `
        <svg xmlns="http://w3.org" width="460" height="104">
            <defs>
                <radialGradient id="fade" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stop-color="#00ff41" stop-opacity="0.10"/>
                    <stop offset="100%" stop-color="#010602" stop-opacity="0.90"/>
                </radialGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Чёрный фон и рамка -->
            <rect x="0.5" y="0.5" width="459" height="103" rx="4" fill="#020b04" stroke="#00ff41" stroke-opacity="0.75"/>

            <!-- Фоновый матричный код -->
            <g font-family="monospace" font-size="11" fill="#00ff41">
                <text x="12" y="18" opacity="0.20">0 1 ｱ ｳ ｴ ｵ ｶ ｷ ｸ ｹ ｺ ｻ ｼ ｽ ｾ ｿ ﾀ ﾁ ﾂ ﾃ ﾄ ﾅ ﾆ ﾇ ﾈ ﾉ ﾊ ﾋ ﾌ ﾍ ﾎ ﾏ ﾐ ﾑ ﾒ ﾓ</text>
                <text x="20" y="36" opacity="0.32">1 0 1 1 0 0 1 0 1 ｱ ｲ ｳ ｴ ｵ 0 1 1 0 ｶ ｷ ｸ ｹ 1 0 0 1 ｻ ｼ ｽ ｾ ｿ 0 1 1 0 1</text>
                <text x="8" y="54" opacity="0.15">ﾜ ｦ ﾝ 0 1 0 1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0</text>
                <text x="16" y="72" opacity="0.28">0 1 ﾗ ﾘ ﾙ ﾚ ﾛ 1 0 0 1 0 1 1 0 ﾏ ﾐ ﾑ ﾒ ﾓ 0 1 1 0 1 0 0 1 ﾊ ﾋ ﾌ ﾍ ﾎ 1 0</text>
                <text x="10" y="90" opacity="0.18">1 0 0 1 1 0 1 0 ｱ ｳ ｴ ｵ ｶ ｷ ｸ 0 1 0 1 1 0 ｻ ｼ ｽ ｾ ｿ 1 0 1 0 0 1 1 0</text>
            </g>

            <!-- Тёмная виньетка, чтобы текст читался чётко -->
            <rect x="1" y="1" width="458" height="102" rx="3.5" fill="url(#fade)"/>

            <!-- Главная надпись строго по центру -->
            <text x="230" y="46" text-anchor="middle" font-family="Consolas, 'JetBrains Mono', monospace" font-size="16" font-weight="bold" letter-spacing="2.5" fill="#5cff85" filter="url(#neonGlow)">
                YOU MUST GET OUT OF THE MATRIX
            </text>

            <!-- Серый пароль из 18 символов строго по центру под надписью -->
            <text x="230" y="76" text-anchor="middle" font-family="Consolas, 'JetBrains Mono', monospace" font-size="13" letter-spacing="2" fill="#8e8e8e">
                S9#vK8mQ2$xL7pW4nR9
            </text>
        </svg>
    `.trim().replace(/\s+/g, ' ');

    const style = [
        `background: url("data:image/svg+xml;utf8,${encodeURIComponent(bannerSvg)}") no-repeat`,
        'padding: 52px 230px',
        'line-height: 0'
    ].join(';');

    console.log('%c ', style);
})();
