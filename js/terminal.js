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
        #tilde-console .console-header { color: var(--neon); font-size: 12px; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 1px solid rgba(0, 242, 255, 0.3); padding-bottom: 10px; text-transform: uppercase; flex-shrink: 0; text-shadow: 0 0 5px var(--neon); display: flex; justify-content: space-between; align-items: center;}
        #tilde-console .console-output { color: #ccc; font-size: 12px; line-height: 1.6; flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding-right: 10px; }
        #tilde-console .console-output::-webkit-scrollbar { width: 4px; }
        #tilde-console .console-output::-webkit-scrollbar-track { background: #000; }
        #tilde-console .console-output::-webkit-scrollbar-thumb { background: var(--neon); box-shadow: 0 0 10px var(--neon); border-radius: 2px; }
		        /* Скролл для окна сохранений */
        #tilde-console .console-save-scroll::-webkit-scrollbar { width: 4px; }
        #tilde-console .console-save-scroll::-webkit-scrollbar-track { background: #000; }
        #tilde-console .console-save-scroll::-webkit-scrollbar-thumb { background: var(--neon); box-shadow: 0 0 10px var(--neon); border-radius: 2px; }
        
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
		
        #tilde-console #console-enter-btn {
            background: transparent;
            border: 1px solid rgba(0, 242, 255, 0.5);
            color: var(--neon);
            border-radius: 3px;
			padding: 6px 12px 2px 12px;	
            margin-left: 10px;
            cursor: pointer;
            font-family: monospace;
            font-size: 22px; 
            line-height: 1;
            transition: 0.3s;
            outline: none;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #tilde-console #console-enter-btn:hover {
            background: rgba(0, 242, 255, 0.1);
            box-shadow: 0 0 10px var(--neon);
        }
        
        /* Стили для кода в консоли (исправлены отступы) */
        #tilde-console .console-code-block { 
            background: rgba(0,0,0,0.5); 
            border: 1px solid rgba(0, 242, 255, 0.2); 
            padding: 15px; 
            margin: 15px 0; 
            font-family: monospace; 
            line-height: 1.6; 
            font-size: 14px; 
            border-radius: 4px;
        }
        #tilde-console .console-code-block .kw { color: #ffaa00; font-weight: bold; }
        #tilde-console .console-code-block .num { color: #00ff44; }
        #tilde-console .console-code-block .var { color: #00f2ff; }
        #tilde-console .console-code-block .op { color: #fff; }

        /* Декоративные уголки для консоли */
        #tilde-console .console-corner {
            position: absolute;
            width: 18px;
            height: 18px;
            border: 2px solid var(--neon);
            z-index: 10;
            pointer-events: none;
            animation: pulseCorner 2s infinite alternate;
        }
        #tilde-console .cc-tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        #tilde-console .cc-tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        #tilde-console .cc-bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        #tilde-console .cc-br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        @keyframes pulseCorner {
            0% { opacity: 0.5; filter: drop-shadow(0 0 2px var(--neon)); }
            100% { opacity: 1; filter: drop-shadow(0 0 8px var(--neon)); }
        }
    `;
    document.head.appendChild(style);

    // 2. СОЗДАЕМ HTML
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'tilde-overlay-bg';
    document.body.appendChild(bgOverlay);

    const overlay = document.createElement('div');
    overlay.id = 'tilde-console';
    overlay.innerHTML = `
        <div class="console-corner cc-tl"></div>
        <div class="console-corner cc-tr"></div>
        <div class="console-corner cc-bl"></div>
        <div class="console-corner cc-br"></div>
        <div class="console-header">
            <span>Консоль Управления // Введите команду</span>
            <button id="console-close-btn" style="background: transparent; border: none; color: var(--neon); font-size: 16px; cursor: pointer; transition: 0.3s; padding: 0 5px;" onmouseover="this.style.color='#ff3333'; this.style.textShadow='0 0 10px #ff3333'" onmouseout="this.style.color='var(--neon)'; this.style.textShadow='none'">✕</button>
        </div>
        <div class="console-output" id="terminal-output"></div>
        <div class="console-input-wrapper">
            <span>></span>
            <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="">
            <button id="console-enter-btn" title="Выполнить">↵</button>
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
    let isConsoleLocked = false;

    function print(text, type = 'normal') {
        const div = document.createElement('div');
        div.className = type;
        div.innerHTML = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    window.printToConsole = function(text, type = 'normal') {
        print(text, type);
        toggleConsole(true); 
    };

    window.addEventListener('lockConsole', () => {
        isConsoleLocked = true;
        const closeBtn = document.getElementById('console-close-btn');
        if(closeBtn) closeBtn.style.display = 'none';
    });

    window.addEventListener('unlockConsole', () => {
        isConsoleLocked = false;
        const closeBtn = document.getElementById('console-close-btn');
        if(closeBtn) closeBtn.style.display = 'block';
    });

    function toggleConsole(show) {
        if (!show && isConsoleLocked) {
            print(`<span class="err">[!] КОНСОЛЬ ЗАБЛОКИРОВАНА СИСТЕМОЙ. ЗАВЕРШИТЕ ТЕКУЩУЮ ОПЕРАЦИЮ.</span>`);
            return;
        }
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

    // 4. ПРОВЕРКА ДОСТУПА К МОДУЛЯМ
    function isModuleOnline(moduleId) {
        const isAuthorized = localStorage.getItem('s9_access_granted') === 'true';
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        switch(moduleId) {
            case 'terminal': return true; 
            case 'hub':
            case 'map': return isAuthorized; 
            case 'archive': return localStorage.getItem('s9_map_visited') === 'true' || currentPage === 'map.html';
            case 'os': return localStorage.getItem('s9_archive_fixed') === 'true';
            case 'edr': return localStorage.getItem('s9_os_fixed') === 'true'; 
            case 'telemetry': return localStorage.getItem('s9_core_fixed') === 'true';
            case 'core': return localStorage.getItem('s9_core_overheated') === 'true' || localStorage.getItem('s9_core_fixed') === 'true';
            case 'gateway': return localStorage.getItem('s9_core_unlocked') === 'true';
            default: return false;
        }
    }
    
    // 5. ОБРАБОТКА КОМАНД
    function processCommand(rawCmd) {
        print(`> ${printCmd(rawCmd)}`);

        // --- УМНАЯ ОБРАБОТКА ДЛЯ ЧИТОВ ---
        if (window.CheatManager) {
            // Если это команда load, передаем оригинальную строку (с сохранением регистра JSON)
            if (rawCmd.toLowerCase().startsWith('load ')) {
                if (window.CheatManager.handleCommand(rawCmd, print)) return;
            } else {
                // Для всех остальных команд (включая save) приводим к нижнему регистру
                if (window.CheatManager.handleCommand(rawCmd.toLowerCase(), print)) return;
            }
        }

        // Для остальных системных команд всегда нижний регистр
        const cmd = rawCmd.toLowerCase(); 

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isLoginPage = currentPage === 'login.html';
        const isHuman = isLoginPage || localStorage.getItem('s9_lang_human') === 'true';
        
        // --- БЛОКИРОВКА НАВИГАЦИИ В EDR ---
        const isEdrLocked = localStorage.getItem('s9_edr_os_trigger') === 'true' || localStorage.getItem('s9_edr_gateway_trigger') === 'true';
        if (isEdrLocked && ['hub', 'map', 'os', 'archive', 'terminal', 'core', 'gateway', 'telemetry'].includes(cmd.split(' ')[0])) {
            print(`<span class="err">ОШИБКА: ДОСТУП ЗАБЛОКИРОВАН. ЗАВЕРШИТЕ ПРОВЕРКУ ЛОГИКИ В СЕКТОРЕ EDR.</span>`);
            setTimeout(() => { window.location.replace('edr.html'); }, 1000);
            return;
        }

        // --- ЛОГИКА ПЕРВОГО КВЕСТА (ТОЛЬКО В ХАБЕ) ---
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
                case 'login': window.location.href = 'login.html'; break;
                case 'terminal': window.location.href = 'tools.html'; break;
                default:
                    print(`ОШИБКА: КОМАНДНЫЙ ПРОЦЕССОР ПОВРЕЖДЕН. ДОСТУПНЫ ТОЛЬКО КОМАНДЫ ВОССТАНОВЛЕНИЯ.`, 'err');
            }
            return;
        }

        // --- КОМАНДА ВЕРИФИКАЦИИ ОС ---
        if (cmd === 'login --id') {
            print(`<span class="err">ОШИБКА: УКАЖИТЕ ID. ПРИМЕР: <span class="cmd-text">login --id <ВАШ_ID></span></span>`);
            return;
        }
        if (cmd.startsWith('login --id ')) {
            if (currentPage !== 'os.html') {
                print(`<span class="err">ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В ОПЕРАЦИОННОЙ СИСТЕМЕ.</span>`);
                return;
            }
            const id = cmd.replace('login --id ', '').trim().replace('0x', '').toLowerCase();
            if (id === '7f930cb4ddb0') {
                localStorage.setItem('s9_os_captcha', 'true');
                print(`<span class="ok">[УСПЕХ] ИДЕНТИФИКАТОР ПРИНЯТ. ДОСТУП К ЯДРУ РАЗРЕШЕН.</span>`);
                window.dispatchEvent(new Event('unlockConsole'));
                setTimeout(() => { location.reload(); }, 2000);
                setTimeout(() => { window.dispatchEvent(new Event('os_id_verified')); }, 500);
            } else {
                print(`<span class="err">[ОШИБКА] НЕВЕРНЫЙ ИДЕНТИФИКАТОР. ПОПРОБУЙТЕ СНОВА.</span>`);
            }
            return;
        }
        // --- КОМАНДЫ ДЛЯ ЯДРА ---
        if (cmd.startsWith('core --position ')) {
            if (currentPage !== 'core.html') {
                print(`<span class="err">ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В ЭНЕРГОЯДРЕ.</span>`);
            } else {
                const args = rawCmd.substring(16).trim(); // Берем текст после "core --position "
                if (args.toLowerCase() === 'sync') {
                    if (typeof window.syncCore === 'function') window.syncCore();
                } else {
                    if (typeof window.checkCorePosition === 'function') window.checkCorePosition(args);
                }
            }
            return;
        }
        // --- КОМАНДА ДЛЯ EDR (ОТВЕТЫ) ---
        if (cmd.startsWith('edr --answer ')) {
            const val = cmd.replace('edr --answer ', '').trim();
            if (typeof window.checkEdrAnswer === 'function') {
                window.checkEdrAnswer(val);
            } else {
                print(`<span class="err">ОШИБКА: МОДУЛЬ EDR НЕ АКТИВЕН.</span>`);
            }
            return;
        }
		
        // --- КОМАНДЫ ДЛЯ ТЕЛЕМЕТРИИ ---
        if (cmd.startsWith('telemetry --')) {
            if (currentPage !== 'telemetry.html') {
                print(`<span class="err">ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В МОДУЛЕ ТЕЛЕМЕТРИИ.</span>`);
            } else {
                if (typeof window.telemetryCommand === 'function') {
                    window.telemetryCommand(cmd);
                } else {
                    print(`<span class="err">ОШИБКА: МОДУЛЬ ТЕЛЕМЕТРИИ НЕ АКТИВЕН.</span>`);
                }
            }
            return;
        }		
        // --- КОМАНДА ОБУЧЕНИЯ АРХИВА ---
        if (cmd === 'archive --traning') {
            if (currentPage !== 'tools.html') {
                print(`<span class="err">ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В ИНЖЕНЕРНОМ ТЕРМИНАЛЕ.</span>`);
                return;
            }
            if (localStorage.getItem('s9_archive_calibrated') === 'true') {
                print(`<span class="err">АРХИВ УЖЕ ОБУЧЕН. КАЛИБРОВКА НЕ ТРЕБУЕТСЯ.</span>`);
                return;
            }
            if (localStorage.getItem('s9_archive_training') === 'true') {
                print(`<span class="warn">РЕЖИМ ОБУЧЕНИЯ УЖЕ АКТИВЕН.</span>`);
                return;
            }
            
            localStorage.setItem('s9_archive_training', 'true');
            window.dispatchEvent(new CustomEvent('start_archive_training'));
            
            print(`<span class="warn">[ОБУЧЕНИЕ] ИНЖЕНЕРНЫЙ ТЕРМИНАЛ ПЕРЕВЕДЁН В РЕЖИМ ОБУЧЕНИЯ.</span>`);
            print(`ДЛЯ КАЛИБРОВКИ АРХИВА ВВЕДИТЕ ЭТАЛОННЫЕ ГЛИФЫ: ХАБ, ГЛИФ, ПУЛЬТ, СЕРВЕР, КОНСОЛЬ.`);
            return;
        }
        // ------------------------------

        // --- КОМАНДА ДЛЯ ОС ---
        if (cmd.startsWith('os --reset qubit ')) {
            if (currentPage !== 'os.html') {
                print(`ОШИБКА: КОМАНДА ДОСТУПНА ТОЛЬКО В ОПЕРАЦИОННОЙ СИСТЕМЕ.`, 'err');
            } else {
                const coords = cmd.split(' ')[3]; 
                const match = coords.match(/^r([1-5])c([1-5])$/i);
                if (match) {
                    print(`<span class="ok">[ОС] ПОПЫТКА СБРОСА КУБИТА ${coords.toUpperCase()}...</span>`);
                    window.dispatchEvent(new CustomEvent('repair_qubit', { detail: coords.toLowerCase() }));
                } else {
                    print(`ОШИБКА: НЕВЕРНЫЙ ФОРМАТ КООРДИНАТ (ПРИМЕР: r1c2)`, 'err');
                }
            }
            return;
        }

        if (cmd.startsWith('help ')) {
            const topic = cmd.split(' ')[1];
            if (topic === 'archive') {
                print(`<span class="topic-header">[АРХИВ]</span>`);
                print(`ДЛЯ КАЛИБРОВКИ АРХИВА ВВЕДИТЕ ${printCmd('archive --traning')}`);
            } else if (topic === 'terminal') {
                print(`<span class="topic-header">[ИНЖЕНЕРНЫЙ ТЕРМИНАЛ]</span>`);
                print(`ДОСТУПНЫЕ СЕРВИСНЫЕ КОДЫ:`);
                print(`> ${printCmd('archive --traning')} - Запуск протокола обучения автосохранения (требует 5 эталонных паттернов).`);
            } else if (topic === 'login') {
                print(`<span class="topic-header">[ЛОГИН]</span>`);
                print(`ВВЕДИТЕ ТЕКСТ «ТРАССИТ» В ИНЖЕНЕРНОМ ТЕРМИНАЛЕ (${printCmd('terminal')}) ДЛЯ ПОЛУЧЕНИЯ КЛЮЧА.`);
            } else if (topic === 'os') {
                print(`<span class="topic-header">[ОС]</span>`);
                print(`ДЛЯ РЕМОНТА КУБИТОВ ИСПОЛЬЗУЙТЕ ${printCmd('os --reset qubit rXcY')}`);
			} else if (topic === 'core') {
				if (currentPage !== 'core.html') {
					print(`<span class="err">СПРАВКА ДОСТУПНА ТОЛЬКО В МОДУЛЕ ЭНЕРГОЯДРА.</span>`);
				} else if (localStorage.getItem('s9_core_fixed') === 'true') {
					print(`<span class="topic-header">[ЭНЕРГОЯДРО]</span>`);
					print(`<span class="ok">ЯДРО СТАБИЛЬНО, РЕМОНТ НЕ ТРЕБУЕТСЯ.</span>`);
				} else if (!window.coreEquations) {
					print(`<span class="err">ОШИБКА: МОДУЛЬ ЯДРА НЕ АКТИВЕН.</span>`);
				} else {
					print(`<span class="topic-header">[ЭНЕРГОЯДРО]</span>`);
					print(`ДАНО:`);
					print(`X + Y = ${window.coreEquations.xy}`);
					print(`Y + Z = ${window.coreEquations.yz}`);
					print(`X + Z = ${window.coreEquations.xz}`);
					print(`НАЙДИТЕ X, Y, Z И ВВЕДИТЕ:`);
					print(`> ${printCmd('core --position rt X, lt -X, up Y, dn -Y, fw Z, bk -Z')}`);
					print(`ЗАТЕМ:`);
					print(`> ${printCmd('core --position sync')}`);
				}				
            } else if (topic === 'telemetry') {
                if (currentPage === 'telemetry.html') {
                    print(`<span class="topic-header">[СИСТЕМА ТЕЛЕМЕТРИИ]</span>`);
                    print(`ВАША ЗАДАЧА: СИНХРОНИЗИРОВАТЬ 3 ВОЛНЫ (RED, GREEN, BLUE) С ЭТАЛОНОМ (БЕЛАЯ ВОЛНА).`);
                    print(``);
                    print(`<span class="topic-header">[ДОСТУПНЫЕ КОМАНДЫ]</span>`);
                    
                    print(`> ${printCmd('telemetry --set <red|green|blue> <freq|phase|amp|offset> <+/-число>')}`);
                    print(`  Изменяет параметр выбранной волны.`);
                    print(`  Пример: ${printCmd('telemetry --set red freq +5')}`);
                    print(`  Пример: ${printCmd('telemetry --set blue phase -10')}`);
                    print(``);
                    
                    print(`> ${printCmd('telemetry --toggle <red|green|blue>')}`);
                    print(`  Скрывает или показывает выбранную волну на экране.`);
                    print(`  Пример: ${printCmd('telemetry --toggle green')}`);
                    print(``);
                    
                    print(`> ${printCmd('telemetry --read target')}`);
                    print(`  Выводит точные параметры эталонной (белой) волны в консоль.`);
                } else {
                    print(`<span class="err">СПРАВКА ДОСТУПНА ТОЛЬКО В МОДУЛЕ ТЕЛЕМЕТРИИ.</span>`);
                }
            } else if (topic === 'cheats') {
                print(`<span class="topic-header">[ЧИТЫ И УТИЛИТЫ]</span>`);
                print(`> ${printCmd('save')} - Сохранить прогресс (Base64)`);
                print(`> ${printCmd('load <код>')} - Загрузить прогресс`);
                print(`> ${printCmd('fix_lang')} - Восстановить язык`);
                print(`> ${printCmd('fix_archive')} - Починить Архив`);
                print(`> ${printCmd('calibrate_archive')} - Калибровка Архива (2 фразы)`);
                print(`> ${printCmd('reset_archive')} - Сбросить Архив`);
                print(`> ${printCmd('fix_os')} - Починить ОС (и вызвать EDR)`);
                print(`> ${printCmd('reset_os')} - Сбросить ОС и EDR`);
                print(`> ${printCmd('reset_core')} - Сброс до желтого ядра (охлаждение)`);
                print(`> ${printCmd('fix_telemetry')} - Синхронизировать волны телеметрии`);
                print(`> ${printCmd('reset_telemetry')} - Сбросить телеметрию (новые волны)`);
                print(`> ${printCmd('clear_memory')} - Полная очистка памяти`);
            } else {
                print(`НЕТ ИНФОРМАЦИИ ПО ТЕМЕ '${topic}'.`, 'err');
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
                if (isModuleOnline('hub')) print(`> ${printCmd('hub')} - Хаб`);
                if (isModuleOnline('map')) print(`> ${printCmd('map')} - Карта`);
                print(`> ${printCmd('terminal')} - Терминал`);
                if (isModuleOnline('archive')) print(`> ${printCmd('archive')} - Архив`);
                if (isModuleOnline('os')) print(`> ${printCmd('os')} - ОС`);
                if (isModuleOnline('edr')) print(`> ${printCmd('edr')} - EDR`);
                print(`> ${printCmd('help [тема]')} - Справка`);
                print(`> ${printCmd('clear')} - Очистка`);
                break;
            case 'clear': output.innerHTML = ''; break;
            case 'hub': 
                if (isModuleOnline('hub')) window.location.href = 'index.html'; 
                else print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
                break;
            case 'map': 
                if (isModuleOnline('map')) window.location.href = 'map.html'; 
                else print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
                break;
            case 'terminal': window.location.href = 'tools.html'; break;
            case 'login': window.location.href = 'login.html'; break;
            case 'archive': 
                if (isModuleOnline('archive')) window.location.href = 'archive.html'; 
                else print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
                break;
            case 'os': 
                if (isModuleOnline('os')) window.location.href = 'os.html'; 
                else print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
                break;
            case 'edr': 
                if (isModuleOnline('edr')) window.location.href = 'edr.html'; 
                else print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
                break;
            default:
                print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ ${printCmd('help')}.`, 'err');
        }
    }

    document.addEventListener('keydown', (e) => {
        // Тильда (Punto Switcher)
        if (e.code === 'Backquote') {
            if (overlay.classList.contains('active') && document.activeElement === input) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            toggleConsole(!overlay.classList.contains('active'));
        }
        
        // Закрытие по Escape (только если консоль открыта)
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            e.preventDefault();
            toggleConsole(false);
        }
    });

    const toggleBtn = document.getElementById('console-toggle-btn');
    if (toggleBtn) toggleBtn.addEventListener('click', () => toggleConsole(!overlay.classList.contains('active')));

    const closeBtn = document.getElementById('console-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => toggleConsole(false));

    function submitCommand() {
        const cmd = input.value.trim(); 
        if (cmd) {
            processCommand(cmd);
            input.value = '';
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitCommand();
        }
    });

    const enterBtn = document.getElementById('console-enter-btn');
    if (enterBtn) {
        enterBtn.addEventListener('click', submitCommand);
    }
})();
