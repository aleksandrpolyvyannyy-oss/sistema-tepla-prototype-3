// Cookie-баннер (порт скрипта из CookieBanner.astro). До согласия ничего не загружается.
(function () {
  const KEY = 'st-cookie-consent';
  const VERSION = '2026-10-29';
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.version === VERSION ? v : null; } catch (e) { return null; } };
  // Карта офиса на «Контактах»: внешний виджет Яндекс Карт подключается только по нажатию «Показать карту».
  document.querySelectorAll('[data-map-load]').forEach((b) => b.addEventListener('click', () => {
    const wrap = b.closest('[data-map-box]'); const f = wrap && wrap.querySelector('iframe[data-click-src]');
    if (!f) return;
    f.src = f.getAttribute('data-click-src'); f.hidden = false;
    const stub = wrap.querySelector('[data-map-stub]'); if (stub) stub.hidden = true;
  }));
  const box = document.querySelector('[data-cookie]');
  if (!box) return;
  const analyticsBox = box.querySelector('[data-cookie-analytics]');
  const loadAnalytics = () => {
    if (window.__stAnalytics) return;
    window.__stAnalytics = true;
    // Виджеты отзывов Яндекс Карт и 2ГИС (внешние iframe) — тоже только после согласия.
    document.querySelectorAll('iframe[data-consent-src]').forEach((f) => {
      f.src = f.getAttribute('data-consent-src'); f.hidden = false;
      const stub = f.parentNode.querySelector('[data-consent-stub]'); if (stub) stub.hidden = true;
    });
    // Карта Яндекса на «Контактах» - с тем же согласием (без него - картинка с нашего сервера и кнопка).
    document.querySelectorAll('[data-map-load]').forEach((b) => b.click());
  };
  const save = (analytics) => {
    try { localStorage.setItem(KEY, JSON.stringify({ necessary: true, analytics: analytics, version: VERSION, date: new Date().toISOString() })); } catch (e) {}
    box.classList.remove('is-visible', 'is-custom');
    if (analytics) loadAnalytics();
  };
  const state = read();
  if (!state) box.classList.add('is-visible');
  else if (state.analytics) loadAnalytics();
  box.querySelector('[data-cookie-all]').addEventListener('click', () => save(true));
  box.querySelector('[data-cookie-necessary]').addEventListener('click', () => save(false));
  const saveBtn = box.querySelector('[data-cookie-save]');
  box.querySelector('[data-cookie-custom]').addEventListener('click', () => { box.classList.add('is-custom'); saveBtn.hidden = false; });
  saveBtn.addEventListener('click', () => save(analyticsBox.checked));
  document.querySelectorAll('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => {
    const s = read(); analyticsBox.checked = !!(s && s.analytics);
    box.classList.add('is-visible', 'is-custom'); saveBtn.hidden = false;
  }));
})();
