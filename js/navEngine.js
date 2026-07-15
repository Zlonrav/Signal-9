(function() {
    if (window.NAV_ENGINE_INITIALIZED) return;
    window.NAV_ENGINE_INITIALIZED = true;

    const destinations = {
        'РУБКА': 'index.html',
        'ТЕРМИНАЛ': 'tools.html',
        'АРХИВ': 'archive.html',
        'КАРТА': 'map.html',
        'РЕАКТОР': 'reactor.html',
        'АНГАР': 'hangar.html',
        'СКЛАД': 'storage.html',
        'МЕДОТСЕК': 'medbay.html',
        'ОБСЕРВАТОРИЯ': 'obs.html',
        'ЯДРО': 'core_room.html'
    };

    const navOverlay = document.createElement('div');
    navOverlay.id = 'nav-console-fixed';
    
    // Внутренняя структура консоли
    navOverlay.innerHTML = `
        <div class="nav-internal-box">
            <div id="nav-header" style="color: #00f2ff; font-size: 11px; letter-spacing: 4px; opacity: 0.6; margin-bottom: 30px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">ПРОТОКОЛ ПЕРЕМЕЩЕНИЯ СКРИПТА</div>
            
            <div id="navInput" contenteditable="true" spellcheck="false" 
                style="width: 100%; min-height: 40px; border-bottom: 2px solid #00f2ff; color: #00f2ff; font-family: 'JetBrains Mono', monospace; font-size: 32px; text-align: center; outline: none; text-transform: uppercase; letter-spacing: 5px; cursor: text;"></div>
            
            <div id="nav-hints" style="color: #00f2ff; font-size: 10px; margin-top: 30px; opacity: 0.4; letter-spacing: 1px; font-family: 'JetBrains Mono', monospace;"></div>
        </div>
    `;

    document.body.appendChild(navOverlay);

    const input = document.getElementById('navInput');
    const header = document.getElementById('nav-header');
    const hints = document.getElementById('nav-hints');

    function getUnlockedNodes() {
        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
        
        // СЧИТЫВАЕМ НОВЫЕ ФЛАГИ БЕСШОВНОГО ПЕРЕХОДА:
        const isOrbitStabilized = localStorage.getItem('s9_orbit_stabilized') === 'active';
        const isReactorEmergency = localStorage.getItem('s9_emergency_reactor') === 'active';
        const isAdmin = glyphsCount >= 50; // Наша админская лазейка

        let nodes = ['РУБКА', 'ТЕРМИНАЛ'];
        
        // Стандартные грейды по количеству глифов
        if (glyphsCount >= 3 || isAdmin) nodes.push('АРХИВ');
        if (glyphsCount >= 10 || isAdmin) nodes.push('КАРТА');
        
        // УСЛОВИЕ ДЛЯ РЕАКТОРА (СИНХРОНИЗИРОВАНО С КАРТОЙ):
        // Доступ открывается, если орбита стабилизирована, идет авария реактора ИЛИ если ты админ
        if (isOrbitStabilized || isReactorEmergency || isEmergency || isAdmin) {
            nodes.push('РЕАКТОР');
        }
        
        return nodes;
    }


    input.oninput = () => {
        const val = input.innerText.toUpperCase().trim();
        const unlocked = getUnlockedNodes();

        if (destinations[val]) {
            if (unlocked.includes(val)) {
                input.style.color = '#00ff44';
                header.innerText = `ИНИЦИАЛИЗАЦИЯ ПЕРЕНОСА В: ${val}...`;
                input.contentEditable = "false";
                setTimeout(() => { window.location.href = destinations[val]; }, 800);
            } else {
                input.style.color = '#ffaa00';
                header.innerText = `ОТКАЗ: НЕДОСТАТОЧНО ДАННЫХ ДЛЯ ДОСТУПА`;
            }
        } else {
            input.style.color = '#00f2ff';
            header.innerText = `ПРОТОКОЛ ПЕРЕМЕЩЕНИЯ СКРИПТА`;
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') {
            e.preventDefault();
            if (window.getComputedStyle(navOverlay).display === 'none') {
                const unlocked = getUnlockedNodes();
                hints.innerHTML = `ДОСТУПНЫЕ УЗЛЫ: [ ${unlocked.join(' | ')} ]`;
                navOverlay.style.display = 'flex';
                input.innerText = '';
                input.style.color = '#00f2ff';
                header.innerText = `ПРОТОКОЛ ПЕРЕМЕЩЕНИЯ СКРИПТА`;
                setTimeout(() => input.focus(), 10);
            } else {
                navOverlay.style.display = 'none';
            }
        }
        if (e.key === 'Escape') navOverlay.style.display = 'none';
    });
})();
