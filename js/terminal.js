// js/terminal.js
(function() {
    if (window.TERMINAL_INITIALIZED) return;
    window.TERMINAL_INITIALIZED = true;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === '404.html') return;

    let currentState = 'IDLE';

    // Создаем затемняющий фон
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'tilde-overlay-bg';
    document.body.appendChild(bgOverlay);

    // Создаем консоль
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
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
    }

    // УМНЫЙ HELP (по твоему списку)
    function showHelp(topic) {
        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isCoreUnlocked = localStorage.getItem('s9_core_unlocked') === 'true';

        if (topic) {
            const topics = {
                'help': 'Показывает список доступных команд или справку по конкретной команде.',
                'hub': 'Возврат в Главный Хаб (главная страница).',
                'map': 'Переход на навигационную карту станции.',
                'archive': 'Переход в Базу Данных (требуется 3 глифа).',
                'core': 'Переход в сектор Энергоядра (требуется сканирование).',
                'telemetry': 'Модуль телеметрии [OFFLINE].',
                'edr': 'EDR Сектор [OFFLINE].',
                'gateway': 'Транспортный шлюз [OFFLINE].',
                'scan': 'Запуск глубокого сканирования космоса. Вызывает перегрузку ядра.',
                'restore': 'Восстановление из точки доступа (Только в Энергоядре).',
                'rebuild': 'Пересборка ядра (Только в Энергоядре).',
                'include': 'Включить сектор. Формат: include = 0XF4AD (Только в Энергоядре).',
                'check': 'Проверить сектор. Формат: check = 0XF4AD (Только в Энергоядре).',
                'backup': 'Восстановить из бэкапа. Формат: backup = YYYYMMDD (Только в Энергоядре).',
                'reset': 'Полный сброс прогресса игры. Требует подтверждения (Y/N).'
            };
            if (topics[topic]) {
                print(`<span class="sys">[${topic.toUpperCase()}]</span> ${topics[topic]}`);
            } else {
                print(`НЕТ ИНФОРМАЦИИ ПО КОМАНДЕ '${topic}'.`, 'err');
            }
            return;
        }

        // Список команд
        print(`<span class="sys">ДОСТУПНЫЕ КОМАНДЫ:</span>`);
        print(`> help [команда] - помощь по команде`);
        print(`> hub - главная консоль`);
        print(`> map - карта станции`);
        
        if (glyphsCount >= 3) {
            print(`> archive - архив глифов`);
        } else {
            print(`> archive - архив глифов <span class="err">[OFFLINE]</span>`);
        }

        if (isCoreUnlocked || page === 'reactor.html') {
            print(`> core - энергоядро`);
        } else {
            print(`> core - энергоядро <span class="err">[OFFLINE]</span>`);
        }

        print(`> telemetry - модуль телеметрии <span class="err">[OFFLINE]</span>`);
        print(`> edr - EDR сектор <span class="err">[OFFLINE]</span>`);
        print(`> gateway - транспортный шлюз <span class="err">[OFFLINE]</span>`);
        
        // Если мы в реакторе, показываем спец-команды
        if (page === 'reactor.html') {
            print(`<span class="sys">СПЕЦ-КОМАНДЫ ЭНЕРГОЯДРА:</span>`);
            const isBroken = localStorage.getItem('s9_emergency_reactor') === 'active';
            if (!isBroken) {
                print(`> scan - запустить сканирование`);
            } else {
                print(`> restore - восстановить систему`);
                print(`> rebuild - пересобрать ядро`);
                print(`> include = 0XF4AD - включить сектор`);
                print(`> check = 0XF4AD - проверить сектор`);
                print(`> backup = YYYYMMDD - восстановить из бэкапа`);
            }
        }
        
        print(`> reset - полный сброс прогресса`);
    }

    function processCommand(cmd) {
        print(`> ${cmd}`, 'sys');
        
        if (cmd.startsWith('help ')) {
            showHelp(cmd.split(' ')[1]);
            return;
        }

        // Обработка состояний ожидания (Yes/No)
        if (currentState !== 'IDLE' && (cmd === 'y' || cmd === 'n' || cmd === 'yes' || cmd === 'no')) {
            const isYes = (cmd === 'y' || cmd === 'yes');
            handleYesNo(isYes);
            return;
        }

        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        const isCoreUnlocked = localStorage.getItem('s9_core_unlocked') === 'true';

        switch(cmd) {
            case 'help':
                showHelp();
                break;

            case 'scan':
                if (localStorage.getItem('s9_emergency_reactor') === 'active') {
                    print("ОШИБКА: СКАНИРОВАНИЕ УЖЕ ЗАПУЩЕНО. ЯДРО ПОВРЕЖДЕНО.", "err");
                } else {
                    print("ИНИЦИАЛИЗАЦИЯ ГЛУБОКОГО СКАНИРОВАНИЯ...");
                    setTimeout(() => {
                        print("ТРЕБУЕМАЯ МОЩНОСТЬ: 150%");
                        print("КРИТИЧЕСКИЙ ПЕРЕГРУЗ. ВЫБРОС ПЛАЗМЫ В ЭНЕРГОЯДРЕ.", "err");
                        print("ДОСТУП К СЕКТОРУ 'CORE' РАЗРЕШЕН. ОТПРАВЛЯЙТЕСЬ ТУДА ДЛЯ РЕМОНТА.", "warn");
                        
                        localStorage.setItem('s9_emergency_reactor', 'active');
                        localStorage.setItem('s9_core_unlocked', 'true');
                        
                        if (typeof applyEmergencyStyles === 'function') applyEmergencyStyles();
                        if (typeof updateQuestion === 'function') window.currentChatStep = 0; // Сброс журнала
                    }, 1000);
                }
                break;

            case 'hub':
                window.location.href = 'index.html';
                break;
            case 'map':
                window.location.href = 'map.html';
                break;
            case 'core':
                if (isCoreUnlocked || page === 'reactor.html') {
                    window.location.href = 'reactor.html';
                } else {
                    print("ОШИБКА: ЭНЕРГОЯДРО НЕДОСТУПНО. ТРЕБУЕТСЯ СКАНИРОВАНИЕ (КОМАНДА SCAN).", "err");
                }
                break;
            case 'archive':
                if (glyphsCount >= 3) {
                    window.location.href = 'archive.html';
                } else {
                    print("ОШИБКА: АРХИВ ЗАБЛОКИРОВАН. НУЖНО 3 ГЛИФА.", "err");
                }
                break;
            
            case 'telemetry':
            case 'edr':
            case 'gateway':
                print(`МОДУЛЬ '${cmd.toUpperCase()}' ВРЕМЕННО НЕДОСТУПЕН (OFFLINE).`, "err");
                break;

            // --- КОМАНДЫ ПОЧИНКИ ЯДРА ---
            case 'restore':
                if (page !== 'reactor.html') {
                    print("ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В СЕКТОРЕ ЭНЕРГОЯДРА.", "err");
                } else {
                    print("ПОПЫТКА ВОССТАНОВЛЕНИЯ СИСТЕМЫ ИЗ ТОЧКИ ДОСТУПА. ПОДТВЕРДИТЕ (Y/N)");
                    currentState = 'RESTORE_CONFIRM';
                }
                break;

            case 'rebuild':
                if (page !== 'reactor.html') break;
                print("ЗАПУСК ПЕРЕСБОРКИ ЯДРА...");
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    const blocks = '█'.repeat(progress / 10) + '░'.repeat(10 - progress / 10);
                    print(`[${blocks}] ${progress}%`);
                    if (progress >= 100) {
                        clearInterval(interval);
                        print("ОШИБКА: НЕОБХОДИМО ПЕРЕПИСАТЬ СЕКТОР 0XF4AD.");
                    }
                }, 300);
                break;

            case 'include = 0xf4ad':
                if (page !== 'reactor.html') break;
                print("СЕКТОР 0XF4AD ВКЛЮЧЕН В БУФЕР ОБМЕНА.");
                break;

            case 'check = 0xf4ad':
                if (page !== 'reactor.html') break;
                print("ВВЕДЕНО, ПРОВЕРЕНО. ПРИМЕНИТЬ? (Y/N)");
                currentState = 'APPLY_CONFIRM';
                break;

            // СБРОС (Требует подтверждения)
            case 'reset':
                print("ВЫ УВЕРЕНЫ? ВЕСЬ ПРОГРЕСС БУДЕТ УДАЛЕН. (Y/N)", "warn");
                currentState = 'RESET_CONFIRM';
                break;
                
            default:
                if (cmd.startsWith('backup = ')) {
                    if (page !== 'reactor.html') break;
                    const date = cmd.split('=')[1].trim();
                    const correctDate = getYesterdayDate();
                    if (date === correctDate) {
                        print("ВЕРСИЯ БЭКАПА ПРИНЯТА. ПЕРЕЗАПИСАТЬ? (Y/N)");
                        currentState = 'BACKUP_CONFIRM';
                    } else {
                        print("ОШИБКА: НЕВЕРНАЯ ВЕРСИЯ. ВВЕДИТЕ ВЕРСИЮ, СОЗДАННУЮ 24 ЗЕМНЫХ ЧАСА НАЗАД.", "err");
                    }
                } else {
                    print("НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ HELP.", "err");
                }
        }
    }

    function handleYesNo(isYes) {
        if (!isYes) {
            print("ОПЕРАЦИЯ ОТМЕНЕНА.", "err");
            currentState = 'IDLE';
            return;
        }

        switch(currentState) {
            case 'RESTORE_CONFIRM':
                print("ТОЧКА ВОССТАНОВЛЕНИЯ ПОВРЕЖДЕНА. НЕОБХОДИМА ПЕРЕСБОРКА ЯДРА.", "err");
                print("ВВЕДИТЕ: rebuild");
                currentState = 'IDLE';
                break;
            case 'APPLY_CONFIRM':
                print("КРИТИЧЕСКАЯ ОШИБКА. НЕОБХОДИМО ВОССТАНОВИТЬ ПРЕДЫДУЩИЙ БЭКАП.", "err");
                print("ПРОВЕРЬТЕ СИСТЕМНЫЙ ЖУРНАЛ, ЧТОБЫ УЗНАТЬ ДАТУ БЭКАПА. ВВЕДИТЕ: backup = YYYYMMDD");
                currentState = 'IDLE';
                break;
            case 'BACKUP_CONFIRM':
                print("ЯДРО ВОССТАНОВЛЕНО. ПОДАЧА ЭНЕРГИИ СТАБИЛИЗИРОВАНА.", "ok");
                localStorage.removeItem('s9_emergency_reactor');
                if (typeof applyEmergencyStyles === 'function') applyEmergencyStyles();
                currentState = 'IDLE';
                break;
            case 'RESET_CONFIRM':
                localStorage.clear();
                print("СИСТЕМА ПОЛНОСТЬЮ СБРОШЕНА. ПЕРЕЗАГРУЗКА...", "ok");
                setTimeout(() => window.location.href = 'login.html', 1000);
                currentState = 'IDLE';
                break;
        }
    }

    function toggleConsole(show) {
        overlay.classList.toggle('active', show);
        bgOverlay.classList.toggle('active', show);
        if (show) input.focus();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            const isOpening = !overlay.classList.contains('active');
            toggleConsole(isOpening);
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

    // Клик по фону закрывает консоль
    bgOverlay.addEventListener('click', () => toggleConsole(false));
})();
