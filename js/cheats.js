// js/cheats.js
(function() {
    if (window.CHEATS_INITIALIZED) return;
    window.CHEATS_INITIALIZED = true;

    window.CheatManager = {
        state: 'IDLE',

        // Эта функция вызывается из terminal.js перед обычной обработкой команд
        handleCommand: function(cmd, print) {
            // Обработка подтверждения Y/N
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

            // Сама команда
            if (cmd === 'clear_memory') {
                print('<span class="warn">ВНИМАНИЕ: ВЕСЬ ПРОГРЕСС ИГРЫ БУДЕТ УДАЛЕН. ПОДТВЕРДИТЕ (Y/N)</span>');
                this.state = 'CONFIRM_CLEAR';
                return true; 
            }

            // Справка по читам
            if (cmd === 'cheats') {
                print('<span class="sys">[СПИСОК ЧИТОВ]</span>');
                print('> <span class="cmd-text">clear_memory</span> - Полная очистка localStorage');
                return true;
            }

            // Если команда не чит-код, возвращаем false, чтобы терминал обработал её сам
            return false; 
        }
    };
})();
