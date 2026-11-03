// --- ARCHIVE ENGINE (V1.2 - ЭТАЛОННАЯ ОТРИСОВКА) ---
function initArchive() {
    const grid = document.getElementById('archiveGrid');
    if (!grid) return;

    // Собираем все слова из библиотеки (фразы и словарь)
    const allWords = [
        ...(typeof PHRASES !== 'undefined' ? PHRASES.flatMap(p => p.split(' ')) : []), 
        ...(typeof VOCABULARY !== 'undefined' ? VOCABULARY : [])
    ];
    
	// 1. Получаем уникальные слова
	let uniqueWords = [...new Set(allWords.map(w => w.toUpperCase().replace(/[^А-ЯЁA-Z]/g, '')))].filter(w => w.length > 0);

	// 2. СОРТИРОВКА: сначала те, что есть в localStorage
	uniqueWords.sort((a, b) => {
		const aUnlocked = localStorage.getItem('s9_glyph_' + a) === 'true';
		const bUnlocked = localStorage.getItem('s9_glyph_' + b) === 'true';
		if (aUnlocked && !bUnlocked) return -1;
		if (!aUnlocked && bUnlocked) return 1;
		return a.localeCompare(b); // Остальные по алфавиту
	});

    grid.innerHTML = '';

    uniqueWords.forEach(word => {
        const isUnlocked = localStorage.getItem('s9_glyph_' + word) === 'true';
        const cell = document.createElement('div');
        cell.className = `archive-cell ${isUnlocked ? 'unlocked' : 'locked'}`;

        if (isUnlocked) {
            // БЕРЕМ ЭТАЛОННЫЙ ПУТЬ ИЗ СЛОВАРЯ
            const indices = typeof getPath === 'function' ? getPath(word) : [];
            
            // Генерируем SVG. ВАЖНО: проверяем наличие функции createSVG
            let svgMarkup = "";
            if (typeof createSVG === 'function') {
                svgMarkup = createSVG(indices);
                // Если в createSVG нет viewBox, добавляем его принудительно через замену
                if (!svgMarkup.includes('viewBox')) {
                    svgMarkup = svgMarkup.replace('<svg', '<svg viewBox="0 0 80 80"');
                }
            }
            
            cell.innerHTML = `
                <div class="glyph-container">${svgMarkup}</div>
                <div class="cell-label">${word}</div>
            `;

            cell.onmouseenter = () => {
                if (typeof playGlyphSound === 'function') playGlyphSound(indices);
            };
        } else {
            // Ячейка заблокирована
            cell.innerHTML = `
                <div class="glyph-container">
                    <svg viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="2" fill="var(--neon)" opacity="0.15" />
                    </svg>
                </div>
                <div class="cell-label">LOCKED</div>
            `;
        }

        grid.appendChild(cell);
    });
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', initArchive);
