// js/audioEngine.js
window.audioCtx = null;
window.masterGain = null;
window.noiseSource = null;
window.glyphGainNode = null;
window.isMuted = false;

window.toggleAudio = () => {
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        window.masterGain = window.audioCtx.createGain();
        window.masterGain.connect(window.audioCtx.destination);
        
        const bufferSize = 2 * window.audioCtx.sampleRate;
        const noiseBuffer = window.audioCtx.createBuffer(1, bufferSize, window.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        
        window.noiseSource = window.audioCtx.createBufferSource();
        window.noiseSource.buffer = noiseBuffer;
        window.noiseSource.loop = true;
        
        const filter = window.audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 60;
        
        const noiseGain = window.audioCtx.createGain();
        noiseGain.gain.value = 0.05; 
        
        window.noiseSource.connect(filter).connect(noiseGain).connect(window.masterGain);
        window.noiseSource.start();

        window.isMuted = false;
        window.masterGain.gain.setValueAtTime(1.0, window.audioCtx.currentTime);
    } else {
        window.isMuted = !window.isMuted;
        window.masterGain.gain.setTargetAtTime(window.isMuted ? 0 : 1.0, window.audioCtx.currentTime, 0.1);
    }
};

window.playGlyphSound = async (pathIndices) => {
    if (!window.audioCtx || window.isMuted || window.isSignalLoss) return; 
    
    if (window.glyphGainNode) {
        const prevGain = window.glyphGainNode;
        prevGain.gain.exponentialRampToValueAtTime(0.0001, window.audioCtx.currentTime + 0.05);
        setTimeout(() => prevGain.disconnect(), 60);
    }
    window.glyphGainNode = window.audioCtx.createGain();
    window.glyphGainNode.connect(window.masterGain);
    let currentTime = window.audioCtx.currentTime;
    
    for (let i = 0; i < pathIndices.length - 1; i++) {
        const p1 = POINTS[pathIndices[i]], p2 = POINTS[pathIndices[i+1]];
        if (!p1 || !p2) continue;
        const dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y);
        const length = Math.sqrt(dx*dx + dy*dy) / 25;
        let baseFreq = dx === 0 ? 260 : (dy !== 0 ? 220 : 180);
        const step = (length * 0.14) / Math.floor(length * 15 || 1);
        
        for (let g = 0; g < Math.floor(length * 15); g++) {
            const osc = window.audioCtx.createOscillator(), gNode = window.audioCtx.createGain(), filter = window.audioCtx.createBiquadFilter();
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(baseFreq + (Math.random() * 10), currentTime);
            filter.type = 'bandpass'; filter.frequency.setValueAtTime(baseFreq * 2, currentTime); filter.Q.value = 10;
            gNode.gain.setValueAtTime(0, currentTime);
            gNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.005);
            gNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + step * 0.8);
            osc.connect(filter).connect(gNode).connect(window.glyphGainNode);
            osc.start(currentTime); osc.stop(currentTime + step);
            currentTime += step;
        }
        
        const chime = window.audioCtx.createOscillator(), chimeGain = window.audioCtx.createGain();
        chime.type = 'sine'; chime.frequency.setValueAtTime(baseFreq * 4, currentTime);
        chimeGain.gain.setValueAtTime(0.05, currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.05);
        chime.connect(chimeGain).connect(window.glyphGainNode);
        chime.start(currentTime); chime.stop(currentTime + 0.05);
    }
};
// --- ЗВУК МОДЕМА ДЛЯ ОПЕРАЦИОННОЙ СИСТЕМЫ ---
window.osModemInterval = null;

window.startOsModemSound = () => {
    // Если звук уже запущен или аудио не инициализировано — выходим
    if (window.osModemInterval || !window.audioCtx || window.isMuted) return;

    // Создаем генератор для модемного писка
    const beep = () => {
        if (!window.audioCtx || window.isMuted) return;
        
        const time = window.audioCtx.currentTime;
        
        // Основной тон (высокочастотный писк)
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        const filter = window.audioCtx.createBiquadFilter();
        
        osc.type = 'square'; // Квадратная волна для резкости
        osc.frequency.setValueAtTime(1200, time); // Частота писка
        osc.frequency.exponentialRampToValueAtTime(800, time + 0.1); // Небольшое скольжение
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, time);
        filter.Q.value = 5;
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.03, time + 0.01); // Громкость писка
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15); // Затухание
        
        osc.connect(filter).connect(gain).connect(window.masterGain);
        osc.start(time);
        osc.stop(time + 0.15);
    };

    // Воспроизводим писк каждые 3 секунды
    window.osModemInterval = setInterval(beep, 3000);
};

window.stopOsModemSound = () => {
    if (window.osModemInterval) {
        clearInterval(window.osModemInterval);
        window.osModemInterval = null;
    }
};
