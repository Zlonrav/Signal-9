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
            setInterval(drawTraces, 2000);
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
        function drawTraces() {
            const tracesLayer = document.getElementById('tracesLayer');
            if (!tracesLayer) return;
            tracesLayer.innerHTML = ''; 

            const qubits = document.querySelectorAll('.qubit');
            if (qubits.length === 0) return;

            const coords = [];
            qubits.forEach(q => {
                const rect = q.getBoundingClientRect();
                // Координаты для SVG (относительно окна)
                coords.push({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            });

            for (let i = 0; i < 5; i++) {
                const p1 = coords[Math.floor(Math.random() * coords.length)];
                const p2 = coords[Math.floor(Math.random() * coords.length)];

                if (p1 && p2 && p1 !== p2) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.x);
                    line.setAttribute('y1', p1.y);
                    line.setAttribute('x2', p2.x);
                    line.setAttribute('y2', p2.y);
                    line.setAttribute('stroke', 'rgba(0, 242, 255, 0.3)'); 
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '5 10'); 
                    
                    line.style.animation = 'flow 3s linear infinite';
                    
                    tracesLayer.appendChild(line);
                }
            }
        }
    });
})();
