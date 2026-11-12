// js/archive.js
(function() {
    const CYCLE_TIME_MS = 128000; 
    
    let currentPage = 1;
    let archiveInterval = null;

    window.switchArchivePage = function(pageNum) {
        currentPage = pageNum;
        document.querySelectorAll('.page-tab').forEach((btn, idx) => {
            btn.classList.toggle('active', idx + 1 === pageNum);
        });
        renderArchiveGrid();
    };

    function getPhraseData() {
        const data = localStorage.getItem('s9_phrases_data');
        return data ? JSON.parse(data) : [];
    }

    function savePhraseData(data) {
        localStorage.setItem('s9_phrases_data', JSON.stringify(data));
    }

    function renderArchiveGrid() {
        const grid = document.getElementById('archiveGrid');
        const tabs = document.getElementById('archiveTabs');
        const errorScreen = document.getElementById('archiveErrorScreen');
        
        const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';
        const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';

        // Если калибровка не пройдена и фикса нет — показываем ошибку
        if (!isFixed && !isCalibrated) {
            if (errorScreen) errorScreen.style.display = 'flex';
            if (grid) grid.style.display = 'none';
            if (tabs) tabs.style.display = 'none';
            return;
        }

        if (errorScreen) errorScreen.style.display = 'none';
        if (grid) grid.style.display = 'grid';
        if (tabs) tabs.style.display = 'flex';

        // Получаем фразы СНАЧАЛА
        let phrases = getPhraseData();
        phrases.sort((a, b) => b.timestamp - a.timestamp);

        // --- ЛОГИКА ЗАВЕРШЕНИЯ ТЕСТА ---
        if (isCalibrated && !isFixed) {
            const baseline = parseInt(localStorage.getItem('s9_archive_baseline_count') || '1', 10);
            if (phrases.length >= baseline + 2) {
                localStorage.setItem('s9_archive_fixed', 'true');
                setTimeout(() => { location.reload(); }, 1000);
            }
        }
        // ------------------------

        let buffer1 = phrases.slice(0, 5); 
        let buffer2 = phrases.slice(5, 10); 

        let currentList = (currentPage === 1) ? buffer1 : buffer2;

        grid.innerHTML = '';

        // --- ПРОВЕРКА СЕКТОРА ВЕРИФИКАЦИИ ---
        const isSaltFound = localStorage.getItem('s9_salt_found') === 'true';
        
        if (currentPage === 2 && !isSaltFound) {
            // 1. Сначала рендерим 25 пустых слотов для фона (как в Накопительном буфере)
            for (let i = 0; i < 25; i++) {
                const cell = document.createElement('div');
                cell.className = 'glyph-cell empty-slot';
                grid.appendChild(cell);
            }
            
            // 2. Накладываем поверх сетки плашку с ошибкой
            const errorOverlay = document.createElement('div');
            errorOverlay.style.position = 'absolute';
            errorOverlay.style.inset = '0';
            errorOverlay.style.display = 'flex';
            errorOverlay.style.alignItems = 'center';
            errorOverlay.style.justifyContent = 'center';
            errorOverlay.style.zIndex = '10';
            
            errorOverlay.innerHTML = `
                <div style="text-align: center; border: 1px solid #ff3333; padding: 40px; background: rgba(15, 2, 2, 0.95); box-shadow: 0 0 30px rgba(255, 51, 51, 0.5); border-radius: 8px; max-width: 80%;">
                    <div style="color: #ff3333; font-size: 24px; font-weight: bold; font-family: 'Michroma', sans-serif; margin-bottom: 20px; letter-spacing: 2px; text-shadow: 0 0 10px #ff3333;">ОШИБКА ВЕРИФИКАЦИИ</div>
                    <div style="color: #ff6666; font-size: 14px; font-family: 'JetBrains Mono', monospace; line-height: 1.6;">
                        СИГНАЛ ЗАШИФРОВАН.<br>КЛЮЧ-ПАРОЛЬ НЕ НАЙДЕН.<br><br>
                        <span style="opacity: 0.7; font-size: 12px;">ДЕШИФРОВКА НЕВОЗМОЖНА.</span>
                    </div>
                </div>
            `;
            grid.appendChild(errorOverlay);
            return; // Прерываем отрисовку слов
        }
        // ------------------------------------
        
        for (let row = 0; row < 5; row++) {
            const phraseObj = currentList[row];
            
            for (let col = 0; col < 5; col++) {
                if (phraseObj && phraseObj.words[col]) {
                    const word = phraseObj.words[col];
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell';
                    
                    if (currentPage === 2 && row === 4) {
                        cell.style.opacity = 1;
                    }

                    const indices = typeof getPath === 'function' ? getPath(word) : [];
                    let svgMarkup = typeof createSVG === 'function' ? createSVG(indices) : '';
                    
                    cell.innerHTML = `
                        <div class="glyph-svg">${svgMarkup}</div>
                        <div class="glyph-label">${getWrongLabel(word)}</div>
                    `;
                    grid.appendChild(cell);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell empty-slot';
                    grid.appendChild(cell);
                }
            }
        }
    }

    function initArchive() {
        renderArchiveGrid();
        if (archiveInterval) clearInterval(archiveInterval);
        archiveInterval = setInterval(renderArchiveGrid, 1000);
    }

    document.addEventListener('DOMContentLoaded', initArchive);
    // Обновление таймера телеметрии
    // Обновление таймера телеметрии
    setInterval(() => {
        const timerEl = document.getElementById('timer');
        if (!timerEl) return;

        const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
        
        if (!isCalibrated) {
            timerEl.innerText = "ОЖИДАНИЕ КАЛИБРОВКИ ПАМЯТИ...";
            return;
        }

        if (typeof CYCLE_TIME !== 'undefined' && typeof TOTAL_DECRYPT_TIME !== 'undefined') {
            const timeSec = Math.floor(Date.now() / 1000);
            const timePassed = timeSec % CYCLE_TIME;
            const timeLeft = CYCLE_TIME - timePassed;

            // Если прошло больше времени, чем нужно на дешифровку (110 сек),
            // значит данные уже отправлены в Архив, и мы ждем нового цикла
            if (timePassed >= TOTAL_DECRYPT_TIME) {
                timerEl.innerText = `ОЖИДАНИЕ СЛЕДУЮЩЕГО ЦИКЛА: ${timeLeft} сек`;
            } else {
                timerEl.innerText = `ПРИЁМ СИГНАЛА: ${timeLeft} сек`;
            }
        }
    }, 1000);
})();
