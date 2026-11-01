// --- ЗАГРУЗЧИК СИСТЕМ СТАНЦИИ СИГНАЛ-9 ---
(function() {
    const scripts = [
        "js/phrases.js",
        "js/config.js",
        "js/glyphEngine.js",
        "js/audioEngine.js",
        "js/visualEngine.js",
        "js/uiEngine.js",
        "js/room_chat.js",   // <--- НОВЫЙ
        "js/chatEngine.js",
        "js/terminal.js"     // <--- ЗАМЕНА navEngine.js
    ];
    scripts.forEach(src => {
        document.write(`<script src="${src}"></script>`);
    });
    console.log("SYSTEM: Все модули ядра загружены.");
})();
