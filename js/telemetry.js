// js/telemetry.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const tooltip = document.getElementById('tooltip');
        const visualArea = document.getElementById('visualArea');
        const logBox = document.getElementById('log');
        const input = document.getElementById('input');

        const W = 650;
        const H = 650;
        const centerY = H / 2;

        // Эталонные параметры
        const reference = { freq: 30, phase: 0, amp: 80, offset: 0 };

        // Рабочие волны
        const waves = {
            red:   { freq: 30, phase: 45, amp: 60,  offset: 0, color: '#ff3333', name: 'RED', visible: true, oscillator: null, gain: null },
            green: { freq: 30, phase: 0,  amp: 100, offset: -20, color: '#00ff44', name: 'GREEN', visible: true, oscillator: null, gain: null },
            blue:  { freq: 30, phase: 120, amp: 40, offset: 20, color: '#00aaff', name: 'BLUE', visible: true, oscillator: null, gain: null }
        };

        let isSolved = false;
        let audioStarted = false;

        function addLog(text) {
            const div = document.createElement('div');
            div.innerHTML = text;
            logBox.appendChild(div);
            logBox.scrollTop = logBox.scrollHeight;
        }

        // --- АУДИО-ЛОГИКА ---
        function initAudio() {
            if (audioStarted || !window.audioCtx) return;
            audioStarted = true;
            
            for (const key in waves) {
                const w = waves[key];
                const osc = window.audioCtx.createOscillator();
                const gain = window.audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = w.freq * 10 + 200; // Мапим частоту в звук
                gain.gain.value = 0.02; // Тихий звук
                
                osc.connect(gain).connect(window.masterGain);
                osc.start();
                
                w.oscillator = osc;
                w.gain = gain;
            }
        }

        function updateAudio() {
            if (!audioStarted) return;
            for (const key in waves) {
                const w = waves[key];
                if (w.oscillator && w.gain) {
                    w.oscillator.frequency.setTargetAtTime(w.freq * 10 + 200, window.audioCtx.currentTime, 0.1);
                    w.gain.gain.setTargetAtTime(w.visible ? (w.amp / 2000) : 0, window.audioCtx.currentTime, 0.1);
                }
            }
        }

        // --- ОТРИСОВКА ---
        function drawGrid() {
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= W; x += 25) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
                if (x % 100 === 0) { ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.fillText(x, x + 2, H - 5); }
            }
            for (let y = 0; y <= H; y += 25) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
                if (y % 100 === 0) { ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.fillText(y - centerY, 5, y - 2); }
            }
        }

        function drawWave(w, isRef = false) {
            if (!isRef && !w.visible) return;
            ctx.beginPath();
            ctx.strokeStyle = isRef ? '#ffffff' : w.color;
            ctx.lineWidth = isRef ? 1.5 : 2.5;
            ctx.shadowBlur = isRef ? 5 : 10;
            ctx.shadowColor = isRef ? '#fff' : w.color;
            ctx.globalAlpha = isRef ? 0.4 : 0.8;

            for (let x = 0; x < W; x++) {
                const phaseRad = (w.phase * Math.PI) / 180;
                const y = centerY + Math.sin((x * w.freq / 100) + phaseRad) * w.amp + w.offset;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        function render() {
            ctx.clearRect(0, 0, W, H);
            drawGrid();

            if (isSolved) {
                ctx.fillStyle = '#00ff44';
                ctx.font = '20px Michroma';
                ctx.textAlign = 'center';
                ctx.fillText('СИГНАЛ СИНХРОНИЗИРОВАН', W/2, 50);
                ctx.textAlign = 'left';
            }

            drawWave(reference, true);
            for (const key in waves) drawWave(waves[key]);

            // Проверка на победу
            if (!isSolved) {
                let allMatch = true;
                for (const key in waves) {
                    const w = waves[key];
                    if (w.freq !== reference.freq || w.phase !== reference.phase || w.amp !== reference.amp || w.offset !== reference.offset) {
                        allMatch = false;
                        break;
                    }
                }
                if (allMatch) {
                    isSolved = true;
                    addLog(`<span class="ok">[УСПЕХ] ВСЕ ВОЛНЫ СИНХРОНИЗИРОВАНЫ. СИГНАЛ ЗАФИКСИРОВАН.</span>`);
                    addLog(`<span class="ok">ТЕЛЕМЕТРИЯ ДОСТУПНА.</span>`);
                    localStorage.setItem('s9_telemetry_calibrated', 'true');
                }
            }

            requestAnimationFrame(render);
        }

        // --- TOOLTIP ЛОГИКА ---
        visualArea.addEventListener('mousemove', (e) => {
            if (isSolved) return;
            const rect = visualArea.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let closestWave = null;
            let minDistance = 25;

            for (const key in waves) {
                const w = waves[key];
                if (!w.visible) continue;
                const phaseRad = (w.phase * Math.PI) / 180;
                const waveY = centerY + Math.sin((mouseX * w.freq / 100) + phaseRad) * w.amp + w.offset;
                const dist = Math.abs(mouseY - waveY);

                if (dist < minDistance) {
                    minDistance = dist;
                    closestWave = w;
                }
            }

            if (closestWave) {
                tooltip.style.display = 'block';
                tooltip.style.left = mouseX + 'px';
                tooltip.style.top = mouseY + 'px';
                document.getElementById('tt-title').innerText = closestWave.name + ' WAVE';
                document.getElementById('tt-title').style.color = closestWave.color;
                document.getElementById('tt-freq').innerText = closestWave.freq;
                document.getElementById('tt-phase').innerText = closestWave.phase + '°';
                document.getElementById('tt-amp').innerText = closestWave.amp;
                document.getElementById('tt-offset').innerText = closestWave.offset;
            } else {
                tooltip.style.display = 'none';
            }
        });

        visualArea.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

        // --- КОМАНДЫ ДЛЯ КОНСОЛИ ---
        window.telemetryCommand = function(cmd) {
            const parts = cmd.split(' ');
            if (parts[0] === 'help') {
                addLog(`<span class="warn">ИНСТРУКЦИЯ:</span>`);
                addLog(`Наведите курсор на волны (Red, Green, Blue), чтобы увидеть их параметры.`);
                addLog(`Синхронизируйте их с эталоном (белая волна).`);
                addLog(`КОМАНДЫ:`);
                addLog(`> <span style="color:var(--neon)">telemetry --set <цвет> <параметр> <значение></span>`);
                addLog(`> <span style="color:var(--neon)">telemetry --toggle <цвет></span>`);
                addLog(`ПРИМЕР: telemetry --set red freq +5`);
                return;
            }

            if (parts[0] === 'telemetry' && parts[1] === '--toggle' && parts[2]) {
                const color = parts[2];
                if (waves[color]) {
                    waves[color].visible = !waves[color].visible;
                    addLog(`<span class="ok">[ОК] Волна ${color.toUpperCase()} ${waves[color].visible ? 'включена' : 'выключена'}.</span>`);
                    updateAudio();
                } else {
                    addLog(`<span class="err">[ОШИБКА] Неизвестная волна. Используйте red, green или blue.</span>`);
                }
                return;
            }

            if (parts[0] === 'telemetry' && parts[1] === '--set' && parts.length === 5) {
                const color = parts[2];
                const param = parts[3];
                const valStr = parts[4];
                
                if (waves[color] && waves[color][param] !== undefined) {
                    if (/^[+-]\d+$/.test(valStr)) {
                        const val = parseInt(valStr);
                        waves[color][param] += val;
                        addLog(`<span class="ok">[ОК] ${color.toUpperCase()} ${param.toUpperCase()} изменено на ${val}. Текущее: ${waves[color][param]}</span>`);
                        updateAudio();
                    } else {
                        addLog(`<span class="err">[ОШИБКА] Неверный формат значения.</span>`);
                    }
                } else {
                    addLog(`<span class="err">[ОШИБКА] Неизвестная волна или параметр.</span>`);
                }
                return;
            }
            addLog(`<span class="err">[ОШИБКА] Неизвестная команда. Введите help.</span>`);
        };

        // Инициализация
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim().toLowerCase();
                input.value = '';
                if (cmd) {
                    addLog(`> ${cmd}`);
                    window.telemetryCommand(cmd);
                }
            }
        });

        // Запуск
        addLog(`<span class="topic">[ФАЗОВАЯ СИНХРОНИЗАЦИЯ]</span>`);
        addLog(`Обнаружены 3 волны (R, G, B) и 1 эталон.`);
        addLog(`Наведите курсор на волны, чтобы увидеть их параметры.`);
        addLog(`Введите <span style="color:var(--neon)">help</span> для получения инструкции.`);
        
        // Привязка аудио к кнопке
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                setTimeout(initAudio, 500); // Ждем инициализации audioCtx
            });
        }

        render();
    });
})();