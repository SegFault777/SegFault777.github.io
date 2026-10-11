/* Layout guide (the "?" next to the Layout setting). A window with a button for every layout. A click shows that layout's
   description in five labelled lines: the motif, the features (in prose), the devices it applies to ("-" if none), the
   pros and the cons. Korean for ko and ko-kp, English for every other language. The window uses the layout's own .panel,
   .panel-head and .btn classes, so it takes the look of the current layout. */
(() => {
  const TEXT = {
    ko: {title:'레이아웃 설명', motif:'모티브', feature:'특징', device:'적용 기기', pro:'장점', con:'단점', close:'닫기', hint:'레이아웃을 누르면 설명이 나옵니다.'},
    en: {title:'Layout guide', motif:'Motif', feature:'Features', device:'Devices', pro:'Pros', con:'Cons', close:'Close', hint:'Press a layout to read its description.'}
  };
  const L = {
 "retro": {
  "n": "Retro",
  "ko": {
   "m": "윈도우 95/98 시절의 회색 입체 UI.",
   "f": "회색 베벨과 파란 제목 막대를 쓰는 클래식 Windows 9x 스타일입니다. 메뉴와 버튼이 각진 입체 모양이라 옛 PC 느낌이 가장 강합니다.",
   "d": "커널이 Win9X거나 NT 5.0 이하일 때. (Win 95 – Win ME / Win 2000 / Win 2000 Server)",
   "p": "가볍고 빠르며 그래픽 요구가 낮습니다.",
   "c": "대비가 강하고 장식이 적어 현대 화면에서는 답답하게 느껴질 수 있습니다."
  },
  "en": {
   "m": "Windows 95/98 era UI.",
   "f": "Grey bevels and a blue title bar in the classic Windows 9x style. Square, bevelled menus and buttons give the strongest old-PC feel.",
   "d": "When the kernel is Win9X or NT 5.0 or lower. (Win 95 – Win ME / Win 2000 / Win 2000 Server)",
   "p": "Light, fast, and undemanding on graphics.",
   "c": "High contrast and sparse decoration can feel cramped on modern screens."
  }
 },
 "oldretro": {
  "n": "OldRetro",
  "ko": {
   "m": "DOS 텍스트 모드 셸과 BIOS 설정 화면.",
   "f": "화면 전체를 텍스트 기반으로 그리고, 레이아웃을 BIOS 스타일 목록에서 고릅니다. 설정 창 대신 BIOS 화면이 열리며, 끄면 이전 레이아웃으로 돌아갑니다.",
   "d": "특수한 경우가 아니라면 기본값이 아님.",
   "p": "DOS와 BIOS의 감성을 그대로 살리고 키보드 조작이 빠릅니다.",
   "c": "마우스 중심 사용에는 불편하고, 텍스트 위주 화면이 처음에는 낯섭니다."
  },
  "en": {
   "m": "DOS text-mode shell and BIOS setup screen.",
   "f": "The whole screen is drawn as text, and layouts are chosen from a BIOS-style list. Setup opens as a BIOS screen instead of a settings window; turning the mode off returns to the previous layout.",
   "d": "Not the default unless in a special case.",
   "p": "Keeps the DOS and BIOS feel and is quick to use from the keyboard.",
   "c": "Awkward for mouse-first use, and the text-heavy screens feel unfamiliar at first."
  }
 },
 "luna": {
  "n": "Luna",
  "ko": {
   "m": "Windows XP의 파란 Luna 테마.",
   "f": "파란 제목 막대와 둥근 버튼, 밝은 면과 입체 그라데이션 테두리로 XP 시절의 창 모양을 재현합니다.",
   "d": "커널이 NT 5.1이나 5.2일 때. (Win XP / Win Server 2003)",
   "p": "익숙하고 화려한 파란 테마라 시각적 개성이 뚜렷합니다.",
   "c": "그라데이션이 많아 최신 기기에서는 옛 느낌이 강하고 무겁게 보일 수 있습니다."
  },
  "en": {
   "m": "The blue Luna theme of Windows XP.",
   "f": "Blue title bars, rounded buttons, a light face and graded bevelled edges recreate the window look of the XP era.",
   "d": "When the kernel is NT 5.1 or 5.2. (Win XP / Win Server 2003)",
   "p": "Familiar and colourful, with a strong blue identity.",
   "c": "The many gradients can look dated and heavy on modern hardware."
  }
 },
 "aqua": {
  "n": "Old Aqua",
  "ko": {
   "m": "Mac OS X 10.3 (Panther).",
   "f": "줄무늬 제목 막대, 젤리 버튼, 광택 있는 신호등 창 조절 버튼을 쓰고, 파란 바탕과 입체 메뉴 막대로 Panther 시절의 Aqua 화면을 재현합니다.",
   "d": "클라이언트 기기의 OS가 Mac OS X 10.0 (Cheetah) – Mac OS X 10.3 (Panther)일 때.",
   "p": "입체감과 광택이 강해 Aqua 시절의 개성이 살아 있습니다.",
   "c": "광택과 그림자가 많아 현대 화면에서는 장식이 과하게 보일 수 있습니다."
  },
  "en": {
   "m": "Mac OS X 10.3 (Panther).",
   "f": "Striped title bars, jelly buttons and glossy traffic-light window controls on a blue desktop with a raised menu bar recreate the Panther-era Aqua interface.",
   "d": "When the client OS is Mac OS X 10.0 (Cheetah) – Mac OS X 10.3 (Panther).",
   "p": "Strong depth and gloss capture the Aqua character.",
   "c": "Heavy gloss and shadows can look excessive on modern screens."
  }
 },
 "system6": {
  "n": "System 6",
  "ko": {
   "m": "Apple System 6 (1984–1991) 흑백 UI.",
   "f": "흑백 바둑판 바탕, 줄무늬 창, 반전되는 메뉴 선택, 1비트 창 테두리와 닫기 상자로 초기 Macintosh 화면을 재현합니다.",
   "d": "클라이언트 기기의 OS가 System 1 – Mac OS 7일 때.",
   "p": "색이 적고 단순해서 눈이 편하고 시대 감성이 분명합니다.",
   "c": "색과 장식이 없어 정보를 구분하기 어렵고 현대 콘텐츠와 잘 맞지 않습니다."
  },
  "en": {
   "m": "Apple System 6 (1984–1991) black-and-white UI.",
   "f": "A black-and-white checkerboard desktop, striped windows, inverted menu selection and 1-bit window edges with a close box recreate the early Macintosh screen.",
   "d": "When the client OS is System 1 – Mac OS 7.",
   "p": "Simple, with few colours that are easy on the eyes and a clear period feel.",
   "c": "Without colour or decoration, information is harder to tell apart, and it suits modern content poorly."
  }
 },
 "nextstep": {
  "n": "NeXTSTEP",
  "ko": {
   "m": "NeXT NeXTSTEP 3.x 색 인터페이스.",
   "f": "#555577 바탕, 검은 메뉴 제목, 입체 버튼과 오른쪽 도크 열을 쓰며, 선택한 행은 흰색으로 반전됩니다.",
   "d": "클라이언트 기기의 OS가 NeXTSTEP일 때.",
   "p": "차분한 색과 명확한 입체 버튼으로 작업 화면이 안정적입니다.",
   "c": "밝기가 낮아 장시간 읽기에는 대비가 부족하고, 도크 열은 장식입니다."
  },
  "en": {
   "m": "NeXT NeXTSTEP 3.x colour interface.",
   "f": "A #555577 desktop, black menu titles, bevelled buttons, a dock column on the right, and selected rows that invert to white.",
   "d": "When the client OS is NeXTSTEP.",
   "p": "Calm colours and clear bevelled buttons keep the workspace steady.",
   "c": "Low brightness gives weak contrast for long reading, and the dock column is decorative only."
  }
 },
 "os2": {
  "n": "OS/2",
  "ko": {
   "m": "IBM OS/2 Warp 3 (Presentation Manager).",
   "f": "#CACACA 면, 파란 제목 띠, 위쪽 시스템 바와 점무늬 선택, 입체 테두리로 Warp 3 시절의 화면을 재현합니다.",
   "d": "클라이언트 기기의 OS가 OS/2 Warp 1 – OS/2 Warp 4일 때.",
   "p": "정돈된 면 구성과 선명한 제목 띠로 창을 쉽게 구분할 수 있습니다.",
   "c": "점무늬 바탕과 입체 테두리가 많아 다소 번잡하게 보일 수 있습니다."
  },
  "en": {
   "m": "IBM OS/2 Warp 3 (Presentation Manager).",
   "f": "A #CACACA face, blue title bands, a top system bar and dithered selection, with bevelled edges, recreate the Warp 3 screen.",
   "d": "When the client OS is OS/2 Warp 1 – OS/2 Warp 4.",
   "p": "A neat face layout and clear title bands make windows easy to tell apart.",
   "c": "The dithered background and bevelled edges can look busy."
  }
 },
 "beos": {
  "n": "BeOS",
  "ko": {
   "m": "Be Inc. BeOS R5.",
   "f": "#31659C 바탕에 탭형 제목, 파란 선택 색 #0000B5, 데스크바와 입체 테두리를 씁니다.",
   "d": "클라이언트 기기의 OS가 BeOS DR1 – R5일 때.",
   "p": "탭형 제목과 파란 바탕이 개성 있고, 데스크바로 실행 중인 창을 쉽게 찾습니다.",
   "c": "흰색과 회색이 많아 밋밋하게 느껴질 수 있고 현대 앱 아이콘과 잘 맞지 않습니다."
  },
  "en": {
   "m": "Be Inc. BeOS R5.",
   "f": "Tab-style titles on a #31659C desktop, the blue selection colour #0000B5, a deskbar and bevelled edges.",
   "d": "When the client OS is BeOS DR1 – R5.",
   "p": "Distinctive tab titles and a blue desktop, and the deskbar makes running windows easy to find.",
   "c": "Mostly white and grey, which can feel flat, and it does not match modern app icons."
  }
 },
 "platinum-lavender": {
  "n": "Platinum Lavender",
  "ko": {
   "m": "Mac OS 9 Platinum, 라벤더 강조색.",
   "f": "줄무늬 Copland 창 테두리와 라벤더 강조색, 직각 모서리를 씁니다. Platinum 계열 중 가장 차분합니다.",
   "d": "클라이언트 기기의 OS가 Mac OS 8, Mac OS 9일 때.",
   "p": "차분한 색과 깔끔한 직각 창으로 작업 화면이 편합니다.",
   "c": "강조색이 연해서 버튼과 선택이 잘 안 보일 수 있습니다."
  },
  "en": {
   "m": "Mac OS 9 Platinum with a lavender accent.",
   "f": "Striped Copland window frames with a lavender accent and square corners; the calmest of the Platinum colours.",
   "d": "When the client OS is Mac OS 8 or Mac OS 9.",
   "p": "Calm colours and clean square windows make work comfortable.",
   "c": "The accent is pale, so buttons and selections can be hard to see."
  }
 },
 "platinum-lime": {
  "n": "Platinum Lime",
  "ko": {
   "m": "Mac OS 9 Platinum, 라임 강조색.",
   "f": "같은 Platinum 구조에 라임색 강조와 Copland 창 테두리를 쓰며, 밝은 녹색 버튼과 선택이 특징입니다.",
   "d": "특수한 경우가 아니라면 기본값이 아님.",
   "p": "밝고 생동감 있어 눈에 잘 띕니다.",
   "c": "녹색 강조가 강해 장시간 사용하면 눈이 피로할 수 있습니다."
  },
  "en": {
   "m": "Mac OS 9 Platinum with a lime accent.",
   "f": "Lime accents and Copland window frames within the same Platinum structure, with bright green buttons and selections.",
   "d": "Not the default unless in a special case.",
   "p": "Bright and lively, so it stands out.",
   "c": "The strong green accent can tire the eyes over long use."
  }
 },
 "platinum-magenta": {
  "n": "Platinum Magenta",
  "ko": {
   "m": "Mac OS 9 Platinum, 마젠타 강조색.",
   "f": "같은 Platinum 구조에 마젠타 강조와 Copland 창 테두리를 쓰며, 자주색 선택과 버튼이 특징입니다.",
   "d": "특수한 경우가 아니라면 기본값이 아님.",
   "p": "개성이 뚜렷하고 강조가 분명합니다.",
   "c": "자주색 강조가 많아 화면이 산만하게 보일 수 있습니다."
  },
  "en": {
   "m": "Mac OS 9 Platinum with a magenta accent.",
   "f": "Magenta accents and Copland window frames within the same Platinum structure, with purple selections and buttons.",
   "d": "Not the default unless in a special case.",
   "p": "Distinct character with clear emphasis.",
   "c": "Lots of purple accent can make the screen feel busy."
  }
 },
 "modern": {
  "n": "Modern",
  "ko": {
   "m": "기본 현대 레이아웃(평평한 디자인).",
   "f": "깔끔한 카드와 넉넉한 여백을 쓰는 기본형입니다. 운영체제를 알 수 없을 때 쓰는 기본값입니다.",
   "d": "-",
   "p": "가볍고 모든 기기에서 빠르게 동작하며 읽기 편합니다.",
   "c": "개성이 적어 다른 테마에 비해 밋밋하게 느껴질 수 있습니다."
  },
  "en": {
   "m": "The default modern layout (flat design).",
   "f": "Clean cards and generous spacing; the fallback when the operating system is not recognised.",
   "d": "-",
   "p": "Light and fast on every device, and easy to read.",
   "c": "Little distinctive character, so it can feel plain next to the other themes."
  }
 },
 "modern-aqua": {
  "n": "Mid Aqua",
  "ko": {
   "m": "OS X 10.9 (Mavericks).",
   "f": "광택 있는 Aqua 면, 젤리 신호등 버튼, Mavericks 풍 바탕을 쓰며 창 제목 줄에 입체 버튼이 있습니다.",
   "d": "클라이언트 기기의 OS가 Mac OS X 10.4 (Tiger) – OS X 10.9 (Mavericks)일 때.",
   "p": "Aqua의 입체감과 광택이 살아 있어 시각적으로 풍부합니다.",
   "c": "광택과 그림자가 많아 현대 화면에서는 무겁게 보일 수 있습니다."
  },
  "en": {
   "m": "OS X 10.9 (Mavericks).",
   "f": "Glossy Aqua faces, jelly traffic lights and a Mavericks-style desktop, with raised buttons in the title bars.",
   "d": "When the client OS is Mac OS X 10.4 (Tiger) – OS X 10.9 (Mavericks).",
   "p": "Aqua's depth and gloss come through, making it visually rich.",
   "c": "Gloss and shadows can look heavy on modern screens."
  }
 },
 "modern-aqua-yosemite": {
  "n": "Modern Aqua",
  "ko": {
   "m": "macOS 10.15 (Catalina).",
   "f": "평평하고 반투명한 창과 메뉴 막대, 얇은 시스템 글꼴과 파란 강조를 씁니다. 다크 모드를 지원하고 버전별 지형 배경을 씁니다.",
   "d": "클라이언트 기기의 OS가 OS X 10.10 (Yosemite) – macOS 10.15 (Catalina)일 때.",
   "p": "깔끔하고 현대적이며 다크 모드까지 지원합니다.",
   "c": "반투명 효과 때문에 배경에 따라 대비가 떨어질 수 있습니다."
  },
  "en": {
   "m": "macOS 10.15 (Catalina).",
   "f": "Flat, translucent windows and a menu bar, a thin system face and blue accents, with Dark Mode and a terrain wallpaper per release.",
   "d": "When the client OS is OS X 10.10 (Yosemite) – macOS 10.15 (Catalina).",
   "p": "Clean and modern, with Dark Mode.",
   "c": "Translucency can lower contrast depending on the background."
  }
 },
 "material": {
  "n": "Material",
  "ko": {
   "m": "Google Material 3 디자인.",
   "f": "연보라 바탕, 알약 모양 버튼, 28px 모서리 면과 보라 스위치를 쓰며, 밑줄이 있는 채운 입력칸이 특징입니다.",
   "d": "Android 기기 전부.",
   "p": "둥글고 부드러워 터치 조작이 편합니다.",
   "c": "보라 계열이 강해 다른 테마와 시각적으로 멀게 느껴질 수 있습니다."
  },
  "en": {
   "m": "Google Material 3 design.",
   "f": "A lavender ground, pill-shaped buttons, 28px-cornered surfaces and purple switches, with filled inputs that have an underline.",
   "d": "All Android devices.",
   "p": "Soft and rounded, which makes touch easy.",
   "c": "The strong purple can feel distant from the other themes."
  }
 },
 "plastik": {
  "n": "Plastik",
  "ko": {
   "m": "KDE 3.5 Plastik.",
   "f": "파란 바탕, 회색 입체 창 테두리, 제목 띠의 세로 그라데이션과 밝은 그라데이션 작업 표시줄을 씁니다.",
   "d": "KDE 버전 인식 불가함.",
   "p": "입체감이 있어 창의 가장자리가 분명합니다.",
   "c": "옛 KDE 스타일이라 최신 데스크톱에 비해 장식이 많아 보입니다."
  },
  "en": {
   "m": "KDE 3.5 Plastik.",
   "f": "A blue desktop, bevelled grey window frames, vertical gradients in the title bands and a light gradient taskbar.",
   "d": "KDE version cannot be detected.",
   "p": "The bevels make window edges clear.",
   "c": "As an old KDE style it looks busier than current desktops."
  }
 },
 "modern-glass": {
  "n": "Modern Glass",
  "ko": {
   "m": "유리 질감의 반투명 패널.",
   "f": "굴절 효과가 있는 유리 패널, 흐림과 빛 반사를 쓰며, 마우스 움직임에 반응하는 빛이 특징입니다.",
   "d": "특수한 경우가 아니라면 기본값이 아님.",
   "p": "화려하고 입체적인 느낌을 줍니다.",
   "c": "흐림과 굴절 효과가 많아 성능에 부담이 될 수 있고, 복잡한 배경에서는 글자가 잘 안 보일 수 있습니다."
  },
  "en": {
   "m": "Translucent panels with a glass texture.",
   "f": "Glass panels with a refraction effect, blur and light reflections, and light that responds to the mouse.",
   "d": "Not the default unless in a special case.",
   "p": "Rich and three-dimensional.",
   "c": "Blur and refraction cost performance, and text can be hard to read on busy backgrounds."
  }
 },
 "aero": {
  "n": "Aero",
  "ko": {
   "m": "Windows 7 Aero.",
   "f": "유리 제목 띠와 반투명 창, 부드러운 그림자와 빛을 쓰며, 시작 버튼과 작업 표시줄에도 유리 질감이 들어갑니다.",
   "d": "커널이 NT 6.0, NT 6.1일 때. (Windows Vista / Windows 7 / Windows Server 2008 / Windows Server 2008 R2)",
   "p": "부드럽고 세련된 느낌이 강합니다.",
   "c": "투명 효과가 많아 배경이 복잡하면 글자가 흐려 보일 수 있습니다."
  },
  "en": {
   "m": "Windows 7 Aero.",
   "f": "Glass title bands and translucent windows with soft shadows and light, and glass textures on the Start button and the taskbar.",
   "d": "When the kernel is NT 6.0 or NT 6.1. (Windows Vista / Windows 7 / Windows Server 2008 / Windows Server 2008 R2)",
   "p": "Soft and polished.",
   "c": "Heavy transparency can blur text on busy backgrounds."
  }
 },
 "breeze": {
  "n": "Breeze",
  "ko": {
   "m": "KDE Breeze.",
   "f": "평평한 회색 면과 파란 강조, 둥근 모서리, 얇은 테두리와 단순한 KDE 스타일 버튼을 씁니다.",
   "d": "KDE 버전 인식 불가함.",
   "p": "단정하고 가벼우며 강조색이 명확합니다.",
   "c": "개성이 적어 평범하게 보일 수 있습니다."
  },
  "en": {
   "m": "KDE Breeze.",
   "f": "Flat grey faces with blue accents, rounded corners, thin borders and simple KDE-style buttons.",
   "d": "KDE version cannot be detected.",
   "p": "Neat, light, and with clear accent colours.",
   "c": "Little character, so it can look ordinary."
  }
 },
 "flat": {
  "n": "Flat",
  "ko": {
   "m": "Windows 8/10 평면 디자인.",
   "f": "평평한 색 면과 얇은 선, 강조색 막대와 넉넉한 여백을 쓰며, 그림자 없는 깔끔한 버튼이 특징입니다.",
   "d": "커널 버전이 NT 6.2 – NT 10.0 (Windows 8 – Windows 10 / Windows Server 2016 / 2019 / 2022)",
   "p": "단순하고 깔끔해서 정보를 쉽게 구분할 수 있습니다.",
   "c": "입체감이 적어 버튼이 덜 눈에 띌 수 있습니다."
  },
  "en": {
   "m": "Windows 8/10 flat design.",
   "f": "Flat colour faces and thin lines, accent bars and generous spacing, with clean buttons and no shadows.",
   "d": "When the kernel version is NT 6.2 – NT 10.0 (Windows 8 – Windows 10 / Windows Server 2016 / 2019 / 2022)",
   "p": "Simple and clean, so information is easy to tell apart.",
   "c": "Little depth, so buttons can be less obvious."
  }
 },
 "adwaita": {
  "n": "Adwaita",
  "ko": {
   "m": "GNOME Adwaita.",
   "f": "회색 헤더바, 둥근 버튼, 파란 스위치와 선택을 쓰며, 깔끔한 GNOME 스타일 창입니다.",
   "d": "GNOME.",
   "p": "차분하고 정돈된 느낌이며 읽기 편합니다.",
   "c": "강조가 약해 중요한 요소를 찾기 어려울 때가 있습니다."
  },
  "en": {
   "m": "GNOME Adwaita.",
   "f": "Grey header bars, rounded buttons, blue switches and selections, in a clean GNOME-style window.",
   "d": "GNOME.",
   "p": "Calm, orderly, and easy to read.",
   "c": "Weak emphasis, so key elements can be hard to find."
  }
 },
 "mica": {
  "n": "Mica",
  "ko": {
   "m": "Windows 11 Mica.",
   "f": "은은한 반투명 바탕, 둥근 창 모서리, 얇은 테두리와 파란 강조 색을 씁니다.",
   "d": "커널 버전이 NT 10.0 (Windows 10X / Windows 11 / Windows Server 2025)",
   "p": "차분하고 현대적이며 창이 배경에서 자연스럽게 구분됩니다.",
   "c": "반투명 바탕이 약해서 창이 배경과 비슷하게 보일 수 있습니다."
  },
  "en": {
   "m": "Windows 11 Mica.",
   "f": "A subtle translucent backdrop, rounded window corners, thin borders and blue accent colours.",
   "d": "When the kernel version is NT 10.0 (Windows 10X / Windows 11 / Windows Server 2025)",
   "p": "Calm and modern, and the windows separate naturally.",
   "c": "The translucent backdrop is faint, so windows can look close to the background."
  }
 },
 "oxygen": {
  "n": "Oxygen",
  "ko": {
   "m": "KDE 4 Oxygen.",
   "f": "입체 그라데이션 버튼과 파란 강조, 부드러운 창 테두리와 밝은 회색 면을 씁니다.",
   "d": "KDE 버전 인식 불가함.",
   "p": "입체감이 있어 버튼이 잘 보입니다.",
   "c": "그라데이션이 많아 조금 무겁게 느껴질 수 있습니다."
  },
  "en": {
   "m": "KDE 4 Oxygen.",
   "f": "Bevelled gradient buttons with blue accents, soft window borders and light grey faces.",
   "d": "KDE version cannot be detected.",
   "p": "The bevels make buttons easy to see.",
   "c": "Many gradients can feel a little heavy."
  }
 },
 "sequoia": {
  "n": "Sequoia",
  "ko": {
   "m": "macOS 15 (Sequoia).",
   "f": "밝은 유리 메뉴 막대와 창, 둥근 창 모서리와 부드러운 그림자, 신호등 창 버튼을 씁니다.",
   "d": "클라이언트 기기의 OS가 macOS 11 (Big Sur) – macOS 15 (Sequoia)일 때.",
   "p": "깔끔하고 부드러우며 현대 macOS 느낌이 강합니다.",
   "c": "밝은 바탕에서는 유리 효과가 약하게 보일 수 있습니다."
  },
  "en": {
   "m": "macOS 15 (Sequoia).",
   "f": "A light glass menu bar and windows, rounded corners, soft shadows and traffic-light window buttons.",
   "d": "When the client OS is macOS 11 (Big Sur) – macOS 15 (Sequoia).",
   "p": "Clean, soft, and strongly modern macOS.",
   "c": "On light backgrounds the glass effect can look weak."
  }
 },
 "liquid": {
  "n": "Liquid Glass",
  "ko": {
   "m": "macOS 26 (Tahoe) 이후의 Liquid Glass.",
   "f": "굴절되는 유리 창, 빛 반사와 큰 둥근 모서리를 쓰며, 마우스 움직임에 따라 빛이 움직입니다.",
   "d": "클라이언트 기기의 OS가 macOS 26 (Tahoe), macOS 27 (Golden Gate)일 때.",
   "p": "화려하고 입체적인 현대 macOS 느낌이 강합니다.",
   "c": "효과가 많아 성능에 부담이 될 수 있고, 배경에 따라 대비가 달라집니다."
  },
  "en": {
   "m": "Liquid Glass from macOS 26 (Tahoe) onwards.",
   "f": "Refracting glass windows, light reflections and large rounded corners, with light that moves as the mouse moves.",
   "d": "When the client OS is macOS 26 (Tahoe) or macOS 27 (Golden Gate).",
   "p": "Rich and three-dimensional, with a strong modern macOS feel.",
   "c": "The many effects can cost performance, and contrast changes with the background."
  }
 }
};
  const ORDER = ["retro", "oldretro", "luna", "aqua", "system6", "nextstep", "os2", "beos", "platinum-lavender", "platinum-lime", "platinum-magenta", "modern", "modern-aqua", "modern-aqua-yosemite", "material", "plastik", "modern-glass", "aero", "breeze", "flat", "adwaita", "mica", "oxygen", "sequoia", "liquid"];

  let overlay=null, opener=null, current=null;
  const gx=(key,fb)=>{const d=(window.I18N&&window.I18N[window.miniwinLanguage||''])||{};const v=d[key];return (typeof v==='string'&&v)?v:fb};
  const lang=()=>{const v=(window.miniwinLanguage||document.documentElement.lang||'en').toLowerCase();return /^ko/.test(v)?'ko':'en'};
  const T=()=>TEXT[lang()];
  const stopAll=(e)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};
  function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}

  function build(){
    if(overlay)return;
    overlay=el('div','theme-guide-overlay');
    overlay.hidden=true;
    const panel=el('div','panel theme-guide');
    const head=el('div','panel-head');
    const title=el('span',null,'');
    head.appendChild(title);
    const wc=el('span','wc');
    const closeBtn=el('button','wc-b wc-close');
    closeBtn.type='button';
    closeBtn.setAttribute('aria-label','Close');
    closeBtn.innerHTML='<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5"/></svg>';
    closeBtn.addEventListener('click',close);
    wc.appendChild(closeBtn);
    head.appendChild(wc);
    panel.appendChild(head);
    const body=el('div','theme-guide-body');
    const hint=el('p','theme-guide-hint');
    body.appendChild(hint);
    const grid=el('div','theme-guide-grid');
    ORDER.forEach(key=>{
      const b=el('button','btn theme-guide-pick',L[key].n);
      b.type='button';
      b.dataset.key=key;
      b.addEventListener('click',()=>show(key));
      grid.appendChild(b);
    });
    body.appendChild(grid);
    const detail=el('div','card theme-guide-detail');
    detail.hidden=true;
    body.appendChild(detail);
    panel.appendChild(body);
    overlay.appendChild(panel);
    overlay._refs={title,hint,grid,detail,closeBtn};
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    document.body.appendChild(overlay);
    document.addEventListener('keydown',e=>{if(overlay&&!overlay.hidden)stopAll(e)},true);
    retext();
  }

  function retext(){
    if(!overlay)return;
    const t=T(), r=overlay._refs;
    r.title.textContent=gx('gl_title',t.title);
    r.hint.textContent=gx('gl_hint',t.hint);
    r.closeBtn.setAttribute('aria-label',gx('gl_close',t.close));
    r.closeBtn.title=gx('gl_close',t.close);
    if(current)show(current,true);
  }

  function show(key,silent){
    current=key;
    const r=overlay._refs, t=T(), d=L[key], v=d[lang()];
    r.grid.querySelectorAll('.theme-guide-pick').forEach(b=>{const on=b.dataset.key===key;b.classList.toggle('primary',on);b.setAttribute('aria-pressed',on?'true':'false')});
    r.detail.innerHTML='';
    r.detail.appendChild(el('h3',null,d.n));
    const lk=key.replace(/-/g,'_');
    [['motif','m',v.m],['feature','f',v.f],['device','d',v.d],['pro','p',v.p],['con','c',v.c]].forEach(([k,f,fb])=>{
      const p=el('p',null);
      p.appendChild(el('strong',null,gx('gl_'+k,t[k])+': '));
      p.appendChild(document.createTextNode(gx('gl_'+lk+'_'+f,fb)));
      r.detail.appendChild(p);
    });
    r.detail.hidden=false;
    if(!silent){const b=r.grid.querySelector('[data-key="'+key+'"]');if(b)b.focus({preventScroll:true})}
  }

  function open(btn){
    build();
    opener=btn||null;
    retext();
    overlay.hidden=false;
    if(!current){overlay._refs.detail.hidden=true;}
    const first=overlay._refs.grid.querySelector('.theme-guide-pick');
    (overlay._refs.closeBtn||first).focus({preventScroll:true});
  }
  function close(){
    if(!overlay||overlay.hidden)return;
    overlay.hidden=true;
    if(opener&&opener.focus)opener.focus({preventScroll:true});
  }

  window.miniwinOpenThemeGuide=open;
  window.miniwinCloseThemeGuide=close;
  document.addEventListener('miniwin-language-change',()=>retext());
})();
