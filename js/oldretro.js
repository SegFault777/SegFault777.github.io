(()=>{
  const body=document.body;
  const SECTION_LABELS={home:'HOME',about:'ABOUT',features:'FEATURES',build:'BUILD',networking:'NETWORKING',download:'DOWNLOAD'};
  let screenEl=null,bootEl=null,bootTextEl=null,bodyEl=null,menubarEl=null,statusEl=null;
  let built=false,bootTimer=null,resizeHandler=null,keyBlocker=null;

  function isTouchDevice(){
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  function positionOverlay(){
    if(!screenEl)return;
    const header=document.querySelector('body > header.top');
    if(header)screenEl.style.top=header.getBoundingClientRect().height+'px';
  }

  function buildScreen(){
    if(built)return;
    screenEl=document.createElement('div');
    screenEl.id='oldretroScreen';
    screenEl.innerHTML=
      '<div class="or-boot" id="orBoot"><pre id="orBootText"></pre></div>'+
      '<div class="or-titlebar">MINIWIN.EXE \u2014 TEXT MODE SHELL (80386, 640K CONV, 3072K EXT)</div>'+
      '<div class="or-menubar" id="orMenubar"></div>'+
      '<div class="or-body" id="orBody" tabindex="0"></div>'+
      '<div class="or-statusbar" id="orStatus"></div>'+
      '<div class="or-pagectrl"><button type="button" id="orPageUp">\u25b2 PAGE UP</button><button type="button" id="orPageDown">\u25bc PAGE DOWN</button></div>';
    document.body.appendChild(screenEl);
    bootEl=screenEl.querySelector('#orBoot');
    bootTextEl=screenEl.querySelector('#orBootText');
    bodyEl=screenEl.querySelector('#orBody');
    menubarEl=screenEl.querySelector('#orMenubar');
    statusEl=screenEl.querySelector('#orStatus');
    bodyEl.style.outline='none';
    screenEl.querySelector('#orPageUp').addEventListener('click',()=>pageScroll(-1));
    screenEl.querySelector('#orPageDown').addEventListener('click',()=>pageScroll(1));
    built=true;
  }

  function textOf(el){return el?el.textContent.trim():'';}

  function collectSectionParts(section){
    const parts=[];
    if(section.id!=='home'){
      section.querySelectorAll('h1,h2').forEach(h=>{const t=textOf(h);if(t)parts.push({tag:'h',text:t});});
    }
    const lead=section.querySelector('.hero-grid p, .head p, .section-head .sub');
    if(lead){const t=textOf(lead);if(t)parts.push({tag:'p',text:t});}
    const facts=[...section.querySelectorAll('.fact')].map(f=>{
      const s=textOf(f.querySelector('strong')),sm=textOf(f.querySelector('small'));
      return s+(sm?'  \u2014 '+sm:'');
    }).filter(Boolean);
    if(facts.length)parts.push({tag:'p',text:facts.join('\n')});
    section.querySelectorAll('.card').forEach(c=>{
      const badge=textOf(c.querySelector('.badge')),h3=textOf(c.querySelector('h3')),p=textOf(c.querySelector('p'));
      let line=(badge?'['+badge+'] ':'')+h3;
      if(p)line+='\n  '+p;
      if(line.trim())parts.push({tag:'p',text:line});
    });
    section.querySelectorAll('.terminal pre').forEach(pre=>{
      const t=textOf(pre);
      if(t)parts.push({tag:'pre',text:t});
    });
    section.querySelectorAll('.note').forEach(n=>{
      const t=textOf(n);
      if(t)parts.push({tag:'p',text:t});
    });
    return parts;
  }

  function renderShellContent(){
    if(!bodyEl)return;
    bodyEl.innerHTML='';
    const sections=[...document.querySelectorAll('main section[id]')];
    sections.forEach((section,i)=>{
      const win=document.createElement('div');
      win.className='or-window';
      win.id='or-sec-'+section.id;
      const title=document.createElement('div');
      title.className='or-win-title';
      title.textContent=(i+1)+'. '+(SECTION_LABELS[section.id]||section.id.toUpperCase());
      win.appendChild(title);
      if(section.id==='home'){
        const logo=document.createElement('div');
        logo.className='or-hero-logo';
        logo.textContent='M I N I W I N';
        win.appendChild(logo);
        const tag=textOf(section.querySelector('.tag'));
        if(tag){
          const t=document.createElement('div');
          t.className='or-hero-tag';
          t.textContent=tag;
          win.appendChild(t);
        }
      }
      const winBody=document.createElement('div');
      winBody.className='or-win-body';
      collectSectionParts(section).forEach(part=>{
        const el=document.createElement(part.tag==='pre'?'pre':'p');
        el.textContent=part.text;
        winBody.appendChild(el);
      });
      win.appendChild(winBody);
      const links=[...section.querySelectorAll('.actions a')];
      if(links.length){
        const wrap=document.createElement('div');
        wrap.className='or-win-links';
        links.forEach(a=>{
          const link=document.createElement('a');
          link.href=a.getAttribute('href');
          link.textContent=textOf(a);
          if(a.target)link.target=a.target;
          if(a.hasAttribute('rel'))link.rel=a.getAttribute('rel');
          wrap.appendChild(link);
        });
        win.appendChild(wrap);
      }
      bodyEl.appendChild(win);
    });
    const footer=document.querySelector('body > footer');
    if(footer){
      const win=document.createElement('div');
      win.className='or-window';
      const title=document.createElement('div');
      title.className='or-win-title';
      title.textContent='SYSTEM';
      win.appendChild(title);
      const winBody=document.createElement('div');
      winBody.className='or-win-body';
      const p=document.createElement('p');
      p.textContent=textOf(footer).replace(/\s+/g,' ');
      winBody.appendChild(p);
      win.appendChild(winBody);
      bodyEl.appendChild(win);
    }
  }

  function renderMenubar(){
    if(!menubarEl)return;
    menubarEl.innerHTML='';
    [...document.querySelectorAll('main section[id]')].forEach((section,i)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent='F'+(i+1)+' '+(SECTION_LABELS[section.id]||section.id.toUpperCase());
      btn.addEventListener('click',()=>{
        const target=document.getElementById('or-sec-'+section.id);
        if(target&&bodyEl)bodyEl.scrollTop=target.offsetTop-10;
      });
      menubarEl.appendChild(btn);
    });
  }

  const BOOT_LINES=[
    'Award Modular BIOS v4.51PG, An Energy Star Ally',
    'Copyright (C) 1984-96, Award Software, Inc.',
    '',
    'MINIWIN SYSTEMS INC.',
    '80386DX CPU at 33MHz',
    'Memory Test : 4096K OK',
    '',
    'Detecting Primary Master ... MINIWIN-IDE 40MB',
    'Detecting Primary Slave  ... None',
    'Detecting Floppy Drive A: ... 1.44M',
    '',
    'MINIWIN Bootstrap Loader v1.0',
    'Loading MINIWIN.SYS ......... OK',
    'Loading DISPLAY.CLI ......... OK',
    'Loading MOUSE.DRV ........... skipped (keyboard only)',
    '',
    'Starting text-mode shell...',
    '',
    'C:\\MINIWIN>RUN SETUP.EXE'
  ];

  /* Note on BOOTSTRA.386 (github.com/kristopolous/BOOTSTRA.386): its official loading-cursor
     animation (and the standalone 386-animation package derived from it) is built to run once,
     tied to the page's initial load event, revealing <body> when that single pass finishes.
     Calling it again later — e.g. on a keypress, long after "load" has already fired — leaves
     it waiting for a reveal trigger that never comes, so the screen gets stuck. That's exactly
     what produced the stuck blue screen. Rather than fight that mismatch, the BIOS/boot text
     below reproduces the same DOS-blue, monospace 80386 boot aesthetic directly, deterministically,
     with no dependency on any external script's load timing.
  */
  function playBoot(cb){
    bootTextEl.textContent='';
    bootEl.style.display='block';
    let i=0;
    const step=()=>{
      if(i>=BOOT_LINES.length){
        bootTimer=setTimeout(()=>{
          bootEl.style.display='none';
          cb();
        },320);
        return;
      }
      bootTextEl.textContent+=BOOT_LINES[i]+'\n';
      bootEl.scrollTop=bootEl.scrollHeight;
      i++;
      bootTimer=setTimeout(step,BOOT_LINES[i-1]===''?45:75);
    };
    step();
  }

  function pageScroll(dir){
    if(!bodyEl)return;
    bodyEl.scrollTop+=bodyEl.clientHeight*0.9*dir;
  }

  function lockScroll(){
    if(isTouchDevice())return;
    bodyEl.classList.add('or-locked');
    keyBlocker=(e)=>{
      if(e.key==='PageUp'){e.preventDefault();pageScroll(-1);}
      else if(e.key==='PageDown'){e.preventDefault();pageScroll(1);}
    };
    document.addEventListener('keydown',keyBlocker);
  }

  function unlockScroll(){
    if(bodyEl)bodyEl.classList.remove('or-locked');
    if(keyBlocker){document.removeEventListener('keydown',keyBlocker);keyBlocker=null;}
  }

  function setToggleLabel(active){
    const label=document.querySelector('header.top .style-switch .style-label:first-child');
    if(label)label.textContent=active?'OldRetro':'Retro';
  }

  function persistOldRetroDefault(active){
    try{ localStorage.setItem('miniwin-oldretro', active?'1':'0'); }catch(e){}
  }

  function enterOldRetro(opts){
    opts=opts||{};
    if(body.classList.contains('modern-mode')||body.classList.contains('oldretro-mode'))return;
    buildScreen();
    renderShellContent();
    renderMenubar();
    statusEl.textContent=isTouchDevice()
      ?'SWIPE TO SCROLL \u00b7 TYPE "RETRO" TO RETURN TO GUI MODE'
      :'PAGE UP / PAGE DOWN TO SCROLL \u00b7 TYPE "RETRO" TO RETURN TO GUI MODE';
    body.classList.add('oldretro-mode');
    document.documentElement.classList.add('oldretro-mode');
    setToggleLabel(true);
    persistOldRetroDefault(true);
    syncSettingsToggle();
    if(settingsBuilt)renderSettingsAll();
    positionOverlay();
    resizeHandler=positionOverlay;
    window.addEventListener('resize',resizeHandler);
    bodyEl.scrollTop=0;
    if(opts.skipBoot){
      bootEl.style.display='none';
      lockScroll();
    }else{
      playBoot(()=>{
        lockScroll();
        bodyEl.focus({preventScroll:true});
      });
    }
  }

  function exitOldRetro(){
    if(!body.classList.contains('oldretro-mode'))return;
    if(bootTimer)clearTimeout(bootTimer);
    unlockScroll();
    if(resizeHandler){window.removeEventListener('resize',resizeHandler);resizeHandler=null;}
    body.classList.remove('oldretro-mode');
    document.documentElement.classList.remove('oldretro-mode');
    setToggleLabel(false);
    persistOldRetroDefault(false);
    syncSettingsToggle();
    if(settingsBuilt)renderSettingsAll();
  }

  const styleToggleBtn=document.getElementById('styleToggle');
  if(styleToggleBtn)styleToggleBtn.addEventListener('click',exitOldRetro);

  /* ---------------- Settings modal (gear button) ----------------
     Dedicated Retro <-> OldRetro toggle plus a differences panel —
     the touch/mouse entry point into OldRetro for anyone without a
     physical keyboard (i.e. every mobile visitor). */
  const SETTINGS_I18N={
    ko:{
      title:'설정',close:'닫기',displayMode:'화면 모드',retro:'Retro',oldretro:'OldRetro',kpDefault:'문화어 기본 활성화',
      kpHelp:'문화어는 조선민주주의인민공화국(북한)의 표준어입니다. 이 설정을 켜 두면 언어 메뉴에서 한국어를 고를 때 기본으로 문화어 표기가 적용되고, 끄면 일반 한국어(남한 표준어) 표기로 보입니다. 영어 등 다른 언어에는 영향이 없으며, 선택은 이 기기에 저장됩니다.',
      biosHowDesktop:'이 창을 닫으려면 ESC를 누른 뒤 [Save & Exit]에서 Enter를 누르세요. 창 바깥을 눌러도 닫히지 않습니다.',
      biosHowTouch:'이 창을 닫으려면 창 바깥을 터치해 Save & Exit 창을 띄운 뒤 [Save & Exit]를 터치하세요.',
      biosHelpExitSave:'설정을 저장하고 이 창을 닫습니다.',
      biosHelpExitCancel:'Save & Exit 창을 닫고 설정 화면으로 돌아갑니다.',
      biosKeysDesktop:['\u2191\u2193: 항목 선택','Enter: 선택','ESC: Save & Exit'],
      biosKeysTouch:['터치: 항목 선택','바깥 터치: Save & Exit'],
      diffBtn:'Retro와 OldRetro의 차이',
      rows:[
        ['시대','Retro는 1995년 무렵 마우스 기반 Windows GUI를 재현합니다. OldRetro는 그보다 앞선 DOS 텍스트 모드 시절을 재현합니다.'],
        ['조작','Retro는 마우스로 창과 아이콘을 다룹니다. OldRetro는 화면 위쪽 F1~F6 메뉴와 키보드로 다룹니다.'],
        ['스크롤','Retro는 일반적인 마우스 휠 스크롤입니다. OldRetro는 PC에서는 Page Up/Down 키(또는 화면 하단 버튼)로만 움직이고, 모바일에서는 평소처럼 스와이프로 스크롤됩니다.'],
        ['화면','Retro는 회색 Windows 9x 스타일입니다. OldRetro는 파란 바탕의 단색 텍스트 화면(CLI)입니다.']
      ],
      biosLabel:'Display Mode',
      biosHelpDefault:'사이트의 화면 모드를 선택합니다. 현재: OldRetro (DOS 텍스트 모드 셸).',
      biosHelpRetro:'Retro: 마우스로 조작하는 Windows 95 스타일 GUI. 창, 아이콘, 일반 휠 스크롤.',
      biosHelpOldRetro:'OldRetro: DOS 텍스트 모드 CLI 셸. F1~F6 키보드 메뉴, 데스크톱에서는 Page Up/Down으로만 스크롤.'
    },
    en:{
      title:'Settings',close:'Close',displayMode:'Display mode',retro:'Retro',oldretro:'OldRetro',kpDefault:'Use \ubb38\ud654\uc5b4 by default',
      kpHelp:'\ubb38\ud654\uc5b4 (Munhwaeo) is the standard form of Korean used in North Korea. When this is on, choosing Korean in the language menu shows the site in \ubb38\ud654\uc5b4 wording by default; when it is off, you get regular (South Korean standard) Korean. Other languages are not affected, and the choice is saved on this device.',
      biosHowDesktop:'To close this window, press ESC, then press Enter on [Save & Exit]. Clicking outside the window does not close it.',
      biosHowTouch:'To close this window, tap outside it to open the Save & Exit box, then tap [Save & Exit].',
      biosHelpExitSave:'Save the settings and close this window.',
      biosHelpExitCancel:'Dismiss the Save & Exit box and return to Setup.',
      biosKeysDesktop:['\u2191\u2193: Select Item','Enter: Select','ESC: Save & Exit'],
      biosKeysTouch:['Tap: Select Item','Tap outside: Save & Exit'],
      diffBtn:'Difference between Retro and OldRetro',
      rows:[
        ['Era','Retro recreates the mouse-driven Windows GUI of around 1995. OldRetro goes back further, to the DOS text-mode era.'],
        ['Control','Retro is driven with a mouse over windows and icons. OldRetro is driven with the keyboard through the F1\u2013F6 menu bar.'],
        ['Scrolling','Retro scrolls normally with the mouse wheel. On desktop, OldRetro only moves via Page Up/Down (or the on-screen buttons); on mobile, ordinary swipe scrolling still works.'],
        ['Look','Retro uses the gray Windows 9x chrome. OldRetro is a blue, monospace text screen (CLI).']
      ],
      biosLabel:'Display Mode',
      biosHelpDefault:'Choose the site\u2019s display mode. Current: OldRetro (DOS text-mode shell).',
      biosHelpRetro:'Retro: the mouse-driven, Windows 95-style GUI. Windows, icons, normal wheel scrolling.',
      biosHelpOldRetro:'OldRetro: the DOS text-mode CLI shell. F1\u2013F6 keyboard menu, Page Up/Down scrolling only on desktop.'
    }
  };
  function currentSettingsLang(){
    const l=window.miniwinLanguage||'en';
    return l.indexOf('ko')===0?'ko':'en';
  }

  let settingsOverlay=null,settingsBuilt=false,settingsPanelEl=null,settingsTitleEl=null,
      settingsModeLabelEl=null,settingsToggleBtn=null,
      settingsHelpBtn=null,settingsHelpPop=null,settingsHelpTitleEl=null,settingsDiffPanel=null,settingsKpToggle=null,settingsKpLabelEl=null,settingsHelpKeyHandler=null,settingsEscHandler=null,settingsKpHelpBtn=null,settingsKpHelpBody=null,helpKind=null,
      biosItemEl=null,biosHelpEl=null,biosKeysEl=null,biosPopupEl=null,
      biosOptRetroEl=null,biosOptOldRetroEl=null,biosPopupKeyHandler=null,biosHighlight='oldretro';

  let biosExitEl=null,biosExitSaveEl=null,biosExitCancelEl=null,biosExitKeyHandler=null,
      biosExitHighlight='save',lastPointerType=null,biosPrevTab=null;
  const isOldRetroNow=()=>body.classList.contains('oldretro-mode');
  /* touch users have no Esc key: tapping outside the BIOS window opens the same Save & Exit prompt */
  const touchLike=()=>lastPointerType==='touch'||(lastPointerType===null&&window.matchMedia('(hover: none)').matches);

  function syncSettingsToggle(){
    if(!settingsToggleBtn)return;
    settingsToggleBtn.setAttribute('aria-pressed',body.classList.contains('oldretro-mode')?'true':'false');
    if(settingsKpToggle){
      let on=false;try{on=localStorage.getItem('miniwin-kp-default')==='1'}catch(e){}
      settingsKpToggle.setAttribute('aria-pressed',on?'true':'false');
    }
  }

  function setKpDefault(on){
    try{localStorage.setItem('miniwin-kp-default',on?'1':'0')}catch(e){}
    const cur=window.miniwinLanguage;
    if(on&&cur==='ko')setLanguage('ko-kp');
    else if(!on&&cur==='ko-kp')setLanguage('ko');
    syncSettingsToggle();
  }

  function renderHelpPop(){
    if(!settingsHelpPop)return;
    const t=SETTINGS_I18N[currentSettingsLang()];
    const kp=helpKind==='kp';
    settingsHelpTitleEl.textContent=kp?t.kpDefault:t.diffBtn;
    settingsDiffPanel.hidden=kp;
    settingsKpHelpBody.hidden=!kp;
  }

  function openHelpPop(kind){
    if(!settingsHelpPop)return;
    helpKind=kind||'mode';
    renderHelpPop();
    settingsHelpPop.hidden=false;
    (helpKind==='kp'?settingsKpHelpBtn:settingsHelpBtn).setAttribute('aria-expanded','true');
    settingsHelpKeyHandler=(e)=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const b=helpKind==='kp'?settingsKpHelpBtn:settingsHelpBtn;closeHelpPop();if(b)b.focus({preventScroll:true});}
    };
    document.addEventListener('keydown',settingsHelpKeyHandler,true);
    const c=settingsHelpPop.querySelector('#settingsHelpClose');if(c)c.focus({preventScroll:true});
  }

  function closeHelpPop(){
    if(settingsHelpPop)settingsHelpPop.hidden=true;
    if(settingsHelpBtn)settingsHelpBtn.setAttribute('aria-expanded','false');
    if(settingsKpHelpBtn)settingsKpHelpBtn.setAttribute('aria-expanded','false');
    helpKind=null;
    if(settingsHelpKeyHandler){document.removeEventListener('keydown',settingsHelpKeyHandler,true);settingsHelpKeyHandler=null;}
  }

  function toggleOldRetroFromSettings(){
    if(body.classList.contains('oldretro-mode')){
      exitOldRetro();
    }else{
      if(body.classList.contains('modern-mode')&&styleToggleBtn)styleToggleBtn.click();
      enterOldRetro();
    }
  }

  function renderSettingsText(){
    if(!settingsBuilt)return;
    const t=SETTINGS_I18N[currentSettingsLang()];
    settingsTitleEl.textContent=t.title;
    settingsModeLabelEl.textContent=t.displayMode;
    settingsOverlay.querySelector('#settingsLabelRetro').textContent=t.retro;
    settingsOverlay.querySelector('#settingsLabelOldRetro').textContent=t.oldretro;
    settingsKpHelpBody.textContent=t.kpHelp;
    settingsKpHelpBtn.setAttribute('aria-label',t.kpDefault);
    settingsKpHelpBtn.title=t.kpDefault;
    renderHelpPop();
    settingsHelpBtn.setAttribute('aria-label',t.diffBtn);
    settingsHelpBtn.title=t.diffBtn;
    settingsKpLabelEl.textContent=t.kpDefault;
    settingsKpToggle.setAttribute('aria-label',t.kpDefault);
    settingsDiffPanel.innerHTML='';
    t.rows.forEach(row=>{
      const dt=document.createElement('dt');dt.textContent=row[0];
      const dd=document.createElement('dd');dd.textContent=row[1];
      settingsDiffPanel.appendChild(dt);
      settingsDiffPanel.appendChild(dd);
    });
    settingsOverlay.querySelectorAll('.settings-close').forEach(b=>b.setAttribute('aria-label',t.close));
  }

  /* ---------------- BIOS-style OldRetro settings screen ----------------
     An AMI-Aptio-style Setup Utility: a "Display Mode" item that pops a
     Legacy/UEFI-style two-option selector, with a help pane and key
     legend, standing in for the plain toggle while in OldRetro. */
  function renderBiosKeys(){
    if(!biosKeysEl)return;
    biosKeysEl.innerHTML='';
    const kt=SETTINGS_I18N[currentSettingsLang()];
    (touchLike()?kt.biosKeysTouch:kt.biosKeysDesktop).forEach(line=>{
      const d=document.createElement('div');d.textContent=line;biosKeysEl.appendChild(d);
    });
  }

  function updateBiosHelp(which){
    if(!biosHelpEl)return;
    const t=SETTINGS_I18N[currentSettingsLang()];
    if(which==='retro')biosHelpEl.textContent=t.biosHelpRetro;
    else if(which==='oldretro')biosHelpEl.textContent=t.biosHelpOldRetro;
    else if(which==='exitsave')biosHelpEl.textContent=t.biosHelpExitSave;
    else if(which==='exitcancel')biosHelpEl.textContent=t.biosHelpExitCancel;
    else biosHelpEl.textContent=t.biosHelpDefault+'\n\n'+(touchLike()?t.biosHowTouch:t.biosHowDesktop);
  }

  function renderBiosText(){
    if(!settingsBuilt)return;
    const t=SETTINGS_I18N[currentSettingsLang()];
    const isOldRetroNow=body.classList.contains('oldretro-mode');
    settingsOverlay.querySelector('#biosTitlebarText').textContent='MiniWin Setup Utility \u2013 Copyright (C) 2026 MiniWin Systems Inc.';
    biosItemEl.innerHTML='';
    biosItemEl.appendChild(document.createTextNode(t.biosLabel+'\u00a0\u00a0\u00a0\u00a0'));
    const valueB=document.createElement('b');
    valueB.textContent='['+(isOldRetroNow?t.oldretro:t.retro)+']';
    biosItemEl.appendChild(valueB);
    biosOptRetroEl.textContent=t.retro;
    biosOptOldRetroEl.textContent=t.oldretro;
    settingsOverlay.querySelector('#biosPopupTitle').textContent=t.biosLabel;
    settingsOverlay.querySelector('#biosFooterVersion').textContent='Version 1.0-pre.';
    settingsOverlay.querySelector('#biosFooterTag').textContent='MW01';
    renderBiosKeys();
    updateBiosHelp(null);
    settingsOverlay.querySelectorAll('.settings-close').forEach(b=>b.setAttribute('aria-label',t.close));
  }

  function renderSettingsAll(){
    renderSettingsText();
    renderBiosText();
    if(settingsPanelEl){
      settingsPanelEl.setAttribute('aria-labelledby',body.classList.contains('oldretro-mode')?'biosTitlebarText':'settingsTitle');
    }
  }

  function setBiosHighlight(val){
    biosHighlight=val;
    biosOptRetroEl.classList.toggle('highlight',val==='retro');
    biosOptOldRetroEl.classList.toggle('highlight',val==='oldretro');
    updateBiosHelp(val);
  }

  function openBiosPopup(){
    biosHighlight=body.classList.contains('oldretro-mode')?'oldretro':'retro';
    setBiosHighlight(biosHighlight);
    biosPopupEl.hidden=false;
    biosPopupKeyHandler=(e)=>{
      if(e.key==='ArrowUp'||e.key==='ArrowDown'){
        e.preventDefault();
        setBiosHighlight(biosHighlight==='retro'?'oldretro':'retro');
        (biosHighlight==='retro'?biosOptRetroEl:biosOptOldRetroEl).focus({preventScroll:true});
      }else if(e.key==='Enter'){
        e.preventDefault();
        applyBiosSelection(biosHighlight);
      }else if(e.key==='Escape'){
        e.preventDefault();e.stopPropagation();
        closeBiosPopup();
        if(biosItemEl)biosItemEl.focus({preventScroll:true});
      }
    };
    document.addEventListener('keydown',biosPopupKeyHandler,true);
    (biosHighlight==='retro'?biosOptRetroEl:biosOptOldRetroEl).focus({preventScroll:true});
  }

  function closeBiosPopup(){
    if(biosPopupEl)biosPopupEl.hidden=true;
    if(biosPopupKeyHandler){document.removeEventListener('keydown',biosPopupKeyHandler,true);biosPopupKeyHandler=null;}
  }

  function applyBiosSelection(val){
    closeBiosPopup();
    const isOldRetroNow=body.classList.contains('oldretro-mode');
    if(val==='retro'&&isOldRetroNow){
      exitOldRetro();
      closeSettings();
    }else if(val==='oldretro'&&!isOldRetroNow){
      if(body.classList.contains('modern-mode')&&styleToggleBtn)styleToggleBtn.click();
      enterOldRetro();
      closeSettings();
    }else{
      renderBiosText();
      if(biosItemEl)biosItemEl.focus({preventScroll:true});
    }
  }

  function setExitHighlight(val){
    biosExitHighlight=val;
    biosExitSaveEl.classList.toggle('highlight',val==='save');
    biosExitCancelEl.classList.toggle('highlight',val==='cancel');
    updateBiosHelp(val==='save'?'exitsave':'exitcancel');
  }

  function openExitPrompt(){
    if(!biosExitEl||!biosExitEl.hidden)return;
    closeBiosPopup();
    const tabs=settingsOverlay.querySelectorAll('.bios-tab');
    biosPrevTab=settingsOverlay.querySelector('.bios-tab.active');
    tabs.forEach(t=>t.classList.remove('active'));
    if(tabs[3])tabs[3].classList.add('active'); /* "Save & Exit" tab lights up */
    biosExitEl.hidden=false;
    setExitHighlight('save');
    biosExitKeyHandler=(e)=>{
      if(e.key==='ArrowUp'||e.key==='ArrowDown'){
        e.preventDefault();
        setExitHighlight(biosExitHighlight==='save'?'cancel':'save');
        (biosExitHighlight==='save'?biosExitSaveEl:biosExitCancelEl).focus({preventScroll:true});
      }else if(e.key==='Enter'){
        e.preventDefault();
        if(biosExitHighlight==='save')closeSettings();else closeExitPrompt();
      }else if(e.key==='Escape'){
        e.preventDefault();e.stopPropagation();
        closeExitPrompt();
      }else if(e.key==='Tab'){
        e.preventDefault();
      }
    };
    document.addEventListener('keydown',biosExitKeyHandler,true);
    biosExitSaveEl.focus({preventScroll:true});
  }

  function closeExitPrompt(){
    if(biosExitEl&&!biosExitEl.hidden){
      biosExitEl.hidden=true;
      const tabs=settingsOverlay.querySelectorAll('.bios-tab');
      tabs.forEach(t=>t.classList.remove('active'));
      const back=biosPrevTab||tabs[2]||tabs[0];
      if(back)back.classList.add('active');
      updateBiosHelp(null);
      if(biosItemEl)biosItemEl.focus({preventScroll:true});
    }
    if(biosExitKeyHandler){document.removeEventListener('keydown',biosExitKeyHandler,true);biosExitKeyHandler=null;}
  }

  function buildSettings(){
    if(settingsBuilt)return;
    settingsOverlay=document.createElement('div');
    settingsOverlay.id='settingsOverlay';
    settingsOverlay.hidden=true;
    settingsOverlay.innerHTML=
      '<div class="settings-backdrop" id="settingsBackdrop"></div>'+
      '<div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">'+

        '<div class="settings-standard" id="settingsStandard">'+
          '<div class="settings-head"><span id="settingsTitle"></span>'+
            '<button type="button" class="settings-close" id="settingsClose">\u2715</button></div>'+
          '<div class="settings-body">'+
            '<div class="settings-row"><span class="settings-label-wrap"><span class="settings-row-label" id="settingsModeLabel"></span>'+
              '<button type="button" class="settings-help-btn" id="settingsHelpBtn" aria-haspopup="dialog" aria-expanded="false">?</button></span>'+
              '<div class="style-switch" id="settingsOldRetroSwitch" role="group">'+
                '<span class="style-label" id="settingsLabelRetro">Retro</span>'+
                '<button class="style-toggle" id="settingsOldRetroToggle" type="button" aria-label="Toggle OldRetro mode" aria-pressed="false"><span></span></button>'+
                '<span class="style-label" id="settingsLabelOldRetro">OldRetro</span>'+
              '</div>'+
            '</div>'+
            '<div class="settings-row" id="settingsKpRow"><span class="settings-label-wrap"><span class="settings-row-label" id="settingsKpLabel"></span>'+
              '<button type="button" class="settings-help-btn" id="settingsKpHelpBtn" aria-haspopup="dialog" aria-expanded="false">?</button></span>'+
              '<div class="style-switch" id="settingsKpSwitch" role="group">'+
                '<button class="style-toggle" id="settingsKpToggle" type="button" aria-pressed="false"><span></span></button>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+

        '<div class="settings-bios" id="settingsBios" hidden>'+
          '<div class="bios-titlebar"><span id="biosTitlebarText"></span>'+
            '<button type="button" class="settings-close bios-close" id="biosClose">\u2715</button></div>'+
          '<div class="bios-tabs">'+
            '<span class="bios-tab">Main</span><span class="bios-tab">Advanced</span>'+
            '<span class="bios-tab active">Boot</span><span class="bios-tab">Save &amp; Exit</span>'+
          '</div>'+
          '<div class="bios-main">'+
            '<div class="bios-menu"><button type="button" class="bios-item" id="biosModeItem"></button></div>'+
            '<div class="bios-side"><div class="bios-help" id="biosHelp"></div><div class="bios-keys" id="biosKeys"></div></div>'+
          '</div>'+
          '<div class="bios-popup" id="biosPopup" hidden>'+
            '<div class="bios-popup-title" id="biosPopupTitle"></div>'+
            '<button type="button" class="bios-popup-opt" id="biosOptRetro" data-val="retro"></button>'+
            '<button type="button" class="bios-popup-opt" id="biosOptOldRetro" data-val="oldretro"></button>'+
          '</div>'+
          '<div class="bios-popup bios-exit" id="biosExit" hidden role="dialog" aria-label="Save &amp; Exit">'+
            '<div class="bios-popup-title">Save &amp; Exit</div>'+
            '<button type="button" class="bios-popup-opt" id="biosExitSave">Save &amp; Exit</button>'+
            '<button type="button" class="bios-popup-opt" id="biosExitCancel">Cancel</button>'+
          '</div>'+
          '<div class="bios-footer"><span id="biosFooterVersion"></span><span id="biosFooterTag"></span></div>'+
        '</div>'+

      '</div>'+

      '<div class="settings-help-pop" id="settingsHelpPop" hidden>'+
        '<div class="settings-help-back" id="settingsHelpBack"></div>'+
        '<div class="settings-help-card" role="dialog" aria-modal="true" aria-labelledby="settingsHelpTitle">'+
          '<div class="settings-help-head"><span id="settingsHelpTitle"></span>'+
            '<button type="button" class="settings-help-close" id="settingsHelpClose">\u2715</button></div>'+
          '<dl class="settings-diff-panel" id="settingsDiffPanel"></dl>'+
          '<p class="settings-diff-panel settings-kp-help" id="settingsKpHelpBody" hidden></p>'+
        '</div>'+
      '</div>';
    document.body.appendChild(settingsOverlay);
    settingsPanelEl=settingsOverlay.querySelector('.settings-panel');
    settingsTitleEl=settingsOverlay.querySelector('#settingsTitle');
    settingsModeLabelEl=settingsOverlay.querySelector('#settingsModeLabel');
    settingsToggleBtn=settingsOverlay.querySelector('#settingsOldRetroToggle');
    settingsHelpBtn=settingsOverlay.querySelector('#settingsHelpBtn');
    settingsHelpPop=settingsOverlay.querySelector('#settingsHelpPop');
    settingsHelpTitleEl=settingsOverlay.querySelector('#settingsHelpTitle');
    settingsKpToggle=settingsOverlay.querySelector('#settingsKpToggle');
    settingsKpLabelEl=settingsOverlay.querySelector('#settingsKpLabel');
    settingsDiffPanel=settingsOverlay.querySelector('#settingsDiffPanel');
    settingsKpHelpBtn=settingsOverlay.querySelector('#settingsKpHelpBtn');
    settingsKpHelpBody=settingsOverlay.querySelector('#settingsKpHelpBody');
    biosItemEl=settingsOverlay.querySelector('#biosModeItem');
    biosHelpEl=settingsOverlay.querySelector('#biosHelp');
    biosKeysEl=settingsOverlay.querySelector('#biosKeys');
    biosPopupEl=settingsOverlay.querySelector('#biosPopup');
    biosOptRetroEl=settingsOverlay.querySelector('#biosOptRetro');
    biosOptOldRetroEl=settingsOverlay.querySelector('#biosOptOldRetro');
    biosExitEl=settingsOverlay.querySelector('#biosExit');
    biosExitSaveEl=settingsOverlay.querySelector('#biosExitSave');
    biosExitCancelEl=settingsOverlay.querySelector('#biosExitCancel');

    settingsOverlay.addEventListener('pointerdown',e=>{lastPointerType=e.pointerType;},true);
    settingsOverlay.querySelector('#settingsBackdrop').addEventListener('click',()=>{
      if(isOldRetroNow()){if(touchLike())openExitPrompt();} /* desktop: clicking outside does nothing */
      else closeSettings();
    });
    settingsOverlay.querySelectorAll('.settings-close').forEach(b=>b.addEventListener('click',()=>{
      if(isOldRetroNow())openExitPrompt();else closeSettings();
    }));
    /* keyboard users confirm with Enter (handled in openExitPrompt); only touch taps count as clicks here */
    biosExitSaveEl.addEventListener('click',()=>{if(touchLike())closeSettings();});
    biosExitCancelEl.addEventListener('click',()=>{if(touchLike())closeExitPrompt();});
    biosExitSaveEl.addEventListener('mouseenter',()=>setExitHighlight('save'));
    biosExitCancelEl.addEventListener('mouseenter',()=>setExitHighlight('cancel'));
    biosExitSaveEl.addEventListener('focus',()=>setExitHighlight('save'));
    biosExitCancelEl.addEventListener('focus',()=>setExitHighlight('cancel'));
    settingsToggleBtn.addEventListener('click',toggleOldRetroFromSettings);
    settingsHelpBtn.addEventListener('click',()=>{if(!settingsHelpPop.hidden&&helpKind==='mode')closeHelpPop();else{closeHelpPop();openHelpPop('mode');}});
    settingsKpHelpBtn.addEventListener('click',()=>{if(!settingsHelpPop.hidden&&helpKind==='kp')closeHelpPop();else{closeHelpPop();openHelpPop('kp');}});
    settingsOverlay.querySelector('#settingsHelpClose').addEventListener('click',closeHelpPop);
    settingsOverlay.querySelector('#settingsHelpBack').addEventListener('click',closeHelpPop);
    settingsKpToggle.addEventListener('click',()=>{setKpDefault(settingsKpToggle.getAttribute('aria-pressed')!=='true');});
    biosItemEl.addEventListener('click',openBiosPopup);
    biosOptRetroEl.addEventListener('click',()=>applyBiosSelection('retro'));
    biosOptOldRetroEl.addEventListener('click',()=>applyBiosSelection('oldretro'));
    biosOptRetroEl.addEventListener('mouseenter',()=>setBiosHighlight('retro'));
    biosOptOldRetroEl.addEventListener('mouseenter',()=>setBiosHighlight('oldretro'));
    biosOptRetroEl.addEventListener('focus',()=>setBiosHighlight('retro'));
    biosOptOldRetroEl.addEventListener('focus',()=>setBiosHighlight('oldretro'));

    settingsBuilt=true;
    renderSettingsAll();
    syncSettingsToggle();
  }

  function openSettings(){
    buildSettings();
    renderSettingsAll();
    syncSettingsToggle();
    settingsOverlay.hidden=false;
    settingsEscHandler=(e)=>{if(e.key==='Escape'){if(isOldRetroNow())openExitPrompt();else closeSettings();}};
    document.addEventListener('keydown',settingsEscHandler);
    const focusTarget=body.classList.contains('oldretro-mode')?biosItemEl:settingsOverlay.querySelector('#settingsClose');
    if(focusTarget)focusTarget.focus({preventScroll:true});
  }

  function closeSettings(){
    if(!settingsOverlay)return;
    closeHelpPop();
    closeExitPrompt();
    closeBiosPopup();
    settingsOverlay.hidden=true;
    if(settingsEscHandler){document.removeEventListener('keydown',settingsEscHandler);settingsEscHandler=null;}
  }

  const settingsBtn=document.getElementById('settingsBtn');
  if(settingsBtn)settingsBtn.addEventListener('click',openSettings);

  window.addEventListener('miniwin-language-change',()=>{
    if(body.classList.contains('oldretro-mode')&&built){
      renderShellContent();
      renderMenubar();
    }
    if(settingsBuilt)renderSettingsAll();
  });

  /* Keyboard buffer, mirroring the existing NKBK easter egg pattern above. */
  let buffer='';
  document.addEventListener('keydown',(e)=>{
    if(e.ctrlKey||e.altKey||e.metaKey||e.key.length!==1){return;}
    const ch=e.key.toLowerCase();
    if(!/[a-z]/.test(ch)){buffer='';return;}
    buffer=(buffer+ch).slice(-6);
    if(buffer.endsWith('old')){
      buffer='';
      enterOldRetro();
    }else if(buffer.endsWith('retro')){
      buffer='';
      exitOldRetro();
    }
  });

  /* If OldRetro was left as the saved default, restore it instantly on load
     (no boot replay) — but only when the saved base style is Retro, since
     OldRetro is a sub-state of Retro, not Modern. */
  try{
    const savedStyle=localStorage.getItem('miniwin-style')||'retro';
    if(savedStyle!=='modern' && localStorage.getItem('miniwin-oldretro')==='1'){
      enterOldRetro({skipBoot:true});
    }
  }catch(e){}
})();
