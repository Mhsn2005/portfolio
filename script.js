// Subtle ambient canvas
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const dots = Array.from({ length: 40 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 1.5 + 0.4,
  vx: (Math.random() - 0.5) * 0.15,
  vy: (Math.random() - 0.5) * 0.15,
  a: Math.random() * 0.25 + 0.05
}));

const orbs = [
  { x: w * 0.2, y: h * 0.3, r: 180, vx: 0.08, vy: 0.05, c: '110, 231, 183' },
  { x: w * 0.75, y: h * 0.6, r: 220, vx: -0.06, vy: 0.04, c: '100, 140, 255' }
];

function frame() {
  ctx.fillStyle = 'rgba(12, 12, 15, 0.4)';
  ctx.fillRect(0, 0, w, h);

  orbs.forEach(o => {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < -o.r || o.x > w + o.r) o.vx *= -1;
    if (o.y < -o.r || o.y > h + o.r) o.vy *= -1;
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, `rgba(${o.c}, 0.06)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  });

  dots.forEach(d => {
    d.x += d.vx;
    d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(110, 231, 183, ${d.a})`;
    ctx.fill();
  });

  requestAnimationFrame(frame);
}
frame();

// Scroll reveal
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.06}s`;
  observer.observe(el);
});

// Hero items visible on load
document.querySelectorAll('.hero .fade-up').forEach(el => {
  el.classList.add('in');
});

// Header border on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile nav
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  nav.classList.toggle('open');
});
nav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toggle.classList.remove('open');
    nav.classList.remove('open');
  });
});
