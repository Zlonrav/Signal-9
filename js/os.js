// js/os.js
(function() {
    const CORRECT_ID = "0x7f930cb4ddb0"; 

    document.addEventListener('DOMContentLoaded', () => {
        const lockdown = document.getElementById('os-lockdown');
        const input = document.getElementById('captcha-input');
        const grid = document.getElementById('qubitGrid');
        const hint = document.getElementById('os-hint');

        // --- 1. ВЕРИФИКАЦИЯ ---
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

        if (isCaptchaPassed) {
            lockdown.classList.add('hidden');
            if (hint) hint.style.display = 'none';
            initQubits();
            
            if (typeof window.startOsModemSound === 'function' && window.audioCtx) {
                window.startOsModemSound();
            }
        } else {
            setTimeout(() => input.focus(), 100);
            
            const checkId = () => {
                let val = input.value.trim().toLowerCase();
                if (val.startsWith('0x')) val = val.substring(2);
                
                const cleanVal = val.replace(/[^a-z0-9]/g, '');
                const targetId = "7f930cb4ddb0"; 

                if (cleanVal.length === 12) {
                    if (cleanVal === targetId) {
                        localStorage.setItem('s9_os_captcha', 'true');
                        localStorage.setItem('s9_os_errors', '0'); 
                        lockdown.classList.add('hidden');
                        if (hint) hint.style.display = 'none';
                        initQubits();
                        
                        if (typeof window.startOsModemSound === 'function') {
                            window.startOsModemSound();
                        }
                        
                        if (typeof window.updateQuestion === 'function') {
                            window.currentChatStep = 0;
                            window.updateQuestion();
                        }
                    } else {
                        input.value = '';
                        input.placeholder = "ОШИБКА ДОСТУПА";
                        input.style.borderBottomColor = "#ff3333";
                        setTimeout(() => { 
                            input.placeholder = "0x..."; 
                            input.style.borderBottomColor = "var(--neon)"; 
                        }, 2000);
                    }
                }
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') checkId();
            });
            input.addEventListener('input', checkId);
        }

        // --- 2. КУБИТЫ ---
        function initQubits() {
            grid.innerHTML = '';
            
            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits'));
            
            if (!brokenList) {
                brokenList = [];
                while(brokenList.length < 7) {
                    const r = Math.floor(Math.random() * 5) + 1;
                    const c = Math.floor(Math.random() * 5) + 1;
                    const coord = `r${r}c${c}`;
                    if (!brokenList.includes(coord)) {
                        brokenList.push(coord);
                    }
                } 
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
            }

            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 5; c++) {
                    const coord = `r${r}c${c}`;
                    const qubit = document.createElement('div');
                    qubit.className = 'qubit';
                    qubit.id = `qubit_${coord}`;
                    
                    const isBroken = brokenList.includes(coord);

                    if (isBroken) {
                        qubit.classList.add('broken');
                    } else {
                        qubit.classList.add('active');
                        const randomDelay = (Math.random() * -2).toFixed(2);
                        qubit.style.setProperty('--anim-delay', `${randomDelay}s`);
                    }

                    grid.appendChild(qubit);
                }
            }
            // Даем время отрисоваться DOM перед линиями
            setTimeout(drawTraces, 100);
            setInterval(drawTraces, 6000);
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
                
                const randomDelay = (Math.random() * -2).toFixed(2);
                qubitEl.style.setProperty('--anim-delay', `${randomDelay}s`);
                
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                if (brokenList.length === 0) {
                    localStorage.setItem('s9_edr_os_trigger', 'true');
                    if (window.printToConsole) {
                        window.printToConsole(`<span class="err">[ОС] КРИТИЧЕСКИЙ СБОЙ СИНХРОНИЗАЦИИ ЯДРА. ТРЕБУЕТСЯ ПРОВЕРКА EDR.</span>`);
                    }
                    setTimeout(() => { window.location.href = 'edr.html'; }, 2000);
                }

            } else {
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
                
                if (!brokenList.includes(coord)) brokenList.push(coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
            }
        });

        // --- 4. ТРАССЫ (СТРОГО МЕЖДУ СОСЕДЯМИ) ---
        function drawTraces() {
            const tracesLayer = document.getElementById('tracesLayer');
            const container = document.querySelector('.os-container');
            if (!tracesLayer || !container) return;
            
            tracesLayer.innerHTML = ''; 

            const neighbors = [
                { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
                { dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
            ];

            let linesDrawn = 0;
            let attempts = 0;

            const containerRect = container.getBoundingClientRect();

            while (linesDrawn < 5 && attempts < 100) {
                attempts++;
                
                const r1 = Math.floor(Math.random() * 5) + 1;
                const c1 = Math.floor(Math.random() * 5) + 1;
                
                const offset = neighbors[Math.floor(Math.random() * neighbors.length)];
                const r2 = r1 + offset.dr;
                const c2 = c1 + offset.dc;

                if (r2 >= 1 && r2 <= 5 && c2 >= 1 && c2 <= 5) {
                    const el1 = document.getElementById(`qubit_r${r1}c${c1}`);
                    const el2 = document.getElementById(`qubit_r${r2}c${c2}`);

                    if (el1 && el2) {
                        const rect1 = el1.getBoundingClientRect();
                        const rect2 = el2.getBoundingClientRect();

                        // Вычисляем центры относительно контейнера
                        const x1 = rect1.left - containerRect.left + rect1.width / 2;
                        const y1 = rect1.top - containerRect.top + rect1.height / 2;
                        const x2 = rect2.left - containerRect.left + rect2.width / 2;
                        const y2 = rect2.top - containerRect.top + rect2.height / 2;

                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', x1);
                        line.setAttribute('y1', y1);
                        line.setAttribute('x2', x2);
                        line.setAttribute('y2', y2);
                        line.setAttribute('stroke', '#00f2ff'); // Яркий неон
                        line.setAttribute('stroke-width', '2');
                        line.setAttribute('stroke-dasharray', '4 8'); 
                        line.style.filter = 'drop-shadow(0 0 6px #00f2ff)';
                        line.style.animation = 'flow 20s linear infinite'; 
                        tracesLayer.appendChild(line);
                        
                        linesDrawn++;
                    }
                }
            }
        }
    });
})();
