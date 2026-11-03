// js/archive.js
(function() {
    const CYCLE_TIME_MS = 128000; // 128 секунд
    
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
        const now = Date.now();

        let buffer1 = []; // Свежие (0 - 128 сек)
        let buffer2 = []; // Старые (128 - 256 сек)
        let toDelete = []; // Очень старые (> 256 сек)

        phrases.forEach(p => {
            const age = now - p.timestamp;
            if (age < CYCLE_TIME_MS) {
                buffer1.push(p);
            } else if (age < CYCLE_TIME_MS * 2) {
                buffer2.push(p);
            } else {
                toDelete.push(p);
            }
        });

        // Если есть фразы на удаление, чистим память
        if (toDelete.length > 0) {
            phrases = phrases.filter(p => (now - p.timestamp) < CYCLE_TIME_MS * 2);
            savePhraseData(phrases);
        }

        // Сортируем (новые вверху)
        let currentList = (currentPage === 1) ? buffer1.reverse() : buffer2.reverse();

        grid.innerHTML = '';
        
        // Рисуем до 5 фраз (5 строк по 5 ячеек)
        for (let row = 0; row < 5; row++) {
            const phraseObj = currentList[row];
            
            for (let col = 0; col < 5; col++) {
                if (phraseObj && phraseObj.words[col]) {
                    const word = phraseObj.words[col];
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell';
                    
                    // Если это 2-я вкладка и фраза старая — готовим к растворению
                    if (currentPage === 2) {
                        const age = now - phraseObj.timestamp;
                        const timeLeft = (CYCLE_TIME_MS * 2) - age;
                        if (timeLeft < 15000) {
                            cell.style.opacity = Math.max(0, timeLeft / 15000);
                            cell.style.transform = `scale(${Math.max(0.5, timeLeft / 15000)})`;
                        }
                    }

                    const indices = typeof getPath === 'function' ? getPath(word) : [];
                    let svgMarkup = typeof createSVG === 'function' ? createSVG(indices) : '';
                    
                    cell.innerHTML = `
                        <div class="glyph-svg">${svgMarkup}</div>
                        <div class="glyph-label">${word}</div>
                    `;
                    grid.appendChild(cell);
                } else {
                    // Пустая ячейка
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
})();
