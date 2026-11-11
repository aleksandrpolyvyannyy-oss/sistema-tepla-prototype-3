// Компактный вид страниц (inc/pkg-compact.php): разделы «Подробно» свёрнуты до заголовка и первого абзаца.
// Раскрытие - кнопкой «Читать подробнее» (aria-expanded) или кликом по заголовку; якорь внутри раздела раскрывает его.
// Где браузер умеет hidden="until-found", свёрнутый текст находится поиском по странице (Ctrl+F) и раскрывается сам.
// Весь текст остаётся в HTML: скрипт только ставит классы и добавляет кнопки; высоту заранее ограничивает compact.css.

// Замеры «помещается ли текст» - в ResizeObserver: он срабатывает после раскладки, лишних пересчётов страницы
// при загрузке нет; по умолчанию (до замера) текст считается обрезанным - кнопка и затухание на месте.
const stWatch = (el, fn) => { if ('ResizeObserver' in window) new ResizeObserver(() => fn()).observe(el); };

// Кнопка «Ещё / Подробнее» после элемента: переключает класс is-open (или другой) у цели.
const stMoreBtn = (after, target, labels, openClass) => {
  const cls = openClass || 'is-open';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cmore';
  btn.setAttribute('aria-expanded', 'false');
  if (!target.id) target.id = 'cm-' + Math.random().toString(36).slice(2, 8);
  btn.setAttribute('aria-controls', target.id);
  btn.textContent = labels[0];
  after.after(btn);
  btn.addEventListener('click', () => {
    const open = target.classList.toggle(cls);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? labels[1] : labels[0];
    if (!open && target.getBoundingClientRect().top < 0) target.scrollIntoView({ block: 'start' });
  });
  return btn;
};

// Длинный прайс раздела «Цены» услуги: на телефоне (больше 8 строк) видны первые 6, на компьютере (больше 10) - первые 8,
// остальные строки - кнопкой «Показать все цены». Строки остаются в HTML.
document.querySelectorAll('section#ceny .table-wrap').forEach((wrap) => {
  const rows = wrap.querySelectorAll('table.price tbody tr').length;
  if (rows <= 8) return;
  const label = 'Показать все цены (' + rows + ')';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'price-more' + (rows > 10 ? ' price-more--d' : '');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = label;
  wrap.classList.add('is-cut');
  if (rows > 10) wrap.classList.add('is-cut-d');
  wrap.after(btn);
  btn.addEventListener('click', () => {
    const open = wrap.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Свернуть прайс' : label;
    if (!open && wrap.getBoundingClientRect().top < 0) wrap.scrollIntoView({ block: 'start' });
  });
});

// Вопросы и ответы: видны первые 5 (все свёрнуты), остальные - кнопкой «Ещё вопросы». Ответы и разметка FAQPage - в HTML.
document.querySelectorAll('.faq').forEach((faq) => {
  const n = faq.querySelectorAll(':scope > details').length;
  if (n <= 5) { faq.classList.add('is-all'); return; }
  const shown = n === 6 ? 4 : 5; // ровно 6 - видны 4 (compact.css), иначе 5
  stMoreBtn(faq, faq, ['Ещё вопросы (' + (n - shown) + ')', 'Свернуть вопросы'], 'is-all');
});

// Этапы: подпись этапа обрезана до 2-3 строк (compact.css); одна кнопка показывает все подписи целиком.
document.querySelectorAll('.steps').forEach((ol) => {
  const ps = [...ol.querySelectorAll(':scope > li > p')];
  if (!ps.length) return;
  const btn = stMoreBtn(ol.closest('.more') || ol, ol, ['Подробнее об этапах', 'Свернуть этапы']);
  stWatch(ol, () => {
    if (ol.classList.contains('is-open')) return;
    const fit = !ps.some((p) => p.scrollHeight > p.clientHeight + 2);
    if (ol.classList.contains('is-fit') !== fit) { ol.classList.toggle('is-fit', fit); btn.hidden = fit; }
  });
});

(function () {
  const blocks = [...document.querySelectorAll('[data-pcol]')];
  if (!blocks.length) return;
  const untilFound = 'onbeforematch' in document.body;

  const setOpen = (box, open) => {
    const body = box.querySelector(':scope > [data-pcol-body]');
    const btn = box.querySelector(':scope > [data-pcol-btn]');
    box.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('[data-pcol-label]').textContent = open ? 'Свернуть' : 'Читать подробнее';
    if (untilFound && body) {
      if (open) body.removeAttribute('hidden');
      else body.setAttribute('hidden', 'until-found');
    }
  };

  // Первый абзац обрезан до 3-4 строк: если он целиком помещается - без затухания (is-fitlead),
  // а раздел без скрытой части - ещё и без кнопки (pcol--fit).
  const measure = (box, lead, body) => {
    if (box.classList.contains('is-open')) return;
    const fit = lead.scrollHeight <= lead.clientHeight + 2;
    if (box.classList.contains('is-fitlead') === fit) return;
    box.classList.toggle('is-fitlead', fit);
    box.classList.toggle('pcol--fit', fit && !body);
  };

  blocks.forEach((box) => {
    const body = box.querySelector(':scope > [data-pcol-body]');
    const btn = box.querySelector(':scope > [data-pcol-btn]');
    const h2 = box.querySelector(':scope > h2');
    const lead = box.querySelector(':scope > [data-pcol-lead]');
    if (lead) stWatch(lead, () => measure(box, lead, body));
    if (untilFound && body) {
      box.classList.add('pcol--uf');
      body.setAttribute('hidden', 'until-found');
      body.addEventListener('beforematch', () => setOpen(box, true));
    }
    btn.addEventListener('click', () => {
      const open = !box.classList.contains('is-open');
      setOpen(box, open);
      // После «Свернуть» возвращаем к началу раздела, если он ушёл за верх экрана.
      if (!open && box.getBoundingClientRect().top < 0) (h2 || box).scrollIntoView({ block: 'start' });
    });
    if (h2) {
      h2.addEventListener('click', (e) => {
        if (e.target.closest('a') || box.classList.contains('pcol--fit')) return;
        const open = !box.classList.contains('is-open');
        setOpen(box, open);
      });
    }
  });

  // Якорь (#karkas или якорь внутри свёрнутого текста): раскрыть раздел и показать его.
  const reveal = (hash, scroll) => {
    if (!hash || hash.length < 2) return;
    let el = null;
    try { el = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return; }
    const box = el && el.closest('[data-pcol]');
    if (!box) return;
    const wasHidden = !box.classList.contains('is-open') && !!el.closest('[data-pcol-body]');
    setOpen(box, true);
    if (scroll && wasHidden) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  };
  reveal(location.hash, true);
  addEventListener('hashchange', () => reveal(location.hash, true));
  // Клик по ссылке на якорь этой же страницы (в т. ч. повторный, когда hashchange не срабатывает).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
    reveal(a.hash, false);
  }, true);
})();

// Объекты: видны первые три (compact.css), остальные - кнопкой «Ещё объекты (N)» в строке с «Все объекты».
document.querySelectorAll('#obekty .grid--4').forEach((grid) => {
  const n = grid.children.length - 3;
  const all = grid.closest('.wrap') && grid.closest('.wrap').querySelector(':scope > p.mt-24 > a');
  if (n < 1 || !all) return;
  stMoreBtn(all, grid, ['Ещё объекты (' + n + ')', 'Свернуть объекты'], 'is-all');
});

// Подвал на телефоне: группы ссылок свёрнуты до заголовков, кнопка у заголовка (aria-expanded) показывает ссылки группы;
// клик по самому заголовку (не по ссылке) - то же. На компьютере кнопки скрыты (compact.css), ссылки видны всегда.
document.querySelectorAll('.footer__grid > div:not(.footer__brand) > h3').forEach((h, i) => {
  const ul = h.nextElementSibling;
  if (!ul || ul.tagName !== 'UL') return;
  if (!ul.id) ul.id = 'fnav-' + i;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fnav__btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', ul.id);
  const label = document.createElement('span');
  label.className = 'visually-hidden';
  label.textContent = 'показать ссылки';
  btn.append(label);
  h.append(btn);
  const toggle = () => btn.setAttribute('aria-expanded', String(h.classList.toggle('is-open')));
  btn.addEventListener('click', toggle);
  h.addEventListener('click', (e) => { if (!e.target.closest('a, button')) toggle(); });
});
