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

            // --- НОВЫЙ ЧИТ ДЛЯ СБРОСА АРХИВА ---
            if (cmd === 'reset_archive') {
                localStorage.removeItem('s9_archive_calibrated');
                localStorage.removeItem('s9_archive_fixed');
                localStorage.removeItem('s9_archive_baseline_count');
                localStorage.removeItem('s9_phrases_data');
                
                // Удаляем флаги введенных 10 слов
                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                words.forEach(w => localStorage.removeItem('s9_glyph_' + w));

                print('<span class="ok">[ЧИТ] ЗАДАНИЕ С АРХИВОМ СБРОШЕНО. ВСЕ ФЛАГИ И ФРАЗЫ УДАЛЕНЫ.</span>');
                print('<span class="sys">ПЕРЕХОД В АРХИВ ДЛЯ ПРОВЕРКИ...</span>');
                setTimeout(() => { location.reload(); }, 1500);
                return true;
            }
            // -----------------------------------

            // --- ЧИТ: ТОЛЬКО КАЛИБРОВКА АРХИВА (БЕЗ ЗАВЕРШЕНИЯ ТЕСТА) ---
            if (cmd === 'calibrate_archive') {
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
                
                // ВАЖНО: Время калибровки на 2 секунды ПОЗЖЕ, 
                // чтобы эталонные фразы гарантированно считались "старыми"
                localStorage.setItem('s9_archive_calibration_time', (now + 2000).toString());
                
                print('<span class="ok">[ЧИТ] 10 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. АРХИВ ОТКАЛИБРОВАН, НО ТЕСТ НЕ ЗАВЕРШЕН.</span>');
                print('<span class="sys">ПЕРЕХОД В АРХИВ ДЛЯ ОЖИДАНИЯ ДВУХ ЦИКЛОВ...</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }

            if (cmd === 'fix_os') {
                localStorage.setItem('s9_os_captcha', 'true');
                [3, 7, 12, 15, 19].forEach(num => {
                    localStorage.setItem(`s9_qubit_${num}_fixed`, 'true');
                });
                localStorage.setItem('s9_os_fixed', 'true');

                print('<span class="ok">[ЧИТ] ЗАЩИТА ПЕРИМЕТРА ОБОЙДЕНА. ВСЕ КУБИТЫ ПЕРЕКАЛИБРОВАНЫ.</span>');
                setTimeout(() => { window.location.href = 'os.html'; }, 1500);
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
