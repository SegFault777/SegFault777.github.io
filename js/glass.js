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
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  const defs=document.createElementNS(NS,'defs');svg.appendChild(defs);document.body.appendChild(svg);
  const state=new WeakMap();let uid=0;
  const ro='ResizeObserver' in window?new ResizeObserver(es=>es.forEach(e=>build(e.target))):null;

  function mapFor(w,h,r,bezel){
    const k=Math.min(1,320/Math.max(w,h)),cw=Math.max(2,Math.round(w*k)),ch=Math.max(2,Math.round(h*k));
    const c=document.createElement('canvas');c.width=cw;c.height=ch;
    const g=c.getContext('2d'),img=g.createImageData(cw,ch),d=img.data;
    const hw=w/2,hh=h/2,rr=Math.min(r,hw,hh),bz=Math.max(1,bezel);
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
      const px=(x+.5)/k-hw,py=(y+.5)/k-hh;
      const qx=Math.abs(px)-(hw-rr),qy=Math.abs(py)-(hh-rr);
      const ox=Math.max(qx,0),oy=Math.max(qy,0);
      const sdf=Math.hypot(ox,oy)+Math.min(Math.max(qx,qy),0)-rr; /* <0 inside */
      const dist=-sdf;let nx=0,ny=0,m=0;
      if(dist>=0&&dist<bz){
        if(qx>0&&qy>0){const l=Math.hypot(qx,qy)||1;nx=qx/l*Math.sign(px);ny=qy/l*Math.sign(py)}
        else if(qx>qy){nx=Math.sign(px)}else{ny=Math.sign(py)}
        const t=1-dist/bz;m=t*t*(3-2*t)*t; /* strongest at the very rim, eases to 0 inside */
        nx=-nx*m;ny=-ny*m; /* sample from further inside -> edge content is pulled/bent inward */
      }
      const i=(y*cw+x)*4;
      d[i]=Math.round(128+nx*127);d[i+1]=Math.round(128+ny*127);d[i+2]=128;d[i+3]=255;
    }
    g.putImageData(img,0,0);return c.toDataURL();
  }

  function build(el){
    if(!body.classList.contains('modern-glass-mode')||!el.isConnected)return;
    const w=Math.round(el.offsetWidth),h=Math.round(el.offsetHeight);
    if(w<8||h<8)return;
    const cs=getComputedStyle(el);
    let r=parseFloat(cs.borderTopLeftRadius)||0;if(/%/.test(cs.borderTopLeftRadius))r=Math.min(w,h)/2*parseFloat(cs.borderTopLeftRadius)/50;
    r=Math.min(r,w/2,h/2);
    const key=w+'x'+h+'x'+Math.round(r);
    let s=state.get(el);
    if(s&&s.key===key)return;
    const bezel=Math.max(5,Math.min(26,Math.min(w,h)*.42));
    const scale=bezel*2.4;
    const id=s?s.id:'lgf'+(++uid);
    let f=document.getElementById(id);
    if(!f){f=document.createElementNS(NS,'filter');f.id=id;defs.appendChild(f)}
    f.setAttribute('filterUnits','userSpaceOnUse');f.setAttribute('primitiveUnits','userSpaceOnUse');
    f.setAttribute('x','0');f.setAttribute('y','0');f.setAttribute('width',w);f.setAttribute('height',h);
    f.setAttribute('color-interpolation-filters','sRGB');
    f.innerHTML='<feImage href="'+mapFor(w,h,r,bezel)+'" x="0" y="0" width="'+w+'" height="'+h+'" result="map" preserveAspectRatio="none"/>'+
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="'+scale.toFixed(1)+'" xChannelSelector="R" yChannelSelector="G"/>';
    el.style.setProperty('--lg-filter','url(#'+id+')');
    state.set(el,{id,key});
  }
  function all(){document.querySelectorAll(SEL).forEach(el=>{build(el);if(ro&&!el.__lgro){el.__lgro=1;ro.observe(el)}})}
  function clear(){document.querySelectorAll(SEL).forEach(el=>el.style.removeProperty('--lg-filter'));state.forEach&&0;defs.innerHTML='';uidReset()}
  function uidReset(){document.querySelectorAll(SEL).forEach(el=>state.delete(el))}
  function sync(){if(body.classList.contains('modern-glass-mode'))requestAnimationFrame(all);else clear()}
  window.addEventListener('miniwin-style-change',sync);
  window.addEventListener('load',sync);
  /* settings modal is created lazily */
  new MutationObserver(m=>{if(body.classList.contains('modern-glass-mode')&&m.some(x=>x.addedNodes.length))requestAnimationFrame(all)}).observe(body,{childList:true});
  document.addEventListener('transitionend',e=>{if(e.target&&e.target.matches&&e.target.matches(SEL))build(e.target)},true);
  sync();
})();
