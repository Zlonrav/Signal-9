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
                
                // Принудительно очищаем класс ошибки со всех крупных блоков страницы, если они есть
                const reactorWrap = document.querySelector('.reactor-page, .core-container, .main-frame');
                if (reactorWrap) {
                    reactorWrap.classList.remove('emergency-mode', 'error-state', 'alarm-active');
                    reactorWrap.style.backgroundColor = ""; // Сбрасываем жесткий инлайновый красный фон
                }

                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();

                // 3. ОБНОВЛЕНИЕ ТЕКСТА СТАТУСА (Безопасное)
                // Если у тебя в HTML элемент называется patchStatus (через ID), а не переменная status
                const statusElem = document.getElementById('patchStatus') || (typeof status !== 'undefined' ? status : null);
                if (statusElem) {
                    statusElem.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. СИСТЕМА СТАБИЛЬНА.";
                    statusElem.style.color = "#00ff44"; // Зеленый неон
                    statusElem.style.textShadow = "0 0 15px #00ff44";
                }

                // Скрываем инпут ввода, чтобы игрок больше не писал
                const inputElem = document.getElementById('patchInput') || (typeof input !== 'undefined' ? input : null);
                if (inputElem) {
                    inputElem.style.display = "none";
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

                // ПЕРЕКРАШИВАЕМ ВСЕ БЕГУЩИЕ СТРОКИ КОДА (Потоки глитчей) В ЗЕЛЕНЫЙ
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
