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
                
                // Принудительно меняем переменную неонового цвета на всей странице на ЗЕЛЁНЫЙ
                document.documentElement.style.setProperty('--neon', '#00ff44');
                document.documentElement.style.setProperty('--neon-glow', 'rgba(0, 255, 68, 0.5)');
                
                // СБРАСЫВАЕМ КРАСНЫЙ ФОН С ТЕЛА СТРАНИЦЫ
                document.body.style.background = "#020208"; 
                document.body.style.backgroundColor = "#020208";
                document.body.style.animation = "none"; // Выключаем мигание всей страницы

                // Очищаем аварийные классы со всех крупных блоков страницы
                const reactorWrap = document.querySelector('.reactor-page, .core-container, .main-frame, .wrapper');
                if (reactorWrap) {
                    reactorWrap.classList.remove('emergency-mode', 'error-state', 'alarm-active');
                    reactorWrap.style.backgroundColor = "#020208";
                    reactorWrap.style.boxShadow = "none";
                }

                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();

                // 3. ОБНОВЛЕНИЕ ТЕКСТА СТАТУСА (Зелёный триумф)
                const statusElem = document.getElementById('patchStatus') || (typeof status !== 'undefined' ? status : null);
                if (statusElem) {
                    statusElem.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. СИСТЕМА СТАБИЛЬНА.";
                    statusElem.style.color = "#00ff44"; 
                    statusElem.style.textShadow = "0 0 15px #00ff44";
                }

                // Скрываем инпут ввода
                const inputElem = document.getElementById('patchInput') || (typeof input !== 'undefined' ? input : null);
                if (inputElem) {
                    inputElem.style.display = "none";
                }

                // Перекрашиваем рамку интерфейса
                const patchInterface = document.querySelector('.patch-interface');
                if (patchInterface) {
                    patchInterface.style.borderColor = "#00ff44";
                    patchInterface.style.boxShadow = "0 0 30px rgba(0, 255, 68, 0.3)";
                    
                    // Прячем мелкую надпись "Внимание: требуется перепрошивка..."
                    const subLabels = patchInterface.querySelectorAll('div');
                    subLabels.forEach(div => {
                        if (div.innerText.includes("ВНИМАНИЕ") || div.innerText.includes("БЭКАП") || div.innerText.includes("ОБНАРУЖЕНО")) {
                            div.style.display = "none";
                        }
                    });
                }

                // 4. КРАСИМ ЦЕНТРАЛЬНЫЙ ГЛИФ В ЗЕЛЕНЫЙ
                const glyphCont = document.getElementById('core-glyph');
                if (glyphCont) {
                    const svg = glyphCont.querySelector('svg');
                    if (svg) {
                        svg.style.stroke = "#00ff44";
                        svg.style.filter = "drop-shadow(0 0 15px #00ff44)";
                    }
                }

                // ПЕРЕКЛЮЧАЕМ ВСЕ ПОТОКИ ХАОТИЧНОГО КОДА В ЗЕЛЕНЫЙ РЕЖИМ ЛОГОВ
                const glitchLines = document.querySelectorAll('.glitch-line, .code-stream, .matrix-text, div');
                glitchLines.forEach(line => {
                    if (line.style.color === 'rgb(255, 51, 51)' || line.classList.contains('error')) {
                        line.style.color = "rgba(0, 255, 68, 0.4)";
                    }
                });

                // 5. ПЕРЕХОД В РУБКУ ЧЕРЕЗ 3 СЕКУНДЫ
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
