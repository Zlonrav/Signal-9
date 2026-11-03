// js/cheats.js
(function() {
    if (window.CHEATS_INITIALIZED) return;
    window.CHEATS_INITIALIZED = true;

    window.CheatManager = {
        state: 'IDLE',

        // Эта функция вызывается из terminal.js перед обычной обработкой команд
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

            // --- НОВЫЙ ЧИТ ДЛЯ АРХИВА ---
            if (cmd === 'fix_archive') {
                const words = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                const glyphsData = [];
                const now = Date.now();

                words.forEach((w, i) => {
                    localStorage.setItem('s9_glyph_' + w, 'true');
                    // Записываем в массив для отрисовки (сдвигаем время, чтобы они не были идеально одновременными)
                    glyphsData.push({ word: w, timestamp: now - (i * 1000) });
                });

                localStorage.setItem('s9_glyphs_data', JSON.stringify(glyphsData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                
                print('<span class="ok">[ЧИТ] 10 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. АРХИВ ОТКАЛИБРОВАН.</span>');
                print('<span class="sys">ПЕРЕХОД В АРХИВ ДЛЯ ПРОВЕРКИ...</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }
            // -----------------------------

            // Очистка памяти
            if (cmd === 'clear_memory') {
                print('<span class="warn">ВНИМАНИЕ: ВЕСЬ ПРОГРЕСС ИГРЫ БУДЕТ УДАЛЕН. ПОДТВЕРДИТЕ (Y/N)</span>');
                this.state = 'CONFIRM_CLEAR';
                return true; 
            }

            // Справка по читам
            if (cmd === 'cheats') {
                print('<span class="sys">[СПИСОК ЧИТОВ]</span>');
                print('> <span class="cmd-text">fix_archive</span> - Автоматически вводит 10 слов для починки Архива');
                print('> <span class="cmd-text">clear_memory</span> - Полная очистка localStorage');
                return true;
            }

            // Если команда не чит-код, возвращаем false, чтобы терминал обработал её сам
            return false; 
        }
    };
})();
