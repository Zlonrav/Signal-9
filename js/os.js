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
                        localStorage.setItem('s9_os_errors', '0'); // СБРАСЫВАЕМ СЧЕТЧИК ОШИБОК ПРИ УСПЕШНОМ ВХОДЕ
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
        }

        // --- 3. ЛОГИКА РЕМОНТА ---
        window.addEventListener('repair_qubit', (e) => {
            const coord = e.detail; 
            const qubitEl = document.getElementById(`qubit_${coord}`);
            if (!qubitEl) return;

            let brokenList = JSON.parse(localStorage.getItem('s9_os_broken_qubits') || '[]');
            let errors = parseInt(localStorage.getItem('s9_os_errors') || '0', 10);

            if (qubitEl.classList.contains('broken')) {
                // Если кубит был сломан — чиним
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                brokenList = brokenList.filter(item => item !== coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                checkAllFixed();
            } else {
                // Если кубит был рабочим — ломаем и увеличиваем счетчик
                qubitEl.classList.remove('active');
                qubitEl.classList.add('broken');
                if (!brokenList.includes(coord)) brokenList.push(coord);
                localStorage.setItem('s9_os_broken_qubits', JSON.stringify(brokenList));
                
                errors++;
                localStorage.setItem('s9_os_errors', errors.toString());

                if (errors >= 3) {
                    // ДЕСТРУКТИВНАЯ ДЕЯТЕЛЬНОСТЬ
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
    });
})();
