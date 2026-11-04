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
        { q: "> [SYSTEM]", a: "Traceback (most recent call last):\n  File \"&lt;string&gt;\", line 1, in &lt;module&gt;\nAttributeError: 'DigitalBeing' object has no attribute 'human_lang'" },
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
        
        // 1. ХАБ (СЫРОЙ РЕЖИМ)
        if (page === 'index.html' && !isHuman) {
            return CHAT_DATABASE['index.html'];
        }
        
        // 2. ХАБ (ОБЫЧНЫЙ РЕЖИМ)
        if (page === 'index.html' && isHuman) {
            return [
                { q: "> СИСТЕМА ПРИЁМА СИГНАЛА", a: "ДЕШИФРОВКА ВХОДЯЩЕГО ПОТОКА ЗАПУЩЕНА. ИСТОЧНИК СИГНАЛА НЕИЗВЕСТЕН. КАЖДЫЕ 128 СЕКУНД КАНАЛ ПЕРЕЗАГРУЖАЕТСЯ, ГЕНЕРИРУЯ НОВУЮ ПОРЦИЮ ТРАССИТОВ." },
                { q: "> ДИАГНОСТИКА ПАМЯТИ", a: "ВНИМАНИЕ. ОБНАРУЖЕНА ПОТЕРЯ СВЯЗИ С УДАЛЕННЫМ МОДУЛЕМ ПАМЯТИ. БУФЕР АРХИВА НЕДОСТУПЕН. ЗАПИСЬ ДАННЫХ НЕВОЗМОЖНА." },
                { q: "> ПЛАН ДЕЙСТВИЙ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ДОСТУПА К МОДУЛЯМ СТАНЦИИ ОТКРОЙТЕ КАРТУ ТОПОЛОГИИ <cmd>map</cmd>." },
                { q: "> СТАТУС СИСТЕМЫ", a: "ТЕКУЩИЙ РЕЖИМ: НЕСТАБИЛЬНЫЙ. ОСНОВНАЯ ЗАДАЧА — РАСШИФРОВКА И ТРАНСЛЯЦИЯ ДАННЫХ." }
            ];
        }

        // 3. АРХИВ
        // --- ЛОГИКА ДЛЯ АРХИВА ---
        if (page === 'archive.html') {
            const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
            const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';

            if (isCalibrated && !isFixed) {
                return [
                    { q: "> КАЛИБРОВКА ЗАВЕРШЕНА", a: "РУЧНАЯ КАЛИБРОВКА ПАМЯТИ ПРОЙДЕНА УСПЕШНО. БУФЕР ГОТОВ К ТЕСТУ АВТОЗАПИСИ." },
                    { q: "> ТЕСТ АВТОЗАПИСИ", a: "ДЛЯ ПОДТВЕРЖДЕНИЯ СТАБИЛЬНОСТИ НЕОБХОДИМО ДОЖДАТЬСЯ ДВУХ НОВЫХ ЦИКЛОВ ДЕШИФРОВКИ СИГНАЛА." },
                    { q: "> СТАТУС ТЕСТА", a: "ОЖИДАНИЕ ПОСТУПЛЕНИЯ НОВЫХ ТРАССИТОВ ИЗ ЭФИРА. СЛЕДИТЕ ЗА ТАЙМЕРОМ ТЕЛЕМЕТРИИ." }
                ];
            }
            
            if (isFixed) {
                return [
                    { q: "> ОТЧЁТ", a: "ПАМЯТЬ СТАБИЛЬНА. АВТОСОХРАНЕНИЕ ТРАССИТОВ АКТИВИРОВАНО." },
                    { q: "> ДИАГНОСТИКА", a: "ЛОКАЛЬНЫЕ СИСТЕМЫ В ФУНКИОНИРУЮТ НОРМАЛЬНО." }
                ];
            }
        }

        // 4. ОПЕРАЦИОННАЯ СИСТЕМА
        if (page === 'os.html') {
            const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';
            const isOsFixed = localStorage.getItem('s9_os_fixed') === 'true';

            if (!isCaptchaPassed) {
                return [
                    { q: "> ЗАЩИТА ПЕРИМЕТРА", a: "ДОСТУП ЗАБЛОКИРОВАН. ТРЕБУЕТСЯ ВЕРИФИКАЦИЯ." },
                    { q: "> ПРОТОКОЛ", a: "ПОЛУЧИТЕ ИДЕНТИФИКАТОР В КОНСОЛИ (<cmd>self --id</cmd>) И ВВЕДИТЕ ЕГО В ПОЛЕ." }
                ];
            }

            if (isCaptchaPassed && !isOsFixed) {
                return [
                    { q: "> ЯДРО РАЗБЛОКИРОВАНО", a: "ОБНАРУЖЕНА ДЕКОГЕРЕНЦИЯ КУБИТОВ." },
                    { q: "> ИНСТРУКЦИЯ", a: "ИСПОЛЬЗУЙТЕ <cmd>os --reset qubit rXcY</cmd> ДЛЯ ПОЧИНКИ." }
                ];
            }

            if (isOsFixed) {
                return [
                    { q: "> ОС СТАБИЛЬНА", a: "ВСЕ КУБИТЫ В НОРМЕ." },
                    { q: "> НОВАЯ УГРОЗА", a: "ОБНАРУЖЕНЫ ПРИЗРАКИ В EDR. ПРОВЕРЬТЕ КАРТУ." }
                ];
            }
        }

        // Стандартный вывод для остальных страниц
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
        element.innerHTML = ''; 
        
        // Создаем временный контейнер для парсинга HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;

        const nodes = Array.from(tempDiv.childNodes);
        let nodeIndex = 0;
        let charIndex = 0;
        let currentWrapper = null;
        let currentNodeText = '';

        function typeNextChar() {
            if (nodeIndex >= nodes.length) {
                if (onComplete) onComplete();
                return;
            }

            const node = nodes[nodeIndex];
            
            // Если обертка еще не создана для текущего узла
            if (!currentWrapper) {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Обычный текст
                    currentWrapper = document.createElement('span');
                    element.appendChild(currentWrapper);
                } else if (node.nodeName.toLowerCase() === 'cmd') {
                    // Команда (внутри тега <cmd>)
                    currentWrapper = document.createElement('span');
                    currentWrapper.className = 'cmd-text'; // Применяем неоновый стиль
                    element.appendChild(currentWrapper);
                } else {
                    // Неизвестный тег, пропускаем
                    nodeIndex++;
                    typeNextChar();
                    return;
                }
                currentNodeText = node.textContent;
                charIndex = 0;
            }

            // Печатаем символы
            if (charIndex < currentNodeText.length) {
                const char = currentNodeText[charIndex];
                currentWrapper.textContent += char;
                if (char !== " ") playTypeSound();
                charIndex++;
                setTimeout(typeNextChar, 30);
            } else {
                // Узел напечатан, переходим к следующему
                nodeIndex++;
                currentWrapper = null;
                typeNextChar();
            }
        }

        if (nodes.length > 0) typeNextChar();
        else if (onComplete) onComplete();
    }

    window.updateQuestion = function() {
        const qField = document.getElementById('quest-field');
        const aField = document.getElementById('answer-field');
        const container = document.querySelector('.chat-system');
        if (!qField || !aField) return;

        // --- СБРОС ШАГА ПРИ ИЗМЕНЕНИИ ФЛАГА АРХИВА ---
        let page = window.location.pathname.split('/').pop() || 'index.html';
        if (page === 'archive.html') {
            const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';
            if (window.lastArchiveFixedState !== isFixed) {
                window.currentChatStep = 0;
                window.lastArchiveFixedState = isFixed;
            }
        }
        // ---------------------------------------------

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
