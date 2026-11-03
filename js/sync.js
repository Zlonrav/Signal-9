// js/sync.js
(function() {
    if (window.SYNC_INITIALIZED) return;
    window.SYNC_INITIALIZED = true;

    // Глобальная переменная для доступа к текущей фразе
    window.globalPhraseIndex = 0;

    setInterval(() => {
        if (typeof PHRASES === 'undefined') return;
        
        const now = Date.now();
        const timeSec = Math.floor(now / 1000);
        const timePassed = timeSec % CYCLE_TIME;
        const phraseIndex = Math.floor((timeSec / CYCLE_TIME) % PHRASES.length);
        
        window.globalPhraseIndex = phraseIndex;

        // ЛОГИКА АВТОСОХРАНЕНИЯ В АРХИВ
        if (localStorage.getItem('s9_archive_calibrated') === 'true') {
            if (window.lastSavedPhrase !== phraseIndex && timePassed >= TOTAL_DECRYPT_TIME) {
                window.lastSavedPhrase = phraseIndex; 
                
                let glyphs = [];
                const data = localStorage.getItem('s9_glyphs_data');
                if (data) glyphs = JSON.parse(data);
                
                let changed = false;
                const words = PHRASES[phraseIndex].split(' ');
                
                words.forEach(w => {
                    const cleanWord = w.toUpperCase().replace(/[^А-ЯЁA-Z]/g, '');
                    if (cleanWord.length >= 3) { 
                        const exists = glyphs.some(g => g.word === cleanWord);
                        if (!exists) {
                            glyphs.push({ word: cleanWord, timestamp: Date.now() });
                            changed = true;
                        }
                    }
                });

                if (glyphs.length > 50) {
                    glyphs = glyphs.slice(glyphs.length - 50);
                }

                if (changed) {
                    localStorage.setItem('s9_glyphs_data', JSON.stringify(glyphs));
                }
            }
        }
    }, 1000); // Проверяем каждую секунду
})();
