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
                // Проверяем, нет ли уже такой фразы (чтобы не дублировать)
                const exists = phrases.some(p => p.text === currentPhraseText);

                if (!exists) {
                    const words = currentPhraseText.split(' '); // Берем все 5 слов как есть
                    phrases.push({ 
                        text: currentPhraseText,
                        words: words, 
                        timestamp: Date.now() 
                    });

                    // Оставляем только 10 фраз, но защищаем эталонные, пока Архив не починен
                    if (phrases.length > 10) {
                        const isArchiveFixed = localStorage.getItem('s9_archive_fixed') === 'true';
                        
                        if (!isArchiveFixed) {
                            // Если Архив еще не починен, сохраняем первые 2 (эталонные) 
                            // и добавляем 8 самых новых.
                            const manualPhrases = phrases.slice(0, 2);
                            const newestPhrases = phrases.slice(-8);
                            phrases = [...manualPhrases, ...newestPhrases];
                        } else {
                            // Если Архив починен, просто оставляем 10 последних
                            phrases = phrases.slice(phrases.length - 10);
                        }
                    }

                    localStorage.setItem('s9_phrases_data', JSON.stringify(phrases));
                }
            }
        }
    }, 1000); 
})();
