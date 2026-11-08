// js/telemetry.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const visualArea = document.getElementById('visualArea');
        const logBox = document.getElementById('logBox');

        const W = 390;
        const H = 500;
        const centerY = H / 2;

        const reference = { 
            freq: Math.floor(Math.random() * 30) + 20,
            phase: Math.floor(Math.random() * 36) * 10,
            amp: Math.floor(Math.random() * 40) + 60,
            offset: Math.floor(Math.random() * 5) * 10 - 20
        };

        const waves = {
            red:   { freq: 30, phase: 45, amp: 60,  offset: 0, color: '#ff3333', name: 'RED', visible: true, osc: null, gain: null, panner: null, lfo: null, lfoGain: null },
            green: { freq: 30, phase: 0,  amp: 100, offset: -20, color: '#00ff44', name: 'GREEN', visible: true, osc: null, gain: null, panner: null, lfo: null, lfoGain: null },
            blue:  { freq: 30, phase: 120, amp: 40, offset: 20, color: '#00aaff', name: 'BLUE', visible: true, osc: null, gain: null, panner: null, lfo: null, lfoGain: null }
        };

        const refAudio = { osc: null, gain: null, panner: null, lfo: null, lfoGain: null, isPlaying: false };

        let isSolved = false;
        let audioStarted = false;
        let globalTime = 0;

        function addLog(text, type = '') {
            const div = document.createElement('div');
            div.className = `log-line ${type}`;
            div.innerHTML = text;
            logBox.appendChild(div);
            if (logBox.children.length > 15) logBox.removeChild(logBox.firstChild);
            logBox.scrollTop = logBox.scrollHeight;
        }

        function updateUI() {
            for (const key in waves) {
                document.getElementById(`ui-${key}-freq`).innerText = waves[key].freq;
                document.getElementById(`ui-${key}-phase`).innerText = waves[key].phase;
                document.getElementById(`ui-${key}-amp`).innerText = waves[key].amp;
                document.getElementById(`ui-${key}-offset`).innerText = waves[key].offset;
            }
        }

        function createAudioNode(w, isRef = false) {
            if (!window.audioCtx) return;

            const osc = window.audioCtx.createOscillator();
            const gain = window.audioCtx.createGain();
            const panner = window.audioCtx.createStereoPanner();
            
            const lfo = window.audioCtx.createOscillator();
            const lfoGain = window.audioCtx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 5;
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            osc.type = 'sine';
            osc.frequency.value = w.freq * 10 + 200;
            gain.gain.value = 0;
            
            osc.connect(panner).connect(gain).connect(window.masterGain);
            osc.start();

            if (isRef) {
                refAudio.osc = osc; refAudio.gain = gain; refAudio.panner = panner; refAudio.lfo = lfo; refAudio.lfoGain = lfoGain;
            } else {
                w.osc = osc; w.gain = gain; w.panner = panner; w.lfo = lfo; w.lfoGain = lfoGain;
            }
        }

        function initAudio() {
            if (audioStarted || !window.audioCtx) return;
            audioStarted = true;
            
            for (const key in waves) createAudioNode(waves[key], false);
            createAudioNode(reference, true);
            
            // Не сбрасываем refAudio.isPlaying!
            updateAudio();
        }

        function updateAudio() {
            if (!audioStarted) return;

            const applyParams = (w, audio, forceVolume = null) => {
                if (!audio.osc) return;
                audio.osc.frequency.setTargetAtTime(w.freq * 10 + 200, window.audioCtx.currentTime, 0.1);
                const vol = forceVolume !== null ? forceVolume : (w.amp / 2000);
                audio.gain.gain.setTargetAtTime(vol, window.audioCtx.currentTime, 0.1);
                const panValue = (w.phase / 180) - 1; 
                audio.panner.pan.setTargetAtTime(panValue, window.audioCtx.currentTime, 0.1);
                audio.lfoGain.gain.setTargetAtTime(Math.abs(w.offset) * 2, window.audioCtx.currentTime, 0.1);
            };

            // Если слушаем эталон - глушим остальные
            const muteOthers = refAudio.isPlaying;
            for (const key in waves) {
                applyParams(waves[key], waves[key], muteOthers ? 0 : null);
            }
            
            if (refAudio.isPlaying) {
                applyParams(reference, refAudio, reference.amp / 1000); // Громче в 2 раза
            } else {
                refAudio.gain.gain.setTargetAtTime(0, window.audioCtx.currentTime, 0.1);
            }
        }

        function drawGrid() {
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= W; x += 20) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
                if (x % 100 === 0 && x !== 0 && x !== W) { ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.fillText(x, x + 2, H - 5); }
            }
            for (let y = 0; y <= H; y += 20) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
                if (y % 100 === 0 && y !== 0 && y !== H) { ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.fillText(y - centerY, 5, y - 2); }
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
                const y = centerY + Math.sin((x * w.freq / 200) + phaseRad + globalTime) * w.amp + w.offset;
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
                ctx.font = '16px Michroma';
                ctx.textAlign = 'center';
                ctx.fillText('СИГНАЛ СИНХР.', W/2, 30);
                ctx.textAlign = 'left';
            }

            drawWave(reference, true);
            for (const key in waves) drawWave(waves[key]);

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
                    addLog(`[УСПЕХ] ВСЕ ВОЛНЫ СИНХРОНИЗИРОВАНЫ.`, "ok");
                    localStorage.setItem('s9_telemetry_calibrated', 'true');
                }
            }

            globalTime -= 0.03;
            requestAnimationFrame(render);
        }

        window.telemetryCommand = function(cmd) {
            const parts = cmd.split(' ');
            
            const printMsg = (text, type = '') => {
                addLog(text, type);
                if (window.printToConsole) window.printToConsole(text, type); 
            };
            
            if (parts[1] === '--read' && parts[2] === 'target') {
                printMsg(`<span class="warn">[ЭТАЛОН] FREQ: ${reference.freq} | PHASE: ${reference.phase} | AMP: ${reference.amp} | OFFSET: ${reference.offset}</span>`);
                return;
            }

            if (parts[1] === '--listen' && parts[2] === 'target') {
                if (!window.audioCtx) {
                    printMsg(`<span class="err">[ОШИБКА] СНАЧАЛА ВКЛЮЧИТЕ АУДИО (КНОПКА В ЛЕВОМ НИЖНЕМ УГЛУ).</span>`);
                    return;
                }
                if (!audioStarted) initAudio(); // Если аудио-узлы еще не созданы - создаем сейчас
                
                refAudio.isPlaying = !refAudio.isPlaying;
                printMsg(`<span class="ok">[ОК] Звук эталона ${refAudio.isPlaying ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}.</span>`);
                updateAudio();
                return;
            }

            if (parts[1] === '--toggle' && parts[2]) {
                const color = parts[2];
                if (waves[color]) {
                    waves[color].visible = !waves[color].visible;
                    printMsg(`<span class="ok">[ОК] Волна ${color.toUpperCase()} ${waves[color].visible ? 'включена' : 'выключена'}.</span>`);
                    updateAudio();
                } else {
                    printMsg(`<span class="err">[ОШИБКА] Неизвестная волна.</span>`);
                }
                return;
            }

            if (parts[1] === '--set' && parts.length === 5) {
                const color = parts[2];
                const param = parts[3];
                const valStr = parts[4];
                
                if (waves[color] && waves[color][param] !== undefined) {
                    if (/^[+-]\d+$/.test(valStr)) {
                        const val = parseInt(valStr);
                        waves[color][param] += val;
                        printMsg(`<span class="ok">[ОК] ${color.toUpperCase()} ${param.toUpperCase()} изм. на ${val}.</span>`);
                        updateUI();
                        updateAudio();
                    } else {
                        printMsg(`<span class="err">[ОШИБКА] Неверный формат значения.</span>`);
                    }
                } else {
                    printMsg(`<span class="err">[ОШИБКА] Неизвестная волна или параметр.</span>`);
                }
                return;
            }
            printMsg(`<span class="err">[ОШИБКА] Неизвестная команда.</span>`);
        };

        addLog(`[ФАЗОВАЯ СИНХРОНИЗАЦИЯ]`, "warn");
        addLog(`Обнаружены 3 волны. Синхронизируйте их с эталоном.`);
        
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                // Убираем setTimeout, чтобы избежать гонки состояний
                initAudio();
            });
        }

        updateUI();
        render();
    });
})();