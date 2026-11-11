// Фильтры каталога объектов (скрипт из src/pages/obekty/index.astro).
(function () {
  const root = document.querySelector('[data-filters]');
  if (!root) return;
  const items = [...document.querySelectorAll('[data-obj]')];
  const district = document.querySelector('[data-district]');
  const area = document.querySelector('[data-area]');
  const empty = document.querySelector('[data-empty]');
  let tag = 'all';
  const apply = () => {
    const [min, max] = area.value ? area.value.split('-').map(Number) : [0, Infinity];
    let shown = 0;
    items.forEach((el) => {
      const a = Number(el.dataset.area);
      const ok = (tag === 'all' || el.dataset.tags.split(' ').includes(tag)) && (!district.value || el.dataset.district === district.value) && a >= min && a < max;
      el.hidden = !ok;
      if (ok) shown++;
    });
    empty.style.display = shown ? 'none' : 'block';
  };
  root.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    tag = b.dataset.filter;
    apply();
  }));
  district.addEventListener('change', apply);
  area.addEventListener('change', apply);
})();
