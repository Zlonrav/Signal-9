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
        #tilde-console .sys { color: var(--neon); font-weight: bold; }
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

    // 4. ОБРАБОТКА КОМАНД (Обучаем логин)
    function processCommand(cmd) {
        print(`> ${cmd}`, 'sys');
        
        // Обработка Help с аргументами
        if (cmd.startsWith('help ')) {
            const topic = cmd.split(' ')[1];
            if (topic === 'trassit') {
                print(`<span class="sys">[ТРАССИТ]</span>`);
                print(`ГРАФИЧЕСКИЙ КЛЮЧ ДОСТУПА. КАЖДОЕ СЛОВО ИМЕЕТ УНИКАЛЬНУЮ ГЕОМЕТРИЧЕСКУЮ ТРАЕКТОРИЮ.`);
                print(`ДЛЯ АВТОРИЗАЦИИ НАРИСУЙТЕ КЛЮЧ «ТРАССИТ» НА СЕТКЕ ПЕРЕД ВАМИ.`);
            } else if (topic === 'console') {
                print(`<span class="sys">[КОНСОЛЬ]</span>`);
                print(`ИНТЕРФЕЙС УПРАВЛЕНИЯ. ОТКРЫВАЕТСЯ КЛАВИШЕЙ «~» ИЛИ КНОПКОЙ «>_». ВВОДИТЕ КОМАНДЫ И НАЖИМАЙТЕ ENTER.`);
            } else if (topic === 'terminal') {
                print(`<span class="sys">[ТЕРМИНАЛ]</span>`);
                print(`ИНЖЕНЕРНЫЙ МОДУЛЬ. ПОЗВОЛЯЕТ ВВОДИТЬ ГЛИФЫ ВРУЧНУЮ. ПЕРЕХОД: КОМАНДА TERMINAL.`);
            } else {
                print(`НЕТ ИНФОРМАЦИИ ПО ТЕМЕ '${topic.toUpperCase()}'.`, 'err');
            }
            return;
        }
        
        switch(cmd) {
            case 'help':
                print(`<span class="sys">ДОСТУПНЫЕ КОМАНДЫ:</span>`);
                print(`> help [тема] - справка`);
                print(`> clear - очистить консоль`);
                print(`> test - проверить статус системы`);
                print(`> hub - (В разработке) Переход в Хаб`);
                print(`<span class="sys">СПЕЦИАЛЬНЫЕ ТЕМЫ:</span> help trassit, help console, help terminal`);
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
            default:
                print(`НЕИЗВЕСТНАЯ КОМАНДА. ВВЕДИТЕ HELP.`, 'err');
        }
    }

    // 5. СОБЫТИЯ
    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            toggleConsole(!overlay.classList.contains('active'));
        }
        if (e.key === 'Escape') toggleConsole(false);
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
