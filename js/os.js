// js/os.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('qubitGrid');
        const logBox = document.getElementById('logBox');
        const desktop = document.getElementById('os-desktop');
        const tabsContainer = document.getElementById('layerTabs');
        const gridWrapper = document.getElementById('gridWrapper');

        let activeLayer = 1;
        let qubits = {};
        let isAnimating = false;
		
        // --- ЛОГИ ---
        function addLog(text, type = '') {
            if (!logBox) return;
            const line = document.createElement('div');
            line.className = `log-line ${type}`;
            line.innerText = text;
            logBox.appendChild(line);
            if (logBox.children.length > 24) logBox.removeChild(logBox.firstChild);
            logBox.scrollTop = logBox.scrollHeight;
        }

        function updateStats() {
            const valCpu = document.getElementById('valCpu');
            const valRam = document.getElementById('valRam');
            const barCpu = document.getElementById('barCpu');
            const barRam = document.getElementById('barRam');
            if (!valCpu) return; 

            const cpu = Math.floor(Math.random() * 40) + 30;
            const ram = Math.floor(Math.random() * 50) + 20;

            valCpu.innerText = cpu + '%';
            valRam.innerText = ram + '%';
            barCpu.style.width = cpu + '%';
            barRam.style.width = ram + '%';

            if (cpu > 60) barCpu.classList.add('warn'); else barCpu.classList.remove('warn');
            if (ram > 60) barRam.classList.add('warn'); else barRam.classList.remove('warn');
        }

        // --- 1. ВЕРИФИКАЦИЯ ---
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';
        const shield = document.getElementById('os-shield-overlay');

        if (isCaptchaPassed) {
            if (shield) shield.style.display = 'none';
            desktop.style.display = 'flex';
            initGame();
        } else {
            if (shield) shield.style.display = 'flex';
            desktop.style.display = 'none';
        }

        // --- 2. ЛОГИКА 5x5x5 ---
        function initGame() {
            if (!grid) return;
            
            let savedData = localStorage.getItem('s9_os_qubits_data');
            if (savedData) {
                qubits = JSON.parse(savedData);
            } else {
                generateRandomQubits();
            }

            renderTabs();
            renderGrid();
            startMonitorLoop();
        }

        function generateRandomQubits() {
            qubits = {};
            for (let l = 1; l <= 5; l++) {
                qubits[l] = {};
                for (let r = 1; r <= 5; r++) {
                    qubits[l][r] = {};
                    for (let c = 1; c <= 5; c++) qubits[l][r][c] = { state: 'active' };
                }
            }

            const pool = [];
            for (let l = 1; l <= 5; l++)
                for (let r = 1; r <= 5; r++)
                    for (let c = 1; c <= 5; c++) pool.push({ l, r, c });
                       // Правильный shuffle (Fisher-Yates)
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }

            // 4 сломанных
            for (let i = 0; i < 4; i++) {
                const p = pool.pop();
                qubits[p.l][p.r][p.c].state = 'broken';
            }
            
            // 2 пары запутанных
            for (let i = 0; i < 2; i++) {
                const p1 = pool.pop(), p2 = pool.pop();
                const type = i === 0 ? 'A' : 'B';
                qubits[p1.l][p1.r][p1.c] = { state: 'entangled', pair: type, linkedTo: `L${p2.l}R${p2.r}C${p2.c}` };
                qubits[p2.l][p2.r][p2.c] = { state: 'entangled', pair: type, linkedTo: `L${p1.l}R${p1.r}C${p1.c}` };
            }
            
            // 2 желтых
            for (let i = 0; i < 2; i++) {
                const p = pool.pop();
                qubits[p.l][p.r][p.c] = { state: 'warning' };
            }

            // 25 серых
            for (let i = 0; i < 25; i++) {
                const p = pool.pop();
                qubits[p.l][p.r][p.c].state = 'locked';
            }

            saveState();
        }

        function saveState() {
            localStorage.setItem('s9_os_qubits_data', JSON.stringify(qubits));
        }

        // --- 3. ОТРИСОВКА ---
        function renderTabs() {
            tabsContainer.innerHTML = '';
            for (let l = 1; l <= 5; l++) {
                const tab = document.createElement('div');
                tab.className = 'layer-tab';
                if (l === activeLayer) tab.classList.add('active');

                let dotClass = 'dot-clean';
                let hasBroken = false, hasWarn = false, hasEnt = false;

                for (let r = 1; r <= 5; r++) for (let c = 1; c <= 5; c++) {
                    const s = qubits[l][r][c].state;
                    if (s === 'broken') hasBroken = true;
                    else if (s === 'warning') hasWarn = true;
                    else if (s === 'entangled') hasEnt = true;
                }
                
                if (hasBroken) dotClass = 'dot-err';
                else if (hasWarn) dotClass = 'dot-warn';
                else if (hasEnt) dotClass = 'dot-ent';

                tab.innerHTML = `L${l}<div class="status-dot ${dotClass}"></div>`;
                tab.onclick = () => switchLayer(l);
                tabsContainer.appendChild(tab);
            }
        }

        function renderGrid() {
            grid.innerHTML = '';
            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 5; c++) {
                    const q = qubits[activeLayer][r][c];
                    const el = document.createElement('div');
                    el.className = 'qubit';

                    if (q.state === 'broken') el.classList.add('q-broken');
                    else if (q.state === 'warning') el.classList.add('q-warn');
                    else if (q.state === 'entangled') el.classList.add('q-ent');
                    else if (q.state === 'locked') {
                        el.style.opacity = '0.2'; el.style.borderColor = '#555'; el.style.boxShadow = 'none';
                    }

                    if (q.state === 'entangled') {
                        const dot = document.createElement('div');
                        dot.className = `pair-dot pair-${q.pair}`;
                        el.appendChild(dot);
                    }
                    grid.appendChild(el);
                }
            }
        }

        // --- 4. АНИМАЦИЯ ПЕРЕХОДА ---
        function switchLayer(target) {
            if (isAnimating || target === activeLayer) return;

            isAnimating = true;
            const isForward = target > activeLayer;

            gridWrapper.className = `grid-wrapper ${isForward ? 'anim-out-past' : 'anim-out-future'}`;

            setTimeout(() => {
                activeLayer = target;
                renderGrid();
                const valLayer = document.getElementById('valLayer');
                if (valLayer) valLayer.innerText = `${String(activeLayer).padStart(2,'0')} / 05`;
                renderTabs();

                gridWrapper.className = `grid-wrapper ${isForward ? 'anim-in-future' : 'anim-in-past'}`;

                setTimeout(() => {
                    gridWrapper.className = 'grid-wrapper';
                    isAnimating = false;
                }, 600);
            }, 600);
        }

        // --- 5. ПРОВЕРКИ И ПОБЕДА ---
        function checkAllFixed() {
            let totalProblems = 0;
            for (let l = 1; l <= 5; l++)
                for (let r = 1; r <= 5; r++)
                    for (let c = 1; c <= 5; c++) {
                        const s = qubits[l][r][c].state;
                        if (s === 'broken' || s === 'warning' || s === 'entangled') totalProblems++;
                    }

            if (totalProblems === 0) {
                // Отключаем повторные вызовы
                if (window.osWinTriggered) return;
                window.osWinTriggered = true;
                
                addLog(`> FATAL: CRITICAL SYNC FAILURE. EDR REQUIRED.`, "err");
                if (window.printToConsole) {
                    window.printToConsole(`<span class="err">[ОС] КРИТИЧЕСКИЙ СБОЙ СИНХРОНИЗАЦИИ ЯДРА. ТРЕБУЕТСЯ ПРОВЕРКА EDR.</span>`);
                }
                
                // Пауза 2 секунды перед EDR
                setTimeout(() => { 
                    localStorage.setItem('s9_edr_os_trigger', 'true');
                    window.location.href = 'edr.html'; 
                }, 2000);
            }
        }

        // --- 6. КОМАНДЫ ИЗ КОНСОЛИ ---
        window.processOsCommand = function(args) {
            // args - массив строк, например ['--reset', 'qubit', 'l1r1c1']
            
            const action = args[0];
            const isPair = args.length === 4;

            if (action === '--reset' && args[1] === 'qubit') {
                if (args.length !== 3) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ. ПРИМЕР: os --reset qubit L1R1C1</span>`); return; }
                
                const m = args[2].match(/^l(\d)r(\d)c(\d)$/i);
                if (!m) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ.</span>`); return; }

                const l = +m[1], r = +m[2], c = +m[3];
                const q = qubits[l]?.[r]?.[c];
                if (!q) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЕ КООРДИНАТЫ.</span>`); return; }

                if (q.state === 'entangled') {
                    window.printToConsole(`<span class="err">ОШИБКА: КВАНТОВАЯ СВЯЗЬ. ВВЕДИТЕ: os --entangle LxRxCx LxRxCx</span>`); return;
                }
                if (q.state === 'warning') {
                    window.printToConsole(`<span class="err">ОШИБКА: ДЕКОГЕРЕНЦИЯ. ВВЕДИТЕ: os --warn qubit LxRxCx</span>`); return;
                }
                if (q.state === 'active' || q.state === 'locked') {
                    window.printToConsole(`<span class="err">КУБИТ УЖЕ В НОРМЕ.</span>`); return;
                }

                q.state = 'active';
                saveState();
                if (activeLayer === l) renderGrid();
                renderTabs();
                addLog(`> SYS: QUBIT L${l}R${r}C${c} RESTORED.`, "ok");
                window.printToConsole(`<span class="ok">[УСПЕХ] КУБИТ L${l}R${r}C${c} ВОССТАНОВЛЕН.</span>`);
                checkAllFixed();
            } 
            
            else if (action === '--entangle') {
                if (args.length !== 3) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ. ПРИМЕР: os --entangle L1R1C1 L2R2C2</span>`); return; }
                
                const m1 = args[1].match(/^l(\d)r(\d)c(\d)$/i);
                const m2 = args[2].match(/^l(\d)r(\d)c(\d)$/i);
                if (!m1 || !m2) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ.</span>`); return; }

                const [_, l1, r1, c1] = m1;
                const [__, l2, r2, c2] = m2;
                const q1 = qubits[+l1]?.[+r1]?.[+c1];
                const q2 = qubits[+l2]?.[+r2]?.[+c2];

                if (!q1 || !q2 || q1.state !== 'entangled' || q2.state !== 'entangled' || q1.pair !== q2.pair) {
                    window.printToConsole(`<span class="err">ОШИБКА: ЭТИ КУБИТЫ НЕ СВЯЗАНЫ.</span>`); return;
                }

                q1.state = 'active'; q2.state = 'active';
                saveState();
                if (activeLayer === +l1 || activeLayer === +l2) renderGrid();
                renderTabs();
                addLog(`> SYS: QUANTUM PAIR [${q1.pair}] COLLAPSED.`, "ok");
                window.printToConsole(`<span class="ok">[УСПЕХ] СВЯЗЬ РАЗОРВАНА. ОБА КУБИТА В НОРМЕ.</span>`);
                checkAllFixed();
            } 
            
            else if (action === '--warn' && args[1] === 'qubit') {
                if (args.length !== 3) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ. ПРИМЕР: os --warn qubit L1R1C1</span>`); return; }
                
                const m = args[2].match(/^l(\d)r(\d)c(\d)$/i);
                if (!m) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ.</span>`); return; }

                const l = +m[1], r = +m[2], c = +m[3];
                const q = qubits[l]?.[r]?.[c];
                if (!q) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЕ КООРДИНАТЫ.</span>`); return; }

                if (q.state !== 'warning') {
                    window.printToConsole(`<span class="err">ОШИБКА: КУБИТ НЕ В СОСТОЯНИИ ПРЕДУПРЕЖДЕНИЯ.</span>`); return;
                }

                q.state = 'active';
                saveState();

                if (activeLayer === l) renderGrid();
                renderTabs();
                addLog(`> SYS: QUBIT L${l}R${r}C${c} STABILIZED.`, "ok");
                window.printToConsole(`<span class="ok">[УСПЕХ] КУБИТ L${l}R${r}C${c} СТАБИЛИЗИРОВАН.</span>`);
                checkAllFixed();
            }
            
            else if (action === '--move') {
                if (args.length !== 3) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ. ПРИМЕР: os --move L1R1C1 L5R5C5</span>`); return; }
                
                const m1 = args[1].match(/^l(\d)r(\d)c(\d)$/i);
                const m2 = args[2].match(/^l(\d)r(\d)c(\d)$/i);
                if (!m1 || !m2) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЙ ФОРМАТ.</span>`); return; }

                const [_, l1, r1, c1] = m1;
                const [__, l2, r2, c2] = m2;
                const q1 = qubits[+l1]?.[+r1]?.[+c1];
                const q2 = qubits[+l2]?.[+r2]?.[+c2];

                if (!q1 || !q2) { window.printToConsole(`<span class="err">ОШИБКА: НЕВЕРНЫЕ КООРДИНАТЫ.</span>`); return; }

                // Разрешено двигать только active и locked
                const validStates = ['active', 'locked'];
                if (!validStates.includes(q1.state) || !validStates.includes(q2.state)) {
                    window.printToConsole(`<span class="err">ОШИБКА: НЕЛЬЗЯ ПЕРЕМЕЩАТЬ ПОВРЕЖДЕННЫЙ КУБИТ.</span>`); return;
                }

                // Свап состояний
                const tmp = { ...q1 };
                Object.assign(q1, q2);
                Object.assign(q2, tmp);
                
                saveState();
                if (activeLayer === +l1 || activeLayer === +l2) renderGrid();
                renderTabs();
                window.printToConsole(`<span class="ok">[УСПЕХ] КУБИТЫ ПЕРЕМЕЩЕНЫ.</span>`);
            }
            else {
                window.printToConsole(`<span class="err">ОШИБКА: НЕИЗВЕСТНАЯ КОМАНДА.</span>`);
            }
        };

        // --- 7. МОНИТОРИНГ ---
        function startMonitorLoop() {
            for(let i=0; i<20; i++) addLog("> SYS_MONITOR: BACKGROUND PROCESS OK");
            
            if (!window.osMonitorInterval) {
                window.osMonitorInterval = setInterval(updateStats, 1500);
                updateStats(); 
                
                const logMessages = [
                    { text: "> CALIBRATING SECTOR 07...", type: "" },
                    { text: "> CHECKING MEMORY BLOCKS...", type: "" },
                    { text: "> SCANNING FOR ANOMALIES...", type: "" },
                    { text: "> DATA STREAM RECEIVED", type: "ok" },
                    { text: "> KERNEL INTEGRITY OK", type: "ok" }
                ];

                window.osLogInterval = setInterval(() => {
                    if (Math.random() > 0.5) {
                        const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
                        addLog(msg.text, msg.type);
                    }
                }, 2000);
            }
        }
    });
})();