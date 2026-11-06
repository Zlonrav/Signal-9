// js/edr.js
(function() {
    const content = document.getElementById('edrContent');
    
    // Флаги прохождения
    const osPassed = localStorage.getItem('s9_edr_os_passed') === 'true';
    const gatewayPassed = localStorage.getItem('s9_edr_gateway_passed') === 'true';
    
    // Триггеры (разрешения на вход)
    const osTrigger = localStorage.getItem('s9_edr_os_trigger') === 'true';
    const gatewayTrigger = localStorage.getItem('s9_edr_gateway_trigger') === 'true';

    // Очистка старых интервалов при перезагрузке (на всякий случай)
    if (window.edrScanInterval) clearInterval(window.edrScanInterval);
    if (window.edrLogInterval) clearInterval(window.edrLogInterval);

    // --- 1. ЗАПУСК ПЕСОЧНИЦЫ (ЕСЛИ ЕСТЬ ТРИГГЕР) ---
    if (osTrigger) {
        startSandbox();
    } 
    // --- 2. ЗАПУСК ВЗЛОМА ШИФРА (ЕСЛИ ЕСТЬ ТРИГГЕР) ---
    else if (gatewayTrigger) {
        startMastermind();
    } 
    // --- 3. РАБОЧИЙ РЕЖИМ ---
    else {
        if (osPassed && gatewayPassed) {
            initShieldVisual(false); // Полный режим
        } else if (osPassed || gatewayPassed) {
            initShieldVisual(true, osPassed ? 'ОС' : 'ШЛЮЗ'); // Частичный режим (ожидание)
        } else {
            window.location.replace('404.html');
        }
    }

    // --- ЛОГИКА ПЕСОЧНИЦЫ ---
    function startSandbox() {
        let phase = 1;
        function renderPhase() {
            if (phase === 1) {
                let ans = 24;
                content.innerHTML = `
                    <div style="color: var(--warn); margin-bottom: 10px;">ЭТАП 1 / 3</div>
                    <div class="code-box">
                        <span style="color:#888">// БАЗОВЫЙ ЦИКЛ</span><br><br>
                        LET X = 3<br>LOOP 3 TIMES:<br>&nbsp;&nbsp;X = X * 2<br>PRINT X
                    </div>
                    <div>ВВЕДИТЕ РЕЗУЛЬТАТ:</div>
                    <input type="text" id="sbAns" class="code-input" autocomplete="off">
                `;
                document.getElementById('sbAns').oninput = (e) => { if(e.target.value === ans.toString()) { phase++; renderPhase(); } };
            } else if (phase === 2) {
                let ans = 22;
                content.innerHTML = `
                    <div style="color: var(--warn); margin-bottom: 10px;">ЭТАП 2 / 3</div>
                    <div class="code-box">
                        <span style="color:#888">// ЦИКЛ + УСЛОВИЕ</span><br><br>
                        LET X = 5<br>LOOP 3 TIMES:<br>&nbsp;&nbsp;X = X + 2<br>IF X > 10:<br>&nbsp;&nbsp;X = X * 2<br>PRINT X
                    </div>
                    <div>ВВЕДИТЕ РЕЗУЛЬТАТ:</div>
                    <input type="text" id="sbAns" class="code-input" autocomplete="off">
                `;
                document.getElementById('sbAns').oninput = (e) => { if(e.target.value === ans.toString()) { phase++; renderPhase(); } };
            } else if (phase === 3) {
                let ans = 88;
                content.innerHTML = `
                    <div style="color: var(--warn); margin-bottom: 10px;">ЭТАП 3 / 3</div>
                    <div class="code-box">
                        <span style="color:#888">// ВЕТВЛЕНИЕ</span><br><br>
                        LET X = 2<br>LET Y = 10<br>LOOP 3 TIMES:<br>&nbsp;&nbsp;X = X * 3<br>&nbsp;&nbsp;IF X > 5: Y = Y + X<br>PRINT Y
                    </div>
                    <div>ВВЕДИТЕ РЕЗУЛЬТАТ:</div>
                    <input type="text" id="sbAns" class="code-input" autocomplete="off">
                `;
                document.getElementById('sbAns').oninput = (e) => { 
                    if(e.target.value === ans.toString()) { 
                        localStorage.setItem('s9_edr_os_passed', 'true');
                        localStorage.removeItem('s9_edr_os_trigger');
                        localStorage.setItem('s9_os_fixed', 'true');
                        localStorage.setItem('s9_os_errors', '0'); 
                        content.innerHTML = `<h2 style="color: var(--ok);">ЛОГИКА ПОДТВЕРЖДЕНА</h2><p>Возврат в ОС...</p>`;
                        setTimeout(() => { window.location.href = 'os.html'; }, 2000);
                    } 
                };
            }
            setTimeout(() => { const inp = document.getElementById('sbAns'); if(inp) inp.focus(); }, 100);
        }
        renderPhase();
    }

    // --- ЛОГИКА ВЗЛОМА ШИФРА ---
    function startMastermind() {
        const targetCode = Array.from({length: 5}, () => Math.floor(Math.random() * 10)).join('');
        content.innerHTML = `
            <div style="margin-bottom: 15px; color: var(--neon); text-align:center;">
                > ДОСТУП К ШЛЮЗУ ЗАБЛОКИРОВАН.<br>
                > ПОДБЕРИТЕ 5-ЗНАЧНЫЙ КОД.<br>
                > <span style="color:var(--ok)">ЗЕЛЕНЫЙ</span> - ЦИФРА НА СВОЕМ МЕСТЕ. <span style="color:var(--warn)">ЖЕЛТЫЙ</span> - ЕСТЬ, НО НЕ ТАМ.
            </div>
            <div class="mm-logs" id="mmLogs">> СИСТЕМА ГОТОВА К ВВОДУ...</div>
            <div class="mm-inputs" id="mmInputs">
                <input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)">
            </div>
            <button id="mmBtn" style="background:transparent; border:1px solid var(--neon); color:var(--neon); padding:10px 20px; cursor:pointer;">ПРОВЕРИТЬ</button>
        `;
        window.moveFocus = (el) => { if (el.value.length === 1 && el.nextElementSibling) el.nextElementSibling.focus(); };

        document.getElementById('mmBtn').onclick = () => {
            const inputs = document.querySelectorAll('#mmInputs input');
            let guess = ''; inputs.forEach(i => guess += i.value);
            if (guess.length !== 5) return;

            let exact = 0, wrongPos = 0;
            let targetArr = targetCode.split(''), guessArr = guess.split('');
            for(let i=0; i<5; i++) { if (guessArr[i] === targetArr[i]) { exact++; targetArr[i] = null; guessArr[i] = null; } }
            for(let i=0; i<5; i++) { if (guessArr[i] !== null) { const idx = targetArr.indexOf(guessArr[i]); if (idx !== -1) { wrongPos++; targetArr[idx] = null; } } }

            const log = document.getElementById('mmLogs');
            log.innerHTML += `<div>> ВВОД: ${guess} | <span style="color:var(--ok)">ТОЧНО: ${exact}</span> | <span style="color:var(--warn)">НЕ ТАМ: ${wrongPos}</span></div>`;
            log.scrollTop = log.scrollHeight;

            if (exact === 5) {
                localStorage.setItem('s9_edr_gateway_passed', 'true');
                localStorage.removeItem('s9_edr_gateway_trigger');
                document.getElementById('mmBtn').disabled = true;
                content.innerHTML = `<h2 style="color: var(--ok);">ШЛЮЗ РАЗБЛОКИРОВАН</h2><p>Возврат на Карту...</p>`;
                setTimeout(() => { window.location.href = 'map.html'; }, 2000);
            } else {
                inputs.forEach(i => i.value = '');
                inputs[0].focus();
            }
        };
        setTimeout(() => document.querySelector('#mmInputs input').focus(), 100);
    }

    // --- РАБОЧИЙ РЕЖИМ (ЩИТ) ---
    function initShieldVisual(isPartial = false, moduleName = '') {
        // Генерируем HTML
        content.innerHTML = `
            <div class="main-layout">
                <!-- ЩИТ -->
                <div class="shield-wrapper">
                    <div class="shield-shape" id="shieldGrid"></div>
                </div>

                <!-- ПАНЕЛЬ СТАТИСТИКИ -->
                <div class="side-panel">
                    <div class="counters">
                        <div class="counter-box">
                            <div class="counter-label">ПРОВЕРЕНО</div>
                            <div class="counter-value" id="cnt-scanned">0</div>
                        </div>
                        <div class="counter-box">
                            <div class="counter-label">УГРОЗЫ</div>
                            <div class="counter-value" id="cnt-threats">0</div>
                        </div>
                        <div class="counter-box">
                            <div class="counter-label">УСТРАНЕНО</div>
                            <div class="counter-value" id="cnt-cleared">0</div>
                        </div>
                    </div>

                    <div class="log-container">
                        <div class="log-box" id="logBox"></div>
                    </div>
                </div>
            </div>
            ${isPartial ? `<div style="position: absolute; bottom: 10px; color: var(--warn); font-size: 10px; letter-spacing: 2px;">ПРОТОКОЛ ${moduleName}: ОЖИДАНИЕ ВТОРОГО ТРИГГЕРА</div>` : ''}
        `;

        const grid = document.getElementById('shieldGrid');
        const logBox = document.getElementById('logBox');
        
        let totalScanned = 0;
        let activeThreats = 0;
        let totalCleared = 0;

        const elScanned = document.getElementById('cnt-scanned');
        const elThreats = document.getElementById('cnt-threats');
        const elCleared = document.getElementById('cnt-cleared');

        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        const cells = [];
        const cols = 14;
        const rows = 16;

        // Создаем ячейки
        for (let i = 0; i < cols * rows; i++) {
            const cell = document.createElement('div');
            cell.className = 'shield-cell';
            grid.appendChild(cell);
            cells.push(cell);
        }

        // Функция логов
        function addLog(text, type = '') {
            const line = document.createElement('div');
            line.className = `log-line ${type}`;
            line.innerText = text;
            logBox.appendChild(line);

            if (logBox.children.length > 40) {
                logBox.removeChild(logBox.firstChild);
            }
        }

        // Заполняем лог при старте
        for(let i=0; i<25; i++) {
            addLog(isPartial ? "> EDR MONITOR: WAITING FOR SECOND TRIGGER..." : "> SYS_MONITOR: BACKGROUND PROCESS OK");
        }

        // Главный цикл сканирования
        window.edrScanInterval = setInterval(() => {
            // Сканирование
            const idx = Math.floor(Math.random() * cells.length);
            const cell = cells[idx];

            if (!cell.classList.contains('threat') && !cell.classList.contains('cleared')) {
                cell.classList.add('scanning');
                setTimeout(() => cell.classList.remove('scanning'), 100);

                totalScanned++;
                elScanned.innerText = formatNumber(totalScanned);
            }

            // Угроза
            if (Math.random() > 0.96) {
                const threatIdx = Math.floor(Math.random() * cells.length);
                const threatCell = cells[threatIdx];

                if (!threatCell.classList.contains('threat') && !threatCell.classList.contains('cleared') && !threatCell.classList.contains('scanning')) {
                    threatCell.classList.add('threat');
                    
                    activeThreats++;
                    elThreats.innerText = formatNumber(activeThreats);

                    const r = Math.floor(threatIdx / cols) + 1;
                    const c = (threatIdx % cols) + 1;

                    addLog(`> PID ${Math.floor(Math.random()*9000)+1000}: WARNING! THREAT AT [${r},${c}]`, 'warn');

                    setTimeout(() => {
                        threatCell.classList.remove('threat');
                        threatCell.classList.add('cleared');
                        
                        activeThreats--;
                        totalCleared++;
                        elThreats.innerText = formatNumber(activeThreats);
                        elCleared.innerText = formatNumber(totalCleared);
                        
                        addLog(`> PID: THREAT NEUTRALIZED. RESUMING SCAN.`, 'ok');
                        setTimeout(() => threatCell.classList.remove('cleared'), 1000);
                    }, 1500);
                }
            }
        }, 50);

        // Фоновые логи
        window.edrLogInterval = setInterval(() => {
            if (Math.random() > 0.6) {
                const messages = [
                    "> SCANNING KERNEL SPACE... 100%",
                    "> CHECKING INTEGRITY: SYS_CORE.DLL",
                    "> MEMORY BLOCK 0x4F2A: CLEAN",
                    "> NETWORK GATEWAY: PING OK",
                    "> CHECKING HASH SIGNATURES...",
                    "> ALL SYSTEMS SECURE"
                ];
                addLog(messages[Math.floor(Math.random() * messages.length)]);
            }
        }, 1000);
    }
})();
