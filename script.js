const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w, h, t = 0;
let mx = -999, my = -999;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

const particles = Array.from({ length: 55 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: (Math.random() - 0.5) * 0.8,
  vy: (Math.random() - 0.5) * 0.8,
  r: Math.random() * 1.8 + 0.4,
  hue: Math.random() > 0.5 ? 180 : 320
}));

const blobs = [
  { x: w * 0.25, y: h * 0.35, r: 200, vx: 0.22, vy: 0.15, hue: 180 },
  { x: w * 0.7, y: h * 0.55, r: 240, vx: -0.18, vy: 0.12, hue: 310 },
  { x: w * 0.5, y: h * 0.8, r: 150, vx: 0.12, vy: -0.16, hue: 200 }
];

// Soft multi-direction glitch streaks (rare, faint)
const streaks = [];
function spawnStreak() {
  if (Math.random() > 0.992) {
    const kind = Math.random();
    if (kind < 0.4) {
      // horizontal
      streaks.push({ type: 'h', y: Math.random() * h, life: 1, thick: 1, hue: Math.random() > 0.5 ? 180 : 320 });
    } else if (kind < 0.75) {
      // vertical
      streaks.push({ type: 'v', x: Math.random() * w, life: 1, thick: 1, hue: Math.random() > 0.5 ? 180 : 320 });
    } else {
      // short diagonal
      streaks.push({
        type: 'd',
        x: Math.random() * w,
        y: Math.random() * h,
        len: 40 + Math.random() * 80,
        angle: (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + Math.random() * 0.2),
        life: 1,
        hue: Math.random() > 0.5 ? 180 : 320
      });
    }
  }
}

function frame() {
  t += 0.016;
  ctx.fillStyle = 'rgba(6, 6, 12, 0.28)';
  ctx.fillRect(0, 0, w, h);

  blobs.forEach(b => {
    b.x += b.vx + Math.sin(t + b.hue) * 0.3;
    b.y += b.vy + Math.cos(t * 0.7 + b.hue) * 0.22;
    if (b.x < -b.r || b.x > w + b.r) b.vx *= -1;
    if (b.y < -b.r || b.y > h + b.r) b.vy *= -1;

    const dx = b.x - mx, dy = b.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < 260) {
      b.vx += (dx / dist) * 0.1;
      b.vy += (dy / dist) * 0.1;
    }
    b.vx *= 0.996;
    b.vy *= 0.996;

    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.hue}, 100%, 55%, 0.1)`);
    g.addColorStop(0.5, `hsla(${b.hue}, 90%, 40%, 0.03)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  particles.forEach((p, i) => {
    p.x += p.vx + Math.sin(t * 1.5 + i) * 0.2;
    p.y += p.vy + Math.cos(t * 1.2 + i) * 0.18;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.35)`;
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 85) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `hsla(${p.hue}, 100%, 55%, ${0.08 * (1 - d / 85)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  });

  spawnStreak();
  for (let i = streaks.length - 1; i >= 0; i--) {
    const S = streaks[i];
    S.life -= 0.05;
    if (S.life <= 0) { streaks.splice(i, 1); continue; }
    const a = S.life * 0.12;
    ctx.strokeStyle = `hsla(${S.hue}, 100%, 65%, ${a})`;
    ctx.lineWidth = S.thick || 1;
    ctx.beginPath();
    if (S.type === 'h') {
      ctx.moveTo(0, S.y);
      ctx.lineTo(w, S.y);
    } else if (S.type === 'v') {
      ctx.moveTo(S.x, 0);
      ctx.lineTo(S.x, h);
    } else {
      ctx.moveTo(S.x, S.y);
      ctx.lineTo(S.x + Math.cos(S.angle) * S.len, S.y + Math.sin(S.angle) * S.len);
    }
    ctx.stroke();
  }

  if (mx > 0) {
    const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
    mg.addColorStop(0, 'rgba(0, 245, 255, 0.06)');
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(mx, my, 100, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(frame);
}
frame();

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
);
document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 0.05}s`;
  observer.observe(el);
});

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    nav.classList.remove('open');
  }));
}

const title = document.querySelector('.hero-title');
if (title) {
  setInterval(() => {
    if (Math.random() > 0.9) {
      title.classList.add('glitching');
      setTimeout(() => title.classList.remove('glitching'), 180 + Math.random() * 200);
    }
  }, 4000);
}
