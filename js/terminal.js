// js/terminal.js
(function() {
    if (window.TERMINAL_INITIALIZED) return;
    window.TERMINAL_INITIALIZED = true;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === '404.html') return;

    // 1. ВНЕДРЯЕМ СТИЛИ ПРЯМО В JS (Гарантия единого вида на всех страницах)
    const style = document.createElement('style');
    style.innerHTML = `
        #tilde-overlay-bg {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999998;
        }
        #tilde-overlay-bg.active { display: block; }

        #tilde-console {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            max-width: 95vw;
            height: 450px;
            background: #020508;
            border: 1px solid var(--neon);
            box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);
            z-index: 2147483647 !important;
            font-family: 'JetBrains Mono', monospace;
            flex-direction: column;
            padding: 20px;
            box-sizing: border-box;
            overflow: hidden; /* Жестко обрезаем всё, что пытается вылезти */
        }
        #tilde-console.active { display: flex; }
        
        /* Сброс стилей для всех элементов внутри консоли */
        #tilde-console * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        #tilde-console .console-header {
            color: var(--neon);
            font-size: 12px;
            letter-spacing: 2px;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(0, 242, 255, 0.3);
            padding-bottom: 10px;
            text-transform: uppercase;
            flex-shrink: 0;
        }

        #tilde-console .console-output {
            color: #ccc;
            font-size: 11px;
            line-height: 1.6;
            flex-grow: 1;
            overflow-y: auto;
            margin-bottom: 15px;
            padding-right: 10px;
        }

        #tilde-console .console-output::-webkit-scrollbar { width: 4px; }
        #tilde-console .console-output::-webkit-scrollbar-track { background: #000; }
        #tilde-console .console-output::-webkit-scrollbar-thumb {
            background: var(--neon);
            box-shadow: 0 0 10px var(--neon);
            border-radius: 2px;
        }

        #tilde-console .sys { color: var(--neon); font-weight: bold; }
        #tilde-console .err { color: #ff3333; }
        #tilde-console .ok { color: #00ff44; }
        #tilde-console .warn { color: #ffaa00; }

        #tilde-console .console-input-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
            border-top: 1px solid rgba(0, 242, 255, 0.2);
            padding-top: 15px;
        }

        #tilde-console .console-input-wrapper span {
            color: var(--neon);
            font-size: 14px;
            font-weight: bold;
        }

        /* ЖЕСТКИЙ ФИКС ДЛЯ ИНПУТА, ЧТОБЫ STYLE-TOOLS.CSS ЕГО НЕ ЛОМАЛ */
        #tilde-console #terminal-input {
            flex: 1;
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid rgba(0, 242, 255, 0.5) !important;
            color: var(--neon) !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 14px !important;
            text-align: left !important; /* <--- ВЫРАВНИВАНИЕ ПО ЛЕВОМУ КРАЮ */
            outline: none !important;
            text-transform: uppercase;
            box-shadow: none !important;
            position: static !important; /* Убираем абсолютное позиционирование */
            width: 100% !important;
            padding: 5px 0 !important;
            margin: 0 !important;
            display: block !important;
        }

        #tilde-console #terminal-input:focus {
            border-bottom-color: var(--neon) !important;
            box-shadow: 0 5px 10px -5px var(--neon) !important;
        }

        #tilde-console .console-hint {
            margin-top: 15px;
            font-size: 9px;
            color: #555;
            display: flex;
            justify-content: space-between;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    let currentState = 'IDLE';

    // 2. СОЗДАЕМ HTML
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'tilde-overlay-bg';
    document.body.appendChild(bgOverlay);

    const overlay = document.createElement('div');
    overlay.id = 'tilde-console';
    overlay.innerHTML = `
        <div class="console-header">Консоль Управления // Введите команду</div>
        <div class="console-output" id="terminal-output">
            <div>СИСТЕМА ГОТОВА. ВВЕДИТЕ <span class="sys">help</span> ДЛЯ СПИСКА КОМАНД.</div>
        </div>
        <div class="console-input-wrapper">
            <span>></span>
            <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="">
        </div>
        <div class="console-hint">
            <span>[TILDE / ~] - ЗАКРЫТЬ</span>
            <span>[ENTER] - ВЫПОЛНИТЬ</span>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    function print(text, type = 'normal') {
        const div = document.createElement('div');
        div.className = type;
        div.innerHTML = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function getYesterdayDate() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }

    function showHelp(topic) {
        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isCoreUnlocked = localStorage.getItem('s9_core_unlocked') === 'true';

        if (topic) {
            const topics = {
                'help': 'Показывает список доступных команд.',
                'hub': 'Возврат в Главный Хаб.',
                'map': 'Переход на навигационную карту.',
                'terminal': 'Переход в Инженерный Терминал.',
                'archive': 'База Данных (требуется 3 глифа).',
                'core': 'Сектор Энергоядра (требуется сканирование).',
                'scan': 'Запуск сканирования. Вызывает перегрузку ядра.',
                'restore': 'Восстановление из точки доступа.',
                'rebuild': 'Пересборка ядра.',
                'backup': 'Восстановить из бэкапа: backup = YYYYMMDD.'
            };
            print(topics[topic] ? `<span class="sys">[${topic.toUpperCase()}]</span> ${topics[topic]}` : `НЕТ ИНФОРМАЦИИ ПО '${topic}'.`, topics[topic] ? 'normal' : 'err');
            return;
        }

        print(`<span class="sys">ДОСТУПНЫЕ КОМАНДЫ:</span>`);
        print(`> help [команда] - помощь по команде`);
        print(`> hub - главная консоль`);
        print(`> map - карта станции`);
        print(`> terminal - инженерный терминал`);
        
        if (glyphsCount >= 3) print(`> archive - архив глифов`);
        else print(`> archive - архив глифов <span class="err">[OFFLINE]</span>`);

        if (isCoreUnlocked || page === 'reactor.html') print(`> core - энергоядро`);
        else print(`> core - энергоядро <span class="err">[OFFLINE]</span>`);
        
        if (page === 'reactor.html') {
            print(`<span class="sys">СПЕЦ-КОМАНДЫ ЭНЕРГОЯДРА:</span>`);
            const isBroken = localStorage.getItem('s9_emergency_reactor') === 'active';
            if (!isBroken) print(`> scan - запустить сканирование`);
            else {
                print(`> restore - восстановить систему`);
                print(`> rebuild - пересобрать ядро`);
                print(`> include = 0XF4AD - включить сектор`);
                print(`> check = 0XF4AD - проверить сектор`);
                print(`> backup = YYYYMMDD - восстановить из бэкапа`);
            }
        }
    }

    function processCommand(cmd) {
        print(`> ${cmd}`, 'sys');
        
        if (cmd.startsWith('help ')) {
            showHelp(cmd.split(' ')[1]);
            return;
        }

        if (currentState !== 'IDLE' && (cmd === 'y' || cmd === 'n' || cmd === 'yes' || cmd === 'no')) {
            handleYesNo(cmd === 'y' || cmd === 'yes');
            return;
        }

        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isCoreUnlocked = localStorage.getItem('s9_core_unlocked') === 'true';

        switch(cmd) {
            case 'help': showHelp(); break;
            case 'hub': window.location.href = 'index.html'; break;
            case 'map': window.location.href = 'map.html'; break;
            case 'terminal': window.location.href = 'tools.html'; break;
            
            case 'scan':
                if (localStorage.getItem('s9_emergency_reactor') === 'active') {
                    print("ОШИБКА: СКАНИРОВАНИЕ УЖЕ ЗАПУЩЕНО. ЯДРО ПОВРЕЖДЕНО.", "err");
                } else {
                    print("ИНИЦИАЛИЗАЦИЯ ГЛУБОКОГО СКАНИРОВАНИЯ...");
                    setTimeout(() => {
                        print("ТРЕБУЕМАЯ МОЩНОСТЬ: 150%");
                        print("КРИТИЧЕСКИЙ ПЕРЕГРУЗ. ВЫБРОС ПЛАЗМЫ В ЭНЕРГОЯДРЕ.", "err");
                        print("ДОСТУП К СЕКТОРУ 'CORE' РАЗРЕШЕН. ОТПРАВЛЯЙТЕСЬ ТУДА.", "warn");
                        localStorage.setItem('s9_emergency_reactor', 'active');
                        localStorage.setItem('s9_core_unlocked', 'true');
                        if (typeof applyEmergencyStyles === 'function') applyEmergencyStyles();
                    }, 1000);
                }
                break;

            case 'core':
                if (isCoreUnlocked || page === 'reactor.html') window.location.href = 'reactor.html';
                else print("ОШИБКА: ЭНЕРГОЯДРО НЕДОСТУПНО. ТРЕБУЕТСЯ СКАНИРОВАНИЕ.", "err");
                break;

            case 'archive':
                if (glyphsCount >= 3) window.location.href = 'archive.html';
                else print("ОШИБКА: АРХИВ ЗАБЛОКИРОВАН. НУЖНО 3 ГЛИФА.", "err");
                break;
            
            case 'telemetry': case 'edr': case 'gateway':
                print(`МОДУЛЬ '${cmd.toUpperCase()}' ВРЕМЕННО НЕДОСТУПЕН (OFFLINE).`, "err"); break;

            case 'restore':
                if (page !== 'reactor.html') print("ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В СЕКТОРЕ ЭНЕРГОЯДРА.", "err");
                else { print("ПОПЫТКА ВОССТАНОВЛЕНИЯ. ПОДТВЕРДИТЕ (Y/N)"); currentState = 'RESTORE_CONFIRM'; }
                break;

            case 'rebuild':
                if (page !== 'reactor.html') break;
                print("ЗАПУСК ПЕРЕСБОРКИ ЯДРА...");
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    const blocks = '█'.repeat(progress / 10) + '░'.repeat(10 - progress / 10);
                    print(`[${blocks}] ${progress}%`);
                    if (progress >= 100) { clearInterval(interval); print("ОШИБКА: НЕОБХОДИМО ПЕРЕПИСАТЬ СЕКТОР 0XF4AD."); }
                }, 300);
                break;

            case 'include = 0xf4ad':
                if (page === 'reactor.html') print("СЕКТОР 0XF4AD ВКЛЮЧЕН В БУФЕР ОБМЕНА.");
                break;

            case 'check = 0xf4ad':
                if (page === 'reactor.html') { print("ВВЕДЕНО, ПРОВЕРЕНО. ПРИМЕНИТЬ? (Y/N)"); currentState = 'APPLY_CONFIRM'; }
                break;
                
            default:
                if (cmd.startsWith('backup = ') && page === 'reactor.html') {
                    const date = cmd.split('=')[1].trim();
                    if (date === getYesterdayDate()) { print("ВЕРСИЯ БЭКАПА ПРИНЯТА. ПЕРЕЗАПИСАТЬ? (Y/N)"); currentState = 'BACKUP_CONFIRM'; }
                    else print("ОШИБКА: НЕВЕРНАЯ ВЕРСИЯ. НУЖЕН БЭКАП ЗА ВЧЕРА (YYYYMMDD).", "err");
                } else {
                    print("НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ HELP.", "err");
                }
        }
    }

    function handleYesNo(isYes) {
        if (!isYes) { print("ОПЕРАЦИЯ ОТМЕНЕНА.", "err"); currentState = 'IDLE'; return; }

        switch(currentState) {
            case 'RESTORE_CONFIRM':
                print("ТОЧКА ВОССТАНОВЛЕНИЯ ПОВРЕЖДЕНА. НЕОБХОДИМА ПЕРЕСБОРКА. ВВЕДИТЕ: rebuild", "err"); currentState = 'IDLE'; break;
            case 'APPLY_CONFIRM':
                print("КРИТИЧЕСКАЯ ОШИБКА. НЕОБХОДИМ БЭКАП. ДАТА В СИСТЕМНОМ ЖУРНАЛЕ.", "err"); currentState = 'IDLE'; break;
            case 'BACKUP_CONFIRM':
                print("ЯДРО ВОССТАНОВЛЕНО. ПОДАЧА ЭНЕРГИИ СТАБИЛИЗИРОВАНА.", "ok");
                localStorage.removeItem('s9_emergency_reactor');
                if (typeof applyEmergencyStyles === 'function') applyEmergencyStyles();
                window.dispatchEvent(new Event('s9_reactor_updated')); 
                currentState = 'IDLE'; 
                break;
        }
    }

    function toggleConsole(show) {
        overlay.classList.toggle('active', show);
        bgOverlay.classList.toggle('active', show);
        if (show) {
            input.value = ''; 
            setTimeout(() => input.focus(), 50);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            toggleConsole(!overlay.classList.contains('active'));
        }
        if (e.key === 'Escape') toggleConsole(false);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            if (cmd) processCommand(cmd);
            input.value = '';
        }
    });

    bgOverlay.addEventListener('click', () => toggleConsole(false));
})();
