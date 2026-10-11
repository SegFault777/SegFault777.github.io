/* Settings dropdowns (Layout and Language) in the theme's own menu skin.
   The native <select> stays in the page and keeps its value, its options and its change handlers; only the list that
   opens is replaced. The list reuses the .lang-menu class, so each theme's language-menu skin styles it, and it is
   placed with !important inline rules so the header dropdown rules cannot move it. */
(()=>{
  let menu=null, owner=null;
  const isSel=el=>!!(el&&el.tagName==='SELECT'&&el.classList.contains('settings-lang-select'));

  function ensureMenu(){
    if(menu) return menu;
    menu=document.createElement('div');
    menu.className='lang-menu sel-menu';
    menu.setAttribute('role','listbox');
    menu.style.visibility='hidden';menu.style.opacity='0';menu.style.pointerEvents='none';
    document.body.appendChild(menu);
    return menu;
  }

  /* the list mirrors the select: option groups become headings, the current value is ticked */
  function build(sel){
    const m=ensureMenu();m.innerHTML='';
    const addOpt=o=>{
      const b=document.createElement('button');
      b.type='button';b.setAttribute('role','option');b.textContent=o.textContent;
      /* the layout list shows each entry in the look of the theme it names (th-retro, th-luna, ...) */
      if(sel.id==='settingsLayoutSelect') b.classList.add('th-'+o.value);
      if(o.value===sel.value){
        b.classList.add('active');b.setAttribute('aria-selected','true');
        const c=document.createElement('span');c.className='check';c.textContent='✓';b.appendChild(c);
      }
      b.addEventListener('click',()=>choose(sel,o.value));
      m.appendChild(b);
    };
    [...sel.children].forEach(ch=>{
      if(ch.tagName==='OPTGROUP'){
        const h=document.createElement('div');h.className='sel-group';h.textContent=ch.label;m.appendChild(h);
        [...ch.children].forEach(addOpt);
      }else if(ch.tagName==='OPTION') addOpt(ch);
    });
  }

  /* placed under the select, or above it when there is no room below; the width follows the select */
  function place(sel){
    const m=ensureMenu(), r=sel.getBoundingClientRect();
    const w=Math.max(r.width,180), left=Math.max(8,Math.min(r.left,window.innerWidth-w-8));
    const maxH=Math.min(window.innerHeight*0.7,520);
    m.style.cssText='';
    m.style.setProperty('position','fixed','important');
    m.style.setProperty('display','block','important');
    m.style.setProperty('right','auto','important');
    m.style.setProperty('z-index','20010','important');
    m.style.setProperty('max-height',maxH+'px','important');
    m.style.setProperty('width',w+'px','important');
    m.style.setProperty('min-width','0','important');
    m.style.setProperty('left',left+'px','important');
    m.style.visibility='visible';m.style.opacity='1';m.style.pointerEvents='auto';m.style.transform='none';
    const h=Math.min(m.scrollHeight,maxH);
    const below=r.bottom+6;
    const top=(below+h>window.innerHeight-8&&r.top-6-h>8)?r.top-6-h:below;
    m.style.setProperty('top',top+'px','important');
  }

  function open(sel){
    if(!sel.isConnected) return;
    owner=sel;build(sel);place(sel);
    sel.setAttribute('aria-expanded','true');
  }
  function close(){
    if(!menu) return;
    menu.style.visibility='hidden';menu.style.opacity='0';menu.style.pointerEvents='none';
    if(owner) owner.removeAttribute('aria-expanded');
    owner=null;
  }
  function choose(sel,v){
    sel.value=v;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    close();
    sel.focus({preventScroll:true});
  }
  function move(sel,step){
    const n=sel.options.length;if(!n) return;
    const i=Math.max(0,Math.min(n-1,sel.selectedIndex+step));
    if(i!==sel.selectedIndex){sel.selectedIndex=i;sel.dispatchEvent(new Event('change',{bubbles:true}));}
    if(owner===sel) build(sel);
  }

  /* a click or tap on a settings select opens the themed list instead of the native one */
  document.addEventListener('mousedown',e=>{
    const s=e.target&&e.target.closest?e.target.closest('select.settings-lang-select'):null;
    if(s){
      e.preventDefault();
      if(owner===s) close(); else {close();open(s);}
      s.focus({preventScroll:true});
      return;
    }
    if(menu&&owner&&!menu.contains(e.target)) close();
  },true);

  document.addEventListener('keydown',e=>{
    const s=e.target;
    if(!isSel(s)) return;
    if(e.key==='Enter'||e.key===' '||(e.altKey&&e.key==='ArrowDown')){e.preventDefault();owner===s?close():open(s);}
    else if(e.key==='Escape'&&owner){e.preventDefault();e.stopPropagation();close();}
    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(s,e.key==='ArrowDown'?1:-1);}
  },true);

  /* keep the list attached to its select while the sheet scrolls or the window resizes; close it if the select is gone */
  const follow=()=>{
    if(!owner) return;
    if(!owner.isConnected||owner.getClientRects().length===0){close();return;}
    place(owner);
  };
  window.addEventListener('scroll',follow,true);
  window.addEventListener('resize',follow);
})();
