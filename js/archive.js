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
        const now = Date.now();

        // 1. Сортируем все фразы по времени (новые вверху)
        phrases.sort((a, b) => b.timestamp - a.timestamp);

        // 2. Делим на буферы по 5 штук
        let buffer1 = phrases.slice(0, 5); // 5 самых новых
        let buffer2 = phrases.slice(5, 10); // 5 следующих за ними
        let toDelete = phrases.slice(10); // Все, что старше 10 фраз

        // 3. Если есть фразы на удаление, чистим память
        if (toDelete.length > 0) {
            savePhraseData(phrases.slice(0, 10));
        }

        // 4. Выбираем, что рисовать
        let currentList = (currentPage === 1) ? buffer1 : buffer2;

        grid.innerHTML = '';
        
        // Рисуем до 5 фраз (5 строк по 5 ячеек)
        for (let row = 0; row < 5; row++) {
            const phraseObj = currentList[row];
            
            for (let col = 0; col < 5; col++) {
                if (phraseObj && phraseObj.words[col]) {
                    const word = phraseObj.words[col];
                    const cell = document.createElement('div');
                    cell.className = 'glyph-cell';
                    
                    // УБРАЛИ ЛОГИКУ РАСТВОРЕНИЯ, ЧТОБЫ ВСЕ БЫЛО ВИДНО
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
