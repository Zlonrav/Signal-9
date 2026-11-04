// js/cheats.js
(function() {
    if (window.CHEATS_INITIALIZED) return;
    window.CHEATS_INITIALIZED = true;

    window.CheatManager = {
        state: 'IDLE',

        handleCommand: function(cmd, print) {
            // Обработка подтверждения Y/N для очистки
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

            // --- ЧИТ ДЛЯ АРХИВА ---
            if (cmd === 'fix_archive') {
                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                const phrasesData = [];
                const now = Date.now();

                words.forEach((w, i) => {
                    localStorage.setItem('s9_glyph_' + w, 'true');
                    phrasesData.push({ word: w, timestamp: now - (i * 1000) });
                });

                localStorage.setItem('s9_phrases_data', JSON.stringify(phrasesData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                
                print('<span class="ok">[ЧИТ] 10 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. АРХИВ ОТКАЛИБРОВАН.</span>');
                print('<span class="sys">ПЕРЕХОД В АРХИВ ДЛЯ ПРОВЕРКИ...</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }

            // --- НОВЫЙ ЧИТ ДЛЯ ОС ---
            if (cmd === 'fix_os') {
                // 1. Обходим защиту (вводим ID)
                localStorage.setItem('s9_os_captcha', 'true');
                
                // 2. Чиним все 5 кубитов
                [3, 7, 12, 15, 19].forEach(num => {
                    localStorage.setItem(`s9_qubit_${num}_fixed`, 'true');
                });
                
                // 3. Ставим флаг, что ОС починена
                localStorage.setItem('s9_os_fixed', 'true');

                print('<span class="ok">[ЧИТ] ЗАЩИТА ПЕРИМЕТРА ОБОЙДЕНА. ВСЕ КУБИТЫ ПЕРЕКАЛИБРОВАНЫ.</span>');
                print('<span class="sys">ПЕРЕХОД В ОС ДЛЯ ПРОВЕРКИ...</span>');
                setTimeout(() => { window.location.href = 'os.html'; }, 1500);
                return true; 
            }
            // -----------------------

            // Очистка памяти
            if (cmd === 'clear_memory') {
                print('<span class="warn">ВНИМАНИЕ: ВЕСЬ ПРОГРЕСС ИГРЫ БУДЕТ УДАЛЕН. ПОДТВЕРДИТЕ (Y/N)</span>');
                this.state = 'CONFIRM_CLEAR';
                return true; 
            }

            // Справка по читам
            if (cmd === 'cheats') {
                print('<span class="sys">[СПИСОК ЧИТОВ]</span>');
                print('> <span class="cmd-text">fix_archive</span> - Автоматически вводит 10 слов для Архива');
                print('> <span class="cmd-text">fix_os</span> - Обходит защиту ОС и чинит все кубиты');
                print('> <span class="cmd-text">clear_memory</span> - Полная очистка localStorage');
                return true;
            }

            return false; 
        }
    };
})();
