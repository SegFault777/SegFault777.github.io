# SegFault777.github.io — the MiniWin website

This repository is the website for **MiniWin**, a 32-bit x86 operating system written from scratch. The site
explains the project, shows the source, and lets visitors boot the real MiniWin disk image in their browser.
It is a static site: plain HTML, CSS and JavaScript with no build step.

## About MiniWin

MiniWin boots from a single 1 MB MBR disk image into a Windows-95-flavoured GUI. Its bootloader sets a 640×480
32-bit VBE mode, the kernel is freestanding C with no libc, and it includes a window manager, a Hangul input
method, an HTML5/CSS engine (MiniWeb), loadable `.mwp` programs, two NIC drivers, and a TCP/IP stack with TLS 1.2
for HTTPS. The OS has its own repository and README; this README covers only the website.

## Running the site locally

No tools are needed beyond a static file server, because some features (translation files, the demo disk image)
do not load over `file://`.

```bash
git clone https://github.com/SegFault777/SegFault777.github.io.git
cd SegFault777.github.io
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`.

## Deploying

In the repository settings, set **Pages** to serve the `main` branch from the root. Pushing to `main` updates the
site. All stylesheet and script URLs carry a `?v=` value (currently `1.0`); bump it when a file changes so browsers
reload it.

## What is on the page

| Section | Id | Purpose |
|---|---|---|
| Hero | `home` | Title, one-line summary, links |
| 01 / The project | `about` | What MiniWin is |
| 02 / Features | `features` | Bootloader, display, kernel, desktop, apps, MiniWeb, HTML5 engine, `.mwp` programs |
| 03 / Build | `build` | Build and QEMU commands, with a terminal-style window |
| 04 / Networking | `networking` | NIC drivers, ARP/IPv4/UDP, DHCP/DNS, TCP, TLS 1.2 |
| 05 / Get it | `download` | Disk image, source archive, repository and README links |
| 06 / Try it | `demo` | Boot MiniWin in the browser (see below) |

The navigation bar highlights the section you are reading. The Retro/Modern switch in the header and the
settings window control the look (see *Layouts*).

### Section 06: the browser demo

The demo boots `assets/os-image.img` (the 1 MB MiniWin disk image) in the [v86](https://github.com/copy/v86)
x86 emulator, with **32 MB of RAM** and 8 MB of video memory.

- `js/demo.js` downloads the emulator only when **Start** is pressed. It looks for the emulator files in
  `vendor/v86/` first and falls back to the jsDelivr CDN. To pin a version or work offline, copy `libv86.js`,
  `v86.wasm`, `seabios.bin` and `vgabios.bin` into `vendor/v86/` (see `vendor/v86/README.md`).
- The keyboard and mouse are attached to the emulator only after the screen is clicked, so the page keeps its own
  keys until then. Press Esc to release the mouse.
- The demo has no network connection, so MiniWeb cannot open pages in it.
- The kernel refuses to start with less than 9392 KB of RAM (`VGA_MIN_RAM_KB` in the OS source), so the memory size
  must stay above that.
- The kernel is built with the compiler's default `-m32` target, which emits CMOV (a P6 instruction). The emulated
  CPU therefore has to be P6-class.

## Layouts (themes)

The site has **24 layouts** plus an **OldRetro** mode (a DOS-style text shell with a BIOS-style setup screen: Display Mode, Language, Munhwaeo and Reduce motion, with every layout listed). Choose
one in **Settings → Layout**, or switch between Retro and Modern with the header toggle.

**Retro family:** Retro, OldRetro, Luna (Windows XP), Aqua (Mac OS X 10.0–10.3), System 6, NeXTSTEP, OS/2 (IBM OS/2 Warp 3 colours), BeOS (BeOS R5 colours), Platinum Lavender,
Platinum Lime, Platinum Magenta (Mac OS 9). NeXTSTEP uses exact colours sampled from a NeXTSTEP 3.x screen,
with the dock column on the right; its logo and application icons are not reproduced. OS/2 uses the exact colours
of an OS/2 Warp 3 screen; the Warp wallpaper and logo are not reproduced.

**Modern family:** Modern, Mid Aqua (Mac OS X 10.4–10.9), Modern Aqua (10.10–10.15), Material, Plastik (KDE 3.5),
Modern Glass, Aero, Breeze, Flat, Adwaita, Mica, Oxygen, Sequoia, Liquid Glass.

Each visitor starts with a layout that matches their operating system:

| Device | Default layout |
|---|---|
| Windows 9x, or Windows NT 5.0 and lower (Win 95 – Win ME / Windows 2000 / Windows 2000 Server) | Retro |
| Windows NT 5.1 or 5.2 (Windows XP / Windows Server 2003) | Luna |
| Windows NT 6.0 or 6.1 (Windows Vista / Windows 7 / Windows Server 2008 / 2008 R2) | Aero |
| Windows NT 6.2 – 10.0 (Windows 8 – Windows 10 / Windows Server 2016 – 2022) | Flat |
| Windows NT 10.0 with the Windows 11 Client Hints (Windows 11 / Windows Server 2025) | Mica |
| Mac OS X 10.0 (Cheetah) – Mac OS X 10.3 (Panther) | Old Aqua |
| Mac OS X 10.4 (Tiger) – OS X 10.9 (Mavericks) | Mid Aqua |
| OS X 10.10 (Yosemite) – macOS 10.15 (Catalina) | Modern Aqua |
| macOS 11 (Big Sur) – macOS 15 (Sequoia) | Sequoia |
| macOS 26 (Tahoe), macOS 27 (Golden Gate) | Liquid Glass |
| Classic Mac OS, 68K (System 1 – Mac OS 7) | System 6 |
| Classic Mac OS 8 / 9 (PowerPC) | Platinum Lavender |
| NeXTSTEP | NeXTSTEP |
| OS/2 Warp 1 – Warp 4 | OS/2 |
| BeOS DR1 – R5 | BeOS |
| Android (all devices) | Material |
| iOS, iPadOS | Sequoia |
| Linux (GNOME) | Adwaita |
| Anything else | Modern |

Not chosen automatically: OldRetro (only in special cases), Platinum Lime and Platinum Magenta, Modern Glass, Plastik,
Breeze and Oxygen (a KDE version cannot be detected). Browsers cannot report the classic Mac, NeXTSTEP, OS/2 and BeOS
systems reliably, so those are matched by the names their user agents contain. Safari and Chromium freeze the macOS
version at 10_15_7 in the user agent; Chromium's Client Hints give the real version, and Safari cannot tell Catalina
from Sequoia.

## Settings

The gear button opens the settings window. The **?** next to the Layout setting opens the layout guide: a window with a button for every layout (OldRetro included); a click shows its description as five labelled lines (motif, features, devices, pros and cons), in Korean or English.

| Item | Saved as | Notes |
|---|---|---|
| Layout | `miniwin-style` | Grouped into Retro and Modern |
| Language | `miniwin-language` | See *Languages* |
| Munhwaeo by default | `miniwin-kp-default` | Uses the North Korean standard Korean text set |
| Reduce motion | `miniwin-reduce-motion` | On by default on mobile devices and when the OS asks |

All values live in the browser's `localStorage`; nothing is sent to a server.

## Languages

Each language has one file in `i18n/`. A missing key falls back to the chosen language, then to English. The site
includes English, Korean, Munhwaeo (`ko-kp`), Spanish, Simplified and Traditional Chinese, Japanese, French,
German, Brazilian Portuguese, Italian, Russian, Vietnamese, Indonesian, Polish, Turkish, Dutch, Swedish, Ukrainian,
Arabic and Hindi.

The section 06 strings and the newest feature text are written in English and Korean; the other languages show
English for those keys until they are translated.

The interface text (navigation, section titles, buttons, the demo's labels and the settings window) is translated into every language listed above. The page's long explanatory paragraphs are translated into every language listed above. The detailed help texts (the munhwaeo note, the BIOS help) and the layout guide descriptions are still in Korean and English. The munhwaeo variant (ko-kp) is written in the North Korean standard orthography (for example 련결 and 로동 keep their initial ㄹ, and 화상, 기동, 페지 and 콤퓨터 are used).

## External resources

| Resource | Source | Used for |
|---|---|---|
| Silkscreen | Google Fonts | Platinum title font |
| Roboto | Google Fonts | Material font |
| Galmuri | jsDelivr | Bitmap font for the Retro family |
| Pretendard | jsDelivr | Font for Aqua and the modern layouts |
| v86 (fallback only) | jsDelivr | Emulator for section 06, if `vendor/v86/` is empty |

## Browser support and limits

- The glass refraction in Liquid Glass and Modern Glass uses an SVG filter, which looks best in Chromium-based
  browsers; other browsers show a blur.
- Chicago, Geneva, Helvetica Neue and Lucida Grande cannot be shipped on the web. They are used only if they are
  installed.
- On phones (640 px and narrower) the header becomes two rows, every control is at least 44 px tall, and the
  Settings window fits the screen.
- The demo needs a keyboard and a mouse; it works best on a computer.

## Adding a layout

Replace `NEWKEY` with your key.

1. **`js/theme.js`**: add it to the `normalise` list; add a flag and a `['NEWKEY-mode', flag]` entry to the class
   list in `apply`; add it to `variant` and to the label map in `syncLabels`; add a `DEFAULTS` entry if an OS should
   use it.
2. **`js/oldretro.js`**: add an `<option value="NEWKEY">` to the Layout list and handle it in `currentLayout`.
3. **`css/NEWKEY.css`**: create it and `@import` it at the end of `css/main.css`. Use selectors specific enough to
   beat the layouts before it, such as `html body.modern-mode.NEWKEY-mode`.
4. Style the dropdown entry `button.th-NEWKEY` in `css/42-select-menus.css` terms.

## Files

```
index.html          the page: sections 01–06, navigation, settings window
css/                main.css imports 01–50 in order; the order is the priority order
js/                 i18n.js, nav.js, theme.js, oldretro.js, settings-select.js,
                    modern-stagger.js, glass.js, demo.js
i18n/               one translation file per language
assets/             os-image.img (section 06), miniweb-html5.png
assets/system6/     System 6 frame pieces (1-bit)
assets/aqua/        colour field for Old Aqua
vendor/v86/         optional local copy of the v86 emulator
```

## Version

Website version **1.0**. The OS version is in the MiniWin repository.

## License

This website is free software under the GNU General Public License, version 3 (GPL-3.0); see `LICENSE`.
Copyright (C) 2026 MiniWin Project. It comes with ABSOLUTELY NO WARRANTY. The MiniWin OS and the third-party files
it bundles have their own licenses, described in the MiniWin repository.
