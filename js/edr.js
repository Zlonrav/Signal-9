// js/edr.js
(function() {
    const content = document.getElementById('edrContent');
    const hint = document.getElementById('edr-hint');
    
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
        if (hint) hint.style.display = 'none';
        if (osPassed && gatewayPassed) {
            initShieldVisual(false);
        } else if (osPassed || gatewayPassed) {
            initShieldVisual(true, osPassed ? 'ОС' : 'ШЛЮЗ');
        } else {
            window.location.replace('404.html');
        }
    }

    // ==========================================
    // ЛОГИКА ПЕСОЧНИЦЫ
    // ==========================================
    function startSandbox() {
        if (hint) hint.style.display = 'block';
        let currentLevel = 1;
        let errorCount = 0;
        let correctAnswer = 0;

        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        function generateLevel(level) {
            let htmlCode = '';
            let ans = 0;
            errorCount = 0;

            if (level === 1) {
                const startX = rand(2, 5);
                const addVal = rand(2, 4);
                const multVal = rand(2, 3);
                ans = startX;
                for(let i=0; i<3; i++) { ans += addVal; ans *= multVal; }

                htmlCode = `
                    <div class="code-line"><span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span></div>
                    <div class="code-line"><span class="kw">LOOP</span> <span class="num">3</span> TIMES:</div>
                    <div class="code-line indent"><span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">+</span> <span class="num">${addVal}</span></div>
                    <div class="code-line indent"><span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">${multVal}</span></div>
                    <div class="code-line"><span class="kw">PRINT</span> <span class="var">X</span></div>
                `;
            } 
            else if (level === 2) {
                const startX = rand(4, 8);
                const addVal = rand(2, 4);
                const threshold = rand(12, 15);
                ans = startX;
                for(let i=0; i<3; i++) { ans += addVal; if (ans > threshold) ans *= 2; }

                htmlCode = `
                    <div class="code-line"><span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span></div>
                    <div class="code-line"><span class="kw">LOOP</span> <span class="num">3</span> TIMES:</div>
                    <div class="code-line indent"><span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">+</span> <span class="num">${addVal}</span></div>
                    <div class="code-line indent"><span class="kw">IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">${threshold}</span>:</div>
                    <div class="code-line indent" style="padding-left: 40px;"><span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">2</span></div>
                    <div class="code-line"><span class="kw">PRINT</span> <span class="var">X</span></div>
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
                ans = y;

                htmlCode = `
                    <div class="code-line"><span class="kw">LET</span> <span class="var">X</span> <span class="op">=</span> <span class="num">${startX}</span></div>
                    <div class="code-line"><span class="kw">LET</span> <span class="var">Y</span> <span class="op">=</span> <span class="num">${startY}</span></div>
                    <div class="code-line"><span class="kw">LOOP</span> <span class="num">3</span> TIMES:</div>
                    <div class="code-line indent"><span class="var">X</span> <span class="op">=</span> <span class="var">X</span> <span class="op">*</span> <span class="num">${multVal}</span></div>
                    <div class="code-line indent"><span class="kw">IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">10</span>:</div>
                    <div class="code-line indent" style="padding-left: 40px;"><span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">+</span> <span class="var">X</span></div>
                    <div class="code-line indent"><span class="kw">ELSE IF</span> <span class="var">X</span> <span class="op">></span> <span class="num">5</span>:</div>
                    <div class="code-line indent" style="padding-left: 40px;"><span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">*</span> <span class="num">2</span></div>
                    <div class="code-line indent"><span class="kw">ELSE</span>:</div>
                    <div class="code-line indent" style="padding-left: 40px;"><span class="var">Y</span> <span class="op">=</span> <span class="var">Y</span> <span class="op">-</span> <span class="num">1</span></div>
                    <div class="code-line"><span class="kw">PRINT</span> <span class="var">Y</span></div>
                `;
            }

            correctAnswer = ans;

            // Убрали width: 600px, сделали адаптивным под 600px рамку
            content.innerHTML = `
                <div style="width: 100%; max-width: 480px; text-align: left; box-sizing: border-box;">
                    <div style="color: var(--neon); margin-bottom: 10px; font-size: 10px; letter-spacing: 1px;">// ВЫПОЛНЕНИЕ СКРИПТА В ИЗОЛИРОВАННОЙ СРЕДЕ</div>
                    <div id="codeOutput" style="margin-bottom: 15px;"></div>
                    
                    <div style="text-align: center;">
                        <div style="margin-bottom: 8px; color: #aaa; font-size: 11px;">ЭТАП ${level} / 3 — ВВЕДИТЕ РЕЗУЛЬТАТ:</div>
                        <input type="text" id="sbAnswer" class="terminal-input" autocomplete="off" inputmode="numeric" pattern="[0-9]*">
                        <button id="sbBtn" class="mobile-btn">ВЫПОЛНИТЬ</button>
                        <div id="sbStatus" class="status-msg"></div>
                    </div>
                </div>
            `;

            const codeOutput = document.getElementById('codeOutput');
            const lines = htmlCode.trim().split('\n');
            let lineIdx = 0;
            
            function typeLine() {
                if (lineIdx < lines.length) {
                    const div = document.createElement('div');
                    div.innerHTML = lines[lineIdx].trim(); 
                    if (lines[lineIdx].includes('class="code-line indent"')) {
                        div.className = 'code-line indent';
                        if(lines[lineIdx].includes('style="padding-left: 40px;"')) div.style.paddingLeft = '40px';
                    } else {
                        div.className = 'code-line';
                    }
                    codeOutput.appendChild(div);
                    if (typeof window.playTypeSound === 'function') window.playTypeSound();
                    lineIdx++;
                    setTimeout(typeLine, 150);
                } else {
                    document.getElementById('sbAnswer').focus();
                }
            }
            typeLine();

            const input = document.getElementById('sbAnswer');
            const status = document.getElementById('sbStatus');
            const btn = document.getElementById('sbBtn');

            function checkAnswer() {
                const val = input.value.trim();
                if (!val) return;

                if (parseInt(val, 10) === correctAnswer) {
                    status.innerText = "> ЛОГИКА ПОДТВЕРЖДЕНА.";
                    status.style.color = "#00ff44";
                    input.disabled = true;
                    if(btn) btn.disabled = true;
                    if(hint) hint.style.display = 'none';
                    
                    setTimeout(() => {
                        if (currentLevel < 3) {
                            currentLevel++;
                            generateLevel(currentLevel);
                            if(hint) hint.style.display = 'block';
                        } else {
                            localStorage.setItem('s9_edr_os_passed', 'true');
                            localStorage.removeItem('s9_edr_os_trigger');
                            localStorage.setItem('s9_os_fixed', 'true');
                            localStorage.setItem('s9_os_errors', '0');
                            content.innerHTML = `<h2 style="color: #00ff44; font-family: Michroma; text-shadow: 0 0 10px #00ff44;">ЛОГИКА ВОССТАНОВЛЕНА</h2><p style="color: var(--neon);">Возврат в ОС...</p>`;
                            setTimeout(() => { window.location.href = 'os.html'; }, 2000);
                        }
                    }, 1500);
                } else {
                    errorCount++;
                    input.classList.add('shake');
                    input.value = '';
                    setTimeout(() => { input.classList.remove('shake'); }, 400);

                    if (errorCount >= 3) {
                        status.innerText = "> СБРОС ПАМЯТИ. ГЕНЕРАЦИЯ НОВОГО ЗАДАНИЯ...";
                        status.style.color = "#ff3333";
                        input.disabled = true;
                        if(btn) btn.disabled = true;
                        if(hint) hint.style.display = 'none';
                        setTimeout(() => { generateLevel(currentLevel); if(hint) hint.style.display = 'block'; }, 2000);
                    } else {
                        status.innerText = `> ОШИБКА ${errorCount}/3. ПОПРОБУЙТЕ СНОВА.`;
                        status.style.color = "#ff3333";
                    }
                }
            }

            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); } });
            if (btn) btn.addEventListener('click', checkAnswer);
        }
        generateLevel(1);
    }

    // ==========================================
    // ЛОГИКА ВЗЛОМА ШИФРА
    // ==========================================
    function startMastermind() {
        if (hint) hint.style.display = 'block';
        const targetCode = Array.from({length: 5}, () => Math.floor(Math.random() * 10)).join('');
        content.innerHTML = `
            <div style="margin-bottom: 15px; color: var(--neon); text-align:center; font-size: 12px; line-height: 1.5;">
                > ДОСТУП К ШЛЮЗУ ЗАБЛОКИРОВАН.<br>
                > ПОДБЕРИТЕ 5-ЗНАЧНЫЙ КОД.<br>
                > <span style="color:#00ff44">ЗЕЛЕНЫЙ</span> - ЦИФРА НА СВОЕМ МЕСТЕ. <span style="color:#ffaa00">ЖЕЛТЫЙ</span> - ЕСТЬ, НО НЕ ТАМ.
            </div>
            <div class="mm-logs" id="mmLogs">> СИСТЕМА ГОТОВА К ВВОДУ...</div>
            <div class="mm-inputs" id="mmInputs">
                <input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)"><input type="text" maxlength="1" oninput="moveFocus(this)">
            </div>
            <button id="mmBtn" class="mobile-btn" style="display: block;">ПРОВЕРИТЬ</button>
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
                if (hint) hint.style.display = 'none';
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
                    if (idx < 4 && inp.value.length === 1) {
                        arr[idx+1].focus();
                    } else {
                        checkCode();
                    }
                }
            });
        });

        setTimeout(() => document.querySelector('#mmInputs input').focus(), 100);
    }

    // ==========================================
    // РАБОЧИЙ РЕЖИМ (ЩИТ)
    // ==========================================
    function initShieldVisual(isPartial = false, moduleName = '') {
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

        for(let i=0; i<20; i++) addLog("> SYS_MONITOR: BACKGROUND OK");

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
