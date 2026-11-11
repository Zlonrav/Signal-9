// js/cheats.js
(function() {
    if (window.CHEATS_INITIALIZED) return;
    window.CHEATS_INITIALIZED = true;

    window.copyLastSave = function() {
        if (!window._lastSaveCode) return;
        navigator.clipboard.writeText(window._lastSaveCode).then(() => {
            const btn = document.getElementById('copy-save-btn');
            if (btn) {
                btn.innerText = '✅ СКОПИРОВАНО';
                btn.style.color = '#00ff44';
                btn.style.borderColor = '#00ff44';
                setTimeout(() => {
                    btn.innerText = '📋 КОПИРОВАТЬ';
                    btn.style.color = '#00f2ff';
                    btn.style.borderColor = '#00f2ff';
                }, 2000);
            }
        });
    };

    window.CheatManager = {
        state: 'IDLE',

        handleCommand: function(cmd, print) {
            // --- СОХРАНЕНИЕ ПРОГРЕССА (В BASE64 С ДАТОЙ) ---
            if (cmd.toLowerCase() === 'save') {
                const saveData = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('s9_')) {
                        saveData[key] = localStorage.getItem(key);
                    }
                }
                const jsonStr = JSON.stringify(saveData);
                const base64Str = btoa(unescape(encodeURIComponent(jsonStr))); 
                
                // Генерация даты
                const now = new Date();
                const dateStr = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
                
                // Сохраняем оригинальный код (с настоящими комментариями) для буфера обмена
                window._lastSaveCode = `<!-- ${dateStr} -->\n${base64Str}\n<!-- /${dateStr} -->`;

                // А на экран выводим с экранированием (чтобы браузер не скрыл комментарии)
                const displayCode = `&lt;!-- ${dateStr} --&gt;<br>${base64Str}<br>&lt;!-- /${dateStr} --&gt;`;

                print('<span class="ok">[СИСТЕМА] ПРОГРЕСС СОХРАНЕН.</span>');
                print(`
                    <div style="margin-top: 10px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 4px; padding: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #888; font-size: 11px;">КОД ДЛЯ СОХРАНЕНИЯ:</span>
                            <button id="copy-save-btn" onclick="window.copyLastSave()" style="background: transparent; border: 1px solid #00f2ff; color: #00f2ff; padding: 4px 10px; cursor: pointer; border-radius: 3px; font-family: inherit; font-size: 10px; transition: 0.3s;">📋 КОПИРОВАТЬ</button>
                        </div>
                        <div class="console-save-scroll" style="user-select: text; word-break: break-all; color: #00f2ff; background: #000; padding: 8px; border: 1px solid rgba(0, 242, 255, 0.2); font-size: 11px; max-height: 100px; overflow-y: auto;">
                            ${displayCode}
                        </div>
                    </div>
                `);
                return true;
            }

            // --- ЗАГРУЗКА ПРОГРЕССА (ИЗ BASE64 С ОЧИСТКОЙ ОТ КОММЕНТАРИЕВ) ---
            if (cmd.toLowerCase().startsWith('load ')) {
                let rawInput = cmd.substring(5).trim(); 
                
                // УМНАЯ ОЧИСТКА: Удаляем HTML-комментарии, пробелы и переносы строк
                rawInput = rawInput.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, '');

                try {
                    const jsonStr = decodeURIComponent(escape(atob(rawInput)));
                    const saveData = JSON.parse(jsonStr);
                    
                    if (typeof saveData === 'object' && saveData !== null) {
                        // 1. Очищаем старые s9_ ключи
                        const keysToRemove = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.startsWith('s9_')) keysToRemove.push(key);
                        }
                        keysToRemove.forEach(k => localStorage.removeItem(k));

                        // 2. Записываем новые
                        let count = 0;
                        for (const [key, value] of Object.entries(saveData)) {
                            if (key.startsWith('s9_')) {
                                localStorage.setItem(key, value);
                                count++;
                            }
                        }
                        
                        print(`<span class="ok">[СИСТЕМА] ЗАГРУЖЕНО ${count} ПЕРЕМЕННЫХ. ПЕРЕЗАГРУЗКА...</span>`);
                        setTimeout(() => location.reload(), 2000);
                        return true;
                    } else {
                        print('<span class="err">[ОШИБКА] НЕВЕРНЫЙ ФОРМАТ ДАННЫХ.</span>');
                    }
                } catch (e) {
                    print('<span class="err">[ОШИБКА] НЕВЕРНЫЙ КОД СОХРАНЕНИЯ. ПРОВЕРЬТЕ, ЧТО СТРОКА СКОПИРОВАНА ПОЛНОСТЬЮ.</span>');
                    console.error(e);
                }
                return true;
            }

            if (this.state === 'CONFIRM_CLEAR') {
                if (cmd.toLowerCase() === 'y' || cmd.toLowerCase() === 'yes') {
                    localStorage.clear();
                    print('<span class="ok">[ЧИТ] ПАМЯТЬ УСПЕШНО ОЧИЩЕНА. ПЕРЕЗАГРУЗКА...</span>');
                    setTimeout(() => location.reload(), 1500);
                    this.state = 'IDLE';
                    return true;
                } else if (cmd.toLowerCase() === 'n' || cmd.toLowerCase() === 'no') {
                    print('<span class="err">[ЧИТ] ОПЕРАЦИЯ ОТМЕНЕНА.</span>');
                    this.state = 'IDLE';
                    return true;
                } else {
                    print('<span class="warn">ВВЕДИТЕ Y ИЛИ N.</span>');
                    return true;
                }
            }

            // --- ЧИТ ДЛЯ ЯЗЫКА ---
            if (cmd.toLowerCase() === 'fix_lang') {
                localStorage.setItem('s9_lang_human', 'true');
                print('<span class="ok">[ЧИТ] ЯЗЫКОВОЙ МОДУЛЬ ПРИНУДИТЕЛЬНО ЗАГРУЖЕН. ПЕРЕЗАГРУЗКА...</span>');
                setTimeout(() => location.reload(), 1000);
                return true;
            }

            // --- ЧИТ ДЛЯ АРХИВА (ПОЧИНКА) ---
            if (cmd.toLowerCase() === 'fix_archive') {
                localStorage.removeItem('s9_archive_training');
                const words = ["ХАБ", "ГЛИФ", "ПУЛЬТ", "СЕРВЕР", "КОНСОЛЬ"];
                const now = Date.now();
                const phrasesData = [
                    { text: words.slice(0, 3).join(' '), words: words.slice(0, 3), timestamp: now - 1000 },
                    { text: words.slice(3, 5).join(' '), words: words.slice(3, 5), timestamp: now }
                ];
                localStorage.setItem('s9_phrases_data', JSON.stringify(phrasesData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                localStorage.setItem('s9_archive_fixed', 'true');
                print('<span class="ok">[ЧИТ] 5 ЭТАЛОННЫХ ТРАССИТОВ ВВЕДЕНО. АРХИВ ПОЧИНЕН.</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }

            // --- ЧИТ ДЛЯ СБРОСА АРХИВА ---
            if (cmd.toLowerCase() === 'reset_archive') {
                localStorage.removeItem('s9_archive_calibrated');
                localStorage.removeItem('s9_archive_fixed');
                localStorage.removeItem('s9_archive_baseline_count');
                localStorage.removeItem('s9_phrases_data');
                localStorage.removeItem('s9_archive_training');
                const words = ["ХАБ", "ГЛИФ", "ПУЛЬТ", "СЕРВЕР", "КОНСОЛЬ"];
                words.forEach(w => localStorage.removeItem('s9_glyph_' + w));
                const oldWords = ["СИСТЕМА", "ПАМЯТЬ", "КОД", "СИГНАЛ", "ВЕКТОР", "АРХИВ", "ЗВЕЗДА", "ОРБИТА", "МОДУЛЬ", "ДАННЫЕ"];
                oldWords.forEach(w => localStorage.removeItem('s9_glyph_' + w));
                print('<span class="ok">[ЧИТ] ЗАДАНИЕ С АРХИВОМ СБРОШЕНО.</span>');
                setTimeout(() => { location.reload(); }, 1500);
                return true;
            }

            // --- ЧИТ: ТОЛЬКО КАЛИБРОВКА АРХИВА ---
            if (cmd.toLowerCase() === 'calibrate_archive') {
                localStorage.removeItem('s9_phrases_data');
                localStorage.removeItem('s9_archive_fixed');
                localStorage.removeItem('s9_archive_training');
                const words = ["ХАБ", "ГЛИФ", "ПУЛЬТ", "СЕРВЕР", "КОНСОЛЬ"];
                const now = Date.now();
                const phrasesData = [
                    { text: words.slice(0, 3).join(' '), words: words.slice(0, 3), timestamp: now - 1000 },
                    { text: words.slice(3, 5).join(' '), words: words.slice(3, 5), timestamp: now }
                ];
                localStorage.setItem('s9_phrases_data', JSON.stringify(phrasesData));
                localStorage.setItem('s9_archive_calibrated', 'true');
                localStorage.setItem('s9_archive_baseline_count', '2');
                print('<span class="ok">[ЧИТ] КАЛИБРОВКА ПРОЙДЕНА. В ПАМЯТИ 2 ФРАЗЫ.</span>');
                setTimeout(() => { window.location.href = 'archive.html'; }, 1500);
                return true; 
            }

            // --- ЧИТ ДЛЯ СБРОСА ОС ---
            if (cmd.toLowerCase() === 'reset_os') {
                localStorage.removeItem('s9_os_captcha');
                localStorage.removeItem('s9_os_fixed');
                localStorage.removeItem('s9_os_broken_qubits');
                localStorage.removeItem('s9_edr_os_passed');
                localStorage.removeItem('s9_edr_os_trigger');
                print('<span class="ok">[ЧИТ] ПРОХОЖДЕНИЕ ОС И EDR СБРОШЕНО.</span>');
                setTimeout(() => { location.reload(); }, 1500);
                return true;
            }
            // --- ЧИТ: СБРОС ДО ЖЕЛТОГО ЯДРА (ПЕРИОД ОХЛАЖДЕНИЯ) ---
            if (cmd.toLowerCase() === 'reset_core') {
                localStorage.setItem('s9_os_fixed', 'true');
                localStorage.setItem('s9_map_visited', 'true');
                
                localStorage.removeItem('s9_core_overheated');
                localStorage.removeItem('s9_core_fixed');
                localStorage.removeItem('s9_core_timer_start');
                
                print('<span class="ok">[ЧИТ] СТАТУС ЯДРА СБРОШЕН ДО WARNING (ЖЕЛТЫЙ). ПЕРЕХОД НА КАРТУ...</span>');
                setTimeout(() => { window.location.href = 'map.html'; }, 1500);
                return true;
            }

            // --- ЧИТ ДЛЯ СБРОСА ТЕЛЕМЕТРИИ ---
            if (cmd.toLowerCase() === 'reset_telemetry') {
                if (typeof window.cheatResetTelemetry === 'function') {
                    window.cheatResetTelemetry();
                    print('<span class="ok">[ЧИТ] ТЕЛЕМЕТРИЯ СБРОШЕНА. ГЕНЕРАЦИЯ НОВЫХ ВОЛН...</span>');
                    setTimeout(() => { location.reload(); }, 1500);
                } else {
                    print('<span class="err">[ЧИТ] МОДУЛЬ ТЕЛЕМЕТРИИ НЕ АКТИВЕН. ПЕРЕЙДИТЕ НА СТРАНИЦУ ТЕЛЕМЕТРИИ.</span>');
                }
                return true;
            }

            // --- ЧИТ ДЛЯ ТЕЛЕМЕТРИИ ---
            if (cmd.toLowerCase() === 'fix_telemetry') {
                if (typeof window.cheatFixTelemetry === 'function') {
                    window.cheatFixTelemetry();
                    print('<span class="ok">[ЧИТ] ВОЛНЫ СИНХРОНИЗИРОВАНЫ С ЭТАЛОНОМ.</span>');
                } else {
                    print('<span class="err">[ЧИТ] МОДУЛЬ ТЕЛЕМЕТРИИ НЕ АКТИВЕН. ПЕРЕЙДИТЕ НА СТРАНИЦУ ТЕЛЕМЕТРИИ.</span>');
                }
                return true;
            }
            
            // --- ЧИТ ДЛЯ ОС (С УЧЕТОМ EDR) ---
            if (cmd.toLowerCase() === 'fix_os') {
                localStorage.setItem('s9_os_captcha', 'true');
                localStorage.setItem('s9_os_broken_qubits', '[]'); 
                localStorage.removeItem('s9_os_fixed');
                
                const edrPassed = localStorage.getItem('s9_edr_os_passed') === 'true';
                
                if (edrPassed) {
                    localStorage.removeItem('s9_edr_os_trigger');
                    localStorage.setItem('s9_os_fixed', 'true');
                    print('<span class="ok">[ЧИТ] КУБИТЫ ПЕРЕКАЛИБРОВАНЫ. ОС ПОЧИНЕНА.</span>');
                    setTimeout(() => { window.location.href = 'os.html'; }, 1500);
                } else {
                    localStorage.setItem('s9_edr_os_trigger', 'true');
                    print('<span class="err">[ЧИТ] ВЫЗВАН СБОЙ. ПЕРЕХОД В EDR ДЛЯ ПРОВЕРКИ ЛОГИКИ.</span>');
                    setTimeout(() => { window.location.href = 'edr.html'; }, 1500);
                }
                return true; 
            }

            // Очистка памяти
            if (cmd.toLowerCase() === 'clear_memory') {
                print('<span class="warn">ВНИМАНИЕ: ВЕСЬ ПРОГРЕСС ИГРЫ БУДЕТ УДАЛЕН. ПОДТВЕРДИТЕ (Y/N)</span>');
                this.state = 'CONFIRM_CLEAR';
                return true; 
            }

            return false; 
        }
    };
})();
