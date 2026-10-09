(()=>{
  const t=document.getElementById('styleToggle');
  if(!t)return;
  const body=document.body,root=document.documentElement;
  const motionOK=window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const isApplePlatform=()=>{const ua=navigator.userAgent||'',p=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'';return /iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)||/Mac/i.test(p)||/Macintosh/.test(ua)};
  const platformDefault=()=>isApplePlatform()?'modern-glass':'modern';
  const normalise=m=>['retro','luna','aqua','modern','modern-glass','aero','breeze','flat','adwaita','mica','oxygen'].includes(m)?m:platformDefault();
  const revealItems=[...document.querySelectorAll('main .hero-grid > *, main section .head, main section .panel')];
  revealItems.forEach((el,i)=>{el.classList.add('modern-reveal');if(i%5)el.classList.add('delay-'+Math.min(i%5,5));});
  let observer=null;
  let textReady=!window.miniwinLanguageReady; /* wait for translated text so the layout is final */
  if(motionOK&&'IntersectionObserver' in window)observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  const sync=m=>{const modern=m!=='retro'&&m!=='luna'&&m!=='aqua';t.setAttribute('aria-pressed',String(modern));t.setAttribute('data-theme',m);t.setAttribute('aria-label',modern?'Switch to Retro style':'Switch to Modern style');};
  const apply=(m,save=true)=>{m=normalise(m);const aqua=m==='aqua',mica=m==='mica',oxy=m==='oxygen',luna=m==='luna',modern=m!=='retro'&&!luna&&!aqua,glass=m==='modern-glass',aero=m==='aero',breeze=m==='breeze',flat=m==='flat',adw=m==='adwaita';[['modern-mode',modern],['modern-glass-mode',glass],['aero-mode',aero],['breeze-mode',breeze],['luna-mode',luna],['flat-mode',flat],['adwaita-mode',adw],['aqua-mode',aqua],['mica-mode',mica],['oxygen-mode',oxy]].forEach(([c,on])=>{root.classList.toggle(c,on);body.classList.toggle(c,on)});if(modern)try{localStorage.setItem('miniwin-modern-variant',m)}catch(e){}if(save&&(m==='retro'||luna||aqua))try{localStorage.setItem('miniwin-retro-flavour',m)}catch(e){}sync(m);syncLabels();if(save)try{localStorage.setItem('miniwin-style',m)}catch(e){}window.dispatchEvent(new CustomEvent('miniwin-style-change',{detail:m}));revealItems.forEach(el=>{el.classList.remove('is-visible');if(!modern||!motionOK)el.classList.add('is-visible')});if(observer){if(modern&&motionOK&&textReady)revealItems.forEach(el=>observer.observe(el));else revealItems.forEach(el=>observer.unobserve(el))}return m};
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const variant=()=>{const v=get('miniwin-modern-variant');return ['modern','modern-glass','aero','breeze','flat','adwaita','mica','oxygen'].includes(v)?v:platformDefault()};const retroPref=()=>{const f=get('miniwin-retro-flavour');return f==='luna'||f==='aqua'?f:'retro'};
  /* Header labels follow the saved preferences (OldRetro / Modern Glass), whichever mode is showing. */
  const syncLabels=()=>{const ls=document.querySelectorAll('header.top .style-switch .style-label');if(ls.length<2)return;ls[0].textContent=get('miniwin-oldretro')==='1'?'OldRetro':retroPref()==='luna'?'Luna':retroPref()==='aqua'?'Aqua':'Retro';ls[ls.length-1].textContent={'modern-glass':'Modern Glass','aero':'Aero','breeze':'Breeze','flat':'Flat','adwaita':'Adwaita','mica':'Mica','oxygen':'Oxygen'}[variant()]||'Modern'};
  window.miniwinSyncLabels=syncLabels;window.miniwinApplyStyle=apply;window.miniwinPlatformDefault=platformDefault;
  let saved=null;try{saved=localStorage.getItem('miniwin-style')}catch(e){}
  const initialStyle=saved||platformDefault();apply(initialStyle,false);
  if(window.miniwinLanguageReady)window.miniwinLanguageReady.then(()=>{textReady=true;apply(initialStyle,false);});
  const specSel='.panel,.monitor,.btn,.nav a,.lang-btn,.top,.settings-panel,.style-switch';
  document.addEventListener('pointermove',e=>{if(!body.classList.contains('modern-glass-mode'))return;const el=e.target.closest&&e.target.closest(specSel);if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');el.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true});
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
