// Nav scroll state
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Mobile menu
const toggle = document.querySelector('.mobile-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Animated stat counters
const animateNum = (el) => {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = target * eased;
    el.textContent = (target >= 1000 ? Math.floor(val).toLocaleString() : val.toFixed(target % 1 ? 1 : 0)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const statIO = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateNum(e.target); statIO.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => statIO.observe(el));

// Live ticker fake-update on hero
const tickerRows = document.querySelectorAll('.terminal .row [data-val]');
if (tickerRows.length) {
  setInterval(() => {
    tickerRows.forEach(el => {
      const base = parseFloat(el.dataset.val);
      const drift = (Math.random() - 0.5) * (base * 0.0015);
      const newVal = base + drift;
      el.textContent = newVal.toFixed(2);
      el.classList.toggle('up', drift >= 0);
      el.classList.toggle('down', drift < 0);
    });
  }, 1800);
}
