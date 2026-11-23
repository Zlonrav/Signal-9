// js/loader.js
(function() {
    const scripts = [
        "https://signal-9.ru/js/phrases.js",
        "https://signal-9.ru/js/config.js",
        "https://signal-9.ru/js/glyph.js",
        "https://signal-9.ru/js/audio.js",
        "https://signal-9.ru/js/visual.js",
        "https://signal-9.ru/js/ui.js",
        "https://signal-9.ru/js/journal.js",  
        "https://signal-9.ru/js/terminal.js",
        "https://signal-9.ru/js/cheats.js",
        "https://signal-9.ru/js/sync.js" 
    ];
    scripts.forEach(src => {
        document.write(`<script src="${src}"></script>`);
    });
    console.log("SYSTEM: Все модули ядра загружены.");
})();
