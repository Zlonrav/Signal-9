// --- ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ ФИЛЬТРОВ ---
(function injectFilters() {
    if (document.getElementById('neonGlow')) return;
    const svgHtml = `
        <svg style="width:0; height:0; position:absolute;" aria-hidden="true" focusable="false">
            <defs>
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur"></feGaussianBlur>
                    <feGaussianBlur stdDeviation="5" result="largeBlur"></feGaussianBlur>
                    <feComposite in="blur" in2="largeBlur" operator="over" result="combinedBlur"></feComposite>
                    <feMerge>
                        <feMergeNode in="combinedBlur"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                </filter>
            </defs>
        </svg>`;
    document.body.insertAdjacentHTML('beforeend', svgHtml);
})();

const initStarfield = () => {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height, stars = [], particles = [];

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Статичные далекие звезды
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.2,
            opacity: Math.random(),
            orbitSpeed: 0.00005 + Math.random() * 0.0001
        });
    }

    // Частицы солнечного ветра
    const createParticle = () => ({
        x: -50,
        y: Math.random() * height,
        speed: 0.2 + Math.random() * 0.5,
        size: Math.random() * 2,
        life: 1
    });

    const draw = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const now = Date.now();

        // 1. Свечение звезды за краем (слева снизу)
        const starGlow = ctx.createRadialGradient(0, height, 0, 0, height, width * 0.8);
        // Пульсация яркости звезды
        const pulse = Math.sin(now * 0.0005) * 0.02;
        starGlow.addColorStop(0, `rgba(0, 242, 255, ${0.08 + pulse})`);
        starGlow.addColorStop(0.5, `rgba(0, 50, 60, ${0.03 + pulse})`);
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.fillRect(0, 0, width, height);

        // 2. Отрисовка звезд с орбитальным дрейфом (вращение вокруг центра звезды слева-снизу)
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
            ctx.globalAlpha = Math.abs(Math.sin(now * 0.001 + s.opacity * 10)) * 0.8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            // Движение по орбите (вокруг точки 0, height)
            const dx = s.x;
            const dy = s.y - height;
            const angle = Math.atan2(dy, dx) + s.orbitSpeed;
            const dist = Math.sqrt(dx * dx + dy * dy);
            s.x = Math.cos(angle) * dist;
            s.y = Math.sin(angle) * dist + height;

            if (s.x > width || s.y < 0) {
                s.x = Math.random() * width;
                s.y = Math.random() * height;
            }
        });

        // 3. Солнечный ветер (частицы от звезды)
        if (particles.length < 20 && Math.random() > 0.95) particles.push(createParticle());
        
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        particles.forEach((p, i) => {
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.speed;
            p.y -= p.speed * 0.2;
            p.life -= 0.002;
            if (p.life <= 0) particles.splice(i, 1);
        });

        requestAnimationFrame(draw);
    };

    draw();
};

initStarfield();