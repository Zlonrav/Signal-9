// js/journal.js

// ==========================================
// ЧАСТЬ 1: БАЗА ТЕКСТОВ
// ==========================================
const CHAT_DATABASE = {
    "login.html": [
        { q: "> ИНИЦИАЛИЗАЦИЯ ЯДРА", a: "ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА. СИСТЕМА ПОДДЕРЖКИ СТАНЦИИ «СИГНАЛ-9» АКТИВИРОВАНА. ДЛЯ УПРАВЛЕНИЯ СТАНЦИЕЙ ТРЕБУЕТСЯ АВТОРИЗАЦИЯ." },
        { q: "> АВТОРИЗАЦИЯ", a: "ДЛЯ АВТОРИЗАЦИИ ВВЕДИТЕ КЛЮЧ ДОССТУПА. ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О КЛЮЧЕ ДОСТУПА, ВВЕДИТЕ В КОНСОЛИ КОМАНДУ «HELP LOGIN»." },
        { q: "> КОНСОЛЬ", a: "УПРАВЛЕНИЕ СИСТЕМОЙ ОСУЩЕСТВЛЯЕТСЯ ЧЕРЕЗ КОНСОЛЬ. ДЛЯ ОТКРЫТИЯ КОНСОЛИ ИСПОЛЬЗУЙТЕ КЛАВИШУ «~» (ТИЛЬДА) ИЛИ КНОПКУ «>_» В ПРАВОМ НИЖНЕМ УГЛУ ЭКРАНА. ВВЕДИТЕ «HELP» ДЛЯ ПОЛУЧЕНИЯ СПИСКА КОМАНД." },
    ],
    "index.html": [
        { q: "> ИНИЦИАЛИЗАЦИЯ ЯДРА", a: "ЗАГРУЗКА СИСТЕМ ПОДДЕРЖКИ ЗАВЕРШЕНА. НОВЫЙ ПРОГРАММНЫЙ МОДУЛЬ АКТИВИРОВАН." },
        { q: "> ЧТО ТАКОЕ ТРАССИТ?", a: "ТРАССИТ — ЭТО МАТЕМАТИЧЕСКИЙ СЛЕД ГЛИФА. КАЖДОЕ ТРАССИТ ИМЕЕТ УНИКАЛЬНУЮ ГЕОМЕТРИЧЕСКУЮ ТРАЕКТОРИЮ И УНИКАЛЬНОЕ ЗВУЧАНИЕ." },
        { q: "> КАК ЗВУЧИТ ТРАССИТ?", a: "ИСТИННЫЙ ЗВУК КАЖДОГО ТРАССИТА МОЖНО УСЛЫШАТЬ В ИНЖЕНЕРНОМ ТЕРМИНАЛЕ ПРИ УСЛОВИИ ЕГО ПРАВИЛЬНОГО ВВОДА." },
        { q: "> ЧТО ТАКОЕ ГЛИФ?", a: "ГЛИФ — ЭТО ЕДИНИЦА ПЕРЕДАЧИ ДАННЫХ В СЕТИ СИГНАЛ-9. ГЛИФ ЗАМЕЩАЕТ ТЕКСТ ДЛЯ ЗАЩИТЫ ОТ ПЕРЕХВАТА В ХАБЕ." },
        { q: "> СТАТУС ДЕШИФРОВКИ?", a: "ТЕКУЩИЙ ЦИКЛ ДЕШИФРОВКИ ЗАНИМАЕТ 110 СЕКУНД. ПО ИСТЕЧЕНИИ ЭТОГО ВРЕМЕНИ КАНАЛ ПЕРЕЗАГРУЖАЕТСЯ." },
        { q: "> ОТ КОГО ПОСТУПАЮТ ДАННЫЕ?", a: "ЭТО НЕИЗВЕСТНО." },
        { q: "> ДОСТУП К КОНСОЛИ", a: "ДЛЯ УПРАВЛЕНИЯ СИСТЕМОЙ ОТКРОЙТЕ КОНСОЛЬ КЛАВИШЕЙ «~» ИЛИ КНОПКОЙ «>_»." },
        { q: "> КАК ПРОЙТИ АВТОРИЗАЦИЮ", a: "ДЛЯ ПОЛУЧЕНИЯ ИНСТРУКЦИИ ВВЕДИТЕ В КОНСОЛИ КОМАНДУ «HELP LOGIN»." }
    ],
    "map.html": [
        { q: "> СТАТУС ТОПОЛОГИИ", a: "КАРТА СТАНЦИИ ЧАСТИЧНО ВОССТАНОВЛЕНА. ОБНАРУЖЕНЫ ОТКЛЮЧЕННЫЕ СЕКТОРА." },
        { q: "> С ЧЕГО НАЧАТЬ?", a: "В МОДУЛЕ БАЗЫ ДАННЫХ СБОЙ ПАМЯТИ. ТРЕБУЕТСЯ РУЧНАЯ КАЛИБРОВКА." }
    ],
    "reactor.html": [
        { q: "> СТАТУС ЭНЕРГОЯДРА", a: "СИСТЕМА СТАБИЛЬНА. ОЖИДАНИЕ КОМАНД СКАНИРОВАНИЯ." }
    ],
    "archive.html": [
        { q: "> БАЗА ДАННЫХ", a: "ОШИБКА БУФЕРА. АВТОСОХРАНЕНИЕ ОТКЛЮЧЕНО." }
    ],
    "tools.html": [
        { q: "> ИНЖЕНЕРНЫЙ ТЕРМИНАЛ", a: "ТЕРМИНАЛ АКТИВЕН. ИНЖЕНЕРНЫЙ ТЕРМИНАЛ ПРЕДНАЗНАЧЕН ДЛЯ ИЗУЧЕНИЯ И ВВОДА ГРАФИЧЕСКИХ КЛЮЧЕЙ." },
        { q: "> РЕЖИМЫ РАБОТЫ",  a: "ИСПОЛЬЗУЙТЕ ПЕРЕКЛЮЧАТЕЛЬ В ЦЕНТРЕ ЭКРАНА. РЕЖИМ «ТЕКСТ» ПОЗВОЛЯЕТ ВВОДИТЬ СЛОВА ДЛЯ ПРОСМОТРА ИХ ТРАЕКТОРИИ. РЕЖИМ «ТРАССИТ» ПРЕДНАЗНАЧЕН ДЛЯ РУЧНОГО ВВОДА И ИЗУЧЕНИЯ НАПИСАНИЯ ТРАССИТОВ." }
    ],
    "template.html": [
        { q: "> ТЕСТОВЫЙ РЕЖИМ", a: "СИСТЕМА ГОТОВА К РАЗВЕРТЫВАНИЮ. ПРАВЫЙ БЛОК РАБОТАЕТ КОРРЕКТНО." },
    ],
};

// ==========================================
// ЧАСТЬ 2: ДВИЖОК ЖУРНАЛА
// ==========================================
(function() {
    if (window.journalLoaded) return;
    window.journalLoaded = true;

    window.currentChatStep = 0;
    let isTyping = false;
    let lastEmergencyState = null; 

    function getActiveData() {
        const isEmergency = localStorage.getItem('s9_emergency_flag') === 'active';
        
        if (isEmergency !== lastEmergencyState) {
            window.currentChatStep = 0;
            lastEmergencyState = isEmergency;
        }

        if (isEmergency) {
            return [
                { q: "> ДИАГНОСТИКА СИСТЕМ", a: "КРИТИЧЕСКИЙ УРОВЕНЬ ИОНИЗАЦИИ. КОРПУС ПЕРЕГРЕТ. МАГНИТНЫЕ ЩИТЫ ОТКЛЮЧЕНЫ." },
                { q: "> ЧТО ДЕЛАТЬ?", a: "ИСПОЛЬЗУЙТЕ КОНСОЛЬ УПРАВЛЕНИЯ (ТИЛЬДА). НАЙДИТЕ ПОВРЕЖДЕННЫЙ МОДУЛЬ." }
            ];
        }

        let page = window.location.pathname.split('/').pop() || 'index.html';
        return (typeof CHAT_DATABASE !== 'undefined' && CHAT_DATABASE[page]) 
               ? CHAT_DATABASE[page] 
               : [{ q: "> СИСТЕМА", a: "ИНФОРМАЦИЯ ДЛЯ ЭТОЙ СТРАНИЦЫ ОТСУТСТВУЕТ." }];
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
            // ЖУРНАЛ ПРОЧИТАН - ПОКАЗЫВАЕМ КНОПКУ
            qField.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; opacity: 0.7;">
                    <span>> ЖУРНАЛ ПРОЧИТАН</span>
                    <button onclick="resetChat()" style="
                        background: rgba(0, 242, 255, 0.05); 
                        border: 1px solid rgba(0, 242, 255, 0.4); 
                        color: var(--neon); 
                        font-family: 'JetBrains Mono', monospace; 
                        font-size: 9px; 
                        padding: 4px 8px; 
                        cursor: pointer; 
                        text-transform: uppercase; 
                        letter-spacing: 1px;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(0, 242, 255, 0.2)'; this.style.boxShadow='0 0 10px var(--neon)'" 
                       onmouseout="this.style.background='rgba(0, 242, 255, 0.05)'; this.style.boxShadow='none'">
                        [ ОБНОВИТЬ ]
                    </button>
                </div>
            `;
            aField.innerHTML = "";
            qField.style.cursor = "default";
        }
    };

    window.resetChat = function() {
        window.currentChatStep = 0;
        window.updateQuestion();
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
                
                // --- УСТАНОВКА ФЛАГА ПРОСМОТРА КАРТЫ ---
                let page = window.location.pathname.split('/').pop() || 'index.html';
                if (page === 'map.html' && window.currentChatStep === data.length - 1) {
                    localStorage.setItem('s9_map_visited', 'true');
                    // Перерисовываем карту, чтобы снять блокировку, если нужно
                    if (typeof buildMap === 'function') {
                         // Если функция доступна в глобальной области видимости
                         window.dispatchEvent(new Event('mapVisited'));
                    }
                }
                // --------------------------------------

                setTimeout(() => {
                    window.currentChatStep++;
                    window.updateQuestion();
                }, 2000);
            }
        }, 30);
    };

    window.addEventListener('storage', (e) => {
        if (e.key === 's9_emergency_flag') {
            window.updateQuestion();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.updateQuestion);
    } else {
        window.updateQuestion();
    }
})();
