(() => {
  const T = {
    en: { title: 'Un — Learning screen-free', language: 'Language', hero: 'Learning screen-free', sub: 'Your child counts real toys on the table and talks with a friendly tutor. The camera and the voice do the rest.', play: 'Play video', caption: 'A real lesson, filmed at the table.', cta: 'Download on TestFlight', note: 'Free beta.', platforms: 'Platforms', apple: 'iPhone & iPad', oss: 'Open source engine and lessons:', made: 'Made for curious counters.', contact: 'Contact:', privacy: 'Privacy Policy', alpha: 'Untested alpha', silicon: 'Apple silicon', team: 'Team', rinat: 'Rinat Enikeev', alexey: 'Alexey Shirshov', ideaAuthor: 'Idea author', semen: 'Semen Morshinin', ctaAndroid: 'Download for Android', noteAndroid: 'Untested alpha. APK for 64-bit ARM phones.', ctaWindows: 'Download for Windows', noteWindows: 'Untested alpha for 64-bit Windows.', ctaLinux: 'Download for Linux', noteLinux: 'Untested alpha for x86_64.', rinatSound: "Play Rinat's video with sound", semenSound: "Play Semen's video with sound" },
    ru: { title: 'Un — Учимся без экрана', language: 'Язык', hero: 'Учимся без экрана', sub: 'Ребёнок считает настоящие игрушки на столе и разговаривает с добрым наставником. Камера и голос делают остальное.', play: 'Смотреть видео', caption: 'Настоящий урок, снятый за столом.', cta: 'Скачать в TestFlight', note: 'Бесплатная бета.', platforms: 'Платформы', apple: 'iPhone и iPad', oss: 'Открытый движок и уроки:', made: 'Для тех, кто любит считать.', contact: 'Контакты:', privacy: 'Политика конфиденциальности', alpha: 'Непроверенная альфа', silicon: 'Apple silicon', team: 'Команда', rinat: 'Ринат Еникеев', alexey: 'Алексей Ширшов', ideaAuthor: 'Автор идеи', semen: 'Семён Моршинин', ctaAndroid: 'Скачать для Android', noteAndroid: 'Непроверенная альфа. APK для 64-битных ARM-телефонов.', ctaWindows: 'Скачать для Windows', noteWindows: 'Непроверенная альфа для 64-битной Windows.', ctaLinux: 'Скачать для Linux', noteLinux: 'Непроверенная альфа для x86_64.', rinatSound: 'Включить видео Рината со звуком', semenSound: 'Включить видео Семёна со звуком' }
  };

  const store = {
    get() { try { return localStorage.getItem('un-lang'); } catch { return null; } },
    set(v) { try { localStorage.setItem('un-lang', v); } catch {} }
  };

  const buttons = document.querySelectorAll('.lang [data-lang]');

  function apply(lang) {
    const t = T[lang];
    document.documentElement.lang = lang;
    // A page can carry its own title per language (data-title-en / data-title-ru on <html>).
    document.title = document.documentElement.dataset[lang === 'ru' ? 'titleRu' : 'titleEn'] || t.title;
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

  // Respect reduced motion: show the poster instead of looping video.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
  }

  // Demo video: the glass button starts it with sound and hands over to the native controls.
  const demo = document.querySelector('video.demo');
  const play = document.querySelector('.still .play');
  if (demo && play) {
    play.addEventListener('click', () => {
      play.hidden = true;
      demo.controls = true;
      demo.play().catch(() => {});
    });
    demo.addEventListener('ended', () => { demo.controls = false; demo.load(); play.hidden = false; play.focus(); });
  }

  // Team videos: sound on hover (mouse); every click/tap/Enter restarts with sound. Browsers only allow
  // audio after the visitor has interacted with the page, so if unmuting is
  // refused the video falls back to muted playback.
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.avatar.has-sound').forEach(box => {
    const v = box.querySelector('video');
    const sound = on => {
      box.setAttribute('aria-pressed', String(on));
      if (on) {
        v.loop = false;
        v.currentTime = 0;
        v.muted = false;
        v.play().catch(() => { v.muted = true; v.loop = true; box.setAttribute('aria-pressed', 'false'); if (!still) v.play().catch(() => {}); });
      } else {
        v.muted = true;
        v.loop = true;
        if (still) { v.pause(); v.currentTime = 0; }
        else if (v.paused) v.play().catch(() => {});
      }
    };
    // One play-through with sound, then back to the silent loop.
    v.addEventListener('ended', () => sound(false));
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') sound(true); });
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') sound(false); });
    box.addEventListener('click', () => sound(true));
    box.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sound(true); }
    });
  });

  // Main button: TestFlight for Apple devices (and as the default); the newest alpha build elsewhere.
  const os = (() => {
    // Client hints when the browser has them (Chromium), the user agent string otherwise.
    const s = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.userAgent;
    if (/android/i.test(s)) return 'android';
    if (/iphone|ipad|ipod|mac/i.test(s)) return 'apple';
    if (/win/i.test(s)) return 'windows';
    if (/cros|chrome os/i.test(s)) return 'other';
    if (/linux/i.test(s)) return 'linux';
    return 'other';
  })();
  const cta = document.querySelector('.cta-button');
  const builds = { android: 'Android', windows: 'Windows', linux: 'Linux' };
  if (cta && builds[os]) {
    cta.href = `/download/${os}`;
    cta.querySelector('[data-i18n="cta"]').dataset.i18n = `cta${builds[os]}`;
    document.querySelector('.cta-note').dataset.i18n = `note${builds[os]}`;
    cta.querySelector('.icon-apple').setAttribute('hidden', '');
    cta.querySelector('.icon-download').removeAttribute('hidden');
  }

  const saved = store.get();
  const initial = T[saved] ? saved : (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en';
  apply(initial);
})();
