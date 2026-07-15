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
                // 1. ФИКСИРУЕМ УСПЕХ НАВСЕГДА И ЧИСТИМ ТРЕВОГИ
                localStorage.setItem('s9_reactor_fixed', 'true');
                localStorage.removeItem('s9_emergency_reactor');
                localStorage.removeItem('s9_orbit_stabilized');
                localStorage.removeItem('s9_emergency_flag');
                
                // 2. СНИМАЕМ КРАСНЫЙ РЕЖИМ ЧС И УДАЛЯЕМ ВЕРХНЮЮ ПЛАШКУ
                document.body.classList.remove('emergency-mode');
                const bar = document.getElementById('emergency-bar');
                if (bar) bar.remove();
                
                // Вызываем глобальный сброс сигнала, если он подключен
                if (typeof window.triggerSignalLoss === 'function') {
                    window.triggerSignalLoss(false);
                }

                // 3. ВИЗУАЛЬНЫЙ ФИДБЕК ОБ УСПЕХЕ
                // Меняем текст главного статуса
                if (status) {
                    status.innerText = "ПРОТОКОЛ ВОССТАНОВЛЕН. ЯДРО СТАБИЛЬНО.";
                    status.style.color = "#00ff44"; // Перекрашиваем статус в зелёный
                    status.style.textShadow = "0 0 15px #00ff44";
                }
                
                // Прячем поле ввода (инпут), чтобы пользователь больше ничего не писал
                if (input) {
                    input.style.display = "none";
                }

                // ПРЯЧЕМ СТАТИЧНУЮ СТРОКУ ТРЕВОГИ ("ВНИМАНИЕ: ТРЕБУЕТСЯ ПЕРЕПРОШИВКА...")
                // Находим родительский блок интерфейса патча
                const patchInterface = document.querySelector('.patch-interface');
                if (patchInterface) {
                    // Перекрашиваем рамку блока в зелёный цвет успеха
                    patchInterface.style.borderColor = "#00ff44";
                    patchInterface.style.boxShadow = "0 0 30px rgba(0, 255, 68, 0.2)";
                    
                    // Находим и скрываем вторую строчку с мелким текстом, чтобы она не мешалась
                    const subHeader = patchInterface.querySelector('div:not(.status-header):not([style*="margin-top"])');
                    if (subHeader) subHeader.style.display = "none";
                }
                
                // 4. КРАСИМ ЦЕНТРАЛЬНЫЙ ГЛИФ В ЗЕЛЁНЫЙ ЦВЕТ УСПЕХА
                const glyphCont = document.getElementById('core-glyph');
                if (glyphCont) {
                    const svg = glyphCont.querySelector('svg');
                    if (svg) {
                        svg.style.stroke = "#00ff44";
                        svg.style.filter = "drop-shadow(0 0 15px #00ff44)";
                    }
                }

                // 5. ПРИНУДИТЕЛЬНЫЙ ПЛАВНЫЙ ПЕРЕХОД В РУБКУ ЧЕРЕЗ 3 СЕКУНДЫ
                console.log("РЕАКТОР СТАБИЛИЗИРОВАН. ВОЗВРАТ В РУБКУ...");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
            }

        });
    }

    // Запуск шума
    generateGlitch();
})();
