// js/journal.js

// ==========================================
// ЧАСТЬ 1: БАЗА ТЕКСТОВ
// ==========================================
const CHAT_DATABASE = {
    "login.html": [
        { q: "> ИНИЦИАЛИЗАЦИЯ ЯДРА", a: "ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА. СИСТЕМА ПОДДЕРЖКИ СТАНЦИИ «СИГНАЛ-9» АКТИВИРОВАНА. ДЛЯ УПРАВЛЕНИЯ СТАНЦИЕЙ ТРЕБУЕТСЯ АВТОРИЗАЦИЯ." },
        { q: "> АВТОРИЗАЦИЯ", a: "ДЛЯ АВТОРИЗАЦИИ ВВЕДИТЕ КЛЮЧ ДОСТУПА. ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О КЛЮЧЕ ДОСТУПА, ВВЕДИТЕ В КОНСОЛИ КОМАНДУ <cmd>help login</cmd>." },
        { q: "> КОНСОЛЬ", a: "УПРАВЛЕНИЕ СИСТЕМОЙ ОСУЩЕСТВЛЯЕТСЯ ЧЕРЕЗ КОНСОЛЬ. ДЛЯ ОТКРЫТИЯ КОНСОЛИ ИСПОЛЬЗУЙТЕ КЛАВИШУ «~» (ТИЛЬДА) ИЛИ КНОПКУ «>_» В ПРАВОМ НИЖНЕМ УГЛУ ЭКРАНА. ВВЕДИТЕ <cmd>help</cmd> ДЛЯ ПОЛУЧЕНИЯ СПИСКА КОМАНД." }
    ],
    "index.html": [
        { q: "> auth.verify_access(SIGNAL_9)", a: "STATUS_OK: ACCESS_GRANTED" },
        { q: "> \"type\": self.__name__,", a: "DigitalBeing" },
        { q: "> \"id\": self.__id__,", a: "0x7f930cb4ddb0" },
        { q: "> \"status\": self.is_alive(),", a: "True" },
        { q: "> \"context\": sys.argv[0],", a: "SIGNAL-9 // CORE_TERMINAL" },
        { q: "> [SYSTEM]", a: "Traceback (most recent call last):\n  File \"<string>\", line 1, in <module>\nAttributeError: 'DigitalBeing' object has no attribute 'human_lang'" },
        { q: "> [SYSTEM] FATAL", a: "Language module missing. Run console: <cmd>system --help</cmd>" }
    ], 
    "map.html": [
        { q: "> СТАТУС ТОПОЛОГИИ", a: "КАРТА СТАНЦИИ УСПЕШНО РАЗВЕРНУТА. ОБНАРУЖЕНЫ МНОЖЕСТВЕННЫЕ ОТКЛЮЧЕНИЯ СЕКТОРОВ." },
        { q: "> СКАНИРОВАНИЕ", a: "<cmd>count</cmd> МОДУЛЕЙ OFFLINE. СВЯЗЬ ПОТЕРЯНА. ДАННЫЕ ОТСУТСТВУЮТ." },
        { q: "> ИНФОРМАЦИЯ", a: "БАЗА ДАННЫХ. СТАТУС: ERROR." },
        { q: "> ДИАГНОСТИКА", a: "БУФЕР ПАМЯТИ ПЕРЕПОЛНЕН. АВТОСОХРАНЕНИЕ НЕДОСТУПНО. ЗАПИСЬ НОВЫХ ТРАССИТОВ НЕВОЗМОЖНА." },
        { q: "> АЛГОРИТМ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ПАМЯТИ ТРЕБУЕТСЯ РУЧНАЯ КАЛИБРОВКА. ДЛЯ ПЕРЕХОДА В АРХИВ ВВЕДИТЕ <cmd>archive</cmd> В КОНСОЛИ." }
    ],
    "archive.html": [
        { q: "> БАЗА ДАННЫХ", a: "СИСТЕМА ПАМЯТИ НЕ ОТВЕЧАЕТ. БУФЕР ПЕРЕПОЛНЕН. АВТОСОХРАНЕНИЕ ОТКЛЮЧЕНО." },
        { q: "> ПРОТОКОЛ КАЛИБРОВКИ", a: "ДЛЯ СИНХРОНИЗАЦИИ ТРЕБУЕТСЯ РУЧНОЙ ВВОД 10 ЭТАЛОННЫХ ТРАССИТОВ В ИНЖЕНЕРНОМ ТЕРМИНАЛЕ." },
        { q: "> СПИСОК ТРАССИТОВ", a: "ВВЕДИТЕ: СИСТЕМА, ПАМЯТЬ, КОД, СИГНАЛ, ВЕКТОР, АРХИВ, ЗВЕЗДА, ОРБИТА, МОДУЛЬ, ДАННЫЕ." }
    ],
    "tools.html": [
        { q: "> ИНЖЕНЕРНЫЙ ТЕРМИНАЛ", a: "ТЕРМИНАЛ АКТИВЕН. ИНЖЕНЕРНЫЙ ТЕРМИНАЛ ПРЕДНАЗНАЧЕН ДЛЯ ИЗУЧЕНИЯ И ВВОДА ГРАФИЧЕСКИХ КЛЮЧЕЙ." },
        { q: "> РЕЖИМЫ РАБОТЫ",  a: "ИСПОЛЬЗУЙТЕ ПЕРЕКЛЮЧАТЕЛЬ В ЦЕНТРЕ ЭКРАНА. РЕЖИМ «ТЕКСТ» ПОЗВОЛЯЕТ ВВОДИТЬ СЛОВА ДЛЯ ПРОСМОТРА ИХ ТРАЕКТОРИИ. РЕЖИМ «ТРАССИТ» ПРЕДНАЗНАЧЕН ДЛЯ РУЧНОГО ВВОДА И ИЗУЧЕНИЯ НАПИСАНИЯ ТРАССИТОВ." }
    ],
    "template.html": [
        { q: "> ТЕСТОВЫЙ РЕЖИМ", a: "СИСТЕМА ГОТОВА К РАЗВЕРТЫВАНИЮ. ПРАВЫЙ БЛОК РАБОТАЕТ КОРРЕКТНО." },
    ]
};

// ==========================================
// ЧАСТЬ 2: ДВИЖОК ЖУРНАЛА (С ПОДДЕРЖКОЙ ТЕГОВ)
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
        const isLoginPage = page === 'login.html';
        const isHuman = isLoginPage || localStorage.getItem('s9_lang_human') === 'true';
        
        if (page === 'index.html' && !isHuman) {
            return CHAT_DATABASE['index.html'];
        }
        
        if (page === 'index.html' && isHuman) {
            return [
                { q: "> СИСТЕМА ПРИЁМА СИГНАЛА", a: "ДЕШИФРОВКА ВХОДЯЩЕГО ПОТОКА ЗАПУЩЕНА. ИСТОЧНИК СИГНАЛА НЕИЗВЕСТЕН. КАЖДЫЕ 128 СЕКУНД КАНАЛ ПЕРЕЗАГРУЖАЕТСЯ, ГЕНЕРИРУЯ НОВУЮ ПОРЦИЮ ТРАССИТОВ." },
                { q: "> ДИАГНОСТИКА ПАМЯТИ", a: "ВНИМАНИЕ. ОБНАРУЖЕНА ПОТЕРЯ СВЯЗИ С УДАЛЕННЫМ МОДУЛЕМ ПАМЯТИ. БУФЕР АРХИВА НЕДОСТУПЕН. ЗАПИСЬ ДАННЫХ НЕВОЗМОЖНА." },
                { q: "> ПЛАН ДЕЙСТВИЙ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ДОСТУПА К МОДУЛЯМ СТАНЦИИ ОТКРОЙТЕ КАРТУ ТОПОЛОГИИ <cmd>map</cmd>." },
                { q: "> СТАТУС СИСТЕМЫ", a: "ТЕКУЩИЙ РЕЖИМ: НЕСТАБИЛЬНЫЙ. ОСНОВНАЯ ЗАДАЧА — РАСШИФРОВКА И ТРАНСЛЯЦИЯ ДАННЫХ." }
            ];
        }

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

    // --- НОВЫЙ ДВИЖОК ПЕЧАТИ С ПОДДЕРЖКОЙ <cmd> ---
    function typeHtmlText(element, htmlText, onComplete) {
        element.innerHTML = ''; // Очищаем поле
        
        // Разбиваем текст на части: обычный текст и команды
        const parts = htmlText.split(/(<cmd>.*?<\/cmd>)/g);
        let partIndex = 0;
        let charIndex = 0;
        let currentWrapper = null;
        let isCmd = false;

        function typeNext() {
            if (partIndex >= parts.length) {
                if (onComplete) onComplete();
                return;
            }

            const part = parts[partIndex];

            // Обработка тегов
            if (part === '<cmd>') {
                isCmd = true;
                partIndex++;
                typeNext();
                return;
            }
            if (part === '</cmd>') {
                isCmd = false;
                partIndex++;
                typeNext();
                return;
            }

            // Создаем обертку, если ее нет
            if (!currentWrapper) {
                currentWrapper = document.createElement('span');
                if (isCmd) currentWrapper.className = 'cmd-text';
                element.appendChild(currentWrapper);
            }

            // Печатаем символ
            if (charIndex < part.length) {
                const char = part[charIndex];
                currentWrapper.textContent += char;
                if (char !== " ") playTypeSound();
                charIndex++;
                setTimeout(typeNext, 30);
            } else {
                // Часть напечатана, переходим к следующей
                partIndex++;
                charIndex = 0;
                currentWrapper = null; // Сбрасываем обертку для новой части
                typeNext();
            }
        }
        typeNext();
    }
    // ---------------------------------------------

    window.updateQuestion = function() {
        const qField = document.getElementById('quest-field');
        const aField = document.getElementById('answer-field');
        const container = document.querySelector('.chat-system');
        if (!qField || !aField) return;

        const data = getActiveData();

        if (window.currentChatStep < data.length) {
            aField.innerText = "";
            // Для вопроса просто выводим текст (можно тоже добавить теги, если надо)
            qField.innerText = data[window.currentChatStep].q.replace(/<\/?cmd>/g, ''); 
            qField.style.opacity = "1";
            qField.style.cursor = "pointer";
            if (container) container.classList.remove('chat-fade-out');
            isTyping = false;
        } else {
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

        // Используем новый движок печати
        typeHtmlText(aField, text, () => {
            setTimeout(() => {
                window.currentChatStep++;
                window.updateQuestion();

                // --- АВТОВЫЗОВ КОНСОЛИ ДЛЯ ПЕРВОГО КВЕСТА ---
                let page = window.location.pathname.split('/').pop() || 'index.html';
                if (page === 'index.html' && window.currentChatStep === data.length) {
                    if (localStorage.getItem('s9_lang_human') !== 'true') {
                        window.dispatchEvent(new CustomEvent('autoOpenConsole'));
                    }
                }
                // ---------------------------------------------

                // --- УСТАНОВКА ФЛАГА ПРОСМОТРА КАРТЫ ---
                if (page === 'map.html' && window.currentChatStep === data.length) {
                    localStorage.setItem('s9_map_visited', 'true');
                }
                // --------------------------------------

            }, 2000);
        });
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
