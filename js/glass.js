/* Liquid Glass refraction (Chromium).
   For every glass element a displacement map is drawn for its exact size and corner radius:
   it pushes the backdrop sideways near the rim (like light bending through a convex lens)
   and leaves the centre untouched. Browsers that cannot take url() in backdrop-filter
   (Safari / Firefox) simply keep the blur + saturate + rim-light version. */
(()=>{
  const body=document.body,root=document.documentElement;
  const SEL='.top,.panel,.monitor,.nav a,.btn,.style-switch,.settings-btn,.tag,.badge,.note,.settings-panel,.settings-help-card,.style-toggle span';
  let ok=false;
  try{ok=!!(window.CSS&&CSS.supports&&CSS.supports('backdrop-filter','url(#x) blur(2px)'))}catch(e){}
  if(!ok)return;
  root.classList.add('lg-svg');
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  const defs=document.createElementNS(NS,'defs');svg.appendChild(defs);document.body.appendChild(svg);
  const state=new WeakMap();let uid=0;
  const ro='ResizeObserver' in window?new ResizeObserver(es=>es.forEach(e=>build(e.target))):null;

  /* Displacement map (supplied recipe, sized to the element): a grey base, a red X-gradient and a green
     Y-gradient screen-blended on top, and a blurred grey rounded rectangle that flattens the middle so
     only the rim bends the backdrop. */
  function mapSvg(w,h,r){
    const inset=Math.max(3,Math.min(14,Math.min(w,h)*.05)),rx=Math.max(0,Math.min(r-inset,(w-2*inset)/2,(h-2*inset)/2));
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><defs>'+
      '<linearGradient id="Y" x1="0" x2="0" y1="7%" y2="93%"><stop offset="0%" stop-color="#0F0"/><stop offset="100%" stop-color="#000"/></linearGradient>'+
      '<linearGradient id="X" x1="5%" x2="95%" y1="0" y2="0"><stop offset="0%" stop-color="#F00"/><stop offset="100%" stop-color="#000"/></linearGradient></defs>'+
      '<rect width="'+w+'" height="'+h+'" fill="#808080"/>'+
      '<g filter="blur(2px)"><rect width="'+w+'" height="'+h+'" fill="#000080"/>'+
      '<rect width="'+w+'" height="'+h+'" fill="url(#Y)" style="mix-blend-mode:screen"/>'+
      '<rect width="'+w+'" height="'+h+'" fill="url(#X)" style="mix-blend-mode:screen"/>'+
      '<rect x="'+inset+'" y="'+inset+'" width="'+(w-2*inset)+'" height="'+(h-2*inset)+'" rx="'+rx+'" ry="'+rx+'" fill="#808080" filter="blur('+inset+'px)"/></g></svg>';
  }

  function build(el){
    if(!body.classList.contains('modern-glass-mode')||!el.isConnected)return;
    const w=Math.round(el.offsetWidth),h=Math.round(el.offsetHeight);
    if(w<8||h<8)return;
    const cs=getComputedStyle(el);
    let r=parseFloat(cs.borderTopLeftRadius)||0;if(/%/.test(cs.borderTopLeftRadius))r=Math.min(w,h)/2*parseFloat(cs.borderTopLeftRadius)/50;
    r=Math.min(r,w/2,h/2);
    /* Large text-bearing surfaces keep the plain blur/saturate material: refraction there left a hard-edged patch. */
    if(Math.min(w,h)>120&&!el.matches('.top')){el.setAttribute('data-lg','flat');el.style.removeProperty('--lg-filter');state.delete(el);return}
    el.removeAttribute('data-lg');
    const key=w+'x'+h+'x'+Math.round(r);
    let s=state.get(el);
    if(s&&s.key===key)return;
    /* 144 / 142 / 140 for the 420x280 original -> scaled by the element's short side, capped at 34: bigger values leave a hard-edged patch on large panels */
    const k=Math.max(12,Math.min(34,Math.min(w,h)*.514))/144;
    const sc=[144,142,140].map(v=>(v*k).toFixed(1));
    const id=s?s.id:'lgf'+(++uid);
    let f=document.getElementById(id);
    if(!f){f=document.createElementNS(NS,'filter');f.id=id;defs.appendChild(f)}
    f.setAttribute('filterUnits','userSpaceOnUse');f.setAttribute('x','0');f.setAttribute('y','0');f.setAttribute('width',w);f.setAttribute('height',h);
    f.setAttribute('color-interpolation-filters','sRGB');
    const href='data:image/svg+xml;utf8,'+encodeURIComponent(mapSvg(w,h,r));
    const disp=v=>'<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="'+v+'" xChannelSelector="R" yChannelSelector="G"/>';
    f.innerHTML='<feImage x="0" y="0" width="'+w+'" height="'+h+'" href="'+href+'" result="displacementMap"/>'+
      disp(sc[0])+'<feColorMatrix type="matrix" result="displacedR" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>'+
      disp(sc[1])+'<feColorMatrix type="matrix" result="displacedG" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>'+
      disp(sc[2])+'<feColorMatrix type="matrix" result="displacedB" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>'+
      '<feBlend in="displacedR" in2="displacedG" mode="screen" result="rg"/><feBlend in="rg" in2="displacedB" mode="screen"/>';
    el.style.setProperty('--lg-filter','url(#'+id+')');
    state.set(el,{id,key});
  }
  function all(){document.querySelectorAll(SEL).forEach(el=>{build(el);if(ro&&!el.__lgro){el.__lgro=1;ro.observe(el)}})}
  function clear(){document.querySelectorAll(SEL).forEach(el=>{el.style.removeProperty('--lg-filter');el.removeAttribute('data-lg')});defs.innerHTML='';uidReset()}
  function uidReset(){document.querySelectorAll(SEL).forEach(el=>state.delete(el))}
  function sync(){if(body.classList.contains('modern-glass-mode'))requestAnimationFrame(all);else clear()}
  window.addEventListener('miniwin-style-change',sync);
  window.addEventListener('load',sync);
  /* settings modal is created lazily */
  new MutationObserver(m=>{if(body.classList.contains('modern-glass-mode')&&m.some(x=>x.addedNodes.length))requestAnimationFrame(all)}).observe(body,{childList:true});
  document.addEventListener('transitionend',e=>{if(e.target&&e.target.matches&&e.target.matches(SEL))build(e.target)},true);
  sync();
})();
