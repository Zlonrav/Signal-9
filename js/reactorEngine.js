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
        input.addEventListener('input', (e) => {
            const val = e.target.value.toUpperCase().trim();
            
            if (val === "БЭКАП") {
                // 1. ФИКСИРУЕМ УСПЕХ НАВСЕГДА
                localStorage.setItem('s9_reactor_fixed', 'true');
                
                // 2. ПОЛНОСТЬЮ СНОСИМ ОБЕ АВАРИЙНЫЕ ПЕРЕМЕННЫЕ
                localStorage.removeItem('s9_emergency_reactor');
                localStorage.removeItem('s9_orbit_stabilized');
                
                // И убираем старую солнечную тревогу, если она где-то зависла
                localStorage.removeItem('s9_emergency_flag');
                
                // 3. СНИМАЕМ КРАСНЫЙ РЕЖИМ С ТЕКУЩЕЙ СТРАНИЦЫ И ГАСИМ ПЛАШКУ
                document.body.classList.remove('emergency-mode');
                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();
                
                // Если есть глобальная функция сброса сигнала — вызываем её для порядка
                if (typeof window.triggerSignalLoss === 'function') {
                    window.triggerSignalLoss(false);
                }

                // 4. ВИЗУАЛЬНЫЙ ФИДБЕК ОБ УСПЕШНОМ ХЕЙНДШЕЙКЕ
                status.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. БЭКАП СОЗДАН.";
                status.style.color = "#00ff44";
                status.style.textShadow = "0 0 15px #00ff44";
                input.style.display = "none";
                
                // Подсвечиваем центральный глиф зеленым цветом успеха
                const glyphCont = document.getElementById('core-glyph');
                if (glyphCont) {
                    const svg = glyphCont.querySelector('svg');
                    if (svg) {
                        svg.style.stroke = "#00ff44";
                        svg.style.filter = "drop-shadow(0 0 15px #00ff44)";
                    }
                }

                // Плавный уход в рубку через 3 секунды
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
            }

        });
    }

    // Запуск шума
    generateGlitch();
})();
