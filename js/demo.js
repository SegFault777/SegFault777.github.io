/* Section 06 demo: boots assets/os-image.img in the v86 x86 emulator, with 32 MB of RAM.
   The emulator is not downloaded until Start is pressed. Files are looked up in vendor/v86/ first (put libv86.js,
   v86.wasm, seabios.bin and vgabios.bin there to pin a version and work offline); if libv86.js is not there, the
   CDN copy is used. The status line is translated by i18n.js: this script only switches its data-state. */
(()=>{
  const screen=document.getElementById('demoScreen');
  if(!screen)return;
  const cover=document.getElementById('demoCover');
  const startBtn=document.getElementById('demoStart');
  const resetBtn=document.getElementById('demoReset');
  const fullBtn=document.getElementById('demoFull');
  const status=document.getElementById('demoStatus');
  const res=document.getElementById('demoRes');

  const MEMORY_MB=32;
  const VGA_MEMORY_MB=8;
  const abs=u=>new URL(u,document.baseURI).href;
  const IMAGE=abs('assets/os-image.img');
  const CDN='https://cdn.jsdelivr.net';
  const SOURCES=[
    {lib:'vendor/v86/libv86.js',wasm:'vendor/v86/v86.wasm',bios:'vendor/v86/seabios.bin',vga:'vendor/v86/vgabios.bin'},
    {lib:CDN+'/npm/v86@latest/build/libv86.js',wasm:CDN+'/npm/v86@latest/build/v86.wasm',
     bios:CDN+'/gh/copy/v86@master/bios/seabios.bin',vga:CDN+'/gh/copy/v86@master/bios/vgabios.bin'}
  ];

  let emu=null;
  let starting=false;
  const setState=s=>{status.dataset.state=s};
  const ctor=()=>window.V86||window.V86Starter;
  const loadScript=src=>new Promise((ok,fail)=>{
    const s=document.createElement('script');
    s.src=abs(src);s.async=true;
    s.onload=ok;
    s.onerror=()=>{s.remove();fail(new Error('could not load '+src))};
    document.head.appendChild(s);
  });
  async function pickSource(){
    for(const src of SOURCES){
      if(!ctor()){try{await loadScript(src.lib)}catch(e){continue}}
      if(ctor())return src;
    }
    throw new Error('emulator not available');
  }
  const kbd=on=>{try{if(emu)emu.keyboard_set_status(!!on)}catch(e){}};

  async function start(){
    if(starting||emu)return;
    starting=true;startBtn.disabled=true;setState('loading');
    try{
      const src=await pickSource();
      const V=ctor();
      emu=new V({
        wasm_path:abs(src.wasm),
        memory_size:MEMORY_MB*1024*1024,
        vga_memory_size:VGA_MEMORY_MB*1024*1024,
        screen_container:screen,
        bios:{url:abs(src.bios)},
        vga_bios:{url:abs(src.vga)},
        hda:{url:IMAGE,async:false},
        autostart:true
      });
      const on=(name,fn)=>{try{emu.add_listener(name,fn)}catch(e){}};
      on('emulator-started',()=>{
        screen.classList.add('is-on');
        setState('running');
        resetBtn.disabled=false;fullBtn.disabled=false;
        kbd(false); /* the page keeps its own keys (space, arrows) until the screen is clicked */
      });
      on('screen-set-size',v=>{try{if(v&&v[0]&&v[1])res.textContent=v[0]+'×'+v[1]}catch(e){}});
      on('download-error',()=>{setState('error');startBtn.disabled=false;emu=null;cover.style.display=''});
    }catch(e){
      emu=null;setState('error');startBtn.disabled=false;
    }finally{starting=false}
  }

  startBtn.addEventListener('click',start);
  screen.addEventListener('click',()=>{
    if(!emu||!screen.classList.contains('is-on'))return;
    kbd(true);screen.focus();
    try{emu.lock_mouse()}catch(e){}
  });
  screen.addEventListener('blur',()=>kbd(false));
  document.addEventListener('click',e=>{if(!screen.contains(e.target))kbd(false)},true);
  resetBtn.addEventListener('click',()=>{try{if(emu)emu.restart()}catch(e){}});
  fullBtn.addEventListener('click',()=>{try{(screen.requestFullscreen||screen.webkitRequestFullscreen).call(screen)}catch(e){}});
})();
