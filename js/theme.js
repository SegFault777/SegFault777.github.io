(()=>{
  const t=document.getElementById('styleToggle');
  if(!t)return;
  const body=document.body,root=document.documentElement;
  const ua=navigator.userAgent||'',uaData=navigator.userAgentData||null;

  /* ---------------- Default layout by platform ----------------
     Used only until the visitor chooses a layout (a saved choice always wins).
     Each entry: [layout shown by default, Modern variant used when the header toggle leaves a retro layout].
     Browsers only expose what the OS reports, so:
       - Windows: the NT version is in the UA string. Windows 11 and 10 both say "NT 10.0", so Chromium's
         Client Hints (platformVersion, 13+ = Windows 11) are used when available. Firefox and Safari do not
         send them, so there Windows 11 is treated as Windows 10 (Flat).
       - macOS: Safari freezes the UA at "Mac OS X 10_15_7", so Client Hints give the real version where
         supported. Without them the Mac is assumed to be OS X 10.10 or later (Sequoia).
       - Linux: a web page cannot tell KDE from GNOME (or any other desktop), so Linux uses Modern. */
  const DEFAULTS={
    win11:['mica','mica'],win10:['flat','flat'],win8:['flat','flat'],win7:['aero','aero'],vista:['aero','aero'],
    xp:['luna','modern'],win2000:['retro','modern'],win9x:['retro','modern'],
    mac_tahoe:['modern-glass','modern-glass'],mac_sequoia:['sequoia','sequoia'],mac_aqua:['aqua','modern'],
    ios:['sequoia','sequoia'],android:['modern','modern'],linux:['modern','modern'],other:['modern','modern']
  };
  let osVersion=null; /* {platform, major, minor} from Client Hints, filled in asynchronously */
  const winKey=()=>{
    const m=/Windows NT (\d+)\.(\d+)/.exec(ua);
    if(!m)return /Windows (?:95|98|Me|3\.1)/.test(ua)?'win9x':'win10';
    const maj=+m[1],min=+m[2];
    if(maj===10)return osVersion&&osVersion.platform==='Windows'&&osVersion.major>=13?'win11':'win10';
    if(maj===6&&min>=2)return 'win8';   /* 6.2 = Windows 8, 6.3 = Windows 8.1 */
    if(maj===6&&min===1)return 'win7';
    if(maj===6)return 'vista';
    if(maj===5&&min>=1)return 'xp';     /* 5.1 = Windows XP */
    if(maj===5)return 'win2000';
    return 'win10';
  };
  const macKey=()=>{
    let maj=0,min=0;
    if(osVersion&&osVersion.platform==='macOS'&&osVersion.major>0){maj=osVersion.major;min=osVersion.minor}
    else{const m=/Mac OS X (\d+)[_.](\d+)/.exec(ua);if(m){maj=+m[1];min=+m[2]}}
    if(!maj)return 'mac_sequoia';
    if(maj>=16)return 'mac_tahoe';                              /* macOS 26 Tahoe and later */
    if(maj>=11||(maj===10&&min>=10))return 'mac_sequoia';      /* OS X 10.10 through macOS 15 */
    return 'mac_aqua';                                          /* OS X 10.0–10.9 */
  };
  const platformKey=()=>{
    if(/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return 'ios';
    if(/Android/i.test(ua))return 'android';
    if(/Windows/.test(ua))return winKey();
    if(/Macintosh|Mac OS X/.test(ua))return macKey();
    if(/Linux/.test(ua))return 'linux';
    return 'other';
  };
  let platform=platformKey();
  const platformDefault=()=>DEFAULTS[platform][0];
  const platformModern=()=>DEFAULTS[platform][1];
  const platformRetro=()=>{const d=platformDefault();return d==='luna'||d==='aqua'||d==='retro'?d:'retro'};

  /* Title-bar traffic lights: three real round elements (see 40-liquid.css), so each one can be shaded as a sphere.
     They are placed into every .panel-head, and placed again after a language change rewrites the title text. */
  const ensureLights=()=>document.querySelectorAll('.panel-head').forEach(h=>{if(h.querySelector(':scope > .lq-lights'))return;const s=document.createElement('span');s.className='lq-lights';s.setAttribute('aria-hidden','true');s.innerHTML='<i></i><i></i><i></i>';h.insertBefore(s,h.firstChild)});
  ensureLights();
  window.addEventListener('miniwin-language-change',ensureLights);
  const revealItems=[...document.querySelectorAll('main .hero-grid > *, main section .head, main section .panel')];
  revealItems.forEach((el,i)=>{el.classList.add('modern-reveal');if(i%5)el.classList.add('delay-'+Math.min(i%5,5));});
  let observer=null;
  let textReady=!window.miniwinLanguageReady; /* wait for translated text so the layout is final */
  if('IntersectionObserver' in window)observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  const normalise=m=>['retro','luna','aqua','modern','modern-glass','aero','breeze','flat','adwaita','mica','oxygen','sequoia','liquid'].includes(m)?m:platformDefault();
  const sync=m=>{const modern=m!=='retro'&&m!=='luna'&&m!=='aqua';t.setAttribute('aria-pressed',String(modern));t.setAttribute('data-theme',m);t.setAttribute('aria-label',modern?'Switch to Retro style':'Switch to Modern style');};
  const apply=(m,save=true)=>{m=normalise(m);const liq=m==='liquid',seq=m==='sequoia',aqua=m==='aqua',mica=m==='mica',oxy=m==='oxygen',luna=m==='luna',modern=m!=='retro'&&!luna&&!aqua,glass=m==='modern-glass',aero=m==='aero',breeze=m==='breeze',flat=m==='flat',adw=m==='adwaita';[['modern-mode',modern],['modern-glass-mode',glass],['aero-mode',aero],['breeze-mode',breeze],['luna-mode',luna],['flat-mode',flat],['adwaita-mode',adw],['aqua-mode',aqua],['mica-mode',mica],['oxygen-mode',oxy],['sequoia-mode',seq],['liquid-mode',liq]].forEach(([c,on])=>{root.classList.toggle(c,on);body.classList.toggle(c,on)});if(modern&&save)try{localStorage.setItem('miniwin-modern-variant',m)}catch(e){} /* only a real choice is remembered, not a platform guess */if(save&&(m==='retro'||luna||aqua))try{localStorage.setItem('miniwin-retro-flavour',m)}catch(e){}sync(m);syncLabels();if(save)try{localStorage.setItem('miniwin-style',m)}catch(e){}window.dispatchEvent(new CustomEvent('miniwin-style-change',{detail:m}));const reduce=reduceMotionOn();revealItems.forEach(el=>{el.classList.remove('is-visible');if(!modern||reduce)el.classList.add('is-visible')});if(observer){if(modern&&!reduce&&textReady)revealItems.forEach(el=>observer.observe(el));else revealItems.forEach(el=>observer.unobserve(el))}return m};
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  /* Animation removal. The visitor's choice (miniwin-reduce-motion = "1" or "0") always wins. Without a choice
     it is on for mobile devices and when the OS asks for reduced motion. */
  const isMobileDevice=()=>/Mobi|Android|iPhone|iPad|iPod/i.test(ua)||(navigator.maxTouchPoints>1&&/Macintosh/.test(ua))||(matchMedia('(pointer:coarse)').matches&&matchMedia('(hover:none)').matches);
  const reduceMotionOn=()=>{const s=get('miniwin-reduce-motion');if(s==='1')return true;if(s==='0')return false;return isMobileDevice()||matchMedia('(prefers-reduced-motion: reduce)').matches};
  const applyMotion=()=>{const on=reduceMotionOn();root.classList.toggle('reduce-motion',on);body.classList.toggle('reduce-motion',on)};
  const setReduceMotion=on=>{try{localStorage.setItem('miniwin-reduce-motion',on?'1':'0')}catch(e){}applyMotion();apply(t.getAttribute('data-theme')||platformDefault(),false);window.dispatchEvent(new CustomEvent('miniwin-motion-change',{detail:!!on}))};
  const variant=()=>{const v=get('miniwin-modern-variant');return ['modern','modern-glass','aero','breeze','flat','adwaita','mica','oxygen','sequoia','liquid'].includes(v)?v:platformModern()};
  const retroPref=()=>{const f=get('miniwin-retro-flavour');return f==='luna'||f==='aqua'||f==='retro'?f:platformRetro()};
  /* Header labels follow the saved preferences (OldRetro / Modern Glass), whichever mode is showing. */
  const syncLabels=()=>{const ls=document.querySelectorAll('header.top .style-switch .style-label');if(ls.length<2)return;ls[0].textContent=get('miniwin-oldretro')==='1'?'OldRetro':retroPref()==='luna'?'Luna':retroPref()==='aqua'?'Aqua':'Retro';ls[ls.length-1].textContent={'modern-glass':'Modern Glass','aero':'Aero','breeze':'Breeze','flat':'Flat','adwaita':'Adwaita','mica':'Mica','oxygen':'Oxygen','sequoia':'Sequoia','liquid':'Liquid Glass'}[variant()]||'Modern'};
  window.miniwinSyncLabels=syncLabels;window.miniwinApplyStyle=apply;
  window.miniwinPlatformDefault=platformModern;   /* Modern variant for this platform (used by the BIOS list) */
  window.miniwinPlatformStyle=platformDefault;    /* layout shown by default on this platform */
  window.miniwinReduceMotion=reduceMotionOn;      /* true when animations should be removed */
  window.miniwinSetReduceMotion=setReduceMotion;

  /* Client Hints (Chromium only) tell Windows 11 from 10 and give the real macOS version. They arrive
     asynchronously, so the synchronous guess above is replaced only if the visitor has not chosen yet. */
  const hintsReady=(uaData&&typeof uaData.getHighEntropyValues==='function')
    ?uaData.getHighEntropyValues(['platformVersion']).then(v=>{const p=String(v.platformVersion||'').split('.').map(Number);osVersion={platform:uaData.platform,major:p[0]||0,minor:p[1]||0}}).catch(()=>{})
    :Promise.resolve();
  applyMotion();
  apply(get('miniwin-style')||platformDefault(),false);
  hintsReady.then(()=>{
    const key=platformKey();
    if(key===platform)return;
    platform=key;
    if(!get('miniwin-style'))apply(platformDefault(),false);
    else syncLabels();
  });
  if(window.miniwinLanguageReady)window.miniwinLanguageReady.then(()=>{textReady=true;apply(get('miniwin-style')||platformDefault(),false);});
  const specSel='.panel,.monitor,.btn,.nav a,.lang-btn,.top,.settings-panel,.style-switch';
  document.addEventListener('pointermove',e=>{if(!(body.classList.contains('modern-glass-mode')||body.classList.contains('liquid-mode'))||body.classList.contains('reduce-motion'))return;const el=e.target.closest&&e.target.closest(specSel);if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');el.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true});
  t.addEventListener('click',()=>{
    if(body.classList.contains('oldretro-mode')){
      /* OldRetro -> Modern: keep OldRetro as the saved retro flavour */
      if(typeof window.miniwinExitOldRetro==='function')window.miniwinExitOldRetro(true);
      apply(variant());return;
    }
    if(body.classList.contains('modern-mode')){
      apply(retroPref());
      if(get('miniwin-oldretro')==='1'&&typeof window.miniwinEnterOldRetro==='function')window.miniwinEnterOldRetro({skipBoot:true});
      return;
    }
    apply(variant());
  });
  syncLabels();
})();
