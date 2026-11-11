// Шапка: бургер, мобильное меню, раскрытие подразделов (порт скрипта из Header.astro).
(function () {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const burger = header.querySelector('[data-burger]');
  // Компактная шапка после прокрутки. Разные пороги включения и выключения: шапка в потоке страницы,
  // её уменьшение сдвигает прокрутку, и с одним порогом она бы мигала на границе.
  const compact = () => {
    const y = window.scrollY;
    const on = header.classList.contains('is-compact') ? y > 10 : y > 120;
    header.classList.toggle('is-compact', on);
    document.documentElement.classList.toggle('hdr-compact', on);
  };
  addEventListener('scroll', compact, { passive: true });
  compact();
  const desktop = matchMedia('(min-width: 1360px)');
  const closeSubs = (except) => header.querySelectorAll('[data-sub].is-open').forEach((o) => {
    if (o === except) return;
    o.classList.remove('is-open');
    o.querySelector('button').setAttribute('aria-expanded', 'false');
  });
  const setMenu = (open) => {
    // Меню занимает весь экран ниже шапки, где бы шапка ни находилась (над ней плашка прототипа).
    header.style.setProperty('--menu-top', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    header.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    closeSubs();
    // На телефоне раздел, в котором находится посетитель, сразу раскрыт.
    const active = open ? header.querySelector('[data-sub][data-active]') : null;
    if (active) {
      active.classList.add('is-open');
      active.querySelector('button').setAttribute('aria-expanded', 'true');
    }
  };
  burger.addEventListener('click', () => setMenu(!header.classList.contains('is-menu')));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (header.classList.contains('is-menu')) { setMenu(false); burger.focus(); }
    closeSubs();
  });
  desktop.addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  header.querySelectorAll('[data-sub]').forEach((li) => {
    const btn = li.querySelector('button');
    btn.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      closeSubs(li);
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) closeSubs();
  });
  header.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
})();
