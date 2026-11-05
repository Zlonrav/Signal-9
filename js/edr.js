// js/edr.js
(function() {
    const content = document.getElementById('edrContent');
    
    // Флаги прохождения
    const osPassed = localStorage.getItem('s9_edr_os_passed') === 'true';
    const gatewayPassed = localStorage.getItem('s9_edr_gateway_passed') === 'true';
    
    // Триггеры (разрешения на вход)
    const osTrigger = localStorage.getItem('s9_edr_os_trigger') === 'true';
    const gatewayTrigger = localStorage.getItem('s9_edr_gateway_trigger') === 'true';

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
            showFullWorkingMode();
        } else if (osPassed || gatewayPassed) {
            showPartialWorkingMode(osPassed ? 'ОС' : 'ШЛЮЗ');
        } else {
            // Если нет ни триггеров, ни пройденных квестов — 404
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
                        localStorage.removeItem('s9_edr_os_trigger'); // Сжигаем триггер
                        localStorage.setItem('s9_os_fixed', 'true'); // <--- ТЕПЕРЬ ОС СЧИТАЕТСЯ ПОЧИНЕННОЙ
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
                localStorage.removeItem('s9_edr_gateway_trigger'); // Сжигаем триггер
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

    // --- РАБОЧИЙ РЕЖИМ ---
    function showFullWorkingMode() {
        content.innerHTML = `
            <div class="radar-container"><div class="radar-sweep"></div></div>
            <h2 style="color: var(--ok); text-shadow: 0 0 10px var(--ok); margin: 0 0 10px 0;">СИСТЕМА АКТИВНА</h2>
            <p style="color: var(--neon); opacity: 0.7; margin-bottom: 15px;">УГРОЗ НЕ ОБНАРУЖЕНО. МОНИТОРИНГ В ФОНОВОМ РЕЖИМЕ.</p>
            <div class="logs-container" id="edrLogs"></div>
        `;
        const logs = document.getElementById('edrLogs');
        const messages = ["> SCANNING MEMORY: 0 THREATS", "> NETWORK GATEWAY: SECURED", "> KERNEL INTEGRITY: 100%", "> EDR MONITOR: ALL SYSTEMS CLEAN"];
        let i = 0;
        setInterval(() => { logs.innerHTML += `${messages[i % messages.length]}<br>`; logs.scrollTop = logs.scrollHeight; i++; }, 1500);
    }

    function showPartialWorkingMode(moduleName) {
        content.innerHTML = `
            <div class="radar-container"><div class="radar-sweep"></div></div>
            <h2 style="color: var(--ok); text-shadow: 0 0 10px var(--ok); margin: 0 0 10px 0;">ПРОТОКОЛ ${moduleName} АКТИВЕН</h2>
            <p style="color: var(--neon); opacity: 0.7; margin-bottom: 15px;">ОЖИДАНИЕ ВТОРОГО ТРИГГЕРА ДЛЯ ПОЛНОЙ АКТИВАЦИИ.</p>
            <div class="logs-container" id="edrLogs"></div>
        `;
        const logs = document.getElementById('edrLogs');
        const messages = ["> EDR MONITOR: WAITING FOR GATEWAY...", "> KERNEL INTEGRITY: 100%", "> SCANNING MEMORY: 0 THREATS"];
        let i = 0;
        setInterval(() => { logs.innerHTML += `${messages[i % messages.length]}<br>`; logs.scrollTop = logs.scrollHeight; i++; }, 1500);
    }
})();
