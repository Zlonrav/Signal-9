// js/cheats.js
(function() {
    if (window.CHEATS_INITIALIZED) return;
    window.CHEATS_INITIALIZED = true;

    window.CheatManager = {
        state: 'IDLE',

        handleCommand: function(cmd, print) {
            if (this.state === 'CONFIRM_CLEAR') {
                if (cmd === 'y' || cmd === 'yes') {
                    localStorage.clear();
                    print('<span class="ok">[ЧИТ] ПАМЯТЬ УСПЕШНО ОЧИЩЕНА. ПЕРЕЗАГРУЗКА...</span>');
                    setTimeout(() => location.reload(), 1500);
                    this.state = 'IDLE';
                    return true;
                } else if (cmd === 'n' || cmd === 'no') {
                    print('<span class="err">[ЧИТ] ОПЕРАЦИЯ ОТМЕНЕНА.</span>');
                    this.state = 'IDLE';
                    return true;
                } else {
                    print('<span class="warn">ВВЕДИТЕ Y ИЛИ N.</span>');
                    return true;
                }
            }

            // --- ЧИТ ДЛЯ ЯЗЫКА ---
            if (cmd === 'fix_lang') {
                localStorage.setItem('s9_lang_human', 'true');
                print('<span class="ok">[ЧИТ] ЯЗЫКОВОЙ МОДУЛЬ ПРИНУДИТЕЛЬНО ЗАГРУЖЕН. ПЕРЕЗАГРУЗКА...</span>');
                setTimeout(() => location.reload(), 1000);
                return true;
            }

            // --- ЧИТ ДЛЯ АРХИВА (ПОЧИНКА) ---
            if (cmd === 'fix_archive') {
                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                const phrase1 = words.slice(0, 5);
                const phrase2 = words.slice(5, 10);
                const now = Date.now();

                const phrasesData = [
                    { text: phrase1.join(' '), words: phrase1, timestamp: now - 1000 },
                    { text: phrase2.join(' '), words: phrase2, timestamp: now }
                ];

                localStorage.setItem('s9_phrases_data', JSON.stringify(phrasesData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                localStorage.setItem('s9_archive_fixed', 'true');
                localStorage.setItem('s9_archive_baseline_count', '2');
                
                print('<span class="ok">[ЧИТ] 10 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. АРХИВ ПОЧИНЕН.</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }

            // --- ЧИТ ДЛЯ СБРОСА АРХИВА ---
            if (cmd === 'reset_archive') {
                localStorage.removeItem('s9_archive_calibrated');
                localStorage.removeItem('s9_archive_fixed');
                localStorage.removeItem('s9_archive_baseline_count');
                localStorage.removeItem('s9_phrases_data');
                localStorage.removeItem('s9_archive_calibration_time');
                
                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                words.forEach(w => localStorage.removeItem('s9_glyph_' + w));

                print('<span class="ok">[ЧИТ] ЗАДАНИЕ С АРХИВОМ СБРОШЕНО. ВСЕ ФЛАГИ И ФРАЗЫ УДАЛЕНЫ.</span>');
                print('<span class="sys">ПЕРЕЗАГРУЗКА...</span>');
                setTimeout(() => { location.reload(); }, 1500);
                return true;
            }

            // --- ЧИТ: ТОЛЬКО КАЛИБРОВКА АРХИВА (БЕЗ ЗАВЕРШЕНИЯ ТЕСТА) ---
            // --- ЧИТ: ТОЛЬКО КАЛИБРОВКА АРХИВА (БЕЗ ЗАВЕРШЕНИЯ ТЕСТА) ---
            if (cmd === 'calibrate_archive') {
                // Полностью очищаем память от старых фраз
                localStorage.removeItem('s9_phrases_data');
                localStorage.removeItem('s9_archive_fixed');

                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                const phrase1 = words.slice(0, 5);
                const phrase2 = words.slice(5, 10);
                const now = Date.now();

                const phrasesData = [
                    { text: phrase1.join(' '), words: phrase1, timestamp: now - 1000 },
                    { text: phrase2.join(' '), words: phrase2, timestamp: now }
                ];

                localStorage.setItem('s9_phrases_data', JSON.stringify(phrasesData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                localStorage.setItem('s9_archive_baseline_count', '2');
                
                print('<span class="ok">[ЧИТ] 10 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. В ПАМЯТИ РОВНО 2 ФРАЗЫ.</span>');
                print('<span class="sys">ПЕРЕХОД В АРХИВ ДЛЯ ОЖИДАНИЯ ДВУХ НОВЫХ ФРАЗ...</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }
            // --- ЧИТ ДЛЯ СБРОСА ОС ---
            if (cmd === 'reset_os') {
                localStorage.removeItem('s9_os_captcha');
                localStorage.removeItem('s9_os_fixed');
                localStorage.removeItem('s9_os_broken_qubits');
                
                // Удаляем флаги починки каждого кубита
                for (let i = 1; i <= 25; i++) {
                    localStorage.removeItem(`s9_qubit_${i}_fixed`);
                    localStorage.removeItem(`s9_qubit_r1c1_fixed`); // На случай старых форматов
                }
                
                print('<span class="ok">[ЧИТ] ПРОХОЖДЕНИЕ ОС СБРОШЕНО. ВСЕ КУБИТЫ И ID УДАЛЕНЫ.</span>');
                print('<span class="sys">ПЕРЕЗАГРУЗКА...</span>');
                setTimeout(() => { location.reload(); }, 1500);
                return true;
            }
            // --- ЧИТ ДЛЯ ОС ---
            if (cmd === 'fix_os') {
                localStorage.setItem('s9_os_captcha', 'true');
                localStorage.setItem('s9_os_broken_qubits', '[]'); 
                localStorage.setItem('s9_os_errors', '0');
                
                // Имитируем сбой последнего кубита
                localStorage.setItem('s9_edr_os_trigger', 'true');

                print('<span class="err">[ОС] КРИТИЧЕСКИЙ СБОЙ СИНХРОНИЗАЦИИ ЯДРА. ТРЕБУЕТСЯ ПРОВЕРКА EDR.</span>');
                setTimeout(() => { window.location.href = 'edr.html'; }, 2000);
                return true; 
            }

            // Очистка памяти
            if (cmd === 'clear_memory') {
                print('<span class="warn">ВНИМАНИЕ: ВЕСЬ ПРОГРЕСС ИГРЫ БУДЕТ УДАЛЕН. ПОДТВЕРДИТЕ (Y/N)</span>');
                this.state = 'CONFIRM_CLEAR';
                return true; 
            }

            return false; 
        }
    };
})();
