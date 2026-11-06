// js/os.js
(function() {
    const CORRECT_ID = "0x7f930cb4ddb0"; 

    document.addEventListener('DOMContentLoaded', () => {
        const lockdown = document.getElementById('os-lockdown');
        const input = document.getElementById('captcha-input');
        const grid = document.getElementById('qubitGrid');

        // --- 1. ВЕРИФИКАЦИЯ ---
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

        if (isCaptchaPassed) {
            lockdown.classList.add('hidden');
            initQubits();
            
            if (typeof window.startOsModemSound === 'function' && window.audioCtx) {
                window.startOsModemSound();
            }
        } else {
            setTimeout(() => input.focus(), 100);
            
            input.addEventListener('input', (e) => {
                let val = input.value.trim().toLowerCase();
                if (val.startsWith('0x')) val = val.substring(2);
                
                const cleanVal = val.replace(/[^a-z0-9]/g, '');
                const targetId = "7f930cb4ddb0"; 

                if (cleanVal.length === 12) {
                    if (cleanVal === targetId) {
                        localStorage.setItem('s9_os_captcha', 'true');
                        localStorage.setItem('s9_os_errors', '0'); 
                        lockdown.classList.add('hidden');
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
            });
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
                        
                        // ДОБАВЛЯЕМ ЗАДЕРЖКУ
                        const randomDelay = (Math.random() * -2).toFixed(2);
                        qubit.style.setProperty('--anim-delay', `${randomDelay}s`);
                    }

                    grid.appendChild(qubit);
                }
            }

            setInterval(drawTraces, 6000); // Трассы раз в 6 секунд
        }

        // --- 3. РЕМОНТ ---
        window.addEventListener('repair_qubit', (e) => {
            const coord = e.detail; 
            const qubitEl = document.getElementById(`qubit_${coord}`);
            if (!qubitEl) return;

            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');

            if (qubitEl.classList.contains('broken')) {
                // Если чиним сломанный
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                
                const randomDelay = (Math.random() * -2).toFixed(2);
                qubitEl.style.setProperty('--anim-delay', `${randomDelay}s`);
                
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                // ПРОВЕРКА: Если починили ПОСЛЕДНИЙ кубит (список стал пустым)
                if (brokenList.length === 0) {
                    localStorage.setItem('s9_edr_os_trigger', 'true');
                    if (window.printToConsole) {
                        window.printToConsole(`<span class="err">[ОС] КРИТИЧЕСКИЙ СБОЙ СИНХРОНИЗАЦИИ ЯДРА. ТРЕБУЕТСЯ ПРОВЕРКА EDR.</span>`);
                    }
                    setTimeout(() => { window.location.href = 'edr.html'; }, 2000);
                }

            } else {
                // Если ломаем рабочий
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
                
                if (!brokenList.includes(coord)) brokenList.push(coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                // Логику 3-х ошибок убрали. Игрок сам увидит, что сломал лишнее.
            }
        });

        // --- 4. ТРАССЫ (СТРОГО 5 ШТУК И ТОЛЬКО МЕЖДУ СОСЕДЯМИ) ---
        function drawTraces() {
            const tracesLayer = document.getElementById('tracesLayer');
            if (!tracesLayer) return;
            
            tracesLayer.innerHTML = ''; 

            const neighborOffsets = [
                { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
                { dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
            ];

            let linesDrawn = 0;
            let attempts = 0; // Защита от бесконечного цикла

            while (linesDrawn < 5 && attempts < 100) {
                attempts++;
                
                const r1 = Math.floor(Math.random() * 5) + 1;
                const c1 = Math.floor(Math.random() * 5) + 1;
                
                const offset = neighborOffsets[Math.floor(Math.random() * neighborOffsets.length)];
                const r2 = r1 + offset.dr;
                const c2 = c1 + offset.dc;

                if (r2 >= 1 && r2 <= 5 && c2 >= 1 && c2 <= 5) {
                    const STEP = 85; 
                    const OFFSET = 35; 
                    const x1 = (c1 - 1) * STEP + OFFSET;
                    const y1 = (r1 - 1) * STEP + OFFSET;
                    const x2 = (c2 - 1) * STEP + OFFSET;
                    const y2 = (r2 - 1) * STEP + OFFSET;

                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', 'rgba(0, 242, 255, 0.3)'); 
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '4 8'); 
                    line.style.animation = 'flow 24s linear infinite'; 
                    tracesLayer.appendChild(line);
                    
                    linesDrawn++; // Увеличиваем счетчик только после успешной отрисовки
                }
            }
        }
    });
})();
