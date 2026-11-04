// js/os.js
// js/os.js
(function() {
    const CORRECT_ID = "0x7f930cb4ddb0"; 
    const BROKEN_QUBITS = [3, 7, 12, 15, 19, 22, 25]; // Теперь 7 сломанных кубитов из 25

    document.addEventListener('DOMContentLoaded', () => {
        const lockdown = document.getElementById('os-lockdown');
        const input = document.getElementById('captcha-input');
        const grid = document.getElementById('qubitGrid');

        // ... (Логика входа остается без изменений) ...

        // 2. ОТРИСОВКА КУБИТОВ (25 штук)
        function initQubits() {
            grid.innerHTML = '';
            
            for (let i = 1; i <= 25; i++) { // Цикл до 25
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

        // ... (Логика слушателя repair_qubit и checkAllFixed остается без изменений) ...

        // 3. СЛУШАЕМ КОМАНДУ ИЗ КОНСОЛИ
        window.addEventListener('repair_qubit', (e) => {
            const qubitId = e.detail; 
            const qubitNum = parseInt(qubitId, 10);
            
            if (!BROKEN_QUBITS.includes(qubitNum)) return; 

            const qubitEl = document.getElementById(`qubit_${qubitId}`);
            if (qubitEl && qubitEl.classList.contains('broken')) {
                qubitEl.classList.remove('broken');
                qubitEl.classList.add('active');
                localStorage.setItem(`s9_qubit_${qubitNum}_fixed`, 'true');
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
                if (typeof window.updateQuestion === 'function') {
                    window.currentChatStep = 0;
                    window.updateQuestion();
                }
            }
        }
    });
})();
