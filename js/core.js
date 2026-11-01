// --- ГЛАВНЫЙ ЦИКЛ УПРАВЛЕНИЯ ---
function update() {
    if (typeof PHRASES === 'undefined') return;

    // ОБЪЯВЛЯЕМ ПЕРЕМЕННУЮ ТОЛЬКО ОДИН РАЗ
    const now = Date.now();
    
    // --- ИСПРАВЛЕННЫЙ БЛОК ГЛОБАЛЬНОГО СБОЯ ---
    // Читаем оба флага — солнце и реактор
    const isSolarEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
    const isReactorEmergency = localStorage.getItem('s9_emergency_reactor') === 'active';
    const isGlobalEmergency = isSolarEmergency || isReactorEmergency;
    
    if (isGlobalEmergency) {
        if (!isSignalLoss) triggerSignalLoss(true);
        const timeSec = Math.floor(now / 1000);
        const timePassed = timeSec % (typeof CYCLE_TIME !== 'undefined' ? CYCLE_TIME : 128);
        updateMetaData(now, true, timePassed, 0);
        return; // Завершаем выполнение кадра, если активен любой глобальный сбой
    }
    // ----------------------------

    // Продолжаем обычные расчеты (используем уже созданную 'now')
    const timeSec = Math.floor(now / 1000);
    const timeLeft = CYCLE_TIME - (timeSec % CYCLE_TIME);
    const timePassed = timeSec % CYCLE_TIME;
    const phraseIndex = Math.floor((timeSec / CYCLE_TIME) % PHRASES.length);

    const phraseContainer = document.getElementById('currentPhrase');

    if (timePassed === 0 && isSignalLoss && !testBtn.dataset.manual) triggerSignalLoss(false);

    if (document.getElementById('timer')) document.getElementById('timer').innerText = `ПРИЁМ СИГНАЛА: ${timeLeft} сек`;
    
    updateMetaData(now, isSignalLoss, timePassed, phraseIndex);

    if (isSignalLoss) return;

    if (!phraseContainer.dataset.index || phraseContainer.dataset.index === "ERROR_MODE") renderPhrase(phraseContainer, phraseIndex);

    if (timeLeft <= 1 || timePassed === 0) {
        phraseContainer.classList.add('wave-transition');
        document.body.classList.add('signal-glitch');
        if (phraseContainer.dataset.index != phraseIndex) renderPhrase(phraseContainer, phraseIndex);
    } else {
        phraseContainer.classList.remove('wave-transition', 'signal-glitch');
        document.body.classList.remove('signal-glitch');
    }

    if (timeLeft <= 1.5 && timeLeft > 0) phraseContainer.classList.add('fade-out');
    else phraseContainer.classList.remove('fade-out');

    const units = document.querySelectorAll('.glyph-unit');
    const words = PHRASES[phraseIndex].split(' ');
    const timePerGlyph = TOTAL_DECRYPT_TIME / words.length;

    units.forEach((unit, idx) => {
        const word = unit.dataset.wordActual, label = unit.querySelector('.glyph-label');
        if (!label) return;
        const revealStart = idx * timePerGlyph;
        let html = "";
        if (timePassed < revealStart) {
            html = `<span class="char-noise">${getNoise(14)}</span>`;
            unit.classList.remove('done', 'pulse-trigger');
        } else if (timePassed >= (revealStart + timePerGlyph)) {
            html = `<span class="char-fixed">${word}</span>`;
            if (!unit.classList.contains('done')) unit.classList.add('done', 'pulse-trigger');
        } else {
            const progress = (timePassed - revealStart) / timePerGlyph;
            const revealCount = Math.floor(word.length * progress);
            html = `<span class="char-fixed">${word.substring(0, revealCount)}</span><span class="char-noise">${getNoise(Math.max(14, word.length) - revealCount)}</span>`;
            unit.classList.remove('done', 'pulse-trigger');
        }
        if (label.innerHTML !== html) label.innerHTML = html;
    });
}

setInterval(update, 30);
update();
