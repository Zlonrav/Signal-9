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

        if (!isFixed && !isCalibrated) {
            if (errorScreen) errorScreen.style.display = 'flex';
            if (grid) grid.style.display = 'none';
            if (tabs) tabs.style.display = 'none';
            return;
        }

        if (errorScreen) errorScreen.style.display = 'none';
        if (grid) grid.style.display = 'grid';
        if (tabs) tabs.style.display = 'flex';

        let phrases = getPhraseData();

        // Сортируем по времени (новые вверху)
        phrases.sort((a, b) => b.timestamp - a.timestamp);

        // Делим на буферы по 5 штук
        let buffer1 = phrases.slice(0, 5); 
        let buffer2 = phrases.slice(5, 10); 

        // Выбираем, что рисовать
        let currentList = (currentPage === 1) ? buffer1 : buffer2;

        grid.innerHTML = '';
        
        for (let row = 0; row < 5; row++) {
            const phraseObj = currentList[row];
            
            for (let col = 0; col < 5; col++) {
                if (phraseObj && phraseObj.words[col]) {
                    const word = phraseObj.words[col];
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell';
                    
                    if (currentPage === 2 && row === 4) {
                        cell.style.opacity = 0.5;
                    }

                    const indices = typeof getPath === 'function' ? getPath(word) : [];
                    let svgMarkup = typeof createSVG === 'function' ? createSVG(indices) : '';
                    
                    cell.innerHTML = `
                        <div class="glyph-svg">${svgMarkup}</div>
                        <div class="glyph-label">${word}</div>
                    `;
                    grid.appendChild(cell);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell empty-slot';
                    grid.appendChild(cell);
                }
            }
        }

        // --- АВТОМАТИЧЕСКАЯ ПРОВЕРКА ТЕСТА ---
        // Если калибровка пройдена, но фикса нет, проверяем, пришло ли 2 новые фразы
        if (isCalibrated && !isFixed) {
            const baseline = parseInt(localStorage.getItem('s9_archive_baseline_count') || '0', 10);
            if (phrases.length - baseline >= 2) {
                localStorage.setItem('s9_archive_fixed', 'true');
                // Принудительно обновляем журнал, чтобы он сразу показал отчет
                if (typeof window.updateQuestion === 'function') {
                    window.currentChatStep = 0; // Сбрасываем на первый шаг
                    window.updateQuestion();
                }
            }
        }
        // --- ЛОГИКА ЗАВЕРШЕНИЯ ТЕСТА (ТОЛЬКО В ВИЗУАЛЬНОМ РЕНДЕРЕ) ---
        const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
        const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';

        if (isCalibrated && !isFixed) {
            const baseline = parseInt(localStorage.getItem('s9_archive_baseline_count') || '0', 10);
            // Если в памяти появилось 2 новые фразы (2 новых ряда на экране)
            if (phrases.length - baseline >= 2) {
                localStorage.setItem('s9_archive_fixed', 'true');
                // Принудительно перезагружаем страницу, чтобы журнал увидел флаг
                setTimeout(() => { location.reload(); }, 1000);
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
    setInterval(() => {
        const timerEl = document.getElementById('timer');
        if (!timerEl) return;

        const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
        
        // Если калибровка не пройдена, показываем заглушку и не тикаем
        if (!isCalibrated) {
            timerEl.innerText = "ОЖИДАНИЕ КАЛИБРОВКИ ПАМЯТИ...";
            return;
        }

        if (typeof CYCLE_TIME !== 'undefined') {
            const timeSec = Math.floor(Date.now() / 1000);
            const timeLeft = CYCLE_TIME - (timeSec % CYCLE_TIME);
            timerEl.innerText = `ПРИЁМ СИГНАЛА: ${timeLeft} сек`;
        }
    }, 1000);
})();
