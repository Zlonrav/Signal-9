(function() {
    if (window.MAP_ENGINE_INITIALIZED) return;
    window.MAP_ENGINE_INITIALIZED = true;

    const step = 150; // Расстояние между блоками
    const startX = 200; // Начальная точка (Обсерватория)
    const startY = 350; // Центральная горизонтальная ось

    // СЕТКА ОТСЕКОВ (Горизонтальная развертка, Обсерватория слева)
    const SECTORS = [
        { id: 'ОБСЕРВАТОРИЯ', x: startX, y: startY, req: 30, desc: 'СЕКТОР НАБЛЮДЕНИЯ' },
        
        { id: 'ТЕРМИНАЛ', x: startX + step, y: startY - step, req: 0, desc: 'ИНЖЕНЕРНЫЙ УЗЕЛ' },
        { id: 'РУБКА', x: startX + step, y: startY, req: 0, desc: 'ЦЕНТРАЛЬНЫЙ ХАБ' },
        { id: 'АРХИВ', x: startX + step, y: startY + step, req: 3, desc: 'БАНК ДАННЫХ' },
        
        { id: 'КАРТА', x: startX + step * 2, y: startY, req: 10, desc: 'НАВИГАЦИЯ' },
        
        { id: 'ЯДРО', x: startX + step * 3, y: startY - step, req: 50, desc: 'ВЫЧИСЛИТЕЛЬ' },
        { id: 'РЕАКТОР', x: startX + step * 3, y: startY, req: 'emergency', desc: 'ЭНЕРГОБЛОК' },
        { id: 'МЕДОТСЕК', x: startX + step * 3, y: startY + step, req: 25, desc: 'БИО-МОДУЛЬ' },
        
        { id: 'СКЛАД', x: startX + step * 4, y: startY, req: 20, desc: 'ХРАНИЛИЩЕ' },
        { id: 'АНГАР', x: startX + step * 5, y: startY, req: 15, desc: 'ТРАНСПОРТНЫЙ ШЛЮЗ' }
    ];

    const ICONS = {
        'РУБКА': '<circle cx="40" cy="40" r="12" stroke-width="2""")/>><path d="M40 10V20M40 60V70M10 40H20M60 40H70""")/>>',
        'ТЕРМИНАЛ': '<rect x="20" y="25" width="40" height="30" rx="2""")/>><path d="M30 65H50M40 55V65""")/>>',
        'АРХИВ': '<path d="M25 25H55M25 40H55M25 55H55""")/>>',
        'КАРТА': '<path d="M20 20L60 60M60 20L20 60M20 20H60V60H20Z""")/>>',
        'РЕАКТОР': '<circle cx="40" cy="40" r="18" stroke-dasharray="4 2""")/>><circle cx="40" cy="40" r="4" fill="currentColor""")/>>',
        'АНГАР': '<path d="M20 55L40 25L60 55ZM20 62H60""")/>>',
        'СКЛАД': '<path d="M25 25H55V60H25Z M25 42H55 M40 25V60""")/>>',
        'МЕДОТСЕК': '<path d="M40 20V60 M20 40 H60""")/>>',
        'ОБСЕРВАТОРИЯ': '<path d="M25 55A20 20 0 1 1 55 55M40 15V25""")/>>',
        'ЯДРО': '<rect x="28" y="28" width="24" height="24" rx="2""")/>><path d="M40 10V28M40 52V70M10 40H28M52 40H70""")/>>'
    };

    function initMap() {
        const nodesContainer = document.getElementById('mapNodesContainer');
        const linesContainer = document.getElementById('mapLines');
        if (!nodesContainer || !linesContainer) return;

        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';

        nodesContainer.innerHTML = '';
        linesContainer.innerHTML = '';

        SECTORS.forEach(s => {
            const isUnlocked = typeof s.req === 'number' ? glyphsCount >= s.req : (s.req === 'emergency' ? isEmergency : false);
            const node = document.createElement('div');
            node.className = `map-node ${isUnlocked ? 'unlocked' : 'locked'}`;
            node.style.left = `${s.x - 70.8}px`;
            node.style.top = `${s.y - 70.8}px`;

            const icon = isUnlocked ? ICONS[s.id] : '<path d="M30 40H50V60H30ZM35 40V32A5 5 0 0 1 45 32V40" stroke-width="1.5""")/>>';
            const sectorID = `0x${Math.abs(s.id.split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0)),0)).toString(16).toUpperCase().slice(0,4)}`;

            node.innerHTML = `
                <div class="node-glyph">
                    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg>
                </div>
                <div class="node-label">${s.id}</div>
                <div class="node-meta">${isUnlocked ? sectorID : 'ACCESS_DENIED'}</div>
                ${!isUnlocked ? `<div class="req-info">REQ: ${s.req} DATA</div>` : ''}
            `;
            
            if (isUnlocked) {
                node.onclick = () => {
                    const files = { 'РУБКА':'index.html', 'ТЕРМИНАЛ':'tools.html', 'АРХИВ':'archive.html', 'КАРТА':'map.html' };
                    window.location.href = files[s.id] || (s.id.toLowerCase() + '.html');
                };
            }
            nodesContainer.appendChild(node);
        });

        // Рисуем коридоры (Горизонтальный основной ствол)
        drawPath(startX, startY, startX + step * 5, startY); 
        // Вертикальные перемычки
        drawPath(startX + step, startY - step, startX + step, startY + step); // Терминал-Рубка-Архив
        drawPath(startX + step * 3, startY - step, startX + step * 3, startY + step); // Ядро-Реактор-Мед
    }

    function drawPath(x1, y1, x2, y2) {
        const line = document.createElementNS("http://w3.org", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("stroke", "var(--neon)");
        line.setAttribute("stroke-width", "1");
        line.setAttribute("opacity", "0.2");
        document.getElementById('mapLines').appendChild(line);
    }

    initMap();
})();