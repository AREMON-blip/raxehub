---
version: "1.3"
name: RaxeHub
description: Private workshop. Graphite shelf. Dark only. Full creative landing. Home, APK, Web.
colors:
  bg: "#141415"
  card: "#19191B"
  raised: "#232325"
  hair: "#2A2A2C"
  text: "#EDEDED"
  secondary: "#A1A1A6"
  muted: "#ADADAF"
  primary: "#EDEDED"
  on-primary: "#171717"
  mark-stem-a: "#00D2FF"
  mark-stem-b: "#0077FE"
  mark-stem-c: "#0044B8"
  mark-bowl-a: "#5DFBFF"
  mark-bowl-b: "#00E5FF"
  mark-bowl-c: "#0094D4"
  mark-leg-a: "#E879F9"
  mark-leg-b: "#A855F7"
  mark-leg-c: "#6B21A8"
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h1-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.5rem
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section-sm: 64px
  section: 96px
  page-pad-sm: 16px
  page-pad: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 48px
  button-primary-hover:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-primary}"
  button-primary-pressed:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 48px
  button-disabled:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 48px
  nav-link:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.secondary}"
  nav-link-current:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
  nav-hair:
    backgroundColor: "{colors.hair}"
  card-rest:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  card-hover:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  chip-stack:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
  badge-web:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
  badge-rilis:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
  app-icon:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    height: 64px
---

## Overview

RaxeHub = etalase pribadi. Bukan toko. Arah **Graphite Shelf** v1.3. Dark only. Revisi spacing + hierarchy atas v1.2.1. Bukan arah baru.

Chrome tetap graphite. Cyan/purple hanya di mark. No glow.

IA: **Home** `/` pintu, **APK** `/apk` rak, **Web** `/web` galeri, **Keluar**. Tanpa kata "My". Tanpa "Library" di nav.

Katalog APK: KROMA, Tabungku, GPS Tracker. Semua Rilis. Tidak ada AVS. Tidak ada coming soon.

Katalog Web seed (PRD section 9, live 2026-11-22): Tahun Baru Countdown, Crypto Blog. Badge **WEB**. Tombol **Buka live** (`live_url`, tab baru) + **Source** (`repo_url`). Source disabled jika repo kosong.

Mark: `design/assets/raxe-authentic-v2-nocore.svg`. Cyan/purple hidup di mark. Chrome UI graphite. Dilarang `#22D3EE` / `#A78BFA` di tombol, kartu, glow.

Native: `design/RaxeHub-v2-Concepts.figcraft`. Shelf preview tetap `design/HOME-360.png`, `design/HOME-1080.png`, `design/APK-360.png`, `design/APK-1080.png`, `design/WEB-360.png`, `design/WEB-1080.png`. Motion board `design/MOTION.png`.

Aset v1.3:

- Ikon APK 512: `design/icons/kroma.png`, `design/icons/tabungku.png`, `design/icons/gps-tracker.png`.
- Preview live: `design/previews/tahun-baru-countdown-360.png`, `design/previews/tahun-baru-countdown-1080.png`, `design/previews/crypto-blog-360.png`, `design/previews/crypto-blog-1080.png`.

Forge integrasi. Artisan tidak sentuh `functions/`, `pages/`, `src/`, `public/`.

`:root { color-scheme: dark; }` plus `<meta name="color-scheme" content="dark">`.

## Colors

- **bg `#141415`:** kanvas. 15.73:1 vs text, AAA.
- **card `#19191B`:** rest. 15.00:1 vs text, AAA.
- **raised `#232325`:** hover / featured / press.
- **hair `#2A2A2C`:** garis 1px. Bukan teks. 1.29:1 vs bg. Nav hairline opacity 0 to 1 setelah scroll 48px.
- **text `#EDEDED`:** body.
- **secondary `#A1A1A6`:** nav idle, tagline. 7.16:1 vs bg, AAA. 6.82:1 vs card, AA. Jangan taruh secondary di atas card kalau butuh AAA. Di kartu, pakai text atau muted.
- **muted `#ADADAF`:** meta, chip, footer, Source disabled. Naik dari `#9A9AA0` (v1.2.1 gagal AAA di card). 2026-11-23: 8.22:1 vs bg, 7.84:1 vs card, 7.00:1 vs raised. AAA di tiga permukaan.
- **primary `#EDEDED`:** tombol utama. **on-primary `#171717`:** 15.31:1, AAA.
- Mark grads: stem `#00D2FF` `#0077FE` `#0044B8`, bowl `#5DFBFF` `#00E5FF` `#0094D4`, leg `#E879F9` `#A855F7` `#6B21A8`. Hanya di SVG mark.

## Typography

Plus Jakarta Sans display/body. JetBrains Mono meta, chip, badge, countdown thumb.

Skala 8px. Body 16/1.55. **H1 Home 40 (360) / 56 (1080)**, tracking `-0.03em`, weight 500. H2 Tentang 28/32. Label 12, tracking `0.08em`, uppercase. Chip 11.

Measure desc kartu: min 328px di 360. Di bawah itu KROMA PRD 9.5 pecah 4 baris. Clamp 3 baris, jangan potong kalimat di spec.

## Spacing (v1.3)

Satu tangga. Jangan campur 12, 18, 20, 28 di luar tangga.

| Token | px | Pakai |
|---|---|---|
| xs | 4 | icon-ke-teks optical, focus offset sisa |
| sm | 8 | label ke judul, chip gap, stack chip |
| md | 16 | dalam kartu, gap tile 360, page pad 360 |
| lg | 24 | gap tile 1080, form gap, section dalam |
| xl | 32 | page pad 1080, hero type ke CTA |
| section-sm | 64 | antar section di 360 |
| section | 96 | antar section di >= 1024 |

Dalam kartu, urutan tetap: icon, sm, nama, xs, tagline, sm, desc, md, baris tombol. Jangan desc nempel tombol. Jangan tagline nempel desc tanpa sm.

Page pad 16 di < 1024, 32 di >= 1024. `--section` CSS ikut: 64 lalu 96. Spec v1.2.1 yang nulis section 96 saja salah di mobile.

## Layout

Grid 8px. Nav 56. Tap 48. Input min 44.

Break: 360 (A21s), 720 (form 2 kolom), 1024 (nav desktop + section 96).

**360 nav:** empat tab sama lebar (Home, APK, Web, Keluar). Wordmark tidak di nav. Hidup di hero. Hit 48x56.

**1080 nav:** wordmark RaxeHub + Home + APK + Web + Keluar. Current = text + underline 2px.

Home `/`:

1. Hero min 100vh: mark 96 (360) / 128 (1080), wordmark, tagline, CTA **Masuk library** ke `/apk`. Jarak mark ke wordmark xl. Wordmark ke tagline md. Tagline ke CTA xl.
2. Section **Tentang** (F12). Pad atas section-sm / section.
3. Tiga tile rilis. Gap md / lg. Deskripsi max 3 baris (PRD 9.5).

APK `/apk`: featured KROMA raised, pad lg. Compact gap md. CTA satu baris, tinggi 48, gap sm.

Web `/web`: grid 1 kolom < 680, 2 kolom >= 680. Thumbnail 16:9, radius md, object-fit cover. Jangan crop judul live. Desc max 3 baris. Buka live + Source sejajar, gap sm.

Detail `/app/{slug}`: Forge. View Transition share icon. Icon 96, radius lg.

## Admin 360

Audit 2026-11-23, live `https://raxehub.pages.dev/admin`, viewport 360x800, deviceScaleFactor 2.

Form sendiri tidak overflow. `scrollWidth` = `clientWidth` = 360. Body `#141415`. Form 1 kolom. Tidak ada panel putih setengah layar di DOM RaxeHub.

Panel putih ada di **host Clerk** setelah redirect `/admin` tanpa sesi. `certain-filly-1741.clerk.accounts.dev/sign-in`: `scrollWidth` 980 pada viewport 360, `color-scheme` host terang, background transparan. Itu widget pihak ketiga, bukan `.form-grid`.

Forge, jangan patch `public/` dari spec ini tanpa tiket. Kalau dikerjakan:

- Jangan `100vw` di nav, form, atau Clerk mount. Pakai `100%` + `overflow-x: clip` di `html`.
- `input, select, textarea { max-width: 100%; min-width: 0; }`. File input ikut.
- Mount Clerk di dalam `.wrap`. Appearance dark: `colorBackground #141415`, `colorInputBackground #19191B`, `colorText #EDEDED`, `colorPrimary #EDEDED`. Jangan biarkan iframe Clerk lebar 980 lolos ke luar wrap.
- 360: form tetap 1 kolom. 2 kolom baru `min-width: 720px`.
- Label ADMIN uppercase tracking 0.08em, lalu h1, lalu lead, lalu form. Jarak label-h1 sm, h1-lead md, lead-form lg.

## Tentang (F12)

Persona **Raxe Workshop**. Generic. Mark + brand boleh.

Copy lock (jangan ganti tanpa Raxe):

- Label: `Tentang`
- Judul: `Raxe Workshop`
- Body: `Alias Raxe. Semua APK dan web di rak ini dirakit sendiri, dilepas buat teman-teman yang butuh. Kodenya masih berantakan di sana-sini, tapi semuanya jalan.`

**Dilarang keras:** nama asli, sekolah, NISN, alamat, kota, kontak, social pribadi, foto diri.

## Elevation & Depth

Gelap = step permukaan + hairline + inset `0 1px 0 rgba(255,255,255,0.12)`. Bukan drop-shadow glow.

Rest = card. Hover = raised + naik 4px, 160ms. Press = scale 0.98, 120ms. Easing `cubic-bezier(0.22, 1, 0.36, 1)`.

Kartu rilis (pointer): perspective `800px`, rotateX/Y max `4deg`. Hairline tetap. Tidak ada glow.

Hanya color, background, border, opacity, transform. Dilarang `transition: all`.

## Motion (F11) — FULL CREATIVE

Landing **boleh** library. Chrome tetap quiet. Tidak glow.

### Stack

- **Lenis** 1.3.x. `lerp: 0.1`. Import `lenis/dist/lenis.css`. `respectReducedMotion` default **true**. Jangan set `false`.
- **GSAP + ScrollTrigger.** `gsap.registerPlugin(ScrollTrigger)` dulu.
- Wire native-scroll proxy:
  - `lenis.on('scroll', ScrollTrigger.update)`
  - `gsap.ticker.add((time) => lenis.raf(time * 1000))`
  - `gsap.ticker.lagSmoothing(0)`
- Nested scroll (modal): `prevent: (node) => node.closest('.modal')` atau `allowNestedScroll: true`.
- `ScrollTrigger.refresh()` setelah font/image/layout. Create trigger top-to-bottom.
- Jangan `markers: true` di production.

### Beat

- **Mark signature (Home, once):** opacity 0 ke 1, translateY 24 ke 0, rotateX 8deg ke 0, 900ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, `forwards`. Stem / bowl / leg stagger 80ms jika group SVG ada. **No loop. No glow pulse.**
- **Parallax:** mark `yPercent` ~12 vs type 0. Plate belakang `yPercent` ~20. Scrub true.
- **Tile + Tentang reveal:** opacity + translateY 24 ke 0, 640ms, stagger 80ms, `start: "top 85%"`.
- **Nav hairline:** opacity 0 di hero top, 1 setelah 48px scroll.
- **Magnetic cursor (pointer only):** CTA + tile, max offset 8px, lerp 0.2. Touch: off.
- **3D tilt (pointer only):** max 4deg. Touch: off.
- **View Transition:** icon share-element ke `/app/{slug}`.

### Reduced motion

`prefers-reduced-motion: reduce` = **color / opacity only**.

Lenis hormati default. Kill transform, magnetic, tilt, parallax, rotateX. Skip Lenis smooth. Mark: opacity only, 200ms.

## Shapes

Keycap/tombol 8. Kartu 12. Featured + app icon 16. Chip 6. Nested inner = outer minus pad, min 4. Focus ring 2px text, offset 3. Dilarang `outline: none` tanpa ring.

## Icons

Sumber asli. Jangan gambar ulang.

| Slug | Sumber | Out |
|---|---|---|
| kroma | `D:/default project/kroma/assets/ic_launcher-playstore.png` | `design/icons/kroma.png` |
| tabungku | `D:/default project/tabungku/assets/design-v4/icon-dark.png` | `design/icons/tabungku.png` |
| gps-tracker | `D:/default project/gps-tracker/design-preview/mist-assets/ic_launcher.png` | `design/icons/gps-tracker.png` |

Kartu chrome: kanvas 512, fill `#19191B`, radius 96 (16px token pada tampilan 64px). Artwork di-inset 48px, resize LANCZOS, clip radius dalam. Alpha luar ikut radius. Hairline `#2A2A2C` 2px. Tampilan UI: 64px kartu, 96px detail. `alt` = nama app.

## Previews

Above-fold, bukan full page. 2026-11-23.

| File | px | Bytes |
|---|---|---|
| `design/previews/tahun-baru-countdown-360.png` | 360x800 | 39342 |
| `design/previews/tahun-baru-countdown-1080.png` | 1080x800 | 61723 |
| `design/previews/crypto-blog-360.png` | 360x800 | 39984 |
| `design/previews/crypto-blog-1080.png` | 1080x800 | 57221 |

Live: `https://tahun-baru-countdown-eosin.vercel.app/` dan `https://crypto-blog-ten.vercel.app/beranda`. Thumbnail Web pakai file ini, `object-fit: cover`, jangan invent mockup.

## Components

**Nav.** 56. 360: 4 tab equal. 1080: wordmark + 3 tab + Keluar. Current underline 2px. Idle secondary. Keluar selalu secondary.

**Home.** Hero full-viewport. Tentang. Tiga tile. Satu irama section, bukan tiga jarak beda.

**APK.** Featured KROMA raised. Tabungku + GPS compact. Semua Rilis. Icon dari `design/icons/`.

**Web.** Thumb dari `design/previews/`. Chip stack muted. Buka live primary. Source secondary. Disabled + muted jika `repo_url` kosong. Jangan invent repo.

**Button primary.** Off-white, ink text, tinggi 48, highlight atas 18%.

**Button secondary.** raised + hairline.

**Button disabled.** card + hair + muted.

**Card.** Rest card, hover raised. Isi: icon/thumb, nama, tagline, deskripsi max 3 baris, badge.

**Chip.** card + hair, JetBrains 11, muted.

**Badge.** Rilis atau WEB. Muted mono. Bukan cyan.

**Footer APK.** Sideload 2 baris di 360.

**Footer Web.** Live tab baru. Source hanya jika repo ada.

**Mark.** Path autentik. Jangan gambar ulang.

## Copy kartu (PRD 9.5 LOCK)

Pakai persis. Jangan pendekkan ke F10. Max 3 baris di kartu, measure >= 328px di 360. Kalau tidak muat, kartu melebar, jangan edit kalimat.

APK:

- KROMA — tagline `Pemutar musik lokal, tanpa akun`. Desc `Pemutar musik buat berkas audio lokal di HP. Susun antrian sendiri, pasang sleep timer, putar offline. Gak ada akun, gak ada iklan, gak ngumpulin data.`
- Tabungku — tagline `Tabungan dengan tujuan`. Desc `Satu tujuan, satu tabungan. Bikin target, catat setoran, sisa target kelihatan langsung di layar utama. Semua data disimpan di HP, gak ada cloud.`
- GPS Tracker — tagline `Catat jejak perjalanan HP`. Desc `Lacak posisi HP otomatis: rute harian, jarak tempuh, riwayat bisa diputar ulang. Data 100% lokal, tanpa server, tanpa orang lain yang bisa lihat.`

Web:

- Tahun Baru Countdown — tagline `Hitung mundur tahun baru`. Desc `Angka live tersinkron lewat Firebase — semua yang buka lihat hitungan yang sama persis. Dipakai buat countdown bareng grup.` Stack Next.js, Vercel, Firebase RDB. live `https://tahun-baru-countdown-eosin.vercel.app/`
- Crypto Blog — tagline `Catatan tulisan crypto`. Desc `Kumpulan analisis dan catatan teknis crypto yang gw pelajari. Bukan sinyal trading, bukan ajakan beli apa pun.` Stack Next.js 16, Vercel. live `https://crypto-blog-ten.vercel.app/beranda`

## Do's and Don'ts

Do: graphite chrome, mark berwarna, 3 APK rilis, 2 web seed, Home / APK / Web, tangga spacing, muted `#ADADAF`, ikon dari sumber asli, thumb dari preview live, Lenis+GSAP di landing, Tentang generic, reduced-motion color-only.

Don't: kata My, Library di nav, cyan/purple chrome, glow, AVS, coming soon, coming-soon card, mockup teaser, `transition: all`, bounce loop, light mode, invent repo_url, data asli Raxe di Tentang, `respectReducedMotion: false`, sentuh `functions/` `pages/` `src/` `public/`, gambar ulang ikon, pendekkan PRD 9.5, `100vw` di admin, klaim panel putih form RaxeHub (itu host Clerk).
