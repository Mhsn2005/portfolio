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

// Chaotic particles
const particles = Array.from({ length: 80 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: (Math.random() - 0.5) * 1.2,
  vy: (Math.random() - 0.5) * 1.2,
  r: Math.random() * 2 + 0.5,
  life: Math.random(),
  hue: Math.random() > 0.5 ? 180 : 320
}));

// Fluid blobs
const blobs = [
  { x: w * 0.25, y: h * 0.35, r: 200, vx: 0.3, vy: 0.2, hue: 180 },
  { x: w * 0.7, y: h * 0.55, r: 260, vx: -0.25, vy: 0.15, hue: 310 },
  { x: w * 0.5, y: h * 0.8, r: 160, vx: 0.15, vy: -0.2, hue: 200 }
];

// Lightning / glitch lines
const lines = [];
function spawnLine() {
  if (Math.random() > 0.97) {
    lines.push({
      y: Math.random() * h,
      life: 1,
      h: 1 + Math.random() * 3,
      hue: Math.random() > 0.5 ? 180 : 320
    });
  }
}

function frame() {
  t += 0.016;
  ctx.fillStyle = 'rgba(6, 6, 12, 0.22)';
  ctx.fillRect(0, 0, w, h);

  // Blobs
  blobs.forEach(b => {
    b.x += b.vx + Math.sin(t + b.hue) * 0.4;
    b.y += b.vy + Math.cos(t * 0.7 + b.hue) * 0.3;
    if (b.x < -b.r || b.x > w + b.r) b.vx *= -1;
    if (b.y < -b.r || b.y > h + b.r) b.vy *= -1;

    // mouse repulsion
    const dx = b.x - mx, dy = b.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < 280) {
      b.vx += (dx / dist) * 0.15;
      b.vy += (dy / dist) * 0.15;
    }
    b.vx *= 0.995;
    b.vy *= 0.995;

    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.hue}, 100%, 55%, 0.12)`);
    g.addColorStop(0.45, `hsla(${b.hue}, 90%, 40%, 0.04)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Particles + connections
  particles.forEach((p, i) => {
    p.x += p.vx + Math.sin(t * 2 + i) * 0.3;
    p.y += p.vy + Math.cos(t * 1.5 + i) * 0.25;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.45)`;
    ctx.fill();

    // connect nearby
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `hsla(${p.hue}, 100%, 55%, ${0.12 * (1 - d / 90)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  });

  // Glitch scan lines
  spawnLine();
  for (let i = lines.length - 1; i >= 0; i--) {
    const L = lines[i];
    L.life -= 0.04;
    if (L.life <= 0) { lines.splice(i, 1); continue; }
    ctx.fillStyle = `hsla(${L.hue}, 100%, 60%, ${L.life * 0.25})`;
    ctx.fillRect(0, L.y, w, L.h);
  }

  // Mouse glow
  if (mx > 0) {
    const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
    mg.addColorStop(0, 'rgba(0, 245, 255, 0.08)');
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(mx, my, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(frame);
}
frame();

// Scroll reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
);
document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 0.05}s`;
  observer.observe(el);
});

// Header
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile nav
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

// Occasional title glitch
const title = document.querySelector('.hero-title');
if (title) {
  setInterval(() => {
    if (Math.random() > 0.85) {
      title.classList.add('glitching');
      setTimeout(() => title.classList.remove('glitching'), 200 + Math.random() * 300);
    }
  }, 2800);
}
