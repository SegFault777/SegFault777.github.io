(()=>{
  const body=document.body;
  const isRetro=()=>!body.classList.contains('modern-mode')&&!body.classList.contains('oldretro-mode');
  const HANDLE_H=30; /* head-less cards: the top strip acts as the title bar */
  let order=[],drag=null;

  function front(p){
    order=order.filter(x=>x!==p);order.push(p);
    order.forEach((el,i)=>{el.style.zIndex=String(i+1);}); /* max ~16 panels, stays below the sticky header (z 50) */
    document.querySelectorAll('.panel.zo-active').forEach(e=>{if(e!==p)e.classList.remove('zo-active');});
    p.classList.add('zo-active');body.classList.add('zo-used');
  }
  const inHandle=(p,e)=>{
    if(e.target.closest('.panel-head'))return true;
    return (e.clientY-p.getBoundingClientRect().top)<HANDLE_H;
  };
  const setPos=(p,x,y)=>{p.dataset.zx=x;p.dataset.zy=y;p.style.setProperty('--zx',x+'px');p.style.setProperty('--zy',y+'px');};

  document.addEventListener('pointerdown',e=>{
    if(!isRetro()||e.button!==0)return;
    const p=e.target.closest&&e.target.closest('.panel');
    if(!p)return;
    front(p);
    if(e.pointerType==='touch')return; /* keep touch scrolling intact */
    if(e.target.closest('a,button,input,select,textarea'))return;
    if(!inHandle(p,e))return;
    const r=p.getBoundingClientRect();
    drag={p,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:parseFloat(p.dataset.zx||0),oy:parseFloat(p.dataset.zy||0),
          left:r.left,top:r.top+window.scrollY,w:r.width};
    try{p.setPointerCapture(e.pointerId);}catch(_){}
    body.classList.add('zo-dragging');
    e.preventDefault();
  });

  document.addEventListener('pointermove',e=>{
    if(drag&&e.pointerId===drag.id){
      let dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
      dx=Math.max(-drag.left,Math.min(window.innerWidth-drag.w-drag.left,dx)); /* no horizontal overflow */
      dy=Math.max(-drag.top,dy);                                               /* not above page top */
      setPos(drag.p,drag.ox+dx,drag.oy+dy);
    }
  });

  const end=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    try{drag.p.releasePointerCapture(drag.id);}catch(_){}
    drag=null;body.classList.remove('zo-dragging');
  };
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',end);

  /* double-click a title bar to snap the window back to its original place */
  document.addEventListener('dblclick',e=>{
    if(!isRetro())return;
    const h=e.target.closest&&e.target.closest('.panel-head');
    if(h){const p=h.closest('.panel');if(p)setPos(p,0,0);}
  });
})();
