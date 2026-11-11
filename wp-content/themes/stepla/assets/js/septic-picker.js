// Подбор станции (порт скрипта из SepticPicker.astro): клик по чипу фильтрует карточки на месте, без перезагрузки.
(function () {
  const word = (n) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'модель';
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'модели';
    return 'моделей';
  };
  document.querySelectorAll('[data-picker]').forEach((box) => {
    const limit = Number(box.dataset.limit) || 6;
    const state = { people: box.dataset.people || '', mode: box.dataset.mode || '', gw: box.dataset.gw || '' };
    const chips = [...box.querySelectorAll('.pchip')];
    const cards = [...box.querySelectorAll('.pcard')];
    const count = box.querySelector('[data-p-count]');
    const wordEl = box.querySelector('[data-p-word]');
    const fit = box.querySelector('[data-p-fit]');
    const reset = box.querySelector('[data-p-reset]');
    const empty = box.querySelector('[data-p-empty]');
    const more = box.querySelector('[data-p-more]');
    const rest = box.querySelector('[data-p-rest]');
    let all = false;

    const ok = (c) =>
      (!state.people || c.dataset.people === state.people) &&
      (state.mode !== 'dacha' || c.dataset.dacha === '1') &&
      (state.gw !== 'high' || c.dataset.gw === '1');

    const render = () => {
      let n = 0;
      cards.forEach((c) => {
        const m = ok(c);
        c.hidden = !m;
        if (m) n++;
        c.classList.toggle('is-more', m && !all && n > limit);
      });
      count.textContent = String(n);
      wordEl.textContent = word(n);
      fit.textContent = n % 10 === 1 && n % 100 !== 11 ? 'Подходит' : 'Подходят';
      empty.hidden = n > 0;
      more.hidden = all || n <= limit;
      rest.textContent = String(Math.max(0, n - limit));
      reset.hidden = !(state.people || state.mode || state.gw);
      chips.forEach((ch) => {
        const on = state[ch.dataset.f] === ch.dataset.v;
        ch.classList.toggle('is-on', on);
        if (on) ch.setAttribute('aria-current', 'true'); else ch.removeAttribute('aria-current');
      });
    };

    chips.forEach((ch) => ch.addEventListener('click', (e) => {
      // Ctrl/Cmd/средняя кнопка — обычный переход на посадочную страницу.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      const f = ch.dataset.f, v = ch.dataset.v;
      state[f] = state[f] === v ? '' : v;
      all = false;
      render();
    }));
    reset.addEventListener('click', (e) => {
      e.preventDefault();
      state.people = state.mode = state.gw = '';
      all = false;
      render();
    });
    more.addEventListener('click', () => { all = true; render(); });
    render();
  });
})();
