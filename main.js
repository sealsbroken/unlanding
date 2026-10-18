(() => {
  const T = {
    en: { title: 'Un — Learning screen-free', language: 'Language', hero: 'Learning screen-free', sub: 'Your child counts real toys on the table and talks with a friendly tutor. The camera and the voice do the rest.', play: 'Play video', caption: 'A real lesson, filmed at the kitchen table.', cta: 'Download on TestFlight', note: 'Free beta for iPhone and iPad.', platforms: 'Platforms', apple: 'iPhone & iPad', oss: 'Open source engine and lessons:', made: 'Made for curious counters.' },
    ru: { title: 'Un — Учимся без экрана', language: 'Язык', hero: 'Учимся без экрана', sub: 'Ребёнок считает настоящие игрушки на столе и разговаривает с добрым наставником. Камера и голос делают остальное.', play: 'Смотреть видео', caption: 'Настоящий урок, снятый за кухонным столом.', cta: 'Скачать в TestFlight', note: 'Бесплатная бета для iPhone и iPad', platforms: 'Платформы', apple: 'iPhone и iPad', oss: 'Открытый движок и уроки:', made: 'Для тех, кто любит считать.' }
  };

  const store = {
    get() { try { return localStorage.getItem('un-lang'); } catch { return null; } },
    set(v) { try { localStorage.setItem('un-lang', v); } catch {} }
  };

  const buttons = document.querySelectorAll('.lang [data-lang]');

  function apply(lang) {
    const t = T[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t[el.dataset.i18nAria]); });
    buttons.forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === lang)));
  }

  buttons.forEach(b => b.addEventListener('click', () => { store.set(b.dataset.lang); apply(b.dataset.lang); }));

  // Arrow keys move between radios, per the radiogroup pattern.
  document.querySelector('.lang').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next = document.documentElement.lang === 'en' ? 'ru' : 'en';
    store.set(next);
    apply(next);
    document.querySelector(`.lang [data-lang="${next}"]`).focus();
  });

  const saved = store.get();
  const initial = T[saved] ? saved : (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en';
  if (initial !== 'en') apply(initial);
})();
