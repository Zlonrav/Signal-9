// js/map.js
(function() {
    const MAP_POINTS = [{x:15,y:15},{x:40,y:15},{x:65,y:15},{x:15,y:40},{x:40,y:40},{x:65,y:40},{x:15,y:65},{x:40,y:65},{x:65,y:65}];
    
    function getMapPath(word) {
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

    function createMapSVG(path) {
        if (!path || !path.length) return '';
        const start = MAP_POINTS[path[0]];
        let d = `M ${start.x} ${start.y}`;
        for(let i=0; i<path.length-1; i++) {
            const c = MAP_POINTS[path[i]], n = MAP_POINTS[path[i+1]];
            d += ` C ${c.x+(n.x-c.x)*0.5} ${c.y}, ${c.x+(n.x-c.x)*0.5} ${n.y}, ${n.x} ${n.y}`;
        }
        return `<svg viewBox="0 0 80 80"><path d="${d}"></path></svg>`;
    }

    const MAP_DATA = {
        nodes: [
            { id: 'hub', title: 'ГЛАВНЫЙ\nХАБ', x: 600, y: 425, url: 'index.html', type: 'always' },
            { id: 'tools', title: 'ИНЖЕНЕРНЫЙ\nТЕРМИНАЛ', x: 600, y: 200, url: 'tools.html', type: 'always' },
            { id: 'map', title: 'КАРТА', x: 600, y: 650, url: 'map.html', type: 'always' },

            // ОС (ждет починки архива)
            { id: 'os', title: 'ОПЕРАЦИОННАЯ\nСИСТЕМА', x: 350, y: 200, url: 'os.html', type: 'os' },
            
            // Архив (красный, если сломан)
            { id: 'archive', title: 'БАЗА\nДАННЫХ', x: 350, y: 650, url: 'archive.html', type: 'archive' },

            // Остальные (заглушки/будущие квесты)
            { id: 'telemetry', title: 'МОДУЛЬ\nТЕЛЕМЕТРИИ', x: 150, y: 425, url: 'telemetry.html', type: 'offline' },
            { id: 'core', title: 'ЭНЕРГОЯДРО', x: 350, y: 425, url: 'reactor.html', type: 'offline' },
            { id: 'edr', title: 'EDR\nСЕКТОР', x: 850, y: 425, url: 'edr.html', type: 'offline' },
            { id: 'gateway', title: 'ТРАНСПОРТНЫЙ\nШЛЮЗ', x: 1050, y: 425, url: 'gateway.html', type: 'offline' },
            { id: 'sector00', title: 'СЕКТОР\n[0x00]', x: 850, y: 200, url: '#', type: 'offline' },
            { id: 'sectorff', title: 'СЕКТОР\n[0xFF]', x: 850, y: 650, url: '#', type: 'offline' }
        ],
        links: [
            { s: 'hub', t: 'tools' }, { s: 'hub', t: 'map' }, { s: 'hub', t: 'core' }, { s: 'hub', t: 'edr' },
            { s: 'tools', t: 'os' }, { s: 'tools', t: 'sector00' },
            { s: 'core', t: 'telemetry' }, { s: 'core', t: 'archive' },
            { s: 'edr', t: 'gateway' }, { s: 'edr', t: 'sectorff' },
            { s: 'map', t: 'archive' }, { s: 'map', t: 'sectorff' }
        ]
    };

    function getNodeStatus(node) {
        if (node.type === 'always') return 'ONLINE';

        if (node.type === 'archive') {
            return localStorage.getItem('s9_archive_fixed') === 'true' ? 'ONLINE' : 'ERROR';
        }

        if (node.type === 'os') {
            const isArchiveFixed = localStorage.getItem('s9_archive_fixed') === 'true';
            if (!isArchiveFixed) return 'OFFLINE';
            return localStorage.getItem('s9_os_fixed') === 'true' ? 'ONLINE' : 'ERROR';
        }

        // Проверка флагов для остальных
        if (node.id === 'core' && localStorage.getItem('s9_telemetry_calibrated') === 'true') return 'ONLINE';
        if (node.id === 'edr' && localStorage.getItem('s9_os_fixed') === 'true') return 'ONLINE';
        if (node.id === 'telemetry' && localStorage.getItem('s9_edr_ghosts') !== null) return 'ONLINE';
        if (node.id === 'gateway' && localStorage.getItem('s9_core_unlocked') === 'true') return 'ONLINE';
        
        return 'OFFLINE';
    }

    function buildMap() {
        const svg = document.getElementById('mapLines');
        const nodesContainer = document.getElementById('mapNodes');
        if (!svg || !nodesContainer) return;

        svg.innerHTML = '';
        nodesContainer.innerHTML = '';

        // Рисуем линии
        MAP_DATA.links.forEach(link => {
            const source = MAP_DATA.nodes.find(n => n.id === link.s);
            const target = MAP_DATA.nodes.find(n => n.id === link.t);
            if (!source || !target) return;

            const sourceStatus = getNodeStatus(source);
            const targetStatus = getNodeStatus(target);
            const active = (sourceStatus !== 'OFFLINE' && targetStatus !== 'OFFLINE') || (sourceStatus === 'ERROR' || targetStatus === 'ERROR');

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', active ? 'link-active' : 'link-locked');

            const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            bgLine.setAttribute('x1', source.x); bgLine.setAttribute('y1', source.y);
            bgLine.setAttribute('x2', target.x); bgLine.setAttribute('y2', target.y);
            bgLine.setAttribute('class', 'link-bg');
            g.appendChild(bgLine);

            if (active) {
                const flowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                flowLine.setAttribute('x1', source.x); flowLine.setAttribute('y1', source.y);
                flowLine.setAttribute('x2', target.x); flowLine.setAttribute('y2', target.y);
                flowLine.setAttribute('class', 'link-flow');
                flowLine.style.animationDelay = `${Math.random() * -20}s`;
                g.appendChild(flowLine);
            }
            svg.appendChild(g);
        });

        // Рисуем узлы
        MAP_DATA.nodes.forEach(node => {
            const status = getNodeStatus(node);
            const el = document.createElement(status !== 'OFFLINE' ? 'a' : 'div');
            
            if (status !== 'OFFLINE') el.href = node.url;
            
            let cssClass = 'map-node ';
            if (status === 'ONLINE') cssClass += 'unlocked';
            else if (status === 'ERROR') cssClass += 'error-node';
            else cssClass += 'locked';

            el.className = cssClass;
            el.setAttribute('data-id', node.id);
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;

            const formattedTitle = node.title.replace(/\n/g, '<br>');
            
            const wordForGlyph = node.title.split('\n')[0].replace(/\[.*?\]/g, '').trim();
            const glyphSVG = createMapSVG(getMapPath(wordForGlyph));

            el.innerHTML = `
                <div class="node-glyph">${glyphSVG}</div>
                <div class="node-title">${formattedTitle}</div>
                <div class="node-status">${status}</div>
            `;
            nodesContainer.appendChild(el);
        });
    }

    document.addEventListener('DOMContentLoaded', buildMap);
})();
