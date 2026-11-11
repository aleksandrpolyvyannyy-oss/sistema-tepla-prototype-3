// Форма заявки. В предпросмотре проверка полей работает, отправки нет.
(function () {
  document.querySelectorAll('form[data-lead] input[type="tel"], form[data-lead] input[type="text"], [data-quiz] input[type="text"]').forEach((i) => i.addEventListener('focus', () => {
    if (matchMedia('(max-width: 900px)').matches) setTimeout(() => i.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  }));
  // Телефон: «+7» стоит заранее и не стирается, цифры раскладываются в +7 (XXX) XXX-XX-XX.
  // Вставка 8XXXXXXXXXX, 7XXXXXXXXXX и +7... приводится к тому же виду.
  const PREFIX = '+7 ';
  const fmtPhone = (raw) => {
    let d = raw.replace(/\D/g, '');
    if (raw.trim().startsWith('+7')) d = d.slice(1);
    if (d.length === 11 && /^[78]/.test(d)) d = d.slice(1);
    d = d.slice(0, 10);
    // Разделитель ставится только перед следующей цифрой: иначе Backspace не смог бы стереть «-» или «)».
    let out = PREFIX;
    if (d.length) out += '(' + d.slice(0, 3);
    if (d.length > 3) out += ') ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  };
  document.querySelectorAll('form[data-lead] input[name="phone"]').forEach((p) => {
    p.placeholder = '+7 (___) ___-__-__';
    const ensure = () => { if (!p.value.startsWith(PREFIX)) p.value = fmtPhone(p.value); };
    p.addEventListener('focus', () => { if (!p.value) p.value = PREFIX; requestAnimationFrame(() => p.setSelectionRange(p.value.length, p.value.length)); });
    p.addEventListener('blur', () => { if (p.value.trim() === '+7') p.value = ''; });
    p.addEventListener('keydown', (e) => {
      if ((e.key === 'Backspace' && p.selectionStart <= PREFIX.length && p.selectionEnd <= PREFIX.length) || (e.key === 'Delete' && p.selectionStart < PREFIX.length)) e.preventDefault();
    });
    p.addEventListener('input', () => { p.value = fmtPhone(p.value); ensure(); });
  });
  // Файл спрятан за ссылкой «Приложить проект»: без JS поле видно сразу (CSS прячет его только при html.js).
  document.querySelectorAll('[data-file-open]').forEach((b) => b.addEventListener('click', () => {
    const box = document.getElementById(b.getAttribute('aria-controls'));
    if (!box) return;
    box.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); b.hidden = true;
    const inp = box.querySelector('[data-file]'); if (inp) inp.focus();
  }));
  document.querySelectorAll('[data-file]').forEach((inp) => inp.addEventListener('change', () => {
    const out = inp.parentElement.querySelector('[data-file-name]');
    out.textContent = inp.files && inp.files[0] ? inp.files[0].name : 'PDF, JPG, PNG или DWG';
    inp.closest('.file').classList.toggle('has-file', !!(inp.files && inp.files[0]));
  }));
  document.querySelectorAll('form[data-lead]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const phone = form.querySelector('input[name="phone"]');
      const consent = form.querySelector('input[name="consent"]');
      const phoneOk = phone.value.replace(/\D/g, '').length >= 10;
      phone.closest('[data-field]').classList.toggle('has-error', !phoneOk);
      consent.closest('[data-field]').classList.toggle('has-error', !consent.checked);
      if (!phoneOk) { e.preventDefault(); phone.focus(); return; }
      if (!consent.checked) { e.preventDefault(); consent.focus(); return; }
      // Предпросмотр: заявка никуда не отправляется.
      e.preventDefault();
      let n = form.querySelector('.preview-note');
      if (!n) { n = document.createElement('p'); n.className = 'proto-note preview-note'; n.style.marginTop = '12px'; form.appendChild(n); }
      n.textContent = 'Предпросмотр дизайна: заявка не отправлена.';
    });
  });
  // Возврат «Назад» из кеша браузера: снять состояние загрузки с кнопок.
  window.addEventListener('pageshow', () => document.querySelectorAll('form[data-lead] .is-loading').forEach((b) => { b.classList.remove('is-loading'); b.removeAttribute('aria-busy'); }));
})();
