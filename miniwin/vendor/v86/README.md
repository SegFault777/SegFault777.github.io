# v86 files for the section 06 demo

js/demo.js looks for the emulator here first and falls back to the jsDelivr CDN (`@latest`, which is not pinned).
To pin a version and work offline, copy these four files from a v86 release into this folder:

- `libv86.js`
- `v86.wasm`
- `seabios.bin`
- `vgabios.bin`

The demo boots `assets/os-image.img` with 32 MB of RAM (the MiniWin kernel needs at least 9392 KB for its
truecolor backbuffer, see `kernel/vga.h`).
