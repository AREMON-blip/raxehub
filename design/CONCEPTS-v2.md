# RaxeHub v2 — 3 konsep (elevation dark)

Skill Gate: unslop, modern-web-guidance, superpowers:brainstorming, figcraft-design-authoring, antislop, antislop-ui, impeccable

antislop active: during (global preference).

Task: `TSK-20261122-203930`. Dark-only. Katalog: **KROMA, Tabungku, GPS Tracker** — semua Rilis. AVS tidak ada. DESIGN.md ditahan sampai Raxe pilih.

Native: `D:/default project/raxehub/design/RaxeHub-v2-Concepts.figcraft`

Mark: `design/assets/raxe-authentic-v2-nocore.svg` (cyan/purple di mark saja, bukan chrome).

Motion board: `MOTION.png`. Easing `cubic-bezier(0.22, 1, 0.36, 1)`. Hover 160ms rise 4–8px + surface +1. Press 120ms scale 0.97–0.98. View Transition: icon share-element ke `/app/{slug}`. Scroll-driven: nav hairline opacity. `prefers-reduced-motion`: color only. No loop, no glow, no layout-property animation.

MWG: `:root { color-scheme: dark; }` + `<meta name="color-scheme" content="dark">`.

## Arah (beda struktur)

| | A Graphite Shelf | B Ink Crate | C Warm Manifest |
|---|---|---|---|
| Palet | Graphite `#141415` / `#19191B` / `#232325` | Ink `#0B0D14` / `#11141C` / `#1A1E28` | Warm `#161513` / `#1C1A18` / `#262421` |
| Hero | Mark kiri + featured KROMA lifted | Sidebar crate + rak numbered | Kolom kiri mark, wells numbered |
| Kartu | Featured + 2 compact | Full-bleed rows, spine steel | Recessed wells, brass index |
| Accent chrome | Off-white tombol `#EDEDED` | Steel `#8BA3C7` spine | Brass `#C4A574` index |
| 360 | `A-360.png` | `B-360.png` | `C-360.png` |
| 1080 | `A-1080.png` | `B-1080.png` | `C-1080.png` |

Kontras terukur (relative luminance):

- G `#EDEDED` / `#141415` 15.73 AAA; sec 7.16 AAA; muted/card 6.27 AA; onbtn 15.31 AAA
- I `#EEF0F5` / `#0B0D14` 17.02 AAA; sec 8.25 AAA; muted/card 5.98 AA; steel 7.54 AAA
- W `#EFE9DE` / `#161513` 15.10 AAA; sec 7.30 AAA; muted/card 5.76 AA; brass 7.81 AAA

Tap target tombol 140×48. Focus ring 2px text on offset 3.

v1 `RaxeHub-v1-Concepts.figcraft` diarsip. Jangan pakai palet cyan `#22D3EE` / purple `#A78BFA` di chrome.
