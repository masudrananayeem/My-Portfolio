/* ==========================================================================
   ANIMATIONS.JS — shared UI behaviors used across every page
   Custom cursor, loader, particle canvas, nav highlighting, GSAP reveals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCustomCursor();
  initMobileMenu();
  initScrollProgress();
  initParticleCanvas();
  initGsapReveals();
  initSectionDots();
  if (typeof Lenis !== 'undefined') initLenisSmoothScroll();
  api.logVisit(window.location.pathname);
});

/* ---------- Luxury loader ---------- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 400);
  });
}

/* ---------- Custom cursor ---------- */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || window.matchMedia('(max-width: 768px)').matches) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  document.querySelectorAll('a, button, .cursor-hoverable').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.add('hidden')));
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = `${scrolled}%`;
  });
}

/* ---------- Right-side section dots + active nav link ---------- */
function initSectionDots() {
  const sections = document.querySelectorAll('main section[id]');
  const dotsContainer = document.getElementById('section-dots');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  if (dotsContainer) {
    sections.forEach((sec) => {
      const dot = document.createElement('div');
      dot.className = 'section-dot';
      dot.dataset.target = sec.id;
      dot.addEventListener('click', () => sec.scrollIntoView({ behavior: 'smooth' }));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.section-dot');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dots.forEach((d) => d.classList.toggle('active', d.dataset.target === entry.target.id));
          navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((sec) => observer.observe(sec));
}

/* ---------- GSAP scroll-triggered reveal animations ---------- */
function initGsapReveals() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.reveal-fade').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Animate skill bars once visible
  gsap.utils.toArray('.skill-bar-fill').forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      onEnter: () => { bar.style.width = bar.dataset.level + '%'; },
    });
  });

  // Animated counters
  gsap.utils.toArray('.counter').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: target,
          duration: 1.6,
          snap: { innerText: 1 },
          ease: 'power1.out',
        });
      },
    });
  });
}

/* ---------- Lenis smooth scroll ---------- */
function initLenisSmoothScroll() {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ---------- Ambient particle canvas background ---------- */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = window.innerWidth < 768 ? 35 : 80;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    hue: Math.random() > 0.5 ? '0,245,255' : '168,85,247',
  }));

  let mouseX = canvas.width / 2, mouseY = canvas.height / 2;
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mouse follow glow
    const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 260);
    glow.addColorStop(0, 'rgba(0,245,255,0.06)');
    glow.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},0.6)`;
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }
  tick();
}

/* ---------- Toast notification helper (used by contact form, dashboard, etc.) ---------- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) { alert(message); return; }
  toast.textContent = message;
  toast.className = `glass-card px-5 py-3 text-sm font-medium ${type === 'error' ? 'border-red-500/50 text-red-300' : 'border-cyan-400/40 text-cyan-200'} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
