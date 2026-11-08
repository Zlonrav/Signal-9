// js/reactor.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const core = document.getElementById('reactorCore');
        const logBox = document.getElementById('logBox');
        const valTemp = document.getElementById('valTemp');
        const barTemp = document.getElementById('barTemp');
        const valStab = document.getElementById('valStab');
        const barStab = document.getElementById('barStab');

        // Генерация частиц для визуала
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            for(let i=0; i<25; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.animationDelay = `${Math.random() * 2}s`;
                p.style.animationDuration = `${1 + Math.random() * 2}s`;
                particlesContainer.appendChild(p);
            }
        }

        function addLog(text, type = '') {
            if (!logBox) return;
            const line = document.createElement('div');
            line.className = `log-line ${type}`;
            line.innerText = text;
            logBox.appendChild(line);
            if (logBox.children.length > 15) logBox.removeChild(logBox.firstChild);
            logBox.scrollTop = logBox.scrollHeight;
        }

        // Проверяем, починено ли ядро
        const isCoreFixed = localStorage.getItem('s9_core_fixed') === 'true';

        if (isCoreFixed) {
            core.classList.remove('critical');
            core.style.background = "radial-gradient(circle, #fff 0%, #00ff44 30%, #0066ff 70%, transparent 100%)";
            core.style.boxShadow = "0 0 50px #00ff44, 0 0 100px #0066ff, inset 0 0 30px #fff";
            
            if (valTemp) { valTemp.innerText = "45%"; barTemp.style.width = "45%"; barTemp.className = "progress-fill"; }
            if (valStab) { valStab.innerText = "100%"; barStab.style.width = "100%"; barStab.className = "progress-fill"; valStab.style.color = "var(--ok)"; }
            
            addLog("> SYSTEM STABLE", "ok");
        } else {
            core.classList.add('critical');
            
            if (valTemp) { valTemp.innerText = "98%"; barTemp.style.width = "98%"; barTemp.className = "progress-fill err"; }
            if (valStab) { valStab.innerText = "5%"; barStab.style.width = "5%"; barStab.className = "progress-fill err"; valStab.style.color = "var(--err)"; }
        }

        let targetX, targetY, targetZ;
        let sensors, expected;

        if (!isCoreFixed) {
            targetX = Math.floor(Math.random() * 11) - 5;
            targetY = Math.floor(Math.random() * 11) - 5;
            targetZ = Math.floor(Math.random() * 11) - 5;
            
            if (targetX === 0) targetX = 2;
            if (targetY === 0) targetY = -3;
            if (targetZ === 0) targetZ = 1;

            sensors = {
                'rt': 10 - targetX,
                'lt': 10 + targetX,
                'up': 10 - targetY,
                'dn': 10 + targetY,
                'fw': 10 - targetZ,
                'bk': 10 + targetZ
            };

            expected = {
                'rt': 10 - sensors['rt'],
                'lt': 10 - sensors['lt'],
                'up': 10 - sensors['up'],
                'dn': 10 - sensors['dn'],
                'fw': 10 - sensors['fw'],
                'bk': 10 - sensors['bk']
            };

            window.coreEquations = {
                xy: targetX + targetY,
                yz: targetY + targetZ,
                xz: targetX + targetZ
            };

            window.coreTargets = sensors;
        }

        // 3. ФУНКЦИЯ ПРОВЕРКИ ВВЕДЕННОЙ СТРОКИ
        window.checkCorePosition = function(cmdStr) {
            if (localStorage.getItem('s9_core_fixed') === 'true') {
                if (window.printToConsole) window.printToConsole(`<span class="ok">[OK] ЯДРО СТАБИЛЬНО. КОМАНДА НЕ ТРЕБУЕТСЯ.</span>`);
                return;
            }
				if (localStorage.getItem('s9_core_fixed') === 'true') {
					if (window.printToConsole) window.printToConsole(`<span class="ok">[OK] ЯДРО СТАБИЛЬНО. КОМАНДА НЕ ТРЕБУЕТСЯ.</span>`);
					return;
				}
            const rtMatch = cmdStr.match(/rt\s*([+-]?\d+)/);
            const ltMatch = cmdStr.match(/lt\s*([+-]?\d+)/);
            const upMatch = cmdStr.match(/up\s*([+-]?\d+)/);
            const dnMatch = cmdStr.match(/dn\s*([+-]?\d+)/);
            const fwMatch = cmdStr.match(/fw\s*([+-]?\d+)/);
            const bkMatch = cmdStr.match(/bk\s*([+-]?\d+)/);
            if (!rtMatch || !ltMatch || !upMatch || !dnMatch || !fwMatch || !bkMatch) {
                if (window.printToConsole) window.printToConsole(`<span class="err">[ОШИБКА] НЕВЕРНЫЙ ФОРМАТ. ВВЕДИТЕ ВСЕ 6 ЗНАЧЕНИЙ ЧЕРЕЗ ЗАПЯТУЮ.</span>`);
                return;
            }

            const valRT = parseInt(rtMatch[1], 10);
            const valLT = parseInt(ltMatch[1], 10);
            const valUP = parseInt(upMatch[1], 10);
            const valDN = parseInt(dnMatch[1], 10);
            const valFW = parseInt(fwMatch[1], 10);
            const valBK = parseInt(bkMatch[1], 10);

            let isCorrect = true;
            let errors = [];

            if (valRT !== expected['rt']) { isCorrect = false; errors.push('RT'); }
            if (valLT !== expected['lt']) { isCorrect = false; errors.push('LT'); }
            if (valUP !== expected['up']) { isCorrect = false; errors.push('UP'); }
            if (valDN !== expected['dn']) { isCorrect = false; errors.push('DN'); }
            if (valFW !== expected['fw']) { isCorrect = false; errors.push('FW'); }
            if (valBK !== expected['bk']) { isCorrect = false; errors.push('BK'); }

            if (isCorrect) {
                if (window.printToConsole) {
                    window.printToConsole(`<span class="ok">[УСПЕХ] ВСЕ 6 МАГНИТОВ КАЛИБРОВАНЫ.</span>`);
                    window.printToConsole(`ВВЕДИТЕ: <span class="cmd-text">core --position sync</span> ДЛЯ ЗАПУСКА СТАБИЛИЗАЦИИ.`);
                }
                window.corePositionReady = true;
                addLog("> ALL MAGNETS CALIBRATED.", "ok");
            } else {
                if (window.printToConsole) {
                    window.printToConsole(`<span class="err">[ОШИБКА] НЕВЕРНАЯ КАЛИБРОВКА МАГНИТОВ: ${errors.join(', ')}. ПОПРОБУЙТЕ СНОВА.</span>`);
                }
                addLog("> CALIBRATION FAILED.", "err");
            }
        };

        // 4. ФУНКЦИЯ СИНХРОНИЗАЦИИ
			window.syncCore = function() {
				if (localStorage.getItem('s9_core_fixed') === 'true') {
					if (window.printToConsole) window.printToConsole(`<span class="ok">[OK] ЯДРО СТАБИЛЬНО. КОРРЕКТИРОВКА НЕ ТРЕБУЕТСЯ.</span>`);
					return;
				}
				if (!window.corePositionReady) {
                if (window.printToConsole) window.printToConsole(`<span class="err">[ОШИБКА] НЕВОЗМОЖНО СИНХРОНИЗИРОВАТЬ. СНАЧАЛА КАЛИБРУЙТЕ ВСЕ МАГНИТЫ.</span>`);
                return;
            }

            if (window.printToConsole) window.printToConsole(`<span class="ok">[СИСТЕМА] СИНХРОНИЗАЦИЯ ЗАПУЩЕНА...</span>`);
            
            setTimeout(() => {
                core.classList.remove('critical');
                core.style.background = "radial-gradient(circle, #fff 0%, #00ff44 30%, #0066ff 70%, transparent 100%)";
                core.style.boxShadow = "0 0 50px #00ff44, 0 0 100px #0066ff, inset 0 0 30px #fff";
                
                if (valTemp) { valTemp.innerText = "45%"; barTemp.style.width = "45%"; barTemp.className = "progress-fill"; }
                if (valStab) { valStab.innerText = "100%"; barStab.style.width = "100%"; barStab.className = "progress-fill"; valStab.style.color = "var(--ok)"; }

                localStorage.setItem('s9_core_fixed', 'true');
                localStorage.removeItem('s9_core_overheated');
                
                if (window.printToConsole) {
                    window.printToConsole(`<span class="ok">[УСПЕХ] ЭНЕРГОЯДРО СТАБИЛИЗИРОВАНО. ТЕЛЕМЕТРИЯ РАЗБЛОКИРОВАНА.</span>`);
                    window.dispatchEvent(new Event('unlockConsole'));
                }
                addLog("> CORE STABILIZED. SYSTEM ONLINE.", "ok");
                
                // Перезагрузка через 2 секунды после сообщения
               setTimeout(() => { location.reload(); }, 2000);
            }, 2000);
        };
    });
})();