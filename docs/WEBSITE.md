# MiniWin Website (SegFault777.github.io)

MiniWin is a 32-bit x86 operating system project with a real-mode bootloader, a VBE graphics mode, its own kernel, and a windowed desktop. This repository is the project's website. The same HTML document is shown in **19 layouts** (themes), and the site picks a default layout that matches the visitor's operating system.

The site is a static site with no build step. It serves HTML, CSS and JavaScript files as they are.

---

## Contents

1. [Run locally](#run-locally)
2. [Deploy](#deploy)
3. [File layout](#file-layout)
4. [Script load order](#script-load-order)
5. [Layouts (themes)](#layouts-themes)
6. [Default layout by operating system](#default-layout-by-operating-system)
7. [Settings](#settings)
8. [Saved values](#saved-values)
9. [Languages](#languages)
10. [External resources](#external-resources)
11. [Browser support and limits](#browser-support-and-limits)
12. [Adding a layout](#adding-a-layout)
13. [License](#license)

---

## Run locally

You need a web browser and a simple static server. Opening the files with `file://` may break features such as loading translation files, so use a server.

```bash
git clone https://github.com/SegFault777/SegFault777.github.io.git
cd SegFault777.github.io
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html` in your browser.

---

## Deploy

To publish with GitHub Pages, set **Pages** in the repository settings to serve the `main` branch from the root. Push changes to `main` and the site updates.

If a change does not show because of caching, bump the `?v=` value in `index.html`. All CSS and JavaScript URLs use the same `?v=` value.

---

## File layout

```
index.html              Document body and sections (home, about, features, build, networking, download)
css/
  main.css              The list of stylesheet imports; the order is the priority order
  01-base.css … 13-…    Base layout, header, responsive rules, Retro family, shared settings styles
  14-… … 17-…           Modern motion, entrance effects, per-letter animation
  18-oldretro.css       OldRetro (DOS text-mode shell)
  19-settings.css       Settings window
  22-bios.css           BIOS-style layout picker
  23-…, 25-…            Language menu
  26-content.css        Page content
  27-modern-glass.css   Modern Glass
  29-aero.css … 36-…    Aero, Breeze, Luna, Flat, Adwaita, Mica, Oxygen
  37-aqua.css           Old Aqua (Mac OS X 10.0–10.3)
  38-sequoia.css        Sequoia
  39-motion.css         Reduce motion
  40-liquid.css         Liquid Glass
  41-window-controls.css Title bar controls (_ □ X and the Mac dots)
  42-select-menus.css   Dropdown menus in Settings
  43-logo-guard.css     Keeps the logo on one line
  44-platinum.css       Platinum (Mac OS 9, three accent colours)
  45-modern-aqua.css    Mid Aqua (Mac OS X 10.4–10.9): Old Aqua's glossy surfaces
  47-modern-aqua-yosemite.css Modern Aqua (Mac OS X 10.10–10.15)
  46-material.css       Material
  47-modern-aqua-yosemite.css Modern Aqua (Mac OS X 10.10–10.15)
  48-mobile.css         Phone layout (touch targets, two-row header)
  49-system6.css        System 6 (black and white, frame pieces from the reference)
  assets/               Window frame and title-bar images for Platinum
js/
  i18n.js               Translation, language menu, translation file loading
  nav.js                Header navigation
  theme.js              Layout choice, OS detection, defaults, the header toggle
  oldretro.js           Settings window, OldRetro, the BIOS-style picker
  settings-select.js    Dropdown menus in Settings
  modern-stagger.js     Per-letter entrance animation for Modern
  glass.js              Refraction effect for Liquid Glass and Modern Glass
i18n/
  *.js                  One translation file per language
assets/
  miniweb-html5.png     Image used in the document
```

---

## Script load order

`index.html` loads these scripts in the following order. All of them use `defer`, so they run after the HTML has been parsed.

1. `js/i18n.js`: sets up translation first.
2. `js/nav.js`: header navigation.
3. `js/theme.js`: chooses the layout.
4. `js/oldretro.js`: the Settings window and the BIOS-style picker.
5. `js/settings-select.js`: dropdown menus in Settings.
6. `js/modern-stagger.js`: per-letter animation.
7. `js/glass.js`: refraction effect.

---

## Layouts (themes)

Choose a layout in **Settings → Layout**, or switch between Retro and Modern with the header toggle. The keys in the tables are the values stored in `miniwin-style`.

### Retro family

| Key | Name | Description | File |
|---|---|---|---|
| `retro` | Retro | Windows 95/98 style: grey bevels and a blue title bar | `08-retro-win9x.css` |
| `oldretro` | OldRetro | DOS text-mode shell. It also uses the BIOS-style Settings picker | `18-oldretro.css` |
| `luna` | Luna | Windows XP: blue windows and rounded buttons | `32-luna.css` |
| `aqua` | Old Aqua | Mac OS X 10.0–10.3: striped title bars and jelly buttons | `37-aqua.css` |
| `platinum-lavender` | Platinum Lavender | Mac OS 9 Platinum with the lavender accent | `44-platinum.css` |
| `platinum-lime` | Platinum Lime | Mac OS 9 Platinum with the lime accent | `44-platinum.css` |
| `platinum-magenta` | Platinum Magenta | Mac OS 9 Platinum with the magenta accent | `44-platinum.css` |
| `system6` | System 6 | Apple Macintosh System 6 (1984–1991): black and white only, a checkerboard desktop, a one-row menu bar, and striped document windows whose frame pieces are cut from the System 6 reference screens (Retro bitmap font kept) | `49-system6.css`, `assets/system6/` |

### Modern family

| Key | Name | Description | File |
|---|---|---|---|
| `modern` | Modern | A flat, default modern layout | `03-theme-split.css` |
| `modern-aqua` | Mid Aqua | Mac OS X 10.4–10.9 (Mavericks): the glossy, three-dimensional Aqua surfaces and jelly traffic lights of Old Aqua, on the Mavericks desktop | `45-modern-aqua.css` |
| `modern-aqua-yosemite` | Modern Aqua | Mac OS X 10.10 Yosemite through 10.15 Catalina: flat, translucent windows and menu bar, thin system face, Dark Mode, and a terrain wallpaper for each release (Yosemite, El Capitan, Sierra, High Sierra, Mojave, Catalina) | `47-modern-aqua-yosemite.css`, `assets/wallpapers/` |
| `material` | Material | Material 3 colours and shapes: a lavender ground, pill buttons, 28 px surfaces | `46-material.css` |
| `modern-glass` | Modern Glass | Translucent panels with a glass texture | `27-modern-glass.css` |
| `aero` | Aero | Windows 7 style glass windows | `29-aero.css` |
| `breeze` | Breeze | KDE Breeze style | `31-breeze.css` |
| `flat` | Flat | Flat Windows 10 style windows | `33-flat.css` |
| `adwaita` | Adwaita | GNOME Adwaita style | `34-adwaita.css` |
| `mica` | Mica | Windows 11 Mica style | `35-mica.css` |
| `oxygen` | Oxygen | KDE 4 Oxygen style | `36-oxygen.css` |
| `sequoia` | Sequoia | macOS Sequoia style | `38-sequoia.css` |
| `liquid` | Liquid Glass | Refractive glass style, as in macOS Tahoe and later | `40-liquid.css` |

---

## Default layout by operating system

A visitor who has not chosen a layout gets the default below. A saved choice always wins. The second value is the modern layout used when the header toggle leaves a Retro layout.

| Operating system | Default layout | Modern variant |
|---|---|---|
| Windows 11 | Mica | Mica |
| Windows 10, 8 / 8.1 | Flat | Flat |
| Windows 7, Vista | Aero | Aero |
| Windows XP | Luna | Modern |
| Windows 2000, 9x | Retro | Modern |
| macOS 26 Tahoe and macOS 27 Golden Gate | Liquid Glass | Liquid Glass |
| macOS 11–15 (Big Sur through Sequoia) | Sequoia | Sequoia |
| macOS 10.10–10.15 (Yosemite through Catalina) | Modern Aqua | Modern Aqua |
| macOS 10.4–10.9 | Mid Aqua | Mid Aqua |
| macOS 10.0–10.3 | Old Aqua | Modern |
| iOS, iPadOS | Sequoia | Sequoia |
| Android | Material | Material |
| Linux | Modern | Modern |
| Anything else | Modern | Modern |

### How the operating system is detected

- **Windows:** the browser's user agent gives the NT version. Windows 11 and 10 both report `NT 10.0`, so Chromium's Client Hints are used to tell them apart (`platformVersion` 13 or later means Windows 11). Firefox and Safari do not send Client Hints, so Windows 11 is treated as Windows 10 there.
- **macOS:** Safari and Chromium freeze the user agent at `Mac OS X 10_15_7`, which is the same string for every modern Mac. That value is therefore treated as Sequoia. Chromium-based browsers report the real version through Client Hints, so a Mac running Catalina (10.15) gets Modern Aqua there. Safari cannot report the real version, so Catalina users on Safari get Sequoia.
- **Linux:** a web page cannot tell KDE from GNOME or any other desktop, so every Linux system gets Modern.
- **iOS and Android:** detected from the user agent.

---

## Settings

Open the gear button at the right end of the header to open the Settings window.

| Item | Description | Saved as |
|---|---|---|
| Layout | Choose a layout. The list is grouped into Retro and Modern. | `miniwin-style` |
| Language | Display language | `miniwin-language` |
| Munhwaeo by default | Uses the Munhwaeo (North Korean standard) Korean text set when Korean is chosen | `miniwin-kp-default` |
| Reduce motion | Turns off animations. The default is on for mobile devices and when the operating system asks for reduced motion. | `miniwin-reduce-motion` |

The **Retro / Modern** toggle in the header moves between the two families. When it returns to Retro, it goes back to the last Retro layout you used.

---

## Saved values

All values are stored in the browser's `localStorage`. Nothing is sent to a server.

| Key | Value | Meaning |
|---|---|---|
| `miniwin-style` | Layout key | The current layout |
| `miniwin-retro-flavour` | `retro`, `luna`, `aqua`, `platinum-*` | The last Retro layout used |
| `miniwin-modern-variant` | A Modern layout key | The last modern layout used |
| `miniwin-oldretro` | `1` | OldRetro is in use |
| `miniwin-language` | Language code | Display language |
| `miniwin-kp-default` | `1`, `0` | Munhwaeo is on |
| `miniwin-reduce-motion` | `1`, `0` | Reduce motion. If absent, the default applies |

---

## Languages

Each language has one file in `i18n/`. Only the chosen language is loaded when it is needed. A missing key falls back to the chosen language, and then to English.

| Code | Language | Code | Language |
|---|---|---|---|
| `ko` | 한국어 (Korean) | `it` | Italiano |
| `en` | English | `ru` | Русский (Russian) |
| `es` | Español | `vi` | Tiếng Việt |
| `zh-CN` | 中文（简体） (Simplified Chinese) | `id` | Bahasa Indonesia |
| `zh-TW` | 中文（繁體） (Traditional Chinese) | `pl` | Polski |
| `ja` | 日本語 (Japanese) | `tr` | Türkçe |
| `fr` | Français | `nl` | Nederlands |
| `de` | Deutsch | `sv` | Svenska |
| `pt-BR` | Português (Brasil) | `uk` | Українська (Ukrainian) |
| `ar` | العربية (Arabic) | `hi` | हिन्दी (Hindi) |

Korean also has a Munhwaeo text set (`ko-kp`), which is turned on in Settings.

---

## External resources

| Resource | Source | Used for |
|---|---|---|
| Silkscreen | Google Fonts | Platinum title font (stands in for Chicago) |
| Roboto | Google Fonts | Material font |
| Galmuri | jsDelivr | Bitmap font for the Retro family |
| Pretendard | jsDelivr | Font for Aqua and the other modern layouts |

If a font cannot be loaded, the page uses a system font instead. The content can still be read without the fonts.

---

## Browser support and limits

- **Refraction:** the glass effect in Liquid Glass and Modern Glass uses an SVG displacement filter. It looks best in Chromium-based browsers. Other browsers show a blur instead.
- **OS detection:** the limits described above apply. In particular, Safari cannot report the macOS version.
- **System fonts:** Chicago, Geneva, Helvetica Neue and Lucida Grande cannot be shipped on the web. They are used only when they are installed on the device. Otherwise a fallback font is used.
- **Material:** this layout reproduces the Material 3 colours, shapes and type scale with CSS. It does not use the `@material/web` component library.
- **BIOS-style picker:** the OldRetro picker does not list the Platinum layouts. Choose those in **Settings → Layout**.

---

## Adding a layout

To add a layout, replace `NEWKEY` below with your key.

1. **`js/theme.js`**
   - Add `NEWKEY` to the `normalise` list.
   - In `apply`, add a flag for `NEWKEY` and add `['NEWKEY-mode', flag]` to the class list.
   - Make sure the `modern` flag still includes your layout if it belongs to the modern family.
   - Add it to `variant` and to the label map in `syncLabels`, so the header label changes.
   - Add it to `DEFAULTS` if an operating system should use it by default.
2. **`js/oldretro.js`**
   - Add an `<option value="NEWKEY">` to the Layout list (`<optgroup>`).
   - Make `currentLayout` return `NEWKEY` when `NEWKEY-mode` is set.
   - To add it to the BIOS-style picker, follow the same pattern: button, highlight, key order, click handling and apply step.
3. **`css/NEWKEY.css`**: create the file and add `@import` for it at the end of `css/main.css`, so it wins over earlier theme rules. Write selectors that are specific enough, for example `html body.modern-mode.NEWKEY-mode`.
4. **Settings list entries**: follow `css/42-select-menus.css` and define how `button.th-NEWKEY` looks at rest and on hover.

---

## License

This repository does not have a LICENSE file yet. When a license is chosen, add a `LICENSE` file at the root and update this section.
