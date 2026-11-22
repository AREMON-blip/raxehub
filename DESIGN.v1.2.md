---
version: "1.2"
name: RaxeHub
description: Private workshop. Graphite shelf. Dark only. Full creative landing. Home, APK, Web.
colors:
  bg: "#141415"
  card: "#19191B"
  raised: "#232325"
  hair: "#2A2A2C"
  text: "#EDEDED"
  secondary: "#A1A1A6"
  muted: "#9A9AA0"
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
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 96px
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
---

## Overview

RaxeHub = etalase pribadi. Bukan toko. Arah **Graphite Shelf** v1.2. Dark only.

v1.2 naik motion ke **FULL CREATIVE** di landing (F11), tambah section **Tentang** (F12), type lebih besar + whitespace lebih longgar. Chrome tetap graphite. Cyan/purple hanya di mark.

IA: **Home** `/` pintu, **APK** `/apk` rak, **Web** `/web` galeri, **Keluar**. Tanpa kata "My". Tanpa "Library" di nav.

Katalog APK: KROMA, Tabungku, GPS Tracker. Semua Rilis. Tidak ada AVS. Tidak ada coming soon.

Katalog Web seed (PRD section 9, live 2026-11-22): Tahun Baru Countdown, Crypto Blog. Badge **WEB**. Tombol **Buka live** (`live_url`, tab baru) + **Source** (`repo_url`). Source disabled jika repo kosong.

Mark: `design/assets/raxe-authentic-v2-nocore.svg`. Cyan/purple hidup di mark. Chrome UI graphite. Dilarang `#22D3EE` / `#A78BFA` di tombol, kartu, glow.

Native: `design/RaxeHub-v2-Concepts.figcraft`. Preview v1.2: `design/HOME-360.png`, `design/HOME-1080.png`, `design/MOTION.png`. Sidecar APK/Web v1.1 tetap: `design/WEB-360.png`, `design/WEB-1080.png`, `design/A-360.png`, `design/A-1080.png`.

Forge integrasi aset. Artisan tidak sentuh `functions/`, `pages/`, `src/`.

`:root { color-scheme: dark; }` plus `<meta name="color-scheme" content="dark">`.

## Colors

- **bg `#141415`:** kanvas.
- **card `#19191B`:** rest.
- **raised `#232325`:** hover / featured / press.
- **hair `#2A2A2C`:** garis 1px. Nav hairline opacity 0 to 1 setelah scroll 48px.
- **text `#EDEDED`:** body. 15.73:1 vs bg, AAA.
- **secondary `#A1A1A6`:** nav idle, tagline. 7.16:1 vs bg, AAA.
- **muted `#9A9AA0`:** meta, chip, footer, Source disabled. 6.27:1 vs card, AA.
- **primary `#EDEDED`:** tombol utama. **on-primary `#171717`:** 15.31:1, AAA.
- Mark grads: stem `#00D2FF` `#0077FE` `#0044B8`, bowl `#5DFBFF` `#00E5FF` `#0094D4`, leg `#E879F9` `#A855F7` `#6B21A8`. Hanya di SVG mark.

## Typography

Plus Jakarta Sans display/body. JetBrains Mono meta, chip, badge, countdown thumb.

Skala 8px. Body 16/24. **H1 Home 40 (360) / 56 (1080)**, tracking `-0.03em`, weight 500. H2 Tentang 28/32. Label 12. Chip 11.

Whitespace: hero min 100vh. Section pad 64 (360) / 96 (1080). Kartu gap 16/24. Vibe Linear/Vercel-era dark portfolio, identitas graphite + mark RAXE.

## Layout

Grid 8px. Page pad 16 mobile, 32 desktop. Nav 56. Tap 48.

Break: 360 (A21s), 1080 (laptop).

**360 nav:** empat tab sama lebar (Home, APK, Web, Keluar). Wordmark tidak di nav — hidup di hero. Hit 48x56.

**1080 nav:** wordmark RaxeHub + Home + APK + Web + Keluar. Current = text + underline 2px.

Home `/`:
1. Hero full-viewport: mark autentik + wordmark besar + tagline workshop + CTA **Masuk library** ke `/apk`. Parallax plates graphite di belakang (bukan glow).
2. Section **Tentang** (F12).
3. Scroll-reveal 3 tile rilis (KROMA, Tabungku, GPS Tracker). Deskripsi 2 baris per kartu (F10).

APK `/apk`: featured KROMA lifted + Tabungku + GPS. CTA Buka detail / Unduh APK. Deskripsi 2 baris.

Web `/web`: grid kartu thumbnail + nama + tagline + stack chip + deskripsi 2 baris + Buka live + Source. Badge WEB.

Detail `/app/{slug}`: Forge. View Transition share icon.

## Tentang (F12)

Persona **Raxe Workshop**. Generic. Mark + brand boleh.

Copy lock (jangan ganti tanpa Raxe):

- Label: `Tentang`
- Judul: `Raxe Workshop`
- Body: `Alias Raxe. Bengkel kecil. APK dan web dirakit sendiri, rilis dari rak ini. Bukan toko. Bukan perusahaan. Tempat karya.`

**Dilarang keras:** nama asli, sekolah, NISN, alamat, kota, kontak, social pribadi, foto diri.

## Elevation & Depth

Gelap = step permukaan + hairline + inset `0 1px 0 rgba(255,255,255,0.12)`. Bukan drop-shadow glow.

Rest = card. Hover = raised + naik 4-8px, 160ms. Press = scale 0.97-0.98, 120ms. Easing `cubic-bezier(0.22, 1, 0.36, 1)`.

Kartu rilis (pointer): perspective `800px`, rotateX/Y max `6deg`. Hairline tetap. Tidak ada glow.

Hanya color, background, border, opacity, transform. Dilarang `transition: all`.

## Motion (F11) — FULL CREATIVE

Landing **boleh** library. Override YAGNI v1.1. Chrome tetap quiet. Tidak glow.

### Stack

- **Lenis** 1.3.x (darkroom.engineering). `lerp: 0.1`. Import `lenis/dist/lenis.css`. `respectReducedMotion` default **true** — jangan set `false`.
- **GSAP + ScrollTrigger.** `gsap.registerPlugin(ScrollTrigger)` dulu.
- Wire native-scroll proxy:
  - `lenis.on('scroll', ScrollTrigger.update)`
  - `gsap.ticker.add((time) => lenis.raf(time * 1000))`
  - `gsap.ticker.lagSmoothing(0)`
- Nested scroll (modal): `prevent: (node) => node.closest('.modal')` atau `allowNestedScroll: true`.
- `ScrollTrigger.refresh()` setelah font/image/layout. Create trigger top-to-bottom.
- Jangan `markers: true` di production.

### Beat

- **Mark signature (Home, once):** opacity 0→1, translateY 24→0, rotateX 8deg→0, 900ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, `forwards`. Stem / bowl / leg stagger 80ms jika group SVG ada. **No loop. No glow pulse.**
- **Parallax:** mark `yPercent` ~12 vs type 0; plate belakang `yPercent` ~20. Scrub true, start/end hero.
- **Tile + Tentang reveal:** opacity + translateY 32→0, 640ms, stagger 100ms, `start: "top 85%"`. Scrub false, `toggleActions: "play none none reverse"` atau once.
- **Nav hairline:** opacity 0 di hero top, 1 setelah 48px scroll.
- **Magnetic cursor (pointer only):** CTA + tile, max offset 8px, lerp 0.2. Touch: off.
- **3D tilt (pointer only):** kartu rilis, perspective 800, rotate max 6deg. Touch: off.
- **CTA / card rest hover:** 160ms rise 4-8px, press 120ms scale 0.97.
- **View Transition:** icon share-element ke `/app/{slug}`.

### Reduced motion

`prefers-reduced-motion: reduce` = **color / opacity only**.

Lenis hormati default (jangan `respectReducedMotion: false`). Kill transform, magnetic, tilt, parallax, rotateX. Skip Lenis smooth. Mark: opacity only, 200ms.

## Shapes

Keycap/tombol 8. Kartu 12. Featured 16. Chip 6. Nested inner = outer - pad, min 4. Focus ring 2px text, offset 3. Dilarang `outline: none` tanpa ring.

## Components

**Nav.** 56. 360: 4 tab equal. 1080: wordmark + 3 tab + Keluar. Current underline 2px. Idle secondary. Keluar selalu secondary.

**Home.** Hero full-viewport mark autentik, type besar, CTA Masuk library ke `/apk`. Tentang. Tiga tile rilis.

**APK.** Featured KROMA raised. Tabungku + GPS compact. Semua Rilis.

**Web.** Thumbnail graphite (bukan screenshot palsu). Chip stack muted. Buka live primary. Source secondary; disabled + muted jika `repo_url` kosong. Jangan invent repo.

**Button primary.** Off-white, ink text, tinggi 48, highlight atas 18%. Magnetic di Home CTA.

**Button secondary.** raised + hairline.

**Button disabled.** card + hair + muted.

**Card.** Rest card, hover raised. Isi: icon/thumb, nama, tagline, deskripsi 2-3 baris truncated, badge. Home tiles: tilt + magnetic pointer.

**Chip.** card + hair, JetBrains 11, muted.

**Badge.** Rilis atau WEB. Muted mono. Bukan cyan.

**Footer APK.** Sideload 2 baris di 360.

**Footer Web.** Live tab baru. Source hanya jika repo ada.

**Mark.** Path autentik. Jangan gambar ulang.

## Copy kartu (F10)

APK:

- KROMA — Player musik pribadi. Putar berkas lokal di HP. Antrian, sleep timer, tanpa akun.
- Tabungku — Tabungan berdasar tujuan. Satu tujuan, satu tabungan. Catat setoran, lihat sisa target.
- GPS Tracker — Pelacak lokasi. Lacak posisi HP. Riwayat rute, tanpa toko.

Web:

- Tahun Baru Countdown — Callsign Radio. Hitung mundur tahun baru. Angka live Firebase, bukan palsu. Stack Next.js, Firebase. live `https://tahun-baru-countdown-eosin.vercel.app/`
- Crypto Blog — Catatan beranda. Tulisan crypto di Vercel. Next 16. Bukan sinyal trading. Stack Next.js 16, Vercel. live `https://crypto-blog-ten.vercel.app/beranda`

## Do's and Don'ts

Do: graphite chrome, mark berwarna, 3 APK rilis, 2 web seed, Home / APK / Web, elevasi step, Source disabled tanpa repo, Lenis+GSAP di landing, Tentang generic, type besar, reduced-motion color-only.

Don't: kata My, Library di nav, cyan/purple chrome, glow, AVS, coming soon, `transition: all`, bounce loop, light mode, invent repo_url, data asli Raxe di Tentang, `respectReducedMotion: false`, sentuh `functions/` `pages/` `src/`.
