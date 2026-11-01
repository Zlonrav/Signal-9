// js/loader.js
(function() {
    const scripts = [
        "js/phrases.js",
        "js/config.js",
        "js/glyphEngine.js",
        "js/audioEngine.js",
        "js/visualEngine.js",
        "js/uiEngine.js",
        "js/roomChat.js",   
        "js/chatEngine.js",
        "js/terminal.js"   
    ];
    scripts.forEach(src => {
        document.write(`<script src="${src}"></script>`);
    });
    console.log("SYSTEM: Все модули ядра загружены.");
})();
