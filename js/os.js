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
                        const symbolSpan = document.createElement('span');
                        symbolSpan.className = 'qubit-symbol';
                        symbolSpan.innerText = '0'; // Начальный символ
                        qubit.appendChild(symbolSpan);
                    }

                    grid.appendChild(qubit);
                }
            }

            checkAllFixed();
            animateSymbols(); 
            setInterval(drawTraces, 5000); // Трассы раз в 5 секунд
        }

        // --- 3. АНИМАЦИЯ СИМВОЛОВ ---
        function animateSymbols() {
            const symbols = ['0', '1', '#', '@', '%', '&', '*', '+', '='];
            
            setInterval(() => {
                const activeQubits = document.querySelectorAll('.qubit.active');
                activeQubits.forEach(q => {
                    const symbolSpan = q.querySelector('.qubit-symbol');
                    if (symbolSpan) {
                        symbolSpan.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                    }
                });
            }, 2000); // Меняем символ каждые 2 секунды
        }

        // --- 4. РЕМОНТ ---
        window.addEventListener('repair_qubit', (e) => {
            const coord = e.detail; 
            const qubitEl = document.getElementById(`qubit_${coord}`);
            if (!qubitEl) return;

            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');
            let errors = parseInt(localStorage.getItem('s9_os_errors') || '0', 10);

            if (qubitEl.classList.contains('broken')) {
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                
                if (!qubitEl.querySelector('.qubit-symbol')) {
                    const symbolSpan = document.createElement('span');
                    symbolSpan.className = 'qubit-symbol';
                    symbolSpan.innerText = '0';
                    qubitEl.appendChild(symbolSpan);
                }
                
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                checkAllFixed();
            } else {
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
                const symbol = qubitEl.querySelector('.qubit-symbol');
                if (symbol) symbol.remove();
                
                if (!brokenList.includes(coord)) brokenList.push(coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                errors++;
                localStorage.setItem('s9_os_errors', errors.toString());

                if (errors >= 3) {
                    localStorage.removeItem('s9_os_captcha');
                    localStorage.setItem('s9_os_errors', '0');
                    if (typeof window.print === 'function') {
                        window.print(`<span class="err">[ОС] ОБНАРУЖЕНА ДЕСТРУКТИВНАЯ ДЕЯТЕЛЬНОСТЬ. ДОСТУП ЗАБЛОКИРОВАН.</span>`);
                    }
                    setTimeout(() => { location.reload(); }, 1500);
                }
            }
        });

        function checkAllFixed() {
            const brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');
            if (brokenList.length === 0) {
                localStorage.setItem('s9_os_fixed', 'true');
                if (typeof window.updateQuestion === 'function') {
                    window.currentChatStep = 0;
                    window.updateQuestion();
                }
            }
        }

        // --- 5. ТРАССЫ (СТРОГО МЕЖДУ СОСЕДЯМИ) ---
        function drawTraces() {
            const tracesLayer = document.getElementById('tracesLayer');
            const container = document.querySelector('.os-container');
            if (!tracesLayer || !container) return;
            
            tracesLayer.innerHTML = ''; 

            const STEP = 85; // 70px (кубит) + 15px (gap)
            const OFFSET = 35; // Половина кубита
            const containerRect = container.getBoundingClientRect();

            // Смещения для соседей (dx, dy)
            const neighborOffsets = [
                { dr: 0, dc: 1 },   // Вправо
                { dr: 0, dc: -1 },  // Влево
                { dr: 1, dc: 0 },   // Вниз
                { dr: -1, dc: 0 },  // Вверх
                { dr: 1, dc: 1 },   // Вниз-вправо
                { dr: 1, dc: -1 },  // Вниз-влево
                { dr: -1, dc: 1 },  // Вверх-вправо
                { dr: -1, dc: -1 }  // Вверх-влево
            ];

            // Делаем 6 попыток нарисовать трассу
            for (let i = 0; i < 6; i++) {
                // Случайный кубит
                const r1 = Math.floor(Math.random() * 5) + 1; // 1..5
                const c1 = Math.floor(Math.random() * 5) + 1; // 1..5
                
                // Случайный сосед
                const offset = neighborOffsets[Math.floor(Math.random() * neighborOffsets.length)];
                const r2 = r1 + offset.dr;
                const c2 = c1 + offset.dc;

                // Проверяем, что сосед не выходит за границы сетки 5x5
                if (r2 >= 1 && r2 <= 5 && c2 >= 1 && c2 <= 5) {
                    // Вычисляем координаты центров относительно контейнера
                    const x1 = (c1 - 1) * STEP + OFFSET;
                    const y1 = (r1 - 1) * STEP + OFFSET;
                    const x2 = (c2 - 1) * STEP + OFFSET;
                    const y2 = (r2 - 1) * STEP + OFFSET;

                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', 'rgba(0, 242, 255, 0.4)'); 
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '4 8'); 
                    line.style.animation = 'flow 24s linear infinite'; 
                    tracesLayer.appendChild(line);
                }
            }
        }
    });
})();
