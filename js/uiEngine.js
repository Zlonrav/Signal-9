/**
 * UI ENGINE - СИСТЕМА УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ СТАНЦИИ (V6.0)
 * Синхронизирована с глобальным режимом ЧС и навигационной телеметрией
 */

(function() {
    // Защита от повторной инициализации при двойной загрузке
    if (window.UI_ENGINE_INITIALIZED) return;
    window.UI_ENGINE_INITIALIZED = true;

    // --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ МЕТАДАННЫХ ---
    window.lastStatusText = "";
    window.signalTarget = 98;
    window.signalDisplay = 98;
    window.nextSignalUpdate = 0;
    window.channelDisplay = "07";
    window.nextChannelUpdate = 0;
    window.packetDisplay = "0x4F2A";
    window.isPacketStatic = true;
    window.nextPacketAction = 0;
    window.isSignalLoss = false;

    // --- 1. ЛОГИКА ТЕЛЕМЕТРИИ И КОДА СПАСЕНИЯ ---
    window.startStationTelemetry = function() {
        const coordsElem = document.getElementById('station-coords');
        const statusElem = document.getElementById('orbit-status');
        const panel = document.querySelector('.telemetry-panel');
        
        if (!coordsElem) return;

        setInterval(() => {
            const now = Date.now();
            const cycle = 25000; 
            const isHintTime = (now % cycle) > 20000;
            const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';

            if (isHintTime) {
                // БЕЗОПАСНАЯ ОРБИТА (Зеленый режим)
                coordsElem.innerText = "142.0458.13.70"; 
                if (statusElem) {
                    statusElem.innerHTML = "СТАТУС: SAFE VECTOR DETECTED<br>" + 
                    "<span style='font-size:8px; opacity:0.8; display:block; margin-top:2px;'>[SMA:142 | ECC:0.0458 | INC:13.7]</span>";
                }
                // Зеленый цвет подсказки пробивается даже сквозь красный режим
                if (panel) panel.classList.add('safe-orbit-active');
            } else {
                // ОБЫЧНЫЙ РЕЖИМ (Синий или Красный)
                const driftA = (149.6000 + Math.sin(now / 2000) * 0.005).toFixed(4);
                const driftB = (18.04 + Math.cos(now / 1500) * 0.02).toFixed(2);
                
                coordsElem.innerText = `${driftA}.${driftB}`;
                if (statusElem) {
                    statusElem.innerText = isEmergency ? "ВНИМАНИЕ: КРИТИЧЕСКИЙ ВЫБРОС" : "СТАТУС: ГЕОСТАЦИОНАР";
                }
                if (panel) panel.classList.remove('safe-orbit-active');
            }
        }, 100);
    };

    // --- 2. УПРАВЛЕНИЕ РЕЖИМОМ ЧС ---
    window.triggerSignalLoss = function(active) {
        window.isSignalLoss = active;
        const phraseContainer = document.getElementById('currentPhrase');
        
        if (active) {
            localStorage.setItem('s9_emergency_flag', 'active');
            document.body.classList.add('emergency-mode');
            
            // Визуал ERROR на главной
            if (phraseContainer) {
                phraseContainer.innerHTML = '';
                for (let i = 0; i < 5; i++) {
                    const unit = document.createElement('div');
                    unit.className = 'glyph-unit';
                    unit.innerHTML = '<span class="error-text">ERROR</span><div class="glyph-label"></div>';
                    phraseContainer.appendChild(unit);
                }
            }
        } else {
            localStorage.removeItem('s9_emergency_flag');
            document.body.classList.remove('emergency-mode');
            // Перезагрузка для полного восстановления систем
            location.reload(); 
        }
    };

    // Функция для вызова из терминала (лекарство)
    window.resolveEmergency = function() {
        window.triggerSignalLoss(false);
    };

    // --- 3. ОБРАБОТКА МЕТАДАННЫХ (для core.js) ---
    window.updateMetaData = function(now, error, timePassed, phraseIndex) {
        const statusMeta = document.getElementById('status-meta');
        if (statusMeta) {
            if (now > window.nextSignalUpdate) {
                window.signalTarget = error ? 0.1 + Math.random() * 1.5 : 93 + Math.random() * 6;
                window.nextSignalUpdate = now + 1500 + Math.random() * 2500;
            }
            window.signalDisplay += (window.signalTarget - window.signalDisplay) * 0.02;
            let receptionText = window.signalDisplay < 94 ? '<span style="color:#ff3333; font-weight:bold;">НЕСТАБИЛЬНЫЙ</span>' : 'АКТИВНЫЙ';
            if (error) receptionText = '<span style="color:#ff3333; font-weight:bold;">ОБРЫВ СВЯЗИ</span>';
            statusMeta.innerHTML = `УРОВЕНЬ СИГНАЛА: ${window.signalDisplay.toFixed(1)}% | ПРИЁМ: ${receptionText}`;
        }

        const statusTextElem = document.getElementById('status-text');
        const progressBar = document.getElementById('status-progress-bar');
        if (statusTextElem) {
            let currentText = error ? "КРИТИЧЕСКАЯ ОШИБКА ПЕРЕДАЧИ" : "ПОЛУЧЕНИЕ СИГНАЛА";
            if (!error && timePassed < 128) {
                const statuses = ["СИНХРОНИЗАЦИЯ ПОТОКА", "ИДЕНТИФИКАЦИЯ ПАКЕТОВ", "ДЕШИФРОВКА МАССИВА ДАННЫХ", "АНАЛИЗ ДАННЫХ"];
                currentText = statuses[Math.floor(timePassed / 10) % statuses.length];
                if(progressBar) progressBar.style.width = `${(timePassed / 128) * 100}%`;
            } else if (!error) {
                currentText = "РАБОТА ЗАВЕРШЕНА / 100%";
                if(progressBar) { progressBar.style.width = "100%"; progressBar.style.background = "#00ff00"; }
            }
            if (window.lastStatusText !== currentText) window.lastStatusText = currentText;

            let content = "";
            const speed = error ? 0.03 : 0.009;
            const lightPos = (now * speed) % (window.lastStatusText.length + 12) - 6;
            for(let i=0; i<window.lastStatusText.length; i++) {
                let opacity = error ? (Math.random() > 0.7 ? 1 : 0.2) : Math.max(0.1, 1 - (Math.abs(i - lightPos) / 5));
                content += `<span style="opacity:${opacity}">${window.lastStatusText[i]}</span>`;
            }
            statusTextElem.innerHTML = content;
        }
    };

    // --- 4. ОТРИСОВКА ФРАЗ ---
    window.renderPhrase = function(container, index) {
        if (typeof PHRASES === 'undefined' || !container) return;
        container.dataset.index = index;
        container.innerHTML = '';
        PHRASES[index].split(' ').forEach(word => {
            const pathData = getPath(word);
            const unit = document.createElement('div');
            unit.className = 'glyph-unit';
            unit.innerHTML = createSVG(pathData) + '<div class="glyph-label"></div>';
            unit.dataset.wordActual = word.toUpperCase();
            unit.onmouseenter = () => playGlyphSound(pathData);
            container.appendChild(unit);
        });
    };

    // --- 5. ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ ---
    document.addEventListener('DOMContentLoaded', () => {
        // Кнопка аудиодатчиков
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.onclick = function() {
                if (typeof toggleAudio === 'function') {
                    // Разблокировка аудио-контекста для браузера
                    if (window.audioCtx && window.audioCtx.state === 'suspended') {
                        window.audioCtx.resume();
                    }
                    toggleAudio();
                    const isActive = !window.isMuted;
                    this.classList.toggle('active', isActive);
                    const icon = document.getElementById('audio-status-icon');
                    if (icon) icon.innerText = isActive ? "●" : "○";
                }
            };
        }

        // Запуск телеметрии
        window.startStationTelemetry();

        // Проверка режима ЧС при загрузке
        if (localStorage.getItem('s9_emergency_flag') === 'active') {
            window.triggerSignalLoss(true);
        }
    });

})();
