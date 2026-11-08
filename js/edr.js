// js/edr.js
(function() {
    const content = document.getElementById('edrContent');
    const terminalWrapper = document.querySelector('.terminal-wrapper'); // Наш контейнер-рамка
    
    const osPassed = localStorage.getItem('s9_edr_os_passed') === 'true';
    const gatewayPassed = localStorage.getItem('s9_edr_gateway_passed') === 'true';
    const osTrigger = localStorage.getItem('s9_edr_os_trigger') === 'true';
    const gatewayTrigger = localStorage.getItem('s9_edr_gateway_trigger') === 'true';

    if (window.edrScanInterval) clearInterval(window.edrScanInterval);
    if (window.edrLogInterval) clearInterval(window.edrLogInterval);

    if (osTrigger) {
        startSandbox();
    } 
    else if (gatewayTrigger) {
        startMastermind();
    } 
    else {
        if (osPassed && gatewayPassed) {
            initShieldVisual(false);
        } else if (osPassed || gatewayPassed) {
            initShieldVisual(true, osPassed ? 'ОС' : 'ШЛЮЗ');
        } else {
            window.location.replace('404.html');
        }
    }

    // ==========================================
    // ЛОГИКА ПЕСОЧНИЦЫ (ЧЕРЕЗ КОНСОЛЬ)
    // ==========================================
    function startSandbox() {
        // ПОЛНОСТЬЮ СКРЫВАЕМ РАМКУ И КОНТЕНТ, ЧТОБЫ НЕ МЕШАЛИ КОНСОЛИ
        if (terminalWrapper) terminalWrapper.style.display = 'none';
        if (content) content.style.display = 'none';

        let currentLevel = 1;
        let errorCount = 0;
        let correctAnswer = 0;

        // Блокируем консоль и открываем её
        setTimeout(() => {
            if (window.printToConsole) {
                window.printToConsole(`<span class="warn">[EDR] ЗАПУЩЕНА ПЕСОЧНИЦА. ВСЕ ОТВЕТЫ ВВОДИТЕ В КОНСОЛИ.</span>`);
                window.dispatchEvent(new Event('lockConsole'));
                generateLevel(1);
            }
        }, 500);

        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        function generateLevel(level) {
            errorCount = 0;
            let codeHtml = '';
            
            if (level === 1) {
                const startX = rand(2, 5);
                const addVal = rand(2, 4);
                const multVal = rand(2, 3);
                let ans = startX;
                for(let i=0; i<3; i++) { ans += addVal; ans *= multVal; }
                correctAnswer = ans;

                codeHtml = `
                    <div class="console-code-block">
                        <span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span><br>
                        <span class="kw">LOOP</span> <span class="num">3</span> TIMES:<br>
                        &nbsp;&nbsp;<span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">+</span> <span class="num">${addVal}</span><br>
                        &nbsp;&nbsp;<span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">${multVal}</span><br>
                        <span class="kw">PRINT</span> <span class="var">X</span>
                    </div>
                `;
            } 
            else if (level === 2) {
                const startX = rand(4, 8);
                const addVal = rand(2, 4);
                const threshold = rand(12, 15);
                let ans = startX;
                for(let i=0; i<3; i++) { ans += addVal; if (ans > threshold) ans *= 2; }
                correctAnswer = ans;

                codeHtml = `
                    <div class="console-code-block">
                        <span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span><br>
                        <span class="kw">LOOP</span> <span class="num">3</span> TIMES:<br>
                        &nbsp;&nbsp;<span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">+</span> <span class="num">${addVal}</span><br>
                        &nbsp;&nbsp;<span class="kw">IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">${threshold}</span>:<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">2</span><br>
                        <span class="kw">PRINT</span> <span class="var">X</span>
                    </div>
                `;
            } 
            else if (level === 3) {
                const startX = rand(2, 4);
                const startY = rand(5, 10);
                const multVal = rand(2, 3);
                let x = startX, y = startY;
                for(let i=0; i<3; i++) {
                    x *= multVal;
                    if (x > 10) y += x;
                    else if (x > 5) y *= 2;
                    else y -= 1;
                }
                correctAnswer = y;

                codeHtml = `
                    <div class="console-code-block">
                        <span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span><br>
                        <span class="kw">LET</span> <span class="var">Y</span> <span class="op">=</span> <span class="num">${startY}</span><br>
                        <span class="kw">LOOP</span> <span class="num">3</span> TIMES:<br>
                        &nbsp;&nbsp;<span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">${multVal}</span><br>
                        &nbsp;&nbsp;<span class="kw">IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">10</span>:<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">+</span> <span class="var">X</span><br>
                        &nbsp;&nbsp;<span class="kw">ELSE IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">5</span>:<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">*</span> <span class="num">2</span><br>
                        &nbsp;&nbsp;<span class="kw">ELSE</span>:<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">-</span> <span class="num">1</span><br>
                        <span class="kw">PRINT</span> <span class="var">Y</span>
                    </div>
                `;
            }

            // Выводим в консоль
            if (window.printToConsole) {
                window.printToConsole(`<span class="topic-header">[EDR] ЭТАП ${level} / 3</span>`);
                window.printToConsole(codeHtml);
                window.printToConsole(`ВВЕДИТЕ РЕЗУЛЬТАТ: <span class="cmd-text">edr --answer <ЧИСЛО></span>`);
            }
        }

        // Экспортируем функцию для консоли
        window.checkEdrAnswer = function(val) {
            const num = parseInt(val, 10);
            
            if (num === correctAnswer) {
                if (window.printToConsole) window.printToConsole(`<span class="ok">> ЛОГИКА ПОДТВЕРЖДЕНА.</span>`);
                
                if (currentLevel < 3) {
                    currentLevel++;
                    setTimeout(() => generateLevel(currentLevel), 1000);
                } else {
                    localStorage.setItem('s9_edr_os_passed', 'true');
                    localStorage.removeItem('s9_edr_os_trigger');
                    localStorage.setItem('s9_os_fixed', 'true');
                    localStorage.setItem('s9_os_errors', '0');
                    
                    if (window.printToConsole) window.printToConsole(`<span class="ok">> ВСЕ ТЕСТЫ ПРОЙДЕНЫ. ВОЗВРАТ В ОС...</span>`);
                    window.dispatchEvent(new Event('unlockConsole'));
                    setTimeout(() => { window.location.href = 'os.html'; }, 2000);
                }
            } else {
                errorCount++;
                if (window.printToConsole) window.printToConsole(`<span class="err">> ОШИБКА ${errorCount}/3.</span>`);

                if (errorCount >= 3) {
                    if (window.printToConsole) window.printToConsole(`<span class="warn">> СБРОС ПАМЯТИ. ГЕНЕРАЦИЯ НОВОГО ЗАДАНИЯ...</span>`);
                    setTimeout(() => generateLevel(currentLevel), 1500);
                }
            }
        };
    }

    // ==========================================
    // ЛОГИКА ВЗЛОМА ШИФРА (Возвращаем рамку)
    // ==========================================
    function startMastermind() {
        if (terminalWrapper) terminalWrapper.style.display = 'flex';
        if (content) content.style.display = 'flex';

        const targetCode = Array.from({length: 5}, () => Math.floor(Math.random() * 10)).join('');
        content.innerHTML = `
            <div style="margin-bottom: 15px; color: var(--neon); text-align:center; font-size: 12px; line-height: 1.5;">
                > ДОСТУП К ШЛЮЗУ ЗАБЛОКИРОВАН.<br>
                > ПОДБЕРИТЕ 5-ЗНАЧНЫЙ КОД.<br>
            </div>
            <div class="mm-logs" id="mmLogs" style="width: 100%; max-width: 320px; height: 120px; overflow-y: auto; border: 1px solid rgba(0,242,255,0.2); padding: 10px; font-size: 11px; margin-bottom: 15px; text-align: left; font-family: monospace; background: rgba(0,0,0,0.5);">> СИСТЕМА ГОТОВА К ВВОДУ...</div>
            <div class="mm-inputs" id="mmInputs" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 15px;">
                <input type="text" maxlength="1" oninput="moveFocus(this)" style="width: 35px; height: 45px; background: transparent; border: 1px solid var(--neon); color: var(--neon); font-size: 20px; text-align: center; font-family: monospace; outline: none;"><input type="text" maxlength="1" oninput="moveFocus(this)" style="width: 35px; height: 45px; background: transparent; border: 1px solid var(--neon); color: var(--neon); font-size: 20px; text-align: center; font-family: monospace; outline: none;"><input type="text" maxlength="1" oninput="moveFocus(this)" style="width: 35px; height: 45px; background: transparent; border: 1px solid var(--neon); color: var(--neon); font-size: 20px; text-align: center; font-family: monospace; outline: none;"><input type="text" maxlength="1" oninput="moveFocus(this)" style="width: 35px; height: 45px; background: transparent; border: 1px solid var(--neon); color: var(--neon); font-size: 20px; text-align: center; font-family: monospace; outline: none;"><input type="text" maxlength="1" oninput="moveFocus(this)" style="width: 35px; height: 45px; background: transparent; border: 1px solid var(--neon); color: var(--neon); font-size: 20px; text-align: center; font-family: monospace; outline: none;">
            </div>
            <button id="mmBtn" class="mobile-btn" style="display: block; background: transparent; border: 1px solid var(--neon); color: var(--neon); padding: 10px 20px; font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer;">ПРОВЕРИТЬ</button>
        `;
        window.moveFocus = (el) => { if (el.value.length === 1 && el.nextElementSibling) el.nextElementSibling.focus(); };

        const checkCode = () => {
            const inputs = document.querySelectorAll('#mmInputs input');
            let guess = ''; inputs.forEach(i => guess += i.value);
            if (guess.length !== 5) return;

            let exact = 0, wrongPos = 0;
            let targetArr = targetCode.split(''), guessArr = guess.split('');
            for(let i=0; i<5; i++) { if (guessArr[i] === targetArr[i]) { exact++; targetArr[i] = null; guessArr[i] = null; } }
            for(let i=0; i<5; i++) { if (guessArr[i] !== null) { const idx = targetArr.indexOf(guessArr[i]); if (idx !== -1) { wrongPos++; targetArr[idx] = null; } } }

            const log = document.getElementById('mmLogs');
            log.innerHTML += `<div>> ВВОД: ${guess} | <span style="color:#00ff44">ТОЧНО: ${exact}</span> | <span style="color:#ffaa00">НЕ ТАМ: ${wrongPos}</span></div>`;
            log.scrollTop = log.scrollHeight;

            if (exact === 5) {
                localStorage.setItem('s9_edr_gateway_passed', 'true');
                localStorage.removeItem('s9_edr_gateway_trigger');
                content.innerHTML = `<h2 style="color: #00ff44;">ШЛЮЗ РАЗБЛОКИРОВАН</h2><p>Возврат на Карту...</p>`;
                setTimeout(() => { window.location.href = 'map.html'; }, 2000);
            } else {
                inputs.forEach(i => i.value = '');
                inputs[0].focus();
            }
        };

        document.getElementById('mmBtn').onclick = checkCode;
        document.querySelectorAll('#mmInputs input').forEach((inp, idx, arr) => {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (idx < 4 && inp.value.length === 1) arr[idx+1].focus(); else checkCode();
                }
            });
        });

        setTimeout(() => document.querySelector('#mmInputs input').focus(), 100);
    }

    // ==========================================
    // РАБОЧИЙ РЕЖИМ (ЩИТ) - Возвращаем рамку
    // ==========================================
    function initShieldVisual(isPartial = false, moduleName = '') {
        if (terminalWrapper) terminalWrapper.style.display = 'flex';
        if (content) content.style.display = 'flex';

        content.innerHTML = `
            <div class="main-layout">
                <div class="shield-wrapper">
                    <div class="shield-shape" id="shieldGrid"></div>
                </div>
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
        `;

        const grid = document.getElementById('shieldGrid');
        const logBox = document.getElementById('logBox');
        
        let totalScanned = 0, activeThreats = 0, totalCleared = 0;
        const elScanned = document.getElementById('cnt-scanned');
        const elThreats = document.getElementById('cnt-threats');
        const elCleared = document.getElementById('cnt-cleared');

        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        const cells = [];
        const cols = 14, rows = 16;

        for (let i = 0; i < cols * rows; i++) {
            const cell = document.createElement('div');
            cell.className = 'shield-cell';
            grid.appendChild(cell);
            cells.push(cell);
        }

        function addLog(text, type = '') {
            const line = document.createElement('div');
            line.className = `log-line ${type}`;
            line.innerText = text;
            logBox.appendChild(line);
            if (logBox.children.length > 35) logBox.removeChild(logBox.firstChild);
        }

        for(let i=0; i<25; i++) addLog("> SYS_MONITOR: BACKGROUND OK");

        window.edrScanInterval = setInterval(() => {
            const idx = Math.floor(Math.random() * cells.length);
            const cell = cells[idx];

            if (!cell.classList.contains('threat') && !cell.classList.contains('cleared')) {
                cell.classList.add('scanning');
                setTimeout(() => cell.classList.remove('scanning'), 100);
                totalScanned++;
                elScanned.innerText = formatNumber(totalScanned);
            }

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
                        addLog(`> PID: THREAT NEUTRALIZED.`, 'ok');
                        setTimeout(() => threatCell.classList.remove('cleared'), 1000);
                    }, 1500);
                }
            }
        }, 50);

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