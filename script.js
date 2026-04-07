// --- КОНФИГУРАЦИЯ ---
const POINTS = [{x:15,y:15},{x:40,y:15},{x:65,y:15},{x:15,y:40},{x:40,y:40},{x:65,y:40},{x:15,y:65},{x:40,y:65},{x:65,y:65}];
const CYCLE_TIME = 128; 
const TOTAL_DECRYPT_TIME = 110; 
const CYRILLIC = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

let signalDisplay = 98;
let signalTarget = 98;
let nextSignalUpdate = 0;
let isSignalLoss = false;
let lastStatusText = "";
let packetDisplay = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
let nextPacketAction = Date.now() + 500; // Начнем с короткого бега при загрузке
let isPacketStatic = false; 
let channelDisplay = Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0');
let nextChannelUpdate = Date.now() + 5000; // Канал будет жить 5 секунд


const ERROR_INTERVAL = 7 * 60 * 60 * 1000; 
const ERROR_DURATION = 128 * 1000;

// --- ЗВУКОВОЙ ДВИЖОК ---
let audioCtx, masterGain, noiseSource, isMuted = false, glyphGainNode;

const toggleAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 1.0;
        const bufferSize = 2 * audioCtx.sampleRate,
              noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
              output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 60;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.05; 
        noiseSource.connect(filter).connect(noiseGain).connect(masterGain);
        noiseSource.start();
        document.getElementById('audio-status').innerText = "АУДИОДАТЧИКИ: ВКЛЮЧЕНЫ";
    } else {
        isMuted = !isMuted;
        masterGain.gain.setTargetAtTime(isMuted ? 0 : 1.0, audioCtx.currentTime, 0.1);
        document.getElementById('audio-status').innerText = isMuted ? "АУДИОДАТЧИКИ: ОТКЛЮЧЕНЫ" : "АУДИОДАТЧИКИ: ВКЛЮЧЕНЫ";
    }
};

const playGlyphSound = async (pathIndices) => {
    if (!audioCtx || isMuted || isSignalLoss) return;
    if (glyphGainNode) {
        const prevGain = glyphGainNode;
        prevGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        setTimeout(() => prevGain.disconnect(), 60);
    }
    glyphGainNode = audioCtx.createGain();
    glyphGainNode.connect(masterGain);
    let currentTime = audioCtx.currentTime;
    for (let i = 0; i < pathIndices.length - 1; i++) {
        const p1 = POINTS[pathIndices[i]], p2 = POINTS[pathIndices[i+1]];
        if (!p1 || !p2) continue;
        const dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y);
        const length = Math.sqrt(dx*dx + dy*dy) / 25;
        let baseFreq = dx === 0 ? 260 : (dy !== 0 ? 220 : 180);
        const step = (length * 0.14) / Math.floor(length * 15 || 1);
        for (let g = 0; g < Math.floor(length * 15); g++) {
            const osc = audioCtx.createOscillator(), gNode = audioCtx.createGain(), filter = audioCtx.createBiquadFilter();
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(baseFreq + (Math.random() * 10), currentTime);
            filter.type = 'bandpass'; filter.frequency.setValueAtTime(baseFreq * 2, currentTime); filter.Q.value = 10;
            gNode.gain.setValueAtTime(0, currentTime);
            gNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.005);
            gNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + step * 0.8);
            osc.connect(filter).connect(gNode).connect(glyphGainNode);
            osc.start(currentTime); osc.stop(currentTime + step);
            currentTime += step;
        }
        const chime = audioCtx.createOscillator(), chimeGain = audioCtx.createGain();
        chime.type = 'sine'; chime.frequency.setValueAtTime(baseFreq * 4, currentTime);
        chimeGain.gain.setValueAtTime(0.05, currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.05);
        chime.connect(chimeGain).connect(glyphGainNode);
        chime.start(currentTime); chime.stop(currentTime + 0.05);
    }
};

// --- ГРАФИКА ---
function getPath(word) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) hash = ((hash << 5) + hash) + word.charCodeAt(i);
    let seed = Math.abs(hash), path = [], used = new Set();
    const len = (seed % 3) + 5;
    while(path.length < len && used.size < 9) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        let n = seed % 9; if(!used.has(n)) { path.push(n); used.add(n); }
    }
    return path;
}

function createSVG(path) {
    if (!path || !path.length) return '';
    const start = POINTS[path[0]]; // Исправлено: берем первый индекс массива
    let d = `M ${start.x} ${start.y}`;
    for(let i=0; i<path.length-1; i++) {
        const c = POINTS[path[i]], n = POINTS[path[i+1]];
        d += ` C ${c.x+(n.x-c.x)*0.5} ${c.y}, ${c.x+(n.x-c.x)*0.5} ${n.y}, ${n.x} ${n.y}`;
    }
    // Чистый SVG без внешних фильтров
    return `<svg viewBox="0 0 80 80"><path d="${d}"></path></svg>`;
}

const getNoise = (len) => Array.from({length: Math.max(len, 0)}, () => CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)]).join('');

function renderPhrase(container, index) {
    if (typeof PHRASES === 'undefined') return;
    container.dataset.index = index;
    container.innerHTML = '';
    PHRASES[index].split(' ').forEach(word => {
        const pathData = getPath(word), unit = document.createElement('div');
        unit.className = 'glyph-unit';
        unit.innerHTML = createSVG(pathData) + '<div class="glyph-label"></div>';
        unit.dataset.wordActual = word.toUpperCase();
        unit.onmouseenter = () => playGlyphSound(pathData);
        container.appendChild(unit);
    });
}

// --- ЛОГИКА ОБРЫВА ---
const triggerSignalLoss = (active) => {
    isSignalLoss = active;
    const phraseContainer = document.getElementById('currentPhrase');
    if (!phraseContainer) return;

    if (active) {
        document.body.classList.add('mode-error');
        phraseContainer.innerHTML = '';
        phraseContainer.dataset.index = "ERROR_MODE"; 
        for (let i = 0; i < 5; i++) {
            const unit = document.createElement('div');
            unit.className = 'glyph-unit';
            unit.innerHTML = '<span class="error-text">ERROR</span><div class="glyph-label"></div>';
            phraseContainer.appendChild(unit);
        }
    } else {
        document.body.classList.remove('mode-error');
        phraseContainer.dataset.index = "";
    }
};

// --- ГЛАВНЫЙ ЦИКЛ ---
function update() {
    if (typeof PHRASES === 'undefined') return;

    const now = Date.now();
    const timeSec = Math.floor(now / 1000);
    const timeLeft = CYCLE_TIME - (timeSec % CYCLE_TIME);
    const timePassed = timeSec % CYCLE_TIME;
    const phraseIndex = Math.floor((timeSec / CYCLE_TIME) % PHRASES.length);
    const phraseContainer = document.getElementById('currentPhrase');

    // 1. АВТО-ЦИКЛ ERROR (синхронизация с системным временем)
    const cyclePos = now % ERROR_INTERVAL;
    const isErrorTime = cyclePos < ERROR_DURATION;

    // Если время ошибки вышло, а мы всё еще в режиме ERROR — выключаем
    if (!isErrorTime && isSignalLoss) {
        // Если это был авто-обрыв ИЛИ если 128-сек таймер дошел до конца цикла
        if (!testBtn.dataset.manual || timeLeft === CYCLE_TIME) {
            testBtn.dataset.manual = ""; // Сбрасываем ручной флаг
            triggerSignalLoss(false);
        }
    } 
    // Если время ошибки пришло, а мы еще не в ней — включаем
    else if (isErrorTime && !isSignalLoss) {
        triggerSignalLoss(true);
    }

    // Авто-восстановление при смене 128-сек цикла
    if (timePassed === 0 && isSignalLoss && !testBtn.dataset.manual) triggerSignalLoss(false);

    // Таймеры работают всегда
    if (document.getElementById('timer')) document.getElementById('timer').innerText = `ПОИСК СИГНАЛА: ${timeLeft} сек`;
    if (document.getElementById('const-timer')) document.getElementById('const-timer').innerText = `REFRESH: ${timeLeft}s`;
    const constGlyphElem = document.getElementById('const-glyph');
    if (constGlyphElem && !constGlyphElem.innerHTML) constGlyphElem.innerHTML = createSVG(getPath("Расшифровка"));

    // Мета-данные обновляются всегда
    updateMetaData(now, isSignalLoss, timePassed, phraseIndex);

    if (isSignalLoss) return;

    // --- ОБЫЧНЫЙ РЕЖИМ ---
    if (!phraseContainer.dataset.index || phraseContainer.dataset.index === "ERROR_MODE") {
        renderPhrase(phraseContainer, phraseIndex);
    }

    if (timeLeft <= 1 || timePassed === 0) {
        phraseContainer.classList.add('wave-transition');
        document.body.classList.add('signal-glitch');
        if (phraseContainer.dataset.index != phraseIndex) renderPhrase(phraseContainer, phraseIndex);
    } else {
        phraseContainer.classList.remove('wave-transition');
        document.body.classList.remove('signal-glitch');
    }

    if (timeLeft <= 1.5 && timeLeft > 0) phraseContainer.classList.add('fade-out');
    else phraseContainer.classList.remove('fade-out');

    // Дешифровка
    const units = document.querySelectorAll('.glyph-unit');
    const words = PHRASES[phraseIndex].split(' ');
    const timePerGlyph = TOTAL_DECRYPT_TIME / words.length;

    units.forEach((unit, idx) => {
        const word = unit.dataset.wordActual, label = unit.querySelector('.glyph-label');
        if (!label) return;
        const revealStart = idx * timePerGlyph;
        let html = "";
        if (timePassed < revealStart) {
            html = `<span class="char-noise">${getNoise(14)}</span>`;
            unit.classList.remove('done', 'pulse-trigger');
        } else if (timePassed >= (revealStart + timePerGlyph)) {
            html = `<span class="char-fixed">${word}</span>`;
            if (!unit.classList.contains('done')) unit.classList.add('done', 'pulse-trigger');
        } else {
            const progress = (timePassed - revealStart) / timePerGlyph;
            const revealCount = Math.floor(word.length * progress);
            html = `<span class="char-fixed">${word.substring(0, revealCount)}</span><span class="char-noise">${getNoise(Math.max(14, word.length) - revealCount)}</span>`;
            unit.classList.remove('done', 'pulse-trigger');
        }
        if (label.innerHTML !== html) label.innerHTML = html;
    });
}

function updateMetaData(now, error, timePassed, phraseIndex) {
    const statusMeta = document.getElementById('status-meta');
    if (statusMeta) {
        if (now > nextSignalUpdate) {
            signalTarget = error ? 0.1 + Math.random() * 1.5 : 93 + Math.random() * 6;
            nextSignalUpdate = now + 1500 + Math.random() * 2500;
        }
        signalDisplay += (signalTarget - signalDisplay) * 0.02;
        let receptionText = signalDisplay < 94 ? '<span style="color:#ff3333; font-weight:bold;">НЕСТАБИЛЬНЫЙ</span>' : 'АКТИВНЫЙ';
        if (error) receptionText = '<span style="color:#ff3333; font-weight:bold;">ОБРЫВ СВЯЗИ</span>';
        statusMeta.innerHTML = `УРОВЕНЬ СИГНАЛА: ${signalDisplay.toFixed(1)}% | ПРИЁМ: ${receptionText}`;
    }

    const statusTextElem = document.getElementById('status-text');
    const progressBar = document.getElementById('status-progress-bar');
    if (statusTextElem) {
        let currentText = error ? "КРИТИЧЕСКАЯ ОШИБКА ПЕРЕДАЧИ" : "ПОЛУЧЕНИЕ СИГНАЛА";
        if (!error && timePassed < TOTAL_DECRYPT_TIME) {
            const statuses = ["СИНХРОНИЗАЦИЯ ПОТОКА", "ИДЕНТИФИКАЦИЯ ПАКЕТОВ", "ДЕШИФРОВКА МАССИВА ДАННЫХ", "АНАЛИЗ ДАННЫХ"];
            currentText = statuses[Math.floor(timePassed / 10) % statuses.length];
            if(progressBar) progressBar.style.width = `${(timePassed / TOTAL_DECRYPT_TIME) * 100}%`;
        } else if (!error) {
            currentText = "РАБОТА ЗАВЕРШЕНА / 100%";
            if(progressBar) { progressBar.style.width = "100%"; progressBar.style.background = "#00ff00"; }
        }
        if (lastStatusText !== currentText) lastStatusText = currentText;

        let content = "";
        const speed = error ? 0.03 : 0.009; // В режиме ошибки мигает быстрее
        const lightPos = (now * speed) % (lastStatusText.length + 12) - 6;
        for(let i=0; i<lastStatusText.length; i++) {
            let opacity = 1;
            if (error) opacity = Math.random() > 0.7 ? 1 : 0.2;
            else if (timePassed < TOTAL_DECRYPT_TIME) {
                opacity = Math.max(0.1, 1 - (Math.abs(i - lightPos) / 5));
            }
            content += `<span style="opacity:${opacity}">${lastStatusText[i]}</span>`;
        }
        statusTextElem.innerHTML = content;
    }

    const statusFooter = document.getElementById('status-footer');
    if (statusFooter) {
        // Логика смены КАНАЛА (раз в 5 секунд на новое случайное число)
        if (!error && now > nextChannelUpdate) {
            channelDisplay = Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0');
            nextChannelUpdate = now + 5000; // Задаем время до следующей смены
        }

        let packetVal, chanVal;

        if (error) {
            packetVal = "ERR_LOST";
            chanVal = "--";
        } else if (timePassed >= TOTAL_DECRYPT_TIME) {
            // При 100% фиксируем и пакет, и канал
            const finalSeed = phraseIndex * 1234 + 567;
            packetVal = "0x" + (Math.abs(finalSeed) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
            chanVal = channelDisplay; // Оставляем последний активный канал
        } else {
            // Логика ПАКЕТА (бег 0.5с / пауза 3-10с)
            if (now > nextPacketAction) {
                isPacketStatic = !isPacketStatic;
                const delay = isPacketStatic ? (3000 + Math.random() * 7000) : 500;
                nextPacketAction = now + delay;
            }
            if (!isPacketStatic) {
                packetDisplay = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
            }
            packetVal = packetDisplay;
            chanVal = channelDisplay;
        }

        statusFooter.innerText = `DECODING PACKET: ${packetVal} / SECURE CHANNEL ${chanVal}`;
    }
}

// Кнопка теста
const testBtn = document.getElementById('test-error-btn');
if(testBtn) {
    testBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); e.stopPropagation();
        const newState = !isSignalLoss;
        testBtn.dataset.manual = newState ? "true" : "";
        triggerSignalLoss(newState);
        testBtn.style.background = newState ? '#ff3333' : '#333';
    });
}

document.addEventListener('mousedown', (e) => {
    if (e.target.id === 'test-error-btn') return;
    toggleAudio();
});

setInterval(update, 30);
update();
const initStarfield = () => {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height, stars = [], particles = [];

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Статичные далекие звезды
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.2,
            opacity: Math.random(),
            orbitSpeed: 0.00005 + Math.random() * 0.0001
        });
    }

    // Частицы солнечного ветра
    const createParticle = () => ({
        x: -50,
        y: Math.random() * height,
        speed: 0.2 + Math.random() * 0.5,
        size: Math.random() * 2,
        life: 1
    });

    const draw = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const now = Date.now();

        // 1. Свечение звезды за краем (слева снизу)
        const starGlow = ctx.createRadialGradient(0, height, 0, 0, height, width * 0.8);
        // Пульсация яркости звезды
        const pulse = Math.sin(now * 0.0005) * 0.02;
        starGlow.addColorStop(0, `rgba(0, 242, 255, ${0.08 + pulse})`);
        starGlow.addColorStop(0.5, `rgba(0, 50, 60, ${0.03 + pulse})`);
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.fillRect(0, 0, width, height);

        // 2. Отрисовка звезд с орбитальным дрейфом (вращение вокруг центра звезды слева-снизу)
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
            ctx.globalAlpha = Math.abs(Math.sin(now * 0.001 + s.opacity * 10)) * 0.8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            // Движение по орбите (вокруг точки 0, height)
            const dx = s.x;
            const dy = s.y - height;
            const angle = Math.atan2(dy, dx) + s.orbitSpeed;
            const dist = Math.sqrt(dx * dx + dy * dy);
            s.x = Math.cos(angle) * dist;
            s.y = Math.sin(angle) * dist + height;

            if (s.x > width || s.y < 0) {
                s.x = Math.random() * width;
                s.y = Math.random() * height;
            }
        });

        // 3. Солнечный ветер (частицы от звезды)
        if (particles.length < 20 && Math.random() > 0.95) particles.push(createParticle());
        
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        particles.forEach((p, i) => {
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.speed;
            p.y -= p.speed * 0.2;
            p.life -= 0.002;
            if (p.life <= 0) particles.splice(i, 1);
        });

        requestAnimationFrame(draw);
    };

    draw();
};

initStarfield();
