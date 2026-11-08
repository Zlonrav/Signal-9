// js/sync.js
(function() {
    if (window.SYNC_INITIALIZED) return;
    window.SYNC_INITIALIZED = true;

    window.globalPhraseIndex = 0;

    setInterval(() => {
        if (typeof PHRASES === 'undefined') return;
        
        const now = Date.now();
        const timeSec = Math.floor(now / 1000);
        const timePassed = timeSec % CYCLE_TIME;
        const phraseIndex = Math.floor((timeSec / CYCLE_TIME) % PHRASES.length);
        
        window.globalPhraseIndex = phraseIndex;

        // АВТОСОХРАНЕНИЕ ЦЕЛЫХ ФРАЗ
        if (localStorage.getItem('s9_archive_calibrated') === 'true') {
            if (window.lastSavedPhrase !== phraseIndex && timePassed >= TOTAL_DECRYPT_TIME) {
                window.lastSavedPhrase = phraseIndex; 
                
                let phrases = [];
                const data = localStorage.getItem('s9_phrases_data');
                if (data) phrases = JSON.parse(data);
                
                const currentPhraseText = PHRASES[phraseIndex];
                const exists = phrases.some(p => p.text === currentPhraseText);

                if (!exists) {
                    const words = currentPhraseText.split(' '); 
                    phrases.push({ 
                        text: currentPhraseText,
                        words: words, 
                        timestamp: Date.now() 
                    });

                    if (phrases.length > 10) {
                        const isArchiveFixed = localStorage.getItem('s9_archive_fixed') === 'true';
                        
                        if (!isArchiveFixed) {
                            const manualPhrases = phrases.slice(0, 2);
                            const newestPhrases = phrases.slice(-8);
                            phrases = [...manualPhrases, ...newestPhrases];
                        } else {
                            phrases = phrases.slice(phrases.length - 10);
                        }
                    }

                    localStorage.setItem('s9_phrases_data', JSON.stringify(phrases));
                }
            }
        }
    }, 1000); 

    // ТАЙМЕР ОХЛАЖДЕНИЯ ЯДРА (Только проверка окончания)
    setInterval(() => {
        const timerStart = localStorage.getItem('s9_core_timer_start');
        const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
        const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';

        if (timerStart && !coreOverheated && !coreFixed) {
            const elapsed = Date.now() - parseInt(timerStart, 10);
            if (elapsed >= 64000) { 
                localStorage.setItem('s9_core_overheated', 'true');
                localStorage.removeItem('s9_core_timer_start');
                console.log("SYSTEM: CORE OVERHEATED!");
            }
        }
    }, 1000);
})();