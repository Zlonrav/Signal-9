// js/os.js
(function() {
    const CAPTCHA_ANSWER = "69 78 84 69 82"; // ENTER
    const BROKEN_QUBITS = [3, 7, 12, 15, 19]; // Индексы сбойных кубитов (от 1 до 20)

    document.addEventListener('DOMContentLoaded', () => {
        const lockdown = document.getElementById('os-lockdown');
        const input = document.getElementById('captcha-input');
        const grid = document.getElementById('qubitGrid');

        // 1. ЛОГИКА КАПЧИ
        const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

        if (isCaptchaPassed) {
            lockdown.classList.add('hidden');
            initQubits(); // Если капча уже пройдена, сразу показываем кубиты
        } else {
            setTimeout(() => input.focus(), 100);
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = input.value.trim().replace(/\s+/g, ' ');
                    if (val === CAPTCHA_ANSWER) {
                        localStorage.setItem('s9_os_captcha', 'true');
                        lockdown.classList.add('hidden');
                        initQubits();
                        if (typeof window.updateQuestion === 'function') window.dispatchEvent(new Event('storage'));
                    } else {
                        input.value = '';
                        input.placeholder = "ОШИБКА. ПОПРОБУЙТЕ СНОВА";
                        input.style.borderBottomColor = "#ff3333";
                        setTimeout(() => { input.placeholder = "..."; input.style.borderBottomColor = "var(--neon)"; }, 2000);
                    }
                }
            });
        }

        // 2. ЛОГИКА КУБИТОВ
        function initQubits() {
            grid.innerHTML = '';
            
            for (let i = 1; i <= 20; i++) {
                const qubit = document.createElement('div');
                qubit.className = 'qubit';
                qubit.id = `qubit_${String(i).padStart(2, '0')}`;
                
                const isBroken = BROKEN_QUBITS.includes(i);
                const isFixed = localStorage.getItem(`s9_qubit_${i}_fixed`) === 'true';

                if (isBroken && !isFixed) {
                    qubit.classList.add('broken');
                } else {
                    qubit.classList.add('active');
                }

                grid.appendChild(qubit);
            }

            checkAllFixed();
        }

        // 3. СЛУШАЕМ КОМАНДУ ИЗ КОНСОЛИ
        window.addEventListener('repair_qubit', (e) => {
            const qubitId = e.detail; // например, "03"
            const qubitNum = parseInt(qubitId, 10);
            
            if (!BROKEN_QUBITS.includes(qubitNum)) {
                // Если кубит не был сломан
                return; 
            }

            const qubitEl = document.getElementById(`qubit_${qubitId}`);
            if (qubitEl && qubitEl.classList.contains('broken')) {
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                localStorage.setItem(`s9_qubit_${qubitNum}_fixed`, 'true');
                
                // Проверяем, все ли починили
                checkAllFixed();
            }
        });

        function checkAllFixed() {
            let allFixed = true;
            BROKEN_QUBITS.forEach(num => {
                if (localStorage.getItem(`s9_qubit_${num}_fixed`) !== 'true') {
                    allFixed = false;
                }
            });

            if (allFixed) {
                localStorage.setItem('s9_os_fixed', 'true');
                // Здесь можно добавить визуальный эффект успеха
            }
        }
    });
})();
