// --- ИНИЦИАЛИЗАЦИЯ ЦВЕТОВОГО РЕЖИМА ЯДРА ПРИ ЗАГРУЗКЕ ---
(function initReactorVisuals() {
    const isFixed = localStorage.getItem('s9_reactor_fixed') === 'true';
    const isEmergency = localStorage.getItem('s9_emergency_reactor') === 'active' || 
                        localStorage.getItem('s9_emergency_flag') === 'active';

    if (isFixed) {
        // ЕСЛИ РЕАКТОР УЖЕ ПОЧИНЕН — ОН ДЕСЯТКИ ЛЕТ БУДЕТ ЗЕЛЕНЫМ
        document.documentElement.style.setProperty('--neon', '#00ff44');
        document.documentElement.style.setProperty('--neon-glow', 'rgba(0, 255, 68, 0.2)');
        
        // Скрываем аварийный интерфейс патча и инпут
        const patchUI = document.querySelector('.patch-interface');
        if (patchUI) patchUI.style.display = "none";
        
        const statusElem = document.getElementById('patchStatus');
        if (statusElem) {
            statusElem.innerText = "РЕАКТОР СТАБИЛЕН. РАБОТА В ШТАТНОМ РЕЖИМЕ.";
            statusElem.style.color = "#00ff44";
        }
    } else if (isEmergency) {
        // ЕСЛИ ИДЕТ АВАРИЯ — КРАСИМ В КРАСНЫЙ
        document.documentElement.style.setProperty('--neon', '#ff3200');
        document.documentElement.style.setProperty('--neon-glow', 'rgba(255, 50, 0, 0.2)');
    } else {
        // ШТАТНОЕ СПОКОЙНОЕ ВРЕМЯ (ДО ВСЕХ КВЕСТОВ) — СИНИЙ РЕЖИМ
        document.documentElement.style.setProperty('--neon', '#00f2ff');
        document.documentElement.style.setProperty('--neon-glow', 'rgba(0, 242, 255, 0.1)');
    }
})();

// Отрисовка глифа реактора при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const glyphCont = document.getElementById('core-glyph');
    if (glyphCont && typeof getPath === 'function') {
        const indices = getPath("РЕАКТОР"); // Генерируем эталонный глиф
        glyphCont.innerHTML = createSVG(indices);
    }
    
    // Автофокус на поле ввода
    const input = document.getElementById('patchInput');
    if (input) input.focus();
});
// --- REACTOR ENGINE: СИСТЕМА ВОССТАНОВЛЕНИЯ ЯДРА ---
(function() {
    const input = document.getElementById('patchInput');
    const status = document.getElementById('patchStatus');
    const leftStream = document.getElementById('stream-left');
    const rightStream = document.getElementById('stream-right');

    // 1. ГЕНЕРАТОР БИТОГО КОДА (ШУМА)
    function generateGlitch() {
        if (localStorage.getItem('s9_reactor_fixed') === 'true') return;
        
        const chars = "01010101X#$@&%<>?/";
        let content = "";
        for(let i=0; i<20; i++) {
            content += chars.charAt(Math.floor(Math.random() * chars.length)) + "<br>";
        }
        if (leftStream) leftStream.innerHTML = content;
        if (rightStream) rightStream.innerHTML = content;
        
        setTimeout(generateGlitch, 100);
    }

        // 2. ПРОВЕРКА КОДА ПЕРЕПРОШИВКИ
    if (input) {
        // Гарантируем, что поле пустое и в фокусе при старте
        input.value = "";
        input.focus();

        input.addEventListener('input', (e) => {
            // Читаем ввод: переводим в верхний регистр и убираем случайные пробелы по бокам
            const val = e.target.value.toUpperCase().trim();
            console.log("Текущий ввод в реакторе:", val); // Будет видно в консоли Хрома!

             if (val === "БЭКАП") {
                console.log("Критический код БЭКАП принят!");

                // 1. ЧИСТКА ПАМЯТИ СТАНЦИИ
                localStorage.setItem('s9_reactor_fixed', 'true');
                localStorage.removeItem('s9_emergency_reactor');
                localStorage.removeItem('s9_orbit_stabilized');
                localStorage.removeItem('s9_emergency_flag');

                // 2. СНИМАЕМ АВАРИЙНЫЕ СТИЛИ С BODY И ПЛАШКИ
                document.body.classList.remove('emergency-mode');
                
                // Принудительно переключаем неоновые переменные страницы на зелёный
                document.documentElement.style.setProperty('--neon', '#00ff44');
                document.documentElement.style.setProperty('--neon-glow', 'rgba(0, 255, 68, 0.5)');
                
                // Стабилизируем фон страницы
                document.body.style.background = "#020208"; 
                document.body.style.backgroundColor = "#020208";
                document.body.style.animation = "none"; // Выключаем общую пульсацию

                // Удаляем плашку ЧС, если она есть
                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();

                // 3. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ТЕКСТА И ПЕРЕКРАСКА РАМКИ
                const statusElem = document.getElementById('patchStatus') || (typeof status !== 'undefined' ? status : null);
                if (statusElem) {
                    statusElem.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. СИСТЕМА СТАБИЛЬНА.";
                    statusElem.style.color = "#00ff44"; 
                    statusElem.style.textShadow = "0 0 15px #00ff44";
                    
                    // ТОЧЕЧНЫЙ ФИКС КРАСНОЙ РАМКИ СО СКРИНШОТА:
                    // Берем родительский контейнер, в котором лежит текст статуса
                    const parentBox = statusElem.parentElement;
                    if (parentBox) {
                        parentBox.style.borderColor = "#00ff44"; // Делаем рамку ЗЕЛЁНОЙ
                        parentBox.style.boxShadow = "0 0 20px rgba(0, 255, 68, 0.3)";
                        
                        // Находим внутри этой рамки мелкий текст предупреждения и полностью его прячем
                        const subTexts = parentBox.querySelectorAll('div, span, p, small');
                        subTexts.forEach(el => {
                            if (el !== statusElem) {
                                el.style.display = "none";
                            }
                        });
                    }
                }

                // Скрываем инпут ввода букв
                const inputElem = document.getElementById('patchInput') || (typeof input !== 'undefined' ? input : null);
                if (inputElem) {
                    inputElem.style.display = "none";
                }

                // 4. КРАСИМ ЦЕНТРАЛЬНЫЙ ГЛИФ В ЗЕЛЕНЫЙ
                // 4. КРАСИМ ЦЕНТРАЛЬНЫЙ ГЛИФ И КРУГИ ВОКРУГ НЕГО В ЗЕЛЕНЫЙ
                const glyphCont = document.getElementById('core-glyph');
                if (glyphCont) {
                    // Перекрашиваем саму «бабочку» БЭКАПа
                    const svg = glyphCont.querySelector('svg');
                    if (svg) {
                        svg.style.stroke = "#00ff44";
                        svg.style.filter = "drop-shadow(0 0 15px #00ff44)";
                        
                        // Если круг внутри SVG — красим его элементы stroke/fill
                        const svgCircles = svg.querySelectorAll('circle, path');
                        svgCircles.forEach(el => {
                            if (el.getAttribute('stroke') || el.style.stroke) el.style.stroke = "#00ff44";
                        });
                    }
                    
                    // ТОЧЕЧНЫЙ ФИКС КРАСНОГО КРУГА:
                    // Если красный круг — это внешняя рамка самого контейнера глифа
                    glyphCont.style.borderColor = "#00ff44";
                    glyphCont.style.boxShadow = "0 0 20px rgba(0, 255, 68, 0.3)";
                    
                    // Проверяем, нет ли вокруг него других соседних кругов/декораций
                    const subCircles = glyphCont.parentElement ? glyphCont.parentElement.querySelectorAll('.core-circle, .orbit, div') : [];
                    subCircles.forEach(circle => {
                        if (circle !== glyphCont) {
                            circle.style.borderColor = "#00ff44";
                            circle.style.boxShadow = "0 0 15px rgba(0, 255, 68, 0.2)";
                        }
                    });
                }


                // Перекрашиваем все фоновые аварийные строки кода в мягкий зелёный лог
                const glitchLines = document.querySelectorAll('.glitch-line, .code-stream, .matrix-text');
                glitchLines.forEach(line => {
                    line.style.color = "rgba(0, 255, 68, 0.3)";
                    line.style.textShadow = "0 0 5px rgba(0, 255, 68, 0.5)";
                });

                // 5. ЖЕЛЕЗОБЕТОННЫЙ ТЕЛЕПОРТ В РУБКУ ЧЕРЕЗ 3 СЕКУНДЫ
                console.log("Запуск таймера перехода в Рубку...");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
            }



        });
    } else {
        console.error("Критическая ошибка: Элемент patchInput не найден на странице!");
    }

    // Запуск шума кода на фоне
    if (typeof generateGlitch === 'function') {
        generateGlitch();
    }
})();
