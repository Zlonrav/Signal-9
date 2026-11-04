// js/os.js
(function() {
    const CORRECT_ID = "0x7f930cb4ddb0"; 

    document.addEventListener('DOMContentLoaded', () => {
        const lockdown = document.getElementById('os-lockdown');
        const input = document.getElementById('captcha-input');
        const grid = document.getElementById('qubitGrid');

        // --- 1. ЛОГИКА ВЕРИФИКАЦИИ ---
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

        if (isCaptchaPassed) {
            lockdown.classList.add('hidden');
            initQubits();
        } else {
            setTimeout(() => input.focus(), 100);
            
            input.addEventListener('input', (e) => {
                let val = input.value.trim().toLowerCase();
                
                if (val.startsWith('0x')) {
                    val = val.substring(2);
                }
                
                const cleanVal = val.replace(/[^a-z0-9]/g, '');
                const targetId = "7f930cb4ddb0"; 

                if (cleanVal.length === 12) {
                    if (cleanVal === targetId) {
                        localStorage.setItem('s9_os_captcha', 'true');
                        localStorage.setItem('s9_os_errors', '0'); 
                        lockdown.classList.add('hidden');
                        initQubits();
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

        // --- 2. ГЕНЕРАЦИЯ И ОТРИСОВКА КУБИТОВ ---
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
                    }

                    grid.appendChild(qubit);
                }
            }

            checkAllFixed();
            // Запускаем рисование трасс после создания кубитов
            setTimeout(() => {
                drawTraces();
                setInterval(drawTraces, 2000);
            }, 100);
        }

        // --- 3. ЛОГИКА РЕМОНТА ---
        window.addEventListener('repair_qubit', (e) => {
            const coord = e.detail; 
            const qubitEl = document.getElementById(`qubit_${coord}`);
            if (!qubitEl) return;

            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');
            let errors = parseInt(localStorage.getItem('s9_os_errors') || '0', 10);

            if (qubitEl.classList.contains('broken')) {
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                checkAllFixed();
            } else {
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
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

        // --- 4. ЛОГИКА СЛУЧАЙНЫХ ТРАСС ---
// ... (верхняя часть файла без изменений до функции initQubits) ...

        // --- 2. ГЕНЕРАЦИЯ И ОТРИСОВКА КУБИТОВ ---
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
                        // Добавляем контейнер для символа
                        const symbolSpan = document.createElement('span');
                        symbolSpan.className = 'qubit-symbol';
                        qubit.appendChild(symbolSpan);
                    }

                    grid.appendChild(qubit);
                }
            }

            checkAllFixed();
            startSymbolAnimation(); // Запускаем анимацию символов
            setInterval(drawTraces, 8000); // Трассы раз в 8 секунд (в 4 раза медленнее)
        }

        // --- ЛОГИКА АНИМАЦИИ СИМВОЛОВ ---
        function startSymbolAnimation() {
            const symbols = ['0', '1', '#', '@', '%', '&', '*', '+'];
            const activeQubits = document.querySelectorAll('.qubit.active');
            
            setInterval(() => {
                activeQubits.forEach(q => {
                    const symbolSpan = q.querySelector('.qubit-symbol');
                    if (symbolSpan) {
                        // Если символ уже есть, плавно скрываем, затем меняем
                        if (symbolSpan.innerText !== '') {
                            symbolSpan.style.opacity = '0';
                            setTimeout(() => {
                                symbolSpan.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                                symbolSpan.style.opacity = '1'; // Плавно появляем
                            }, 1000); 
                        } else {
                            symbolSpan.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                            symbolSpan.style.opacity = '1';
                        }
                    }
                });
            }, 4000); // Смена символа каждые 4 секунды (4 показа)
        }

        // --- 4. ЛОГИКА СЛУЧАЙНЫХ ТРАСС (только между соседними) ---
        function drawTraces() {
            const tracesLayer = document.getElementById('tracesLayer');
            const container = document.querySelector('.os-container');
            if (!tracesLayer || !container) return;
            
            tracesLayer.innerHTML = ''; 

            const qubits = document.querySelectorAll('.qubit');
            if (qubits.length === 0) return;

            const containerRect = container.getBoundingClientRect();
            const coords = [];
            
            qubits.forEach(q => {
                const rect = q.getBoundingClientRect();
                coords.push({ 
                    x: rect.left + rect.width / 2 - containerRect.left, 
                    y: rect.top + rect.height / 2 - containerRect.top 
                });
            });

            // Ищем соседние кубиты (расстояние меньше 100 пикселей)
            for (let i = 0; i < coords.length; i++) {
                for (let j = i + 1; j < coords.length; j++) {
                    const dx = Math.abs(coords[i].x - coords[j].x);
                    const dy = Math.abs(coords[i].y - coords[j].y);
                    
                    // Проверяем расстояние (горизонталь, вертикаль или диагональ)
                    // Шаг сетки = 70 (кубит) + 15 (gap) = 85.
                    // Диагональ = 85 * sqrt(2) ≈ 120.
                    const isNeighbor = (dx < 10 && dy < 90) || (dy < 10 && dx < 90) || (Math.abs(dx - dy) < 10 && dx < 125);

                    if (isNeighbor) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', coords[i].x);
                        line.setAttribute('y1', coords[i].y);
                        line.setAttribute('x2', coords[j].x);
                        line.setAttribute('y2', coords[j].y);
                        line.setAttribute('stroke', 'rgba(0, 242, 255, 0.4)'); 
                        line.setAttribute('stroke-width', '2');
                        line.setAttribute('stroke-dasharray', '5 10'); 
                        
                        line.style.animation = 'flow 12s linear infinite'; // Замедлили
                        
                        tracesLayer.appendChild(line);
                    }
                }
            }
        }
// ... (нижняя часть файла с checkAllFixed без изменений) ...
    });
})();
