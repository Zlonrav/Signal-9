// --- ЗВУКОВОЙ ДВИЖОК ---
let audioCtx, masterGain, noiseSource, isMuted = false, glyphGainNode;

const toggleAudio = () => {
    // 1. Если контекста нет — создаем его
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        
        // Генерация шума
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        
        noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; 
        filter.frequency.value = 60;
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.05; 
        
        noiseSource.connect(filter).connect(noiseGain).connect(masterGain);
        noiseSource.start();

        // После создания СРАЗУ выставляем громкость в зависимости от isMuted
        // Если при создании isMuted был false (звук включен), ставим 1.0
        masterGain.gain.setValueAtTime(isMuted ? 0 : 1.0, audioCtx.currentTime);
        
    } else {
        // 2. Если контекст уже есть — просто переключаем
        isMuted = !isMuted;
        
        // Плавный переход, чтобы не было щелчка
        const targetVolume = isMuted ? 0 : 1.0;
        masterGain.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.1);
    }

    // 3. Обновляем текст в интерфейсе
    const statusLabel = document.getElementById('audio-status');
    if (statusLabel) {
        statusLabel.innerText = isMuted ? "АУДИОДАТЧИКИ: ОТКЛЮЧЕНЫ" : "АУДИОДАТЧИКИ: ВКЛЮЧЕНЫ";
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