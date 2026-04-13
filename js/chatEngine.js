// --- УНИВЕРСАЛЬНЫЙ ДВИЖОК ТЕРМИНАЛА (V5.2 - EMERGENCY RESET) ---
(function() {
    if (window.chatEngineLoaded) return;
    window.chatEngineLoaded = true;

    window.currentChatStep = 0;
    let isTyping = false;
    let lastEmergencyState = null; // Для отслеживания смены режима

    // Функция получения активной базы сообщений
    function getActiveData() {
        const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
        
        // СБРОС: Если режим изменился с момента последней проверки
        if (isEmergency !== lastEmergencyState) {
            window.currentChatStep = 0; // Начинаем диалог заново
            lastEmergencyState = isEmergency;
        }

        const normalChat = window.roomChat || [];
        const emergencyChat = [
            { q: "> ДИАГНОСТИКА СИСТЕМ", a: "КРИТИЧЕСКИЙ УРОВЕНЬ ИОНИЗАЦИИ. КОРПУС ПЕРЕГРЕТ. МАГНИТНЫЕ ЩИТЫ ОТКЛЮЧЕНЫ." },
            { q: "> КАК ОСТАНОВИТЬ СБОЙ?", a: "НЕОБХОДИМА СТАБИЛИЗАЦИЯ ОРБИТЫ. СЧИТАЙТЕ КОД ИЗ ТЕЛЕМЕТРИИ ВЕКТОРА И ВВЕДИТЕ В ТЕРМИНАЛ." },
            { q: "> ВРЕМЯ ДО РАЗРУШЕНИЯ?", a: "ДАННЫЕ ПОВРЕЖДЕНЫ. ТРЕБУЕТСЯ НЕМЕДЛЕННАЯ КОРРЕКЦИЯ КУРСА." }
        ];
        
        return isEmergency ? emergencyChat : normalChat;
    }

    function playTypeSound() {
        if (typeof audioCtx === 'undefined' || !audioCtx || (typeof isMuted !== 'undefined' && isMuted)) return;
        try {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(12000 + Math.random() * 800, audioCtx.currentTime);
            g.gain.setValueAtTime(0.008, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.01);
            osc.connect(g).connect(masterGain);
            osc.start(); osc.stop(audioCtx.currentTime + 0.01);
        } catch(e) {}
    }

    window.updateQuestion = function() {
        const qField = document.getElementById('quest-field');
        const aField = document.getElementById('answer-field');
        const container = document.querySelector('.chat-system');
        if (!qField || !aField) return;

        const data = getActiveData();

        if (window.currentChatStep < data.length) {
            aField.innerText = "";
            qField.innerText = data[window.currentChatStep].q;
            qField.style.opacity = "1";
            qField.style.cursor = "pointer";
            if (container) container.classList.remove('chat-fade-out');
            isTyping = false;
        } else {
            const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
            qField.innerText = isEmergency ? "> КРИТИЧЕСКИЙ ОТКАЗ СИСТЕМЫ" : "> ИНФОРМАЦИЯ ОТСУТСТВУЕТ";
            aField.innerText = "";
            qField.style.opacity = "0.4";
            qField.style.cursor = "default";
        }
    };

    window.handleChatClick = function() {
        const data = getActiveData();
        if (isTyping || window.currentChatStep >= data.length) return;
        
        isTyping = true;
        const aField = document.getElementById('answer-field');
        const text = data[window.currentChatStep].a;
        let charIdx = 0;
        
        aField.innerText = "";

        const interval = setInterval(() => {
            if (charIdx < text.length) {
                const char = text[charIdx];
                aField.innerText += char;
                if (char !== " ") playTypeSound();
                charIdx++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    const container = document.querySelector('.chat-system');
                    if (container) container.classList.add('chat-fade-out');
                    setTimeout(() => {
                        window.currentChatStep++;
                        window.updateQuestion();
                    }, 1000);
                }, 3000);
            }
        }, 50);
    };

    // ГЛОБАЛЬНЫЙ МОНИТОРИНГ: Следим за localStorage, чтобы чат обновился мгновенно
    window.addEventListener('storage', (e) => {
        if (e.key === 's9_emergency_flag') {
            window.updateQuestion();
        }
    });

    // Периодическая проверка (на случай если storage event не сработал на той же вкладке)
    setInterval(() => {
        const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
        if (isEmergency !== lastEmergencyState) {
            window.updateQuestion();
        }
    }, 500);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.updateQuestion);
    } else {
        window.updateQuestion();
    }
})();
