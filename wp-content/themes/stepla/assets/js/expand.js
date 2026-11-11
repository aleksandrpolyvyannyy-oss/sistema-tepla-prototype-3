// «Показать полностью» (порт скрипта из Expand.astro). Без JS блок раскрыт полностью.
(function () {
  const mq = matchMedia('(max-width: 720px)');
  const boxes = [...document.querySelectorAll('[data-more]')];
  const update = (box) => {
    if (box.classList.contains('is-open')) return;
    const body = box.querySelector('[data-more-body]');
    const btn = box.querySelector('[data-more-btn]');
    const allowed = !box.classList.contains('more--m') || mq.matches;
    box.classList.add('is-clamped');
    const limit = parseFloat(getComputedStyle(box).getPropertyValue('--more-h')) || 320;
    // Сворачиваем, только если прячем заметный кусок (больше 30% высоты).
    const over = allowed && body.scrollHeight > limit * 1.3;
    box.classList.toggle('is-clamped', over);
    btn.hidden = !over;
  };
  boxes.forEach((box) => {
    const btn = box.querySelector('[data-more-btn]');
    btn.addEventListener('click', () => {
      const open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Свернуть' : btn.dataset.label;
      if (!open) { update(box); if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' }); }
    });
    update(box);
  });
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => boxes.forEach(update), 150); });
})();
