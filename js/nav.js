(()=>{
  const links=[...document.querySelectorAll('.nav a[href^="#"]')];
  const sections=[...document.querySelectorAll('main section[id]')];
  const header=document.querySelector('body > header.top');
  if(!links.length||!sections.length)return;

  const getOffset=()=> (header?.getBoundingClientRect().height || 0) + 10;
  const modern=()=>document.body.classList.contains('modern-mode');
  const setActive=id=>links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));

  // Pick exactly one section from the current scroll position. This avoids
  // IntersectionObserver threshold races that can flicker between adjacent sections.
  let raf=0;
  const updateActive=()=>{
    raf=0;
    const probe=window.scrollY + getOffset() + Math.min(window.innerHeight*0.18, 140);
    let current=sections[0];
    for(const section of sections){
      if(section.offsetTop <= probe) current=section;
      else break;
    }
    // When the very bottom is reached, always keep the final section active.
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2){
      current=sections[sections.length-1];
    }
    setActive(current.id);
  };
  const scheduleActive=()=>{ if(!raf) raf=requestAnimationFrame(updateActive); };

  const goTo=(id,updateHash=true)=>{
    const target=document.getElementById(id);
    if(!target)return;
    const y=Math.max(0,target.getBoundingClientRect().top + window.scrollY - getOffset());
    const motionOff=!!(window.miniwinReduceMotion&&window.miniwinReduceMotion());
    window.scrollTo({top:y,behavior:modern()&&!motionOff?'smooth':'auto'});
    setActive(id);
    if(updateHash) history.replaceState(null,'','#'+id);
  };

  links.forEach(link=>link.addEventListener('click',e=>{
    const href=link.getAttribute('href')||'';
    if(!href.startsWith('#')||href==='#')return;
    const id=href.slice(1);
    if(!document.getElementById(id))return;
    e.preventDefault();
    goTo(id,true);
  }));

  window.addEventListener('scroll',scheduleActive,{passive:true});
  window.addEventListener('resize',scheduleActive,{passive:true});
  window.addEventListener('load',scheduleActive,{once:true});

  if(location.hash && document.getElementById(location.hash.slice(1))){
    requestAnimationFrame(()=>goTo(location.hash.slice(1),false));
  }else{
    scheduleActive();
  }
})();
