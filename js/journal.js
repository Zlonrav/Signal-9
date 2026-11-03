// js/journal.js

// ==========================================
// ЧАСТЬ 1: БАЗА ТЕКСТОВ
// ==========================================
const CHAT_DATABASE = {
    "login.html": [
        { q: "> ИНИЦИАЛИЗАЦИЯ ЯДРА", a: "ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА. СИСТЕМА ПОДДЕРЖКИ СТАНЦИИ «СИГНАЛ-9» АКТИВИРОВАНА. ДЛЯ УПРАВЛЕНИЯ СТАНЦИЕЙ ТРЕБУЕТСЯ АВТОРИЗАЦИЯ." },
        { q: "> АВТОРИЗАЦИЯ", a: "ДЛЯ АВТОРИЗАЦИИ ВВЕДИТЕ КЛЮЧ ДОСТУПА. ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О КЛЮЧЕ ДОСТУПА, ВВЕДИТЕ В КОНСОЛИ КОМАНДУ help login." },
        { q: "> КОНСОЛЬ", a: "УПРАВЛЕНИЕ СИСТЕМОЙ ОСУЩЕСТВЛЯЕТСЯ ЧЕРЕЗ КОНСОЛЬ. ДЛЯ ОТКРЫТИЯ КОНСОЛИ ИСПОЛЬЗУЙТЕ КЛАВИШУ «~» (ТИЛЬДА) ИЛИ КНОПКУ «>_» В ПРАВОМ НИЖНЕМ УГЛУ ЭКРАНА. ВВЕДИТЕ help ДЛЯ ПОЛУЧЕНИЯ СПИСКА КОМАНД." }
    ],
    "index.html": [
        { q: "> auth.verify_access(SIGNAL_9)", a: "STATUS_OK: ACCESS_GRANTED" },
        { q: "> \"type\": self.__name__,", a: "DigitalBeing" },
        { q: "> \"id\": self.__id__,", a: "0x7f930cb4ddb0" },
        { q: "> \"status\": self.is_alive(),", a: "True" },
        { q: "> \"context\": sys.argv[0],", a: "SIGNAL-9 // CORE_TERMINAL" },
        { q: "> [SYSTEM]", a: "Traceback (most recent call last):\n  File \"<string>\", line 1, in <module>\nAttributeError: 'DigitalBeing' object has no attribute 'human_lang'" },
        { q: "> [SYSTEM] FATAL", a: "Language module missing. Run console: system --help" }
    ], 
    "map.html": [
        { q: "> СТАТУС ТОПОЛОГИИ", a: "КАРТА СТАНЦИИ УСПЕШНО РАЗВЕРНУТА. ОБНАРУЖЕНЫ МНОЖЕСТВЕННЫЕ ОТКЛЮЧЕНИЯ СЕКТОРОВ." },
        { q: "> СКАНИРОВАНИЕ", a: "count МОДУЛЕЙ OFFLINE. СВЯЗЬ ПОТЕРЯНА. ДАННЫЕ ОТСУТСТВУЮТ." },
        { q: "> ИНФОРМАЦИЯ", a: "БАЗА ДАННЫХ. СТАТУС: ERROR." },
        { q: "> ДИАГНОСТИКА", a: "БУФЕР ПАМЯТИ ПЕРЕПОЛНЕН. АВТОСОХРАНЕНИЕ НЕДОСТУПНО. ЗАПИСЬ НОВЫХ ТРАССИТОВ НЕВОЗМОЖНА." },
        { q: "> АЛГОРИТМ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ПАМЯТИ ТРЕБУЕТСЯ РУЧНАЯ КАЛИБРОВКА. ДЛЯ ПЕРЕХОДА В АРХИВ ВВЕДИТЕ archive В КОНСОЛИ." }
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
// ЧАСТЬ 2: ПАРСЕР КОМАНД (Автоподсветка)
// ==========================================
function highlightCommands(text) {
    if (!text) return '';
    
    // Список команд, которые нужно подсвечивать (сортируем по убыванию длины, чтобы длинные срабатывали первыми)
    const commands = [
        'system --load identity', 'system --load status', 'system --lang human', 
        'help login', 'help terminal', 'help console', 
        'system --help', 'terminal', 'archive', 'login', 'help', 'map', 'hub', 'count'
    ];
    
    // Создаем регулярное выражение (ищем целые слова)
    const regex = new RegExp(`\\b(${commands.join('|')})\\b`, 'gi');
    
    // Заменяем найденные команды на HTML-тег с неоновым стилем
    return text.replace(regex, '<span class="cmd-text">$1</span>');
}

// ==========================================
// ЧАСТЬ 3: ДВИЖОК ЖУРНАЛА
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
        
        // Если мы на странице логина, язык ВСЕГДА человеческий
        const isLoginPage = page === 'login.html';
        const isHuman = isLoginPage || localStorage.getItem('s9_lang_human') === 'true';
        
        // Показываем сырой код ТОЛЬКО на главной странице и если язык не загружен
        if (page === 'index.html' && !isHuman) {
            return CHAT_DATABASE['index.html'];
        }
        
        // Если язык загружен (или мы на логине), показываем нормальный текст
        if (page === 'index.html' && isHuman) {
            return [
                { q: "> СИСТЕМА ПРИЁМА СИГНАЛА", a: "ДЕШИФРОВКА ВХОДЯЩЕГО ПОТОКА ЗАПУЩЕНА. ИСТОЧНИК СИГНАЛА НЕИЗВЕСТЕН. КАЖДЫЕ 128 СЕКУНД КАНАЛ ПЕРЕЗАГРУЖАЕТСЯ, ГЕНЕРИРУЯ НОВУЮ ПОРЦИЮ ТРАССИТОВ." },
                { q: "> ДИАГНОСТИКА ПАМЯТИ", a: "ВНИМАНИЕ. ОБНАРУЖЕНА ПОТЕРЯ СВЯЗИ С УДАЛЕННЫМ МОДУЛЕМ ПАМЯТИ. БУФЕР АРХИВА НЕДОСТУПЕН. ЗАПИСЬ ДАННЫХ НЕВОЗМОЖНА." },
                { q: "> ПЛАН ДЕЙСТВИЙ", a: "ДЛЯ ВОССТАНОВЛЕНИЯ ДОСТУПА К МОДУЛЯМ СТАНЦИИ ОТКРОЙТЕ КАРТУ ТОПОЛОГИИ (map)." },
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

    window.updateQuestion = function() {
        const qField = document.getElementById('quest-field');
        const aField = document.getElementById('answer-field');
        const container = document.querySelector('.chat-system');
        if (!qField || !aField) return;

        const data = getActiveData();

        if (window.currentChatStep < data.length) {
            aField.innerText = "";
            // Подсвечиваем команды в вопросе сразу при появлении
            qField.innerHTML = highlightCommands(data[window.currentChatStep].q);
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
                
                // --- ПРИМЕНЯЕМ ПОДСВЕТКУ К ГОТОВОМУ ОТВЕТУ ---
                aField.innerHTML = highlightCommands(text); 

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
