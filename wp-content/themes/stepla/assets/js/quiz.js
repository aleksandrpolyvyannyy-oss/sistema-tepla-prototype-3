// Калькулятор (порт скрипта из Quiz.astro): 6 шагов → вилка цены (11.11.2026: стадия дома и источник тепла - отдельные шаги 3 и 4). Расчёт и тексты — как в прототипе.
// Добавлено для WP: ответы кладутся в скрытые поля формы заявки (quiz_*), их сохраняет inc/pkg-d.php.
(function () {
  const fmt = (n) => n.toLocaleString('ru-RU');
  document.querySelectorAll('[data-quiz]').forEach((quiz) => {
    let step = 1;
    const TOTAL = 6;
    const steps = quiz.querySelectorAll('[data-step]');
    const prev = quiz.querySelector('[data-q-prev]');
    const next = quiz.querySelector('[data-q-next]');
    const bar = quiz.querySelector('[data-q-bar]');
    const label = quiz.querySelector('[data-q-label]');
    const area = quiz.querySelector('[data-q-area]');
    const areaOut = quiz.querySelector('[data-q-area-out]');
    const val = (name) => { const i = quiz.querySelector(`input[name="${name}"]:checked`); return i ? i.value : undefined; };
    const required = { 1: ['q-service'], 2: ['q-walls'], 3: ['q-stage'] };

    area.addEventListener('input', () => (areaOut.value = area.value));

    const canGo = () => (required[step] || []).every((n) => val(n) !== undefined);
    const render = () => {
      steps.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === step));
      prev.disabled = step === 1;
      next.hidden = step > TOTAL;
      next.textContent = step === TOTAL ? 'Показать стоимость' : 'Далее';
      next.classList.toggle('is-final', step === TOTAL);
      next.disabled = !canGo();
      bar.style.width = `${Math.min(step, TOTAL + 1) / (TOTAL + 1) * 100}%`;
      label.textContent = step > TOTAL ? 'Готово: ваш расчёт' : `Шаг ${step} из ${TOTAL}`;
      if (step > TOTAL) calc();
    };
    quiz.addEventListener('change', (e) => {
      // «Ничего из этого не нужно» снимает допуслуги, а выбор допуслуги снимает «ничего не нужно».
      const t = e.target;
      if (t.name === 'q-extra' && t.checked) {
        quiz.querySelectorAll('input[name="q-extra"]').forEach((i) => { if (i !== t && (t.value === 'none' || i.value === 'none')) i.checked = false; });
      }
      next.disabled = !canGo();
    });
    // После смены шага - к началу квиза, если его верх ушёл под липкую шапку или кнопки шагов не видны над нижней панелью.
    // Отступ сверху даёт scroll-padding-top у html (шапка) и scroll-margin-top у .quiz (меню разделов), global.css.
    const nav = quiz.querySelector('.quiz__nav');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let counted = false;
    const toTop = () => {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const mbar = document.querySelector('.mbar');
      const mb = mbar && getComputedStyle(mbar).display !== 'none' ? mbar.getBoundingClientRect().height : 0;
      if (quiz.getBoundingClientRect().top < pad || nav.getBoundingClientRect().bottom > innerHeight - mb) {
        quiz.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
      }
    };
    next.addEventListener('click', () => { if (canGo()) { quiz.classList.remove('is-back'); step++; render(); toTop(); } });
    prev.addEventListener('click', () => { if (step > 1) { quiz.classList.add('is-back'); step--; render(); toTop(); } });

    // Текст выбранного варианта без пояснения <small>.
    const text = (input) => {
      const lab = input.closest('label').cloneNode(true);
      lab.querySelectorAll('small, input').forEach((n) => n.remove());
      return lab.textContent.trim();
    };
    const answer = (name) => { const i = quiz.querySelector(`input[name="${name}"]:checked`); return i ? text(i) : ''; };

    // Ответы квиза → поля формы (в предпросмотре никуда не уходят).
    function pass(fields) {
      const form = quiz.querySelector('form[data-lead]');
      if (!form) return;
      form.querySelectorAll('input[data-q-pass]').forEach((n) => n.remove());
      Object.keys(fields).forEach((k) => {
        const h = document.createElement('input');
        h.type = 'hidden';
        h.name = k;
        h.value = fields[k];
        h.setAttribute('data-q-pass', '');
        form.appendChild(h);
      });
    }

    function calc() {
      const s = val('q-service') || 'otoplenie';
      const a = Number(area.value);
      const wallK = [1, 0.95, 1.05, 1][Number(val('q-walls') ?? 0)];
      const stageK = [1, 1.05, 1.18][Number(val('q-stage') ?? 0)];
      // Номер = value ответа в quiz.php: 0 газ, 1 электричество, 2 не используется (был тепловой насос),
      // 3 дрова и пеллеты, 4 ещё не решили, 5 сжиженный газ (газ + газгольдерная обвязка), 6 дизель.
      const fuelK = [1, 0.85, 1, 1.15, 1, 1.1, 1.15][Number(val('q-fuel') ?? 4)] ?? 1;
      let lo = 0, hi = 0, round = 10000;
      if (s === 'otoplenie') { lo = a * 2600 * fuelK; hi = a * 4300 * fuelK; }
      if (s === 'voda') { lo = a * 900; hi = a * 1500; }
      if (s === 'kanalizaciya') { lo = 180000 + a * 100; hi = 290000 + a * 300; }
      if (s === 'servis') { lo = 6000 + a * 20; hi = 15000 + a * 40; round = 1000; }
      if (s === 'kompleks') { lo = a * 3800 * fuelK; hi = a * 6000 * fuelK; }
      if (s === 'zapusk') { lo = 12000 + a * 60; hi = 25000 + a * 180; round = 1000; }
      if (s === 'otoplenie' || s === 'voda' || s === 'kompleks') { lo *= wallK * stageK; hi *= wallK * stageK; }
      const extras = {
        septik: [145000, 260000, 'септик'], voda: [90000, 180000, 'ввод воды'], filtr: [60000, 140000, 'фильтрация'],
      };
      // Допуслуга, совпадающая с выбранным разделом, второй раз не считается.
      const chosen = [...quiz.querySelectorAll('input[name="q-extra"]:checked')].map((i) => i.value).filter((c) => c !== 'none' && !(s === 'kanalizaciya' && c === 'septik'));
      chosen.forEach((c) => { lo += extras[c][0]; hi += extras[c][1]; });
      const r = (n) => Math.round(n / round) * round;
      const fork = `${fmt(r(lo))} - ${fmt(r(hi))} руб.`;
      const forkEl = quiz.querySelector('[data-q-fork]');
      const sum = `Дом ${a} м²` + (chosen.length ? ` · плюс ${chosen.map((c) => extras[c][2]).join(', ')}` : '');
      // Вилка «набегает» от нуля один раз за прохождение (600 мс, ease-out); при reduced-motion и повторно - сразу итог.
      if (!counted && !reduce.matches && window.requestAnimationFrame) {
        counted = true;
        const box = forkEl.closest('[aria-live]');
        if (box) box.setAttribute('aria-busy', 'true');
        const L = r(lo), H = r(hi), t0 = performance.now();
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3);
          forkEl.textContent = k < 1 ? `${fmt(Math.round(L * e / round) * round)} - ${fmt(Math.round(H * e / round) * round)} руб.` : fork;
          if (k < 1) requestAnimationFrame(tick); else if (box) box.removeAttribute('aria-busy');
        };
        requestAnimationFrame(tick);
      } else {
        forkEl.textContent = fork;
      }
      quiz.querySelector('[data-q-sum]').textContent = sum;
      const placeEl = quiz.querySelector('#q-place');
      pass({
        quiz_service: answer('q-service'),
        quiz_area: String(a),
        quiz_walls: answer('q-walls'),
        quiz_stage: answer('q-stage'),
        quiz_fuel: answer('q-fuel'),
        quiz_extra: [...quiz.querySelectorAll('input[name="q-extra"]:checked')].map(text).join('; ') || 'не выбрано',
        quiz_place: placeEl ? placeEl.value : '',
        quiz_term: answer('q-term'),
        quiz_fork: fork,
      });
    }
    render();
  });
})();
