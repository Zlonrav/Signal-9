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
                console.log("МАТЧ! Реактор исправлен.");
                
                // 1. ФИКСИРУЕМ ПОЛНУЮ ПОБЕДУ НАД ВСЕМИ ЭТАПАМИ АВАРИИ
                localStorage.setItem('s9_reactor_fixed', 'true');
                localStorage.removeItem('s9_emergency_reactor');
                localStorage.removeItem('s9_orbit_stabilized'); // Стираем ключ доступа
                localStorage.removeItem('s9_emergency_flag');
                
                // 2. СНИМАЕМ АВАРИЙНЫЕ СТИЛИ С СИСТЕМЫ И ПЛАШКИ
                document.body.classList.remove('emergency-mode');
                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();
                
                if (typeof window.triggerSignalLoss === 'function') {
                    window.triggerSignalLoss(false);
                }

                // 3. ВИЗУАЛЬНЫЙ СТАТУС ПОБЕДЫ
                if (status) {
                    status.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. ВСЕ СИСТЕМЫ ШТАТНО.";
                    status.style.color = "#00ff44"; // Яркий зелёный неон успеха
                    status.style.textShadow = "0 0 15px #00ff44";
                }
                
                input.style.display = "none";

                // Подсвечиваем ядро зелёным
                const glyphCont = document.getElementById('core-glyph');
                if (glyphCont) {
                    const svg = glyphCont.querySelector('svg');
                    if (svg) {
                        svg.style.stroke = "#00ff44";
                        svg.style.filter = "drop-shadow(0 0 15px #00ff44)";
                    }
                }

                // ВЫХОД В МИРНУЮ РУБКУ
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
