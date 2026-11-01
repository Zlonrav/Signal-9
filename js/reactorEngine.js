// js/reactorEngine.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const patchInterface = document.querySelector('.patch-interface');
        const statusElem = document.getElementById('patchStatus');
        const glyphCont = document.getElementById('core-glyph');
        const isFixed = localStorage.getItem('s9_reactor_fixed') === 'true'; // На будущее
        const isEmergency = localStorage.getItem('s9_emergency_reactor') === 'active';

        if (glyphCont && typeof getPath === 'function') {
            const indices = getPath("РЕАКТОР");
            glyphCont.innerHTML = createSVG(indices);
        }

        function updateReactorVisuals() {
            const isError = localStorage.getItem('s9_emergency_reactor') === 'active';
            if (isError) {
                document.documentElement.style.setProperty('--neon', '#ff3200');
                document.documentElement.style.setProperty('--neon-glow', 'rgba(255, 50, 0, 0.2)');
                document.body.classList.add('emergency-mode');
                if (patchInterface) {
                    patchInterface.style.display = "block"; 
                    patchInterface.style.borderColor = "#ff3200";
                }
                if (statusElem) {
                    statusElem.innerText = "КРИТИЧЕСКИЙ ПЕРЕГРУЗ. ТРЕБУЕТСЯ ПЕРЕПРОГРАММИРОВАНИЕ.";
                    statusElem.style.color = "#ff3200";
                }
            } else {
                // Штатный режим (или восстановлен)
                document.documentElement.style.setProperty('--neon', '#00ff44');
                document.documentElement.style.setProperty('--neon-glow', 'rgba(0, 255, 68, 0.2)');
                document.body.classList.remove('emergency-mode');
                if (patchInterface) {
                    patchInterface.style.display = "block";
                    patchInterface.style.borderColor = "#00ff44";
                }
                if (statusElem) {
                    statusElem.innerText = "ЭНЕРГОБЛОК СТАБИЛЕН. РЕЖИМ: ШТАТНЫЙ.";
                    statusElem.style.color = "#00ff44";
                    statusElem.style.textShadow = "0 0 15px #00ff44";
                }
            }
        }

        // Проверяем при загрузке и при изменении памяти (когда терминал что-то меняет)
        updateReactorVisuals();
        window.addEventListener('storage', updateReactorVisuals);
    });
})();
