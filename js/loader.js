// js/loader.js
(function() {
    const scripts = [
        "js/phrases.js",
        "js/config.js",
        "js/glyph.js",
        "js/audio.js",
        "js/visual.js",
        "js/ui.js",
        "js/journal.js",  
        "js/terminal.js"
        "js/cheats.js"
    ];
    scripts.forEach(src => {
        document.write(`<script src="${src}"></script>`);
    });
    console.log("SYSTEM: Все модули ядра загружены.");
})();
