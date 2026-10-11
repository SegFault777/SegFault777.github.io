/* Liquid Glass refraction (Chromium).
   For every glass element a displacement map is drawn for its exact size and corner radius:
   it pushes the backdrop sideways near the rim (like light bending through a convex lens)
   and leaves the centre untouched. Browsers that cannot take url() in backdrop-filter
   (Safari / Firefox) simply keep the blur + saturate + rim-light version. */
(()=>{
  const body=document.body,root=document.documentElement;
  const glassOn=()=>body.classList.contains('modern-glass-mode')||body.classList.contains('liquid-mode');
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

  /* Modern Glass keeps its own recipe (below); only Liquid Glass uses the reference shader. */
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

  /* Displacement map from the reference shader (public/liquid-glass.js, "Created by Shu Ding"): a rounded-rectangle signed
     distance and a smoothstep falloff. The shader is run per element, in pixels: deep inside the glass a pixel samples
     itself (no distortion), and toward the rim it samples from closer to the centre, which bends the backdrop like a lens.
     The result is an RGB map (R = x offset, G = y offset) that feDisplacementMap reads. */
  const smoothStep=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t)};
  const roundedRectSDF=(x,y,hw,hh,r)=>{const qx=Math.abs(x)-hw+r,qy=Math.abs(y)-hh+r;return Math.min(Math.max(qx,qy),0)+Math.hypot(Math.max(qx,0),Math.max(qy,0))-r};
  function shaderMap(w,h,r){
    const hw=w/2,hh=h/2,L=Math.min(w,h)/2,rr=Math.min(r,hw,hh);   /* falloff length: half of the shorter side */
    const dx=new Float32Array(w*h),dy=new Float32Array(w*h);let M=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const px=x+.5-hw,py=y+.5-hh;
      const dist=roundedRectSDF(px,py,hw,hh,rr)/L;                 /* 0 at the edge, negative inside */
      const s=smoothStep(0,1,smoothStep(0.8,0,dist-0.15));         /* the reference's displacement, then its scaling */
      const ox=px*(s-1),oy=py*(s-1);                                /* sample position minus pixel position */
      const i=y*w+x;dx[i]=ox;dy[i]=oy;M=Math.max(M,Math.abs(ox),Math.abs(oy));
    }
    M=Math.max(M,1e-3);
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d'),img=ctx.createImageData(w,h),d=img.data;
    for(let i=0;i<w*h;i++){
      d[i*4]=Math.max(0,Math.min(255,(dx[i]/(2*M)+.5)*255));   /* channel = offset / (2M) + 0.5, so scale = 2M restores it */
      d[i*4+1]=Math.max(0,Math.min(255,(dy[i]/(2*M)+.5)*255));
      d[i*4+2]=0;d[i*4+3]=255;
    }
    ctx.putImageData(img,0,0);
    return {href:c.toDataURL(),scale:2*M};
  }

  function build(el){
    if(!glassOn()||!el.isConnected)return;
    const w=Math.round(el.offsetWidth),h=Math.round(el.offsetHeight);
    if(w<8||h<8)return;
    const cs=getComputedStyle(el);
    let r=parseFloat(cs.borderTopLeftRadius)||0;if(/%/.test(cs.borderTopLeftRadius))r=Math.min(w,h)/2*parseFloat(cs.borderTopLeftRadius)/50;
    r=Math.min(r,w/2,h/2);
    /* Large text-bearing surfaces keep the plain blur/saturate material: refraction there left a hard-edged patch. */
    if(Math.min(w,h)>120&&!el.matches('.top')){el.setAttribute('data-lg','flat');el.style.removeProperty('--lg-filter');state.delete(el);return}
    el.removeAttribute('data-lg');
    const key=w+'x'+h+'x'+Math.round(r)+(body.classList.contains('liquid-mode')?'L':'M');   /* a map is per size and per recipe */
    let s=state.get(el);
    if(s&&s.key===key)return;
    /* 144 / 142 / 140 for the 420x280 original -> scaled by the element's short side, capped at 34: bigger values leave a hard-edged patch on large panels */
    /* Liquid Glass: the reference shader map. Modern Glass: the recipe it has always used (k scales it to the element). */
    const liquid=body.classList.contains('liquid-mode');
    const map=liquid?shaderMap(w,h,r):null;
    const k=Math.max(12,Math.min(34,Math.min(w,h)*.514))/144;
    const sc=liquid?[1,142/144,140/144].map(v=>(map.scale*v).toFixed(2)):[144,142,140].map(v=>(v*k).toFixed(1));
    const id=s?s.id:'lgf'+(++uid);
    let f=document.getElementById(id);
    if(!f){f=document.createElementNS(NS,'filter');f.id=id;defs.appendChild(f)}
    f.setAttribute('filterUnits','userSpaceOnUse');f.setAttribute('x','0');f.setAttribute('y','0');f.setAttribute('width',w);f.setAttribute('height',h);
    f.setAttribute('color-interpolation-filters','sRGB');
    const href=liquid?map.href:'data:image/svg+xml;utf8,'+encodeURIComponent(mapSvg(w,h,r));
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
  function sync(){if(glassOn())requestAnimationFrame(all);else clear()}
  window.addEventListener('miniwin-style-change',sync);
  window.addEventListener('load',sync);
  /* settings modal is created lazily */
  new MutationObserver(m=>{if(glassOn()&&m.some(x=>x.addedNodes.length))requestAnimationFrame(all)}).observe(body,{childList:true});
  document.addEventListener('transitionend',e=>{if(e.target&&e.target.matches&&e.target.matches(SEL))build(e.target)},true);
  sync();
})();

/* Liquid Glass switches (40-liquid.css, section D): the keyframes play only on a switch that has been changed by the
   person. The class is added after the click handler has already set aria-pressed, in the same frame, so the new state's
   animation starts at once; the page load never plays it. */
document.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('.style-toggle'):null;if(t)t.classList.add('lq-flip')});
