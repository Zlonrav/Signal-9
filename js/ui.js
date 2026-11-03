/**
 * UI ENGINE - СИСТЕМА УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ СТАНЦИИ (V6.1 - RAW MODE)
 */

(function() {
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

    // --- 1. ЛОГИКА ТЕЛЕМЕТРИИ ---
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
            const isHuman = localStorage.getItem('s9_lang_human') === 'true';

            if (isHintTime) {
                // БЕЗОПАСНАЯ ОРБИТА (Зеленый режим)
                coordsElem.innerText = "142.0458.13.70"; 
                if (statusElem) {
                    if (isHuman) {
                        statusElem.innerHTML = "СТАТУС: SAFE VECTOR DETECTED<br><span style='font-size:8px; opacity:0.8; display:block; margin-top:2px;'>[SMA:142 | ECC:0.0458 | INC:13.7]</span>";
                    } else {
                        statusElem.innerHTML = "status: SAFE_VECTOR<br><span style='font-size:8px; opacity:0.8; display:block; margin-top:2px;'>[SMA:142 | ECC:0.0458 | INC:13.7]</span>";
                    }
                }
                if (panel) panel.classList.add('safe-orbit-active');
            } else {
                // ОБЫЧНЫЙ РЕЖИМ
                const driftA = (149.6000 + Math.sin(now / 2000) * 0.005).toFixed(4);
                const driftB = (18.04 + Math.cos(now / 1500) * 0.02).toFixed(2);
                
                if (isHuman) {
                    coordsElem.innerText = `${driftA}.${driftB}`;
                } else {
                    coordsElem.innerText = `[${driftA}, ${driftB}]`;
                }

                if (statusElem) {
                    if (isHuman) {
                        statusElem.innerText = isEmergency ? "ВНИМАНИЕ: КРИТИЧЕСКИЙ ВЫБРОС" : "СТАТУС: ГЕОСТАЦИОНАР";
                    } else {
                        statusElem.innerText = isEmergency ? "status: CRITICAL" : "status: GEO_STATIONARY";
                    }
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
            location.reload(); 
        }
    };

    window.resolveEmergency = function() {
        window.triggerSignalLoss(false);
    };

    // --- 3. ОБРАБОТКА МЕТАДАННЫХ ---
    window.updateMetaData = function(now, error, timePassed, phraseIndex) {
        const isHuman = localStorage.getItem('s9_lang_human') === 'true';

        const statusMeta = document.getElementById('status-meta');
        if (statusMeta) {
            if (now > window.nextSignalUpdate) {
                window.signalTarget = error ? 0.1 + Math.random() * 1.5 : 93 + Math.random() * 6;
                window.nextSignalUpdate = now + 1500 + Math.random() * 2500;
            }
            window.signalDisplay += (window.signalTarget - window.signalDisplay) * 0.02;
            
            if (isHuman) {
                let receptionText = window.signalDisplay < 94 ? '<span style="color:#ff3333; font-weight:bold;">НЕСТАБИЛЬНЫЙ</span>' : 'АКТИВНЫЙ';
                if (error) receptionText = '<span style="color:#ff3333; font-weight:bold;">ОБРЫВ СВЯЗИ</span>';
                statusMeta.innerHTML = `УРОВЕНЬ СИГНАЛА: ${window.signalDisplay.toFixed(1)}% | ПРИЁМ: ${receptionText}`;
            } else {
                let rawRecv = window.signalDisplay < 94 ? 'FALSE' : 'TRUE';
                if (error) rawRecv = 'FALSE (ERR)';
                statusMeta.innerHTML = `signal_amp: ${window.signalDisplay.toFixed(1)}% | recv: ${rawRecv}`;
            }
        }

        const statusTextElem = document.getElementById('status-text');
        const progressBar = document.getElementById('status-progress-bar');
        if (statusTextElem) {
            let currentText = "";
            
            if (isHuman) {
                currentText = error ? "КРИТИЧЕСКАЯ ОШИБКА ПЕРЕДАЧИ" : "ПОЛУЧЕНИЕ СИГНАЛА";
                if (!error && timePassed < 128) {
                    const statuses = ["СИНХРОНИЗАЦИЯ ПОТОКА", "ИДЕНТИФИКАЦИЯ ПАКЕТОВ", "ДЕШИФРОВКА МАССИВА ДАННЫХ", "АНАЛИЗ ДАННЫХ"];
                    currentText = statuses[Math.floor(timePassed / 10) % statuses.length];
                } else if (!error) {
                    currentText = "РАБОТА ЗАВЕРШЕНА / 100%";
                }
            } else {
                // СЫРОЙ РЕЖИМ
                if (error) {
                    currentText = "decrypt_process: ERROR";
                } else if (timePassed >= 128) {
                    currentText = "decrypt_process: DONE";
                } else {
                    const rawStatuses = ["stream_sync", "packet_id", "decrypting_data", "data_analysis"];
                    currentText = rawStatuses[Math.floor(timePassed / 10) % rawStatuses.length];
                }
            }

            if(progressBar) {
                if (!error && timePassed < 128) progressBar.style.width = `${(timePassed / 128) * 100}%`;
                else if (!error) { progressBar.style.width = "100%"; progressBar.style.background = "#00ff00"; }
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
    // --- 5. ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ ---
    document.addEventListener('DOMContentLoaded', () => {
        const isHuman = localStorage.getItem('s9_lang_human') === 'true';
        
        // --- ПЕРЕВОД ИНТЕРФЕЙСА В СЫРОЙ РЕЖИМ ---
        if (!isHuman) {
            // 1. Меняем слово "ВЕКТОР:" в телеметрии
            const vectorLabel = document.getElementById('vector-label');
            if (vectorLabel) vectorLabel.innerText = "vector:";

            // 2. Меняем заголовок "СИСТЕМНЫЙ ТЕРМИНАЛ" в журнале через внедрение CSS
            const style = document.createElement('style');
            style.innerHTML = `
                .chat-system::before { content: "sys_terminal"; }
            `;
            document.head.appendChild(style);
        }
        // -----------------------------------------

        // Инициализация аудио-кнопки
        const audioBtn = document.getElementById('audio-toggle');
        const audioStatusLabel = document.getElementById('audio-status');
        
        if (audioStatusLabel && !isHuman) {
            audioStatusLabel.innerText = "audio_sensors: false";
        }

        if (audioBtn) {
            audioBtn.onclick = function() {
                if (typeof toggleAudio === 'function') {
                    if (window.audioCtx && window.audioCtx.state === 'suspended') {
                        window.audioCtx.resume();
                    }
                    toggleAudio();
                    const isActive = !window.isMuted;
                    
                    this.classList.toggle('active', isActive);
                    const icon = document.getElementById('audio-status-icon');
                    
                    if (icon) icon.innerText = isActive ? "●" : "○";
                    
                    if (audioStatusLabel) {
                        if (isHuman) {
                            audioStatusLabel.innerText = isActive ? "АУДИОДАТЧИКИ: ВКЛ" : "АУДИОДАТЧИКИ: ВЫКЛ";
                        } else {
                            audioStatusLabel.innerText = isActive ? "audio_sensors: true" : "audio_sensors: false";
                        }
                    }
                }
            };
        }

        window.startStationTelemetry();

        if (typeof applyEmergencyStyles === 'function') {
            applyEmergencyStyles();
        }
    });

})(); 

// --- ЦЕНТРАЛЬНАЯ СИСТЕМА МОНИТОРИНГА ЧС И ИНТЕРФЕЙСА ---
window.applyEmergencyStyles = function() {
    const isSolar = localStorage.getItem('s9_emergency_flag') === 'active';
    const isReactor = localStorage.getItem('s9_emergency_reactor') === 'active';
    const isHuman = localStorage.getItem('s9_lang_human') === 'true';

    if (isSolar || isReactor) {
        document.body.classList.add('emergency-mode');
        
        let bar = document.getElementById('emergency-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'emergency-bar';
            bar.style = "position:fixed; top:0; left:0; width:100%; background:#ff3300; color:#000; text-align:center; font-weight:bold; z-index:10000; padding:8px; font-family:monospace; letter-spacing:2px; text-transform:uppercase;";
            document.body.appendChild(bar);
        }
        
        if (isHuman) {
            bar.innerText = isReactor ? "ВНИМАНИЕ! КРИТИЧЕСКИЙ СБОЙ ПО РЕАКТОРА!" : "ВНИМАНИЕ! СОЛНЕЧНАЯ АКТИВНОСТЬ!";
        } else {
            bar.innerText = isReactor ? "WARNING: REACTOR_CRITICAL_FAILURE" : "WARNING: SOLAR_ACTIVITY";
        }
        
    } else {
        document.body.classList.remove('emergency-mode');
        const bar = document.getElementById('emergency-bar');
        if (bar) bar.remove();
    }
};

document.addEventListener('DOMContentLoaded', window.applyEmergencyStyles);
window.addEventListener('load', window.applyEmergencyStyles);
window.addEventListener('storage', window.applyEmergencyStyles);
