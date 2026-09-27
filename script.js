// ===== FLUID / WATER-LIKE CANVAS =====
const canvas = document.getElementById('fluid');
const ctx = canvas.getContext('2d');
let w, h, particles = [];
const PARTICLE_COUNT = 55;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.reset(true);
  }
  reset(init = false) {
    this.x = Math.random() * w;
    this.y = init ? Math.random() * h : h + 20;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -Math.random() * 0.6 - 0.2;
    this.r = Math.random() * 2.2 + 0.6;
    this.alpha = Math.random() * 0.35 + 0.08;
    this.life = 0;
    this.maxLife = 400 + Math.random() * 300;
  }
  update() {
    this.x += this.vx + Math.sin(this.life * 0.02) * 0.3;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -20) this.reset();
  }
  draw() {
    const fade = 1 - this.life / this.maxLife;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha * fade})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Soft blobs / fluid blobs
const blobs = [];
for (let i = 0; i < 5; i++) {
  blobs.push({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 80 + Math.random() * 120,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    hue: i % 2 === 0 ? 180 : 320
  });
}

function animate() {
  ctx.fillStyle = 'rgba(5, 5, 10, 0.18)';
  ctx.fillRect(0, 0, w, h);

  // Fluid blobs
  blobs.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -b.r || b.x > w + b.r) b.vx *= -1;
    if (b.y < -b.r || b.y > h + b.r) b.vy *= -1;

    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.hue}, 100%, 55%, 0.07)`);
    g.addColorStop(0.5, `hsla(${b.hue}, 100%, 45%, 0.03)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();

// Mouse interaction – gentle push
let mx = -1000, my = -1000;
window.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  blobs.forEach(b => {
    const dx = b.x - mx;
    const dy = b.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      b.vx += dx * 0.0003;
      b.vy += dy * 0.0003;
    }
  });
});

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach(el => observer.observe(el));

// Stagger children slightly
document.querySelectorAll('.xp-list, .stack-grid, .about-stats').forEach(group => {
  const children = group.querySelectorAll('.reveal');
  children.forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.08}s`;
  });
});

// ===== MOBILE MENU =====
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ===== NAV SCROLL STATE =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.style.borderBottomColor = 'rgba(0, 240, 255, 0.25)';
  else nav.style.borderBottomColor = 'rgba(0, 240, 255, 0.15)';
});
