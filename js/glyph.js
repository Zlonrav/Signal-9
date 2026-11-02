// --- ГЕОМЕТРИЯ И ГЛИФЫ ---
function getPath(word) {
	word = word.toUpperCase(); // Добавь это ПЕРВЫМ делом
    let hash = 5381;
    for (let i = 0; i < word.length; i++) hash = ((hash << 5) + hash) + word.charCodeAt(i);
    let seed = Math.abs(hash), path = [], used = new Set();
    const len = (seed % 3) + 5;
    while(path.length < len && used.size < 9) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        let n = seed % 9; if(!used.has(n)) { path.push(n); used.add(n); }
    }
    return path;
}

function createSVG(path) {
    if (!path || !path.length) return '';
    const start = POINTS[path[0]]; 
    let d = `M ${start.x} ${start.y}`;
    for(let i=0; i<path.length-1; i++) {
        const c = POINTS[path[i]], n = POINTS[path[i+1]];
        d += ` C ${c.x+(n.x-c.x)*0.5} ${c.y}, ${c.x+(n.x-c.x)*0.5} ${n.y}, ${n.x} ${n.y}`;
    }
    return `<svg viewBox="0 0 80 80"><path d="${d}"></path></svg>`;
}

const getNoise = (len) => Array.from({length: Math.max(len, 0)}, () => CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)]).join('');
// --- СИСТЕМА ПЛАВНОЙ ОТРИСОВКИ (УНИВЕРСАЛЬНАЯ) ---
const DRAW_SPEED = 100; // Скорость отрисовки

window.renderSmoothPath = function(pathId, indices, isContinuing = false) {
    const pathElem = document.getElementById(pathId);
    if (!pathElem) return;

    // 1. Получаем данные пути через твою функцию createSVG
    const svgMarkup = createSVG(indices);
    if (!svgMarkup) {
        pathElem.setAttribute('d', '');
        return;
    }
    
    // Извлекаем только содержимое атрибута d="..."
    const dMatch = svgMarkup.match(/d="([^"]*)"/);
    const dData = dMatch ? dMatch[1] : '';

    if (indices.length <= 1) {
        pathElem.setAttribute('d', dData);
        pathElem.style.strokeDasharray = 'none';
        return;
    }

    // 2. ПОДГОТОВКА АНИМАЦИИ
    pathElem.setAttribute('d', dData);
    const totalLength = pathElem.getTotalLength();
    pathElem.style.transition = 'none';

    if (isContinuing) {
        // Логика для ручного рисования (дорисовываем сегмент)
        const prevIndices = indices.slice(0, -1);
        const prevMarkup = createSVG(prevIndices);
        const prevDMatch = prevMarkup.match(/d="([^"]*)"/);
        const prevD = prevDMatch ? prevDMatch[1] : '';
        
        pathElem.setAttribute('d', prevD);
        const prevLength = pathElem.getTotalLength();
        
        pathElem.setAttribute('d', dData);
        pathElem.style.strokeDasharray = totalLength;
        pathElem.style.strokeDashoffset = totalLength - prevLength;
        
        const duration = (totalLength - prevLength) / DRAW_SPEED;
        requestAnimationFrame(() => {
            pathElem.style.transition = `stroke-dashoffset ${duration}s linear`;
            pathElem.style.strokeDashoffset = '0';
        });
    } else {
        // Полная отрисовка (например, при вводе текста)
        pathElem.style.strokeDasharray = totalLength;
        pathElem.style.strokeDashoffset = totalLength;
        const duration = totalLength / DRAW_SPEED;
        requestAnimationFrame(() => {
            pathElem.style.transition = `stroke-dashoffset ${duration}s linear`;
            pathElem.style.strokeDashoffset = '0';
        });
    }
};

