(()=>{
  const t=document.getElementById('styleToggle');
  if(!t)return;
  const body=document.body;
  const motionOK=window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const revealItems=[...document.querySelectorAll('main .hero-grid > *, main section .head, main section .panel')];
  revealItems.forEach((el,i)=>{el.classList.add('modern-reveal'); if(i%5)el.classList.add('delay-'+Math.min(i%5,5));});
  let observer=null;
  if(motionOK && 'IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  }
  const apply=m=>{
    const modern=m==='modern';
    document.documentElement.classList.toggle('modern-mode',modern);
    body.classList.toggle('modern-mode',modern);
    t.setAttribute('aria-pressed',String(modern));
    t.setAttribute('aria-label',modern?'Switch to Retro style':'Switch to Modern style');
    localStorage.setItem('miniwin-style',m);
    revealItems.forEach(el=>{
      el.classList.remove('is-visible');
      if(!modern || !motionOK) el.classList.add('is-visible');
    });
    if(observer){
      if(modern && motionOK) revealItems.forEach(el=>observer.observe(el));
      else revealItems.forEach(el=>observer.unobserve(el));
    }
  };
  apply(localStorage.getItem('miniwin-style')||'retro');
  t.addEventListener('click',()=>apply(body.classList.contains('modern-mode')?'retro':'modern'));
})();
