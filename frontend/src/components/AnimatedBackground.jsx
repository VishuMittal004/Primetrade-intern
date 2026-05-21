import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const PARTICLE_COUNT = 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    // Orbs
    const orbs = [
      { x: 0.15, y: 0.2,  r: 320, color: 'rgba(0,180,255,0.07)',  speed: 0.00018 },
      { x: 0.8,  y: 0.7,  r: 280, color: 'rgba(0,255,200,0.05)',  speed: 0.00022 },
      { x: 0.5,  y: 0.5,  r: 400, color: 'rgba(10,120,255,0.04)', speed: 0.00014 },
      { x: 0.9,  y: 0.1,  r: 200, color: 'rgba(100,200,255,0.06)',speed: 0.00030 },
    ];
    let t = 0;

    const LINK_DIST = 100;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t++;

      // Draw animated orbs
      orbs.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.speed + i) * 0.12) * w;
        const oy = (o.y + Math.cos(t * o.speed * 1.3 + i) * 0.1) * h;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grad.addColorStop(0, o.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Move particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });

      // Draw links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,210,255,${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
