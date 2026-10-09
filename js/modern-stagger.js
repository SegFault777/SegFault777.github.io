(()=>{
  const SELECTORS=[
    '.hero .tag', '.hero h1', '.hero p', '.hero .image-credit',
    'main section .head .eyebrow', 'main section .head h2', 'main section .head p',
    'main section .panel-head', 'main section .fact small',
    'main section .card .badge', 'main section .card h3', 'main section .card p',
    'footer .foot > div'
  ];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  const unwrap=(root)=>{
    root.querySelectorAll(':scope .char').forEach(span=>span.replaceWith(document.createTextNode(span.textContent||'')));
    root.querySelectorAll(':scope .word').forEach(w=>w.replaceWith(...w.childNodes));
    root.normalize();
  };

  const split=(root)=>{
    if(!root || root.closest('.canary-modal')) return;
    root.classList.add('char-stagger');
    unwrap(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if(node.parentElement && node.parentElement.closest('.char')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    let index=0;
    nodes.forEach(node=>{
      const frag=document.createDocumentFragment();
      /* Keep each word on one line (the per-character spans would otherwise let lines break mid-word).
         Very long unspaced runs (Chinese / Japanese sentences) stay unwrapped so they can still wrap. */
      node.nodeValue.split(/(\s+)/).forEach(tok=>{
        if(!tok)return;
        if(/^\s+$/.test(tok)){frag.appendChild(document.createTextNode(tok));return;}
        const chars=[...tok];
        const host=chars.length<=20?document.createElement('span'):frag;
        if(host!==frag)host.className='word';
        chars.forEach(ch=>{
          const span=document.createElement('span');
          span.className='char';
          span.style.setProperty('--char-i',String(Math.min(index,48)));
          span.textContent=ch;
          host.appendChild(span);
          index++;
        });
        if(host!==frag)frag.appendChild(host);
      });
      node.replaceWith(frag);
    });
  };

  const prepare=()=>{
    const isModern=document.body.classList.contains('modern-mode');
    document.querySelectorAll(SELECTORS.join(',')).forEach(root=>{
      if(isModern){
        split(root);
      }else{
        unwrap(root);
        root.classList.remove('char-stagger','char-motion-parent');
      }
    });
  };

  /* Existing language switching rewrites textContent. Re-split after every language click. */
  document.querySelectorAll('.lang-menu button[data-lang]').forEach(btn=>{
    btn.addEventListener('click',()=>requestAnimationFrame(prepare));
  });

  window.addEventListener('miniwin-language-change',()=>requestAnimationFrame(prepare));
  prepare();

  /* When switching into Modern after the initial reveal pass, replay the character entrance. */
  const toggle=document.getElementById('styleToggle');
  if(toggle){
    toggle.addEventListener('click',()=>{
      requestAnimationFrame(()=>{
        prepare();
        document.querySelectorAll('.modern-reveal').forEach(el=>{
          if(!document.body.classList.contains('modern-mode')) return;
          if(el.getBoundingClientRect().top < innerHeight*.92){
            el.classList.remove('is-visible');
            void el.offsetWidth;
            requestAnimationFrame(()=>el.classList.add('is-visible'));
          }
        });
      });
    });
  }

  if(reduce.matches||(window.miniwinReduceMotion&&window.miniwinReduceMotion())){
    document.querySelectorAll('.char-stagger').forEach(el=>el.classList.add('char-motion-parent'));
  }
})();
