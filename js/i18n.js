/* i18n: data-i18n 속성 기반 번역, 언어 메뉴, 숨겨진 NKBK 모드.
   외부 계약(다른 모듈이 사용): window.setLanguage, window.miniwinLanguage, 'miniwin-language-change' 이벤트 */
(() => {
  const LANGS = [
    ['ko','한국어'],['en','English'],['es','Español'],['zh-CN','中文（简体）'],['zh-TW','中文（繁體）'],['ja','日本語'],
    ['fr','Français'],['de','Deutsch'],['pt-BR','Português (Brasil)'],['it','Italiano'],['ru','Русский'],['vi','Tiếng Việt'],
    ['id','Bahasa Indonesia'],['pl','Polski'],['tr','Türkçe'],['nl','Nederlands'],['sv','Svenska'],['uk','Українська'],
    ['ar','العربية'],['hi','हिन्दी']
  ];
  const FALLBACK = { 'ko-kp': 'ko' };           /* 누락된 키: 지정 언어 → 영어 순으로 대체 */
  const VERSION = '1.0-rc';                     /* same ?v= as the other assets */
  /* 번역 파일은 필요할 때만 내려받습니다: 고른 언어, 그 대체 언어, 영어. */
  const FILES = new Set([...LANGS.map(l => l[0]), 'ko-kp']);
  window.I18N = window.I18N || {};
  const I18N = window.I18N;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} }
  };
  const loading = {};
  function loadDict(code) {
    if (I18N[code]) return Promise.resolve();
    if (!loading[code]) {
      loading[code] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'i18n/' + code + '.js?v=' + VERSION;
        s.onload = () => resolve();
        s.onerror = () => { delete loading[code]; reject(new Error('i18n: ' + code)); };
        document.head.appendChild(s);
      });
    }
    return loading[code];
  }
  const dictFor = lang => ({ ...I18N.en, ...(I18N[FALLBACK[lang]] || {}), ...(I18N[lang] || {}) });

  let latest = 0;   /* a newer choice made while a file was loading wins */
  let markReady;
  window.miniwinLanguageReady = new Promise(resolve => { markReady = resolve; });
  function apply(lang) {
    const d = dictFor(lang);
    window.miniwinLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = d[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll('.lang-menu button').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('active', on);
      b.innerHTML = b.dataset.langLabel + (on ? '<span class="check">✓</span>' : '');
    });
    store.set('miniwin-language', lang);
    window.dispatchEvent(new CustomEvent('miniwin-language-change', { detail: lang }));
    if (window.applyCanaryLanguage) window.applyCanaryLanguage(lang);
    markReady();
  }

  function setLanguage(lang) {
    if (lang === 'ko' && store.get('miniwin-kp-default') === '1') lang = 'ko-kp';
    if (!FILES.has(lang)) lang = 'en';
    const token = ++latest;
    const need = [lang, FALLBACK[lang], 'en'].filter(Boolean);
    Promise.all(need.map(loadDict)).then(() => {
      if (token === latest) apply(lang);
    }, () => {
      if (token === latest && lang !== 'en') setLanguage('en');
    });
  }
  window.setLanguage = setLanguage;

  /* 언어 선택은 설정 창(oldretro.js)에 있습니다. */
  window.miniwinLanguages = LANGS;

  /* 숨겨진 모드: 한국어에서 NKBK 입력 */
  let buf = '';
  document.addEventListener('keydown', e => {
    if (window.miniwinLanguage !== 'ko' || e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return;
    const ch = e.key.toUpperCase();
    if (!/[A-Z]/.test(ch)) { buf = ''; return; }
    buf = (buf + ch).slice(-4);
    if (buf === 'NKBK') { buf = ''; setLanguage('ko-kp'); }
  });

  setLanguage(store.get('miniwin-language') || 'en');
})();
