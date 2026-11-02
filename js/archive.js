// js/archive.js
(function() {
    // Время в миллисекундах. 128 секунд.
    // Для тестов можешь поставить 10000 (10 секунд) и 20000 (20 секунд).
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

    function getGlyphData() {
        const data = localStorage.getItem('s9_glyphs_data');
        return data ? JSON.parse(data) : [];
    }

    function saveGlyphData(data) {
        localStorage.setItem('s9_glyphs_data', JSON.stringify(data));
    }

    function renderArchiveGrid() {
        const grid = document.getElementById('archiveGrid');
        const tabs = document.getElementById('archiveTabs');
        const errorScreen = document.getElementById('archiveErrorScreen');
        const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';

        if (!isFixed) {
            // Если Архив сломан, показываем ошибку, прячем сетку
            errorScreen.style.display = 'flex';
            grid.style.display = 'none';
            tabs.style.display = 'none';
            return;
        }

        errorScreen.style.display = 'none';
        grid.style.display = 'grid';
        tabs.style.display = 'flex';

        let glyphs = getGlyphData();
        const now = Date.now();

        // ДЕЛИМ ГЛИФЫ НА БУФЕРЫ
        let buffer1 = []; // Новые (свежие)
        let buffer2 = []; // Старые (верификация)
        let toDelete = []; // Очень старые (удалить)

        glyphs.forEach(g => {
            const age = now - g.timestamp;
            if (age < CYCLE_TIME_MS) {
                buffer1.push(g);
            } else if (age < CYCLE_TIME_MS * 2) {
                buffer2.push(g);
            } else {
                toDelete.push(g);
            }
        });

        // Если есть глифы на удаление, чистим массив и сохраняем
        if (toDelete.length > 0) {
            glyphs = glyphs.filter(g => (now - g.timestamp) < CYCLE_TIME_MS * 2);
            saveGlyphData(glyphs);
        }

        // Сортируем по времени (новые вверху)
        let currentList = (currentPage === 1) ? buffer1.reverse() : buffer2.reverse();

        grid.innerHTML = '';
        
        // 5x5 = 25 ячеек
        for (let i = 0; i < 25; i++) {
            if (i < currentList.length) {
                const g = currentList[i];
                const cell = document.createElement('div');
                cell.className = 'glyph-cell';
                
                // Если это страница 2 (верификация), и время подходит к концу — готовим к растворению
                if (currentPage === 2) {
                    const age = now - g.timestamp;
                    const timeLeft = (CYCLE_TIME_MS * 2) - age;
                    if (timeLeft < 15000) {
                        // Если осталось меньше 15 секунд до удаления, добавляем класс
                        cell.style.opacity = Math.max(0, timeLeft / 15000);
                        cell.style.transform = `scale(${Math.max(0.5, timeLeft / 15000)})`;
                    }
                }

                const indices = typeof getPath === 'function' ? getPath(g.word) : [];
                let svgMarkup = typeof createSVG === 'function' ? createSVG(indices) : '';
                
                cell.innerHTML = `
                    <div class="glyph-svg">${svgMarkup}</div>
                    <div class="glyph-label">${g.word}</div>
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

    function initArchive() {
        // Запускаем рендер
        renderArchiveGrid();
        
        // Обновляем каждую секунду, чтобы глифы перелетали и растворялись
        if (archiveInterval) clearInterval(archiveInterval);
        archiveInterval = setInterval(renderArchiveGrid, 1000);
    }

    document.addEventListener('DOMContentLoaded', initArchive);
})();
