// Липкое меню разделов страницы (порт скрипта из SectionNav.astro).
document.querySelectorAll('[data-secnav]').forEach((nav) => {
  const list = nav.querySelector('[data-secnav-list]');
  const pairs = [...list.querySelectorAll('a[href^="#"]')]
    .map((a) => [document.getElementById(decodeURIComponent(a.hash.slice(1))), a])
    .filter((p) => !!p[0]);
  let current = null;
  const setActive = (a) => {
    if (a === current) return;
    if (current) { current.classList.remove('is-active'); current.removeAttribute('aria-current'); }
    current = a;
    if (!a) return;
    a.classList.add('is-active');
    a.setAttribute('aria-current', 'location');
    // Держим активный пункт в поле зрения горизонтальной ленты (телефон).
    const left = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  };
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    const hit = pairs.find(([el]) => visible.has(el));
    setActive(hit ? hit[1] : null);
  }, { rootMargin: '-35% 0px -55% 0px' });
  pairs.forEach(([el]) => io.observe(el));
  // Тень у меню, когда оно прилипло.
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  nav.before(sentinel);
  new IntersectionObserver(([e]) => nav.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);
});
