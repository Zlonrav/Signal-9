// js/os.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('qubitGrid');
        const logBox = document.getElementById('logBox');
        const desktop = document.getElementById('os-desktop');

        // --- ФУНКЦИИ ДЛЯ МОНИТОРИНГА И ЛОГОВ ---
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
            const valDisk = document.getElementById('valDisk');
            const barCpu = document.getElementById('barCpu');
            const barRam = document.getElementById('barRam');
            const barDisk = document.getElementById('barDisk');
            
            if (!valCpu) return; 

            const cpu = Math.floor(Math.random() * 40) + 30;
            const ram = Math.floor(Math.random() * 50) + 20;
            const disk = Math.floor(Math.random() * 10) + 80;

            valCpu.innerText = cpu + '%';
            valRam.innerText = ram + '%';
            valDisk.innerText = disk + '%';

            barCpu.style.width = cpu + '%';
            barRam.style.width = ram + '%';
            barDisk.style.width = disk + '%';

            if (cpu > 60) { barCpu.classList.add('warn'); } else { barCpu.classList.remove('warn'); }
            if (ram > 60) { barRam.classList.add('warn'); } else { barRam.classList.remove('warn'); }
            if (disk > 85) { barDisk.classList.add('warn'); } else { barDisk.classList.remove('warn'); }
        }

        // --- 1. ВЕРИФИКАЦИЯ ---
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

        if (isCaptchaPassed) {
            desktop.style.display = 'flex';
            initQubits();
            if (typeof window.startOsModemSound === 'function' && window.audioCtx) {
                window.startOsModemSound();
            }
        } else {
            // Консоль уже загружена через loader.js, принудительно открываем и блокируем
            setTimeout(() => {
                if (window.printToConsole) {
                    window.printToConsole(`<span class="warn">[СИСТЕМА] НЕОБХОДИМА ВЕРИФИКАЦИЯ ЦЕЛОСТНОСТИ.</span>`);
                    window.printToConsole(`ОБНАРУЖЕН ВНЕШНИЙ ЗАПРОС. ДЛЯ ДОСТУПА К ЯДРУ ВВЕДИТЕ ВАШ УНИКАЛЬНЫЙ ИДЕНТИФИКАТОР.`);
                    window.printToConsole(`ПОЛУЧИТЕ ЕГО В КОНСОЛИ КОМАНДОЙ <span class="cmd-text">self --id</span>.`);
                    window.printToConsole(`ВВЕДИТЕ: <span class="cmd-text">login --id <ВАШ_ID></span>`);
                    window.dispatchEvent(new Event('lockConsole'));
                }
            }, 500);

            // Слушаем событие успешной верификации из terminal.js
            window.addEventListener('os_id_verified', () => {
                desktop.style.display = 'flex';
                initQubits();
                addLog("> SYS: ID VERIFIED. ACCESS GRANTED.", "ok");
                if (typeof window.startOsModemSound === 'function') window.startOsModemSound();
                if (typeof window.updateQuestion === 'function') {
                    window.currentChatStep = 0;
                    window.updateQuestion();
                }
            });
        }

        // --- 2. ИНИЦИАЛИЗАЦИЯ КУБИТОВ ---
        function initQubits() {
            if (!grid) return;
            grid.innerHTML = '';
            
            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits'));
            
            if (!brokenList) {
                brokenList = [];
                while(brokenList.length < 7) {
                    const r = Math.floor(Math.random() * 5) + 1;
                    const c = Math.floor(Math.random() * 5) + 1;
                    const coord = `r${r}c${c}`;
                    if (!brokenList.includes(coord)) brokenList.push(coord);
                } 
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
            }

            let html = '';
            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 5; c++) {
                    const coord = `r${r}c${c}`;
                    const isBroken = brokenList.includes(coord);
                    
                    if (isBroken) {
                        html += `<div class="qubit broken" id="qubit_${coord}"></div>`;
                    } else {
                        const delay = (Math.random() * -1.5).toFixed(2);
                        html += `<div class="qubit active" id="qubit_${coord}" style="--delay: ${delay}s"></div>`;
                    }
                }
            }
            grid.innerHTML = html;

            // Заполняем лог, чтобы не было пустоты сверху
            for(let i=0; i<20; i++) {
                addLog("> SYS_MONITOR: BACKGROUND PROCESS OK");
            }

            // Запускаем фоновые процессы (если еще не запущены)
            if (!window.osMonitorInterval) {
                window.osMonitorInterval = setInterval(updateStats, 1500);
                updateStats(); 
                
                const logMessages = [
                    { text: "> CALIBRATING SECTOR 07...", type: "" },
                    { text: "> CHECKING MEMORY BLOCKS...", type: "" },
                    { text: "> SCANNING FOR ANOMALIES...", type: "" },
                    { text: "> DATA STREAM RECEIVED", type: "ok" },
                    { text: "> KERNEL INTEGRITY OK", type: "ok" },
                    { text: "> WARNING: MINOR GLITCH DETECTED", type: "err" }
                ];

                window.osLogInterval = setInterval(() => {
                    if (Math.random() > 0.5) {
                        const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
                        addLog(msg.text, msg.type);
                    }
                }, 1000); // тут 
            }
        }

        // --- 3. РЕМОНТ ---
        window.addEventListener('repair_qubit', (e) => {
            const coord = e.detail; 
            const qubitEl = document.getElementById(`qubit_${coord}`);
            if (!qubitEl) return;

            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');

            if (qubitEl.classList.contains('broken')) {
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                
                const randomDelay = (Math.random() * -1.5).toFixed(2);
                qubitEl.style.setProperty('--delay', `${randomDelay}s`);
                
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                addLog(`> SYS: QUBIT ${coord.toUpperCase()} RESTORED.`, "ok");

                if (brokenList.length === 0) {
                    localStorage.setItem('s9_edr_os_trigger', 'true');
                    addLog(`> FATAL: CRITICAL SYNC FAILURE. EDR REQUIRED.`, "err");
                    if (window.printToConsole) {
                        window.printToConsole(`<span class="err">[ОС] КРИТИЧЕСКИЙ СБОЙ СИНХРОНИЗАЦИИ ЯДРА. ТРЕБУЕТСЯ ПРОВЕРКА EDR.</span>`);
                    }
                    setTimeout(() => { window.location.href = 'edr.html'; }, 2000);
                }
            } else {
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
                qubitEl.style.removeProperty('--delay');
                
                if (!brokenList.includes(coord)) brokenList.push(coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                addLog(`> ERR: QUBIT ${coord.toUpperCase()} CORRUPTED.`, "err");
            }
        });
    });
})();