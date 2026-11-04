// js/terminal.js
(function() {
    if (window.TERMINAL_INITIALIZED) return;
    window.TERMINAL_INITIALIZED = true;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === '404.html') return;

    // 1. ВНЕДРЯЕМ СТИЛИ
    const style = document.createElement('style');
    style.innerHTML = `
        #tilde-overlay-bg { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); z-index: 999998; backdrop-filter: blur(3px); }
        #tilde-overlay-bg.active { display: block; }
        #tilde-console { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 850px; max-width: 95vw; height: 480px; background: #020508; border: 1px solid var(--neon); box-shadow: 0 0 50px rgba(0, 242, 255, 0.2), inset 0 0 20px rgba(0, 242, 255, 0.05); z-index: 2147483647 !important; font-family: 'JetBrains Mono', monospace; flex-direction: column; padding: 20px; box-sizing: border-box; overflow: hidden; }
        #tilde-console.active { display: flex; }
        #tilde-console * { box-sizing: border-box; margin: 0; padding: 0; }
        #tilde-console .console-header { color: var(--neon); font-size: 12px; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 1px solid rgba(0, 242, 255, 0.3); padding-bottom: 10px; text-transform: uppercase; flex-shrink: 0; text-shadow: 0 0 5px var(--neon); }
        #tilde-console .console-output { color: #ccc; font-size: 12px; line-height: 1.6; flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding-right: 10px; }
        #tilde-console .console-output::-webkit-scrollbar { width: 4px; }
        #tilde-console .console-output::-webkit-scrollbar-track { background: #000; }
        #tilde-console .console-output::-webkit-scrollbar-thumb { background: var(--neon); box-shadow: 0 0 10px var(--neon); border-radius: 2px; }
        
        #tilde-console .cmd-text { color: var(--neon) !important; font-weight: bold; text-transform: lowercase !important; text-shadow: 0 0 5px var(--neon); }
        .cmd-text { color: var(--neon) !important; font-weight: bold; text-transform: lowercase !important; text-shadow: 0 0 5px var(--neon); }
        #tilde-console .topic-header { color: var(--neon) !important; font-weight: bold; text-transform: uppercase; text-shadow: 0 0 5px var(--neon); }
        
        #tilde-console .err { color: #ff3333; }
        #tilde-console .ok { color: #00ff44; }
        #tilde-console .warn { color: #ffaa00; }
        
        #tilde-console .console-input-wrapper { display: flex; align-items: center; gap: 10px; flex-shrink: 0; border-top: 1px solid rgba(0, 242, 255, 0.2); padding-top: 15px; }
        #tilde-console .console-input-wrapper span { color: var(--neon); font-size: 14px; font-weight: bold; }
        #tilde-console #terminal-input { flex: 1; background: transparent !important; border: none !important; border-bottom: 1px solid rgba(0, 242, 255, 0.5) !important; color: var(--neon) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 14px !important; text-align: left !important; outline: none !important; text-transform: uppercase; box-shadow: none !important; position: static !important; width: 100% !important; padding: 5px 0 !important; margin: 0 !important; display: block !important; }
        #tilde-console #terminal-input:focus { border-bottom-color: var(--neon) !important; box-shadow: 0 5px 10px -5px var(--neon) !important; }
        #tilde-console .console-hint { margin-top: 15px; font-size: 9px; color: #555; display: flex; justify-content: space-between; flex-shrink: 0; }
    `;
    document.head.appendChild(style);

    // 2. СОЗДАЕМ HTML
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'tilde-overlay-bg';
    document.body.appendChild(bgOverlay);

    const overlay = document.createElement('div');
    overlay.id = 'tilde-console';
    overlay.innerHTML = `
        <div class="console-header">Консоль Управления // Введите команду</div>
        <div class="console-output" id="terminal-output">
            <div>СИСТЕМА ГОТОВА. ВВЕДИТЕ <span class="cmd-text">help</span> ДЛЯ СПИСКА КОМАНД.</div>
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

    // 3. БАЗОВЫЕ ФУНКЦИИ
    function print(text, type = 'normal') {
        const div = document.createElement('div');
        div.className = type;
        div.innerHTML = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function toggleConsole(show) {
        overlay.classList.toggle('active', show);
        bgOverlay.classList.toggle('active', show);
        if (show) {
            input.value = ''; 
            setTimeout(() => input.focus(), 50);
        }
    }

    function printCmd(cmdName) {
        return `<span class="cmd-text">${cmdName}</span>`;
    }

    // Слушатель автовызова
    window.addEventListener('autoOpenConsole', () => {
        toggleConsole(true);
        print(`<span class="err">[!] КОМАНДНЫЙ ПРОЦЕССОР ПОВРЕЖДЕН.</span>`);
        print(`ВВЕДИТЕ ${printCmd('system --help')} ДЛЯ СПИСКА КОМАНД ВОССТАНОВЛЕНИЯ.`);
    });

    // 4. ПРОВЕРКА ДОСТУПА К МОДУЛЯМ
    function isModuleOnline(moduleId) {
        const isAuthorized = localStorage.getItem('s9_access_granted') === 'true';

        switch(moduleId) {
            case 'terminal':
                return true; 
            case 'hub':
            case 'map':
                return isAuthorized; 
            case 'archive':
                return localStorage.getItem('s9_map_visited') === 'true';
            case 'os':
                return localStorage.getItem('s9_archive_fixed') === 'true';
            case 'edr':
                return localStorage.getItem('s9_os_fixed') === 'true';
            case 'telemetry':
                return localStorage.getItem('s9_edr_ghosts') !== null;
            case 'core':
                return localStorage.getItem('s9_telemetry_calibrated') === 'true' || localStorage.getItem('s9_core_unlocked') === 'true';
            case 'gateway':
                return localStorage.getItem('s9_core_unlocked') === 'true';
            default:
                return false;
        }
    }
    
    // 5. ОБРАБОТКА КОМАНД
    function processCommand(cmd) {
        print(`> ${printCmd(cmd)}`);

        // --- ХУК ДЛЯ ЧИТОВ ---
        if (window.CheatManager && window.CheatManager.handleCommand(cmd, print)) {
            return; 
        }

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isLoginPage = currentPage === 'login.html';
        const isHuman = isLoginPage || localStorage.getItem('s9_lang_human') === 'true';

        // ЛОГИКА ПЕРВОГО КВЕСТА (ТОЛЬКО В ХАБЕ)
        if (!isHuman) {
            switch(cmd) {
                case 'system --help':
                    print(`<span class="topic-header">[СИСТЕМА]</span> ДОСТУПНЫЕ КОМАНДЫ ВОССТАНОВЛЕНИЯ:`);
                    print(`> ${printCmd('system --load identity')} - Модуль идентификации`);
                    print(`> ${printCmd('system --load status')} - Модуль статуса`);
                    print(`> ${printCmd('system --lang human')} - Переводчик на человеческий язык`);
                    break;
                case 'system --load identity':
                    print(`<span class="ok">[СИСТЕМА] МОДУЛЬ ИДЕНТИФИКАЦИИ ПОДКЛЮЧЕН. ОБЪЕКТ: ЦИФРОВАЯ СУЩНОСТЬ.</span>`);
                    break;
                case 'system --load status':
                    print(`<span class="ok">[СИСТЕМА] МОДУЛЬ СТАТУСА ПОДКЛЮЧЕН. СОСТОЯНИЕ: АКТИВНО.</span>`);
                    break;
                case 'system --lang human':
                    print(`<span class="ok">[СИСТЕМА] ПЕРЕВОДЧИК ЗАГРУЖЕН. ПЕРЕЗАГРУЗКА ИНТЕРФЕЙСА...</span>`);
                    localStorage.setItem('s9_lang_human', 'true');
                    setTimeout(() => { location.reload(); }, 1500);
                    break;
                case 'login': 
                    window.location.href = 'login.html'; 
                    break;
                case 'terminal': 
                    window.location.href = 'tools.html'; 
                    break;
                default:
                    print(`ОШИБКА: КОМАНДНЫЙ ПРОЦЕССОР ПОВРЕЖДЕН. ДОСТУПНЫ ТОЛЬКО КОМАНДЫ ВОССТАНОВЛЕНИЯ.`, 'err');
            }
            return;
        }

        // --- ОБЫЧНЫЙ РЕЖИМ ---
        if (cmd.startsWith('help ')) {
            const topic = cmd.split(' ')[1];
            
            if (topic === 'login') {
                print(`<span class="topic-header">[ЛОГИН]</span>`);
                print(`КЛЮЧ ДОСТУПА (ТРАССИТ) ГЕНЕРИРУЕТСЯ В ИНЖЕНЕРНОМ ТЕРМИНАЛЕ.`);
                print(`ВВЕДИТЕ КОМАНДУ ${printCmd('terminal')} ДЛЯ ПЕРЕХОДА В ТЕРМИНАЛ.`);
                print(`ВВЕДИТЕ ТЕКСТ «ТРАССИТ» В ТЕРМИНАЛЕ, ЧТОБЫ УВИДЕТЬ ЭТАЛОННУЮ ГРАФИЧЕСКУЮ ТРАЕКТОРИЮ.`);
                
                if (localStorage.getItem('s9_access_granted') !== 'true') {
                    print(`ВВЕДИТЕ КОМАНДУ ${printCmd('login')} ДЛЯ ВОЗВРАТА НА СТРАНИЦУ АВТОРИЗАЦИИ.`);
                }
            } else if (topic === 'map') {
                print(`<span class="topic-header">[КАРТА]</span>`);
                print(`МОДУЛЬ НАВИГАЦИИ. ПОКАЗЫВАЕТ ТОПОЛОГИЮ СТАНЦИИ И СТАТУС ВСЕХ ОТСЕКОВ.`);
            } else if (topic === 'terminal') {
                print(`<span class="topic-header">[ТЕРМИНАЛ]</span>`);
                print(`ИНЖЕНЕРНЫЙ МОДУЛЬ. ПРЕДНАЗНАЧЕН ДЛЯ ИЗУЧЕНИЯ И ВВОДА ГРАФИЧЕСКИХ КЛЮЧЕЙ.`);
                print(`РЕЖИМ «ТЕКСТ»: ВВЕДИТЕ СЛОВО, ЧТОБЫ УВИДЕТЬ ЕГО ГРАФИЧЕСКУЮ ТРАЕКТОРИЮ.`);
                print(`РЕЖИМ «ТРАССИТ»: СОЕДИНИТЕ ТОЧКИ, ЧТОБЫ РАСПОЗНАТЬ СЛОВО.`);
            } else if (topic === 'cheats') {
                print(`<span class="topic-header">[ЧИТЫ]</span> ДОСТУПНЫЕ КОМАНДЫ ДЛЯ ОТЛАДКИ:`);
                print(`> ${printCmd('fix_lang')} - Восстанавливает человеческий язык`);
                print(`> ${printCmd('calibrate_archive')} - Калибрует Архив (без завершения теста)`);
                print(`> ${printCmd('fix_archive')} - Вводит 10 слов и чинит Архив`);
                print(`> ${printCmd('reset_archive')} - Сбрасывает задание с Архивом`);
                print(`> ${printCmd('fix_os')} - Обходит защиту ОС и чинит кубиты`);
                print(`> ${printCmd('clear_memory')} - Полная очистка памяти`);
                print(`> ${printCmd('reset_os')} - Сбрасывает прохождение ОС`);
            } else if (topic === 'os') {
                print(`<span class="topic-header">[ОС]</span> ОПЕРАЦИОННАЯ СИСТЕМА СТАНЦИИ.`);
                print(`ПРЕДНАЗНАЧЕНА ДЛЯ УПРАВЛЕНИЯ КВАНТОВЫМИ ВЫЧИСЛЕНИЯМИ.`);
                print(`В СЛУЧАЕ ДЕКОГЕРЕНЦИИ КУБИТОВ ИСПОЛЬЗУЙТЕ КОМАНДУ ${printCmd('os --reset qubit_XX')},`);
                print(`ГДЕ XX — НОМЕР СБОЙНОГО КУБИТА (ОТ 01 ДО 25).`);
            } else {
                print(`НЕТ ИНФОРМАЦИИ ПО ТЕМЕ '${topic}'.`, 'err');
            }
            return;
        }

        // --- КОМАНДА ДЛЯ ОС ---
        if (cmd.startsWith('os --reset qubit ')) {
            if (currentPage !== 'os.html') {
                print(`ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В ОПЕРАЦИОННОЙ СИСТЕМЕ.`, 'err');
            } else {
                // Извлекаем координаты (r1c2)
                const coords = cmd.split(' ')[3]; 
                const match = coords.match(/^r([1-5])c([1-5])$/i);
                
                if (match) {
                    print(`<span class="ok">[ОС] ПОПЫТКА СБРОСА КУБИТА ${coords.toUpperCase()}...</span>`);
                    window.dispatchEvent(new CustomEvent('repair_qubit', { detail: coords.toLowerCase() }));
                } else {
                    print(`ОШИБКА: НЕВЕРНЫЙ ФОРМАТ КООРДИНАТ. ИСПОЛЬЗУЙТЕ rXcY (НАПРИМЕР, r1c2)`, 'err');
                }
            }
            return;
        }
        
        switch(cmd) {
            case 'self --id':
                print(`<span class="topic-header">[ИДЕНТИФИКАТОР ЯДРА]</span>`);
                print(`0x7f930cb4ddb0`);
                break;
            case 'help':
                print(`<span class="topic-header">[ПРОТОКОЛЫ ПЕРЕМЕЩЕНИЯ]</span>`);
                
                if (isModuleOnline('hub')) print(`> ${printCmd('hub')} - Переход в Главный Хаб`);
                else print(`> ${printCmd('hub')} - <span class="err">[OFFLINE]</span>`);
                
                if (isModuleOnline('map')) print(`> ${printCmd('map')} - Переход на Карту`);
                else print(`> ${printCmd('map')} - <span class="err">[OFFLINE]</span>`);

                print(`> ${printCmd('terminal')} - Переход в Терминал`);
                
                if (isModuleOnline('archive')) print(`> ${printCmd('archive')} - Переход в Базу Данных`);
                else print(`> ${printCmd('archive')} - <span class="err">[OFFLINE]</span>`);

                if (isModuleOnline('os')) print(`> ${printCmd('os')} - Переход в Операционную Систему`);
                else print(`> ${printCmd('os')} - <span class="err">[OFFLINE]</span>`);

                if (isModuleOnline('edr')) print(`> ${printCmd('edr')} - Переход в EDR Сектор`);
                else print(`> ${printCmd('edr')} - <span class="err">[OFFLINE]</span>`);

                if (isModuleOnline('telemetry')) print(`> ${printCmd('telemetry')} - Переход в Модуль Телеметрии`);
                else print(`> ${printCmd('telemetry')} - <span class="err">[OFFLINE]</span>`);

                if (isModuleOnline('core')) print(`> ${printCmd('core')} - Переход в Энергоядро`);
                else print(`> ${printCmd('core')} - <span class="err">[OFFLINE]</span>`);

                if (isModuleOnline('gateway')) print(`> ${printCmd('gateway')} - Переход к Транспортному Шлюзу`);
                else print(`> ${printCmd('gateway')} - <span class="err">[OFFLINE]</span>`);
                
                print(``);
                print(`<span class="topic-header">[СПРАВОЧНЫЙ МОДУЛЬ]</span>`);
                print(`> ${printCmd('help [тема]')} - Информация о модуле или команде`);
                
                print(``);
                print(`<span class="topic-header">[СИСТЕМНЫЕ УТИЛИТЫ]</span>`);
                print(`> ${printCmd('test')} - Диагностика системы`);
                print(`> ${printCmd('clear')} - Очистка консоли`);
                break;
                
            case 'clear':
                output.innerHTML = '';
                print('КОНСОЛЬ ОЧИЩЕНА.');
                break;
                
            case 'test':
                print(`СТАТУС СИСТЕМЫ: <span class="ok">В НОРМЕ</span>`);
                print(`ТЕКУЩАЯ СТРАНИЦА: ${page}`);
                print(`ФЛАГ ДОСТУПА: ${localStorage.getItem('s9_access_granted') || 'НЕТ'}`);
                break;
                
            case 'hub': 
                if (isModuleOnline('hub')) window.location.href = 'index.html'; 
                else print(`ОШИБКА: ДОСТУП ЗАКРЫТ. ТРЕБУЕТСЯ АВТОРИЗАЦИЯ.`, 'err');
                break;

            case 'map': 
                if (isModuleOnline('map')) window.location.href = 'map.html'; 
                else print(`ОШИБКА: ДОСТУП ЗАКРЫТ. ТРЕБУЕТСЯ АВТОРИЗАЦИЯ.`, 'err');
                break;

            case 'terminal': window.location.href = 'tools.html'; break;
            case 'login': window.location.href = 'login.html'; break;
            
            case 'archive':
                if (isModuleOnline('archive')) window.location.href = 'archive.html';
                else print(`ОШИБКА: МОДУЛЬ [АРХИВ] НЕДОСТУПЕН.`, 'err');
                break;
                
            case 'os':
                if (isModuleOnline('os')) window.location.href = 'os.html';
                else print(`ОШИБКА: МОДУЛЬ [ОС] НЕДОСТУПЕН.`, 'err');
                break;
                
            case 'edr':
                if (isModuleOnline('edr')) window.location.href = 'edr.html';
                else print(`ОШИБКА: МОДУЛЬ [EDR] НЕДОСТУПЕН.`, 'err');
                break;

            case 'telemetry':
                if (isModuleOnline('telemetry')) window.location.href = 'telemetry.html';
                else print(`ОШИБКА: МОДУЛЬ [ТЕЛЕМЕТРИЯ] НЕДОСТУПЕН.`, 'err');
                break;

            case 'core':
                if (isModuleOnline('core')) window.location.href = 'reactor.html';
                else print(`ОШИБКА: МОДУЛЬ [ЭНЕРГОЯДРО] НЕДОСТУПЕН.`, 'err');
                break;
                
            case 'gateway':
                if (isModuleOnline('gateway')) window.location.href = 'gateway.html';
                else print(`ОШИБКА: МОДУЛЬ [ШЛЮЗ] НЕДОСТУПЕН.`, 'err');
                break;
                
            case 'sector00':
            case 'sectorff':
                print(`ОШИБКА: МОДУЛЬ НЕДОСТУПЕН (OFFLINE).`, 'err');
                break;
                
            default:
                print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
        }
    }

    document.addEventListener('keydown', (e) => {
        // Открытие/закрытие ТОЛЬКО по тильде
        if (e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            toggleConsole(!overlay.classList.contains('active'));
        }
    });

    const toggleBtn = document.getElementById('console-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleConsole(!overlay.classList.contains('active'));
        });
    }

    bgOverlay.addEventListener('click', () => toggleConsole(false));

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            if (cmd) processCommand(cmd);
            input.value = '';
        }
    });

})();
