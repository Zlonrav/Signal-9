// js/terminal.js
(function() {
    if (window.TERMINAL_INITIALIZED) return;
    window.TERMINAL_INITIALIZED = true;

    let currentState = 'IDLE';
    const page = window.location.pathname.split('/').pop() || 'index.html';

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

    // Умный HELP
    function showHelp(topic) {
        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;
        
        if (topic) {
            const topics = {
                'scan': 'Запуск глубокого сканирования космоса для поиска источника сигнала.',
                'map': 'Переход на навигационную карту станции.',
                'hub': 'Возврат в Главный Хаб (главная страница).',
                'archive': 'Попытка подключения к базе данных (требует 3 глифа).',
                'reactor': 'Переход в сектор Энергоядра.',
                'restore': 'Восстановление системы из точки доступа (только в Реакторе).',
                'rebuild': 'Пересборка ядра (только в Реакторе).',
                'include': 'Включить сектор в буфер обмена (только в Реакторе).',
                'check': 'Проверить сектор (только в Реакторе).',
                'backup': 'Восстановить из бэкапа. Формат: backup = YYYYMMDD (только в Реакторе).'
            };
            if (topics[topic]) {
                print(`<span class="sys">[${topic.toUpperCase()}]</span> ${topics[topic]}`);
            } else {
                print(`НЕТ ИНФОРМАЦИИ ПО КОМАНДЕ '${topic}'.`, 'err');
            }
            return;
        }

        // Общий список доступных команд
        let cmds = ['help', 'scan (нужно 3 глифа)', 'map', 'hub', 'archive (нужно 3 глифа)', 'reset'];
        if (page === 'reactor.html') {
            cmds = ['help', 'restore', 'rebuild', 'include = 0XF4AD', 'check = 0XF4AD', 'backup = YYYYMMDD', 'hub'];
        }
        print(`ДОСТУПНЫЕ КОМАНДЫ: <span class="sys">${cmds.join(' | ')}</span>`);
    }

    function processCommand(cmd) {
        print(`> ${cmd}`, 'sys');
        
        if (cmd.startsWith('help ')) {
            showHelp(cmd.split(' ')[1]);
            return;
        }

        if (currentState !== 'IDLE' && (cmd === 'yes' || cmd === 'no')) {
            handleYesNo(cmd === 'yes');
            return;
        }

        const glyphsCount = Object.keys(localStorage).filter(k => k.startsWith('s9_glyph_')).length;

        switch(cmd) {
            case 'help':
                showHelp();
                break;
            
            case 'scan':
                if (glyphsCount < 3) {
                    print("ОШИБКА: НЕДОСТАТОЧНО ГЛИФОВ ДЛЯ ИНИЦИАЛИЗАЦИИ СКАНИРОВАНИЯ. ОТКРОЙТЕ КАРТУ (НУЖНО 3 ГЛИФА).", "err");
                    break;
                }
                if (localStorage.getItem('s9_emergency_reactor') === 'active') {
                    print("ОШИБКА: СКАНИРОВАНИЕ НЕВОЗМОЖНО. ЭНЕРГОЯДРО НЕИСПРАВНО.", "err");
                } else {
                    print("ИНИЦИАЛИЗАЦИЯ ГЛУБОКОГО СКАНИРОВАНИЯ...");
                    setTimeout(() => {
                        print("ТРЕБУЕМАЯ МОЩНОСТЬ: 150%");
                        print("КРИТИЧЕСКИЙ ПЕРЕГРУЗ. ВЫБРОС ПЛАЗМЫ В ЭНЕРГОЯДРЕ.", "err");
                        localStorage.setItem('s9_emergency_reactor', 'active');
                        if (typeof applyEmergencyStyles === 'function') applyEmergencyStyles();
                    }, 1000);
                }
                break;

            case 'map':
                window.location.href = 'map.html';
                break;
            case 'hub':
                window.location.href = 'index.html';
                break;
            case 'reactor':
                if (glyphsCount >= 3) window.location.href = 'reactor.html';
                else print("ОШИБКА: КАРТА ЗАБЛОКИРОВАНА. НУЖНО 3 ГЛИФА.", "err");
                break;
            case 'archive':
                if (glyphsCount >= 3) window.location.href = 'archive.html';
                else print("ОШИБКА: АРХИВ ЗАБЛОКИРОВАН. НУЖНО 3 ГЛИФА.", "err");
                break;

            // --- КОМАНДЫ РЕАКТОРА ---
            case 'restore':
                if (page !== 'reactor.html') {
                    print("ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В СЕКТОРЕ ЭНЕРГОЯДРА.", "err");
                } else {
                    print("ПОПЫТКА ВОССТАНОВЛЕНИЯ СИСТЕМЫ ИЗ ТОЧКИ ДОСТУПА. ПОДТВЕРДИТЕ ОПЕРАЦИЮ (YES/NO).");
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
                print("ВВЕДЕНО, ПРОВЕРЕНО. ПРИМЕНИТЬ? (YES/NO)");
                currentState = 'APPLY_CONFIRM';
                break;

            case 'reset':
                localStorage.clear();
                print("СИСТЕМА СБРОШЕНА. ПЕРЕЗАГРУЗКА...");
                setTimeout(() => location.reload(), 1000);
                break;
                
            default:
                if (cmd.startsWith('backup = ')) {
                    if (page !== 'reactor.html') break;
                    const date = cmd.split('=')[1].trim();
                    const correctDate = getYesterdayDate();
                    if (date === correctDate) {
                        print("ВЕРСИЯ БЭКАПА ПРИНЯТА. ПЕРЕЗАПИСАТЬ? (YES/NO)");
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
            print("ОПЕРАЦИЯ ОТМЕНЕНА.");
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
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            overlay.classList.toggle('active');
            if (overlay.classList.contains('active')) input.focus();
        }
        if (e.key === 'Escape') overlay.classList.remove('active');
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            if (cmd) processCommand(cmd);
            input.value = '';
        }
    });
})();
