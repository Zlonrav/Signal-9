// js/journal.js

// ==========================================
// ЧАСТЬ 1: БАЗА ТЕКСТОВ
// ==========================================
const CHAT_DATABASE = {
    "login.html": [
        { q: "> ИНИЦИАЛИЗАЦИЯ ЯДРА", a: "ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА. СИСТЕМА ПОДДЕРЖКИ СТАНЦИИ «СИГНАЛ-9» АКТИВИРОВАНА. ДЛЯ УПРАВЛЕНИЯ СТАНЦИЕЙ ТРЕБУЕТСЯ АВТОРИЗАЦИЯ." },
        { q: "> АВТОРИЗАЦИЯ", a: "ДЛЯ АВТОРИЗАЦИИ ВВЕДИТЕ КЛЮЧ ДОСТУПА. ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О КЛЮЧЕ ДОСТУПА, ВВЕДИТЕ В КОНСОЛИ КОМАНДУ <cmd>help login</cmd>." },
        { q: "> КОНСОЛЬ", a: "УПРАВЛЕНИЕ СИСТЕМОЙ ОСУЩЕСТВЛЯЕТСЯ ЧЕРЕЗ КОНСОЛЬ. ДЛЯ ОТКРЫТИЯ КОНСОЛИ ИСПОЛЬЗУЙТЕ КЛАВИШУ <cmd>«~»</cmd> (ТИЛЬДА) ИЛИ КНОПКУ <cmd>«>_»</cmd> В ПРАВОМ НИЖНЕМ УГЛУ ЭКРАНА. ВВЕДИТЕ <cmd>help</cmd> ДЛЯ ПОЛУЧЕНИЯ СПИСКА КОМАНД." }
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
    "template.html": [
        { q: "> ТЕСТОВЫЙ РЕЖИМ", a: "СИСТЕМА ГОТОВА К РАЗВЕРТЫВАНИЮ. ПРАВЫЙ БЛОК РАБОТАЕТ КОРРЕКТНО." },
    ]
};

// ==========================================
// ЧАСТЬ 2: ДВИЖОК ЖУРНАЛА
// ==========================================
(function() {
    if (window.journalLoaded) return;
    window.journalLoaded = true;

    window.currentChatStep = 0;
    let isTyping = false;
	let lastCoreStatus = 'WAIT';

    function getActiveData() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const isLoginPage = page === 'login.html';
        const isHuman = isLoginPage || localStorage.getItem('s9_lang_human') === 'true';

        if (page === 'index.html' && !isHuman) return CHAT_DATABASE['index.html'];
        
        if (page === 'index.html' && isHuman) {
            return [
                { q: "> СТАТУС СИСТЕМЫ", a: "ТЕКУЩИЙ РЕЖИМ: НЕСТАБИЛЬНЫЙ. ОСНОВНАЯ ЗАДАЧА — РАСШИФРОВКА И ТРАНСЛЯЦИЯ ДАННЫХ." },
                { q: "> СТАТУС ПРИЁМА СИГНАЛА", a: "ДЕШИФРОВКА ВХОДЯЩЕГО ПОТОКА ЗАПУЩЕНА. ИСТОЧНИК СИГНАЛА НЕИЗВЕСТЕН. ГЕНЕРАЦИЯ ТРАССИТОВ КАЖДЫЙ 128 СЕКУНД." },
                { q: "> ДИАГНОСТИКА ПАМЯТИ", a: "ВНИМАНИЕ. ОБНАРУЖЕНА ПОТЕРЯ СВЯЗИ С УДАЛЕННЫМ МОДУЛЕМ ПАМЯТИ. БУФЕР АРХИВА НЕДОСТУПЕН. ЗАПИСЬ ДАННЫХ НЕВОЗМОЖНА." },
                { q: "> АЛГОРИТМ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ДОСТУПА К МОДУЛЯМ СТАНЦИИ ОТКРОЙТЕ КАРТУ ТОПОЛОГИИ. КОМАНДА <cmd>map</cmd>" },
            ];
        }

        if (page === 'map.html') {
            const osFixed = localStorage.getItem('s9_os_fixed') === 'true';
            const archiveFixed = localStorage.getItem('s9_archive_fixed') === 'true';
            const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
            const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';

            if (archiveFixed && !osFixed) {
                return [
                    { q: "> СТАТУС ТОПОЛОГИИ", a: "БАЗА ДАННЫХ ВОССТАНОВЛЕНА. ОБНАРУЖЕН СБОЙ ОПЕРАЦИОННОЙ СИСТЕМЫ." },
                    { q: "> ДИАГНОСТИКА", a: "ЗАФИКСИРОВАНА ДЕКОГЕРЕНЦИЯ КУБИТОВ В МОДУЛЕ ОС." },
                    { q: "> РЕШЕНИЕ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ СИСТЕМЫ ПЕРЕЙДИТЕ В МОДУЛЬ ОС." }
                ];
            }

            if (osFixed && !coreOverheated && !coreFixed) {
                return [
                    { q: "> СТАТУС ТОПОЛОГИИ", a: "КАРТА РАЗВЕРНУТА. ОБНАРУЖЕНЫ ОТКЛЮЧЕНИЯ." },
                    { q: "> ДИАГНОСТИКА ЯДРА", a: "ПОСЛЕ РЕМОНТА ОС НАГРУЗКА НА ЯДРО ВОЗРОСЛА." },
                    { q: "> ВНИМАНИЕ", a: "ЗАФИКСИРОВАН ПЕРИОД ОХЛАЖДЕНИЯ. НЕОБХОДИМО 64 СЕКУНДЫ." },
                    { q: "> ПРОГНОЗ", a: "ЕСЛИ НЕ НАЧАТЬ КАЛИБРОВКУ, ЯДРО УЙДЕТ В ПЕРЕГРУЗКУ." },
                    { q: "> СИСТЕМА", a: "ОЖИДАНИЕ АВАРИЙНОГО СИГНАЛА. КОМАНДА CORE ПОКА НЕДОСТУПНА." }
                ];
            }

            if (coreOverheated && !coreFixed) {
                return [
                    { q: "> КРИТИЧЕСКАЯ ОШИБКА", a: "ЭНЕРГОЯДРО ПЕРЕГРУЖЕНО. МАГНИТЫ РАЗБАЛАНСИРОВАНЫ." },
                    { q: "> АВАРИЙНЫЙ ПРОТОКОЛ", a: "ТРЕБУЕТСЯ РУЧНАЯ СТАБИЛИЗАЦИЯ ЯДРА." },
                    { q: "> ДОСТУП", a: "ПЕРЕЙДИТЕ В МОДУЛЬ ЭНЕРГОЯДРО." }
                ];
            }

            if (coreFixed) {
                return [
                    { q: "> СТАТУС ТОПОЛОГИИ", a: "КАРТА СТАБИЛЬНА. ВСЕ ОСНОВНЫЕ СИСТЕМЫ В НОРМЕ." },
                    { q: "> ЭНЕРГОЯДРО", a: "СТАБИЛЬНО. ВЫРАБОТКА 100%." },
                    { q: "> ТЕЛЕМЕТРИЯ", a: "ПИТАНИЕ ПОДАНО. МОДУЛЬ ДОСТУПЕН." }
                ];
            }
            return CHAT_DATABASE[page] || [{ q: "> СИСТЕМА", a: "ИНФОРМАЦИЯ ОТСУТСТВУЕТ." }];
        }

        if (page === 'tools.html') {
            const isAccessGranted = localStorage.getItem('s9_access_granted') === 'true';
            
            if (!isAccessGranted) {
                return [
                    { q: "> ИНЖЕНЕРНЫЙ ТЕРМИНАЛ", a: "ТЕРМИНАЛ АКТИВЕН. ВВЕДИТЕ ЗАПРОС." },
                    { q: "> КЛЮЧ ДОСТУПА", a: "ДЛЯ ПОЛУЧЕНИЯ ДОСТУПА СГЕНЕРИРУЙТЕ ГРАФИЧЕСКИЙ КЛЮЧ. ВВЕДИТЕ СЛОВО <cmd>ТРАССИТ</cmd> В ПОЛЕ ТЕКСТА. ИЗУЧИТЕ ПОЛУЧЕННУЮ ТРАЕКТОРИЮ." },
                    { q: "> АВТОРИЗАЦИЯ", a: "ПОСЛЕ ИЗУЧЕНИЯ КЛЮЧА ПЕРЕЙДИТЕ НА ЭКРАН ВХОДА. ВВЕДИТЕ <cmd>login</cmd> В КОНСОЛИ ДЛЯ АВТОРИЗАЦИИ." }
                ];
            }

            const isTraining = localStorage.getItem('s9_archive_training') === 'true';
            const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
            const isSuccessRead = localStorage.getItem('s9_read_success_tools') === 'true';

            if (isTraining) {
                return [
                    { q: "> РЕЖИМ ОБУЧЕНИЯ", a: "ТЕРМИНАЛ ПЕРЕВЕДЁН В РЕЖИМ ОБУЧЕНИЯ." },
                    { q: "> ЗАДАЧА", a: "ДЛЯ КАЛИБРОВКИ АРХИВА ВВЕДИТЕ ЭТАЛОННЫЕ ГЛИФЫ. ИСПОЛЬЗУЙТЕ РЕЖИМ «ТЕКСТ», ЧТОБЫ УВИДЕТЬ ТРАЕКТОРИЮ, И РЕЖИМ «ТРАССИТ», ЧТОБЫ ЕЁ ПОВТОРИТЬ." },
                    { q: "> СПИСОК СЛОВ", a: "ХАБ, ГЛИФ, ПУЛЬТ, СЕРВЕР, КОНСОЛЬ. (ВАЖНО: ГЛИФЫ ЗАСЧИТЫВАЮТСЯ ТОЛЬКО В РЕЖИМЕ РИСОВАНИЯ)." }
                ];
            }

            if (isCalibrated && !isSuccessRead) {
                return [
                    { q: "> ОБУЧЕНИЕ ЗАВЕРШЕНО", a: "АВТОСОХРАНЕНИЕ АРХИВА ВОССТАНОВЛЕНО. БАЗОВАЯ ФРАЗА ЗАПИСАНА В БУФЕР." },
                    { q: "> АЛГОРИТМ", a: "ПЕРЕЙДИТЕ В АРХИВ, ЧТОБЫ ЗАФИКСИРОВАТЬ ЗАГРУЗКУ ОСТАЛЬНЫХ ПАРТИЙ ГЛИФОВ, КОМАНДА <cmd>archive</cmd>." }
                ];
            }

            // Простой
            return [
                { q: "> ИНЖЕНЕРНЫЙ ТЕРМИНАЛ", a: "СТАТУС: АКТИВЕН. СИСТЕМА ОЖИДАЕТ КОМАНД." },
                { q: "> ДИАГНОСТИКА", a: "ИСПОЛЬЗУЙТЕ КОНСОЛЬ <cmd>(~)</cmd> ДЛЯ ВВОДА СИСТЕМНЫХ КОМАНД. ВВЕДИТЕ <cmd>help</cmd> ДЛЯ ПОЛУЧЕНИЯ СПИСКА ДОСТУПНЫХ ДЕЙСТВИЙ." }
            ];
        }

        if (page === 'archive.html') {
            const isCalibrated = localStorage.getItem('s9_archive_calibrated') === 'true';
            const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';
            const isSuccessRead = localStorage.getItem('s9_read_success_archive') === 'true';

            // 1. Архив сломан (требуется обучение)
            if (!isCalibrated && !isFixed) {
                return [
                    { q: "> СТАТУС БУФЕРА", a: "СИСТЕМА ПАМЯТИ НЕ ОТВЕЧАЕТ. БУФЕР ПЕРЕПОЛНЕН. АВТОСОХРАНЕНИЕ ОТКЛЮЧЕНО." },
                    { q: "> АЛГОРИТМ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ АВТОСОХРАНЕНИЯ ПЕРЕЙДИТЕ В ИНЖЕНЕРНЫЙ ТЕРМИНАЛ, КОМАНДА <cmd>terminal</cmd>. ЗАПУСТИТЕ ПРОТОКОЛ ОБУЧЕНИЯ АРХИВА, КОМАНДА <cmd>help archive</cmd>" }
                ];
            }

            // 2. Архив калиброван, но ждет накопления данных
            if (isCalibrated && !isFixed) {
                return [
                    { q: "> КАЛИБРОВКА ЗАВЕРШЕНА", a: "РУЧНАЯ КАЛИБРОВКА ПАМЯТИ ПРОЙДЕНА УСПЕШНО. БУФЕР ГОТОВ К ТЕСТУ АВТОЗАПИСИ." },
                    { q: "> ТЕСТ АВТОЗАПИСИ", a: "ДЛЯ ПОДТВЕРЖДЕНИЯ СТАБИЛЬНОСТИ НЕОБХОДИМО ДОЖДАТЬСЯ ДВУХ НОВЫХ ЦИКЛОВ ДЕШИФРОВКИ СИГНАЛА." },
                    { q: "> СТАТУС ТЕСТА", a: "ОЖИДАНИЕ ПОСТУПЛЕНИЯ НОВЫХ ТРАССИТОВ ИЗ ЭФИРА. СЛЕДИТЕ ЗА ТАЙМЕРОМ ТЕЛЕМЕТРИИ." }
                ];
            }
            
            if (isFixed) {
                if (!isSuccessRead) {
                    return [
                        { q: "> ОТЧЁТ", a: "НАКОПИТЕЛЬНЫЙ БУФЕР СТАБИЛЕН, АВТОСОХРАНЕНИЕ АКТИВИРОВАНО." },
                        { q: "> ДИАГНОСТИКА", a: "СЕКТОР ВЕРИФИКАЦИИ ОЖИДАЕТ ПОЛУЧЕНИЯ КЛЮЧ-ПАРОЛЯ ОТ ГЛАВНОГО ХАБА СЕТИ «СИГНАЛ-0»." }
                    ];
                }
                return [
                    { q: "> СТАТУС АРХИВА", a: "БУФЕР РАБОТАЕТ В ШТАТНОМ РЕЖИМЕ." },
                    { q: "> СЕКТОР ВЕРИФИКАЦИИ", a: "ОЖИДАНИЕ КЛЮЧ-ПАРОЛЯ ДЛЯ ДЕШИФРОВКИ СИГНАЛА." }
                ];
            }
        }

        if (page === 'os.html') {
            const isCaptchaPassed = localStorage.getItem('s9_os_captcha') === 'true';

            if (!isCaptchaPassed) {
                return [
                    { q: "> ЗАЩИТА ПЕРИМЕТРА", a: "ДОСТУП ЗАБЛОКИРОВАН. МОДУЛЬ КВАНТОВЫХ ВЫЧИСЛЕНИЙ ИЗОЛИРОВАН." },
                    { q: "> АЛГОРИТМ", a: "НЕОБХОДИМА АВТОРИЗАЦИЯ. КОМАНДА <cmd>self --id</cmd> В КОНСОЛИ." }
                ];
            }

            const qubitsData = JSON.parse(localStorage.getItem('s9_os_qubits_data') || '{}');
            let broken = 0, warning = 0, ent = 0;

            if (qubitsData && qubitsData[1]) {
                for (let l = 1; l <= 5; l++) {
                    for (let r = 1; r <= 5; r++) {
                        for (let c = 1; c <= 5; c++) {
                            const state = qubitsData[l]?.[r]?.[c]?.state;
                            if (state === 'broken') broken++;
                            if (state === 'warning') warning++;
                            if (state === 'entangled') ent++;
                        }
                    }
                }
            }

            if (broken === 0 && warning === 0 && ent === 0) {
                return [
                    { q: "> ОС СТАБИЛЬНА", a: "ВСЕ КУБИТЫ В РАБОЧЕМ СОСТОЯНИИ." }
                ];
            }

            const msgs = [];
            msgs.push({ q: "> ЯДРО РАЗБЛОКИРОВАНО", a: `ОБНАРУЖЕНА ДЕКОГЕРЕНЦИЯ: ${broken} СЛОМАННЫХ, ${warning} В ПРЕДУПРЕЖДЕНИИ, ${ent} ЗАПУТАННЫХ.` });
            
            if (broken > 0) {
                msgs.push({ q: "> СЛОМАННЫЕ", a: "ИСПОЛЬЗУЙТЕ <cmd>os --reset qubit LxRxCx</cmd>." });
            }
            if (warning > 0) {
                msgs.push({ q: "> ВАРНИНГ", a: "ИСПОЛЬЗУЙТЕ <cmd>os --warn qubit LxRxCx</cmd> ДЛЯ СТАБИЛИЗАЦИИ." });
            }
            if (ent > 0) {
                msgs.push({ q: "> ЗАПУТАННЫЕ", a: "ИСПОЛЬЗУЙТЕ <cmd>os --entangle LxRxCx LxRxCx</cmd>." });
            }
            
            return msgs;
        }

        if (page === 'telemetry.html') {
            const isFixed = localStorage.getItem('s9_telemetry_calibrated') === 'true';
            const isSuccessRead = localStorage.getItem('s9_read_success_telemetry') === 'true';

            if (isFixed) {
                if (!isSuccessRead) {
                    return [
                        { q: "> СТАТУС ТЕЛЕМЕТРИИ", a: "СИСТЕМА СИНХРОНИЗИРОВАНА. СИГНАЛ ЗАФИКСИРОВАН." },
                        { q: "> ДАННЫЕ", a: "КООРДИНАТЫ ТРАНСПОРТНОГО ШЛЮЗА ПОЛУЧЕНЫ." }
                    ];
                }
                return [
                    { q: "> СТАТУС ТЕЛЕМЕТРИИ", a: "СИСТЕМА СИНХРОНИЗИРОВАНА." }
                ];
            }
            return [
                { q: "> СТАТУС ТЕЛЕМЕТРИИ", a: "ВНИМАНИЕ. СИГНАЛ НЕСТАБИЛЕН. ЗАФИКСИРОВАНЫ КРИТИЧЕСКИЕ ФАЗОВЫЕ ИСКАЖЕНИЯ И РАССИНХРОНИЗАЦИЯ ЧАСТОТ." },
                { q: "> ДИАГНОСТИКА", a: "ТРИ ЦВЕТОВЫЕ ВОЛНЫ ПОТЕРЯЛИ ПРИВЯЗКУ К ЭТАЛОНУ. ДЛЯ СТАБИЛИЗАЦИИ НЕОБХОДИМО СОВМЕСТИТЬ ИХ ПО ПАРАМЕТРАМ." },
                { q: "> РЕШЕНИЕ", a: "ИСПОЛЬЗУЙТЕ КОНСОЛЬ УПРАВЛЕНИЯ ДЛЯ ВЫВОДА ЭТАЛОНА И НАСТРОЙКИ ВОЛН." }
            ];
        }

        if (page === 'core.html') {
            const isFixed = localStorage.getItem('s9_core_fixed') === 'true';
            const isSuccessRead = localStorage.getItem('s9_read_success_core') === 'true';

            if (isFixed) {
                if (!isSuccessRead) {
                    return [
                        { q: "> СТАТУС ЯДРА", a: "СТАБИЛЬНО. ВЫРАБОТКА 100%. МАГНИТЫ В НОРМЕ." },
                        { q: "> ТЕЛЕМЕТРИЯ", a: "ПИТАНИЕ ПОДАНО. МОДУЛЬ ТЕЛЕМЕТРИИ ДОСТУПЕН." }
                    ];
                }
                return [
                    { q: "> СТАТУС ЯДРА", a: "СТАБИЛЬНО. ВЫРАБОТКА 100%." }
                ];
            }
            return [
                { q: "> СТАТУС ЯДРА", a: "КРИТИЧЕСКИЙ ПЕРЕГРЕВ. МАГНИТНАЯ СТАБИЛИЗАЦИЯ НАРУШЕНА." },
                { q: "> ДИАГНОСТИКА", a: "ЯДРО СМЕЩЕНО ОТНОСИТЕЛЬНО ЦЕНТРА. ПОКАЗАНИЯ ДАТЧИКОВ РАССТОЯНИЯ ОТКЛОНЯЮТСЯ ОТ ЭТАЛОНА." },
                { q: "> РЕШЕНИЕ", a: "ОТКРОЙТЕ КОНСОЛЬ УПРАВЛЕНИЯ. ВВЕДИТЕ HELP CORE ДЛЯ ПОЛУЧЕНИЯ ПОКАЗАНИЙ ДАТЧИКОВ И РУКОВОДСТВА." }
            ];
        }
        return CHAT_DATABASE[page] || [{ q: "> СИСТЕМА", a: "ИНФОРМАЦИЯ ДЛЯ ЭТОЙ СТРАНИЦЫ ОТСУТСТВУЕТ." }];
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

    function typeHtmlText(element, htmlText, onComplete) {
        element.innerHTML = ''; 
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
            if (!currentWrapper) {
                if (node.nodeType === Node.TEXT_NODE) {
                    currentWrapper = document.createElement('span');
                    element.appendChild(currentWrapper);
                } else if (node.nodeName.toLowerCase() === 'cmd') {
                    currentWrapper = document.createElement('span');
                    currentWrapper.className = 'cmd-text';
                    element.appendChild(currentWrapper);
                } else {
                    nodeIndex++;
                    typeNextChar();
                    return;
                }
                currentNodeText = node.textContent;
                charIndex = 0;
            }

            if (charIndex < currentNodeText.length) {
                const char = currentNodeText[charIndex];
                currentWrapper.textContent += char;
                if (char !== " ") playTypeSound();
                charIndex++;
                setTimeout(typeNextChar, 30);
            } else {
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

        let page = window.location.pathname.split('/').pop() || 'index.html';
        
        if (page === 'archive.html') {
            const isFixed = localStorage.getItem('s9_archive_fixed') === 'true';
            if (window.lastArchiveFixedState !== isFixed) {
                window.currentChatStep = 0;
                window.lastArchiveFixedState = isFixed;
            }
        }

        if (page === 'map.html') {
            const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
            const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';
            let status = 'WAIT';
            if (coreOverheated && !coreFixed) status = 'ERROR';
            if (coreFixed) status = 'FIXED';

            if (lastCoreStatus !== status) {
                window.currentChatStep = 0;
                lastCoreStatus = status;
            }
        }

        const data = getActiveData();

        if (window.currentChatStep < data.length) {
            aField.innerText = "";
            qField.innerText = data[window.currentChatStep].q.replace(/<\/?cmd>/g, ''); 
            qField.style.opacity = "1";
            qField.style.cursor = "pointer";
            if (container) container.classList.remove('chat-fade-out');
            isTyping = false;
        } else {
            if (page === 'map.html') {
                const osFixed = localStorage.getItem('s9_os_fixed') === 'true';
                const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
                const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';
                const timerStart = localStorage.getItem('s9_core_timer_start');

                if (osFixed && !coreOverheated && !coreFixed && timerStart) {
                    const elapsed = Math.floor((Date.now() - parseInt(timerStart, 10)) / 1000);
                    const remaining = Math.max(0, 64 - elapsed);
                    
                    qField.innerText = "> ОХЛАЖДЕНИЕ ЯДРА";
                    aField.innerHTML = `<span id="cooling-timer">ОСТАЛОСЬ ВРЕМЕНИ: ${remaining} СЕК</span>`;
                    
                    qField.style.cursor = "default";
                    return;
                }
            }
            // ... (код кнопки "ОБНОВИТЬ" идет ниже) ...

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

        typeHtmlText(aField, text, () => {
            setTimeout(() => {
                window.currentChatStep++;

                let page = window.location.pathname.split('/').pop() || 'index.html';
                
                // --- УСТАНОВКА ФЛАГОВ ПРОЧТЕНИЯ ---
                if (window.currentChatStep === data.length) {
                    if (page === 'tools.html' && localStorage.getItem('s9_archive_calibrated') === 'true') localStorage.setItem('s9_read_success_tools', 'true');
                    if (page === 'archive.html' && localStorage.getItem('s9_archive_fixed') === 'true') localStorage.setItem('s9_read_success_archive', 'true');
                    if (page === 'os.html' && localStorage.getItem('s9_os_fixed') === 'true') localStorage.setItem('s9_read_success_os', 'true');
                    if (page === 'telemetry.html' && localStorage.getItem('s9_telemetry_calibrated') === 'true') localStorage.setItem('s9_read_success_telemetry', 'true');
                    if (page === 'core.html' && localStorage.getItem('s9_core_fixed') === 'true') localStorage.setItem('s9_read_success_core', 'true');
                }
                // ----------------------------------

                if (page === 'index.html' && window.currentChatStep === data.length) {
                    if (localStorage.getItem('s9_lang_human') !== 'true') {
                        window.dispatchEvent(new CustomEvent('autoOpenConsole'));
                    }
                }

                // Запускаем таймер ДО обновления вопроса
                if (page === 'map.html' && window.currentChatStep === data.length) {
                    localStorage.setItem('s9_map_visited', 'true');
                    
                    const osFixed = localStorage.getItem('s9_os_fixed') === 'true';
                    const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
                    const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';
                    
                    if (osFixed && !coreOverheated && !coreFixed && !localStorage.getItem('s9_core_timer_start')) {
                        localStorage.setItem('s9_core_timer_start', Date.now().toString());
                    }
                }

                isTyping = false; // ВАЖНО: Сбрасываем флаг печати
                window.updateQuestion();
            }, 2000);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.updateQuestion);
    } else {
        window.updateQuestion();
    }

    setInterval(() => {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        if (page === 'map.html') {
            const osFixed = localStorage.getItem('s9_os_fixed') === 'true';
            const coreOverheated = localStorage.getItem('s9_core_overheated') === 'true';
            const coreFixed = localStorage.getItem('s9_core_fixed') === 'true';
            const timerStart = localStorage.getItem('s9_core_timer_start');
            
            if (osFixed && !coreOverheated && !coreFixed && timerStart) {
                const timerEl = document.getElementById('cooling-timer');
                if (timerEl) {
                    const elapsed = Math.floor((Date.now() - parseInt(timerStart, 10)) / 1000);
                    const remaining = Math.max(0, 64 - elapsed);
                    timerEl.innerText = `ОСТАЛОСЬ ВРЕМЕНИ: ${remaining} СЕК`;
                    
                    if (remaining <= 0) {
                        localStorage.setItem('s9_core_overheated', 'true');
                        localStorage.removeItem('s9_core_timer_start');
                        location.reload();
                    }
                }
            }
        }
    }, 1000);

})();
