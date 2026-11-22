# DESIGN_BRIEF — RaxeHub v1.0 "Private APK Library"

**Tanggal:** 2026-11-22
**Ditujukan:** Artisan (Topic #542) — 3 konsep kontras sebelum finalisasi
**Status:** v1.2 sinkron 2026-11-22 (copy F12 final + F6 drop)
**Sumber:** Raxe private APK distribution web, dark-only standing default
**File pendamping:** `PRD.md` (fitur), `ARCHITECTURE.md` (kontrak backend)

---

## 1. Esensi Brand

Web ini = **etalase pribadi karya Raxe**. Bukan toko, bukan Play Store. Tone:
**mecha-tech workshop** — simpel, gelap, presisi, sedikit gaya engineering-blueprint.
Warna utama mengikuti brand RAXE (lihat §2). Tidak boleh terasa seperti template SaaS
generik.allowed: sedikit grain/noise texture, garis blueprint, monospace accent.

**Arah modern (permintaan eksplisit Raxe):** clean type besar, generous whitespace,
hairline presisi, motion premium full creative (F11). Bukan retro-clutter, bukan
neo-brutalism. Referensi vibe: Linear/Vercel-era dark portfolio, tetapi identitas
sendiri (graphite + mark RAXE).

## 2. Visual Direction (Wajib)

- **Dark-only** — lock tema gelap. Background `#141415`, card `#19191B`, raised `#232325`
  (v1.2 Graphite Shelf).
- **Logo hero banner:** RAXE mecha-R monogram, referensi
  `D:/default project/_soul-backup-v1/raxe-authentic-v2-nocore.svg`
  (cyan/purple gradient, 45° chamfers, **no diamond core**). Asset asli wajib dipakai /
  re-export — Artisan gak boleh gambar ulang R monogram gaya lain.
- **Accent:** cyan/purple **HANYA di SVG mark**. Chrome UI: tombol off-white `#EDEDED`,
  hairline `#2A2A2C`. **DILARANG** `#22D3EE`/`#A78BFA` di tombol, kartu, atau glow
  (keputusan v1.2).
- **Font:** monospace accent buat angka versi/chip (JetBrains Mono atau Share Tech Mono
  kalau pas), body font bebas pilih (Plus Jakarta Sans udah dipakai di gps-tracker,
  konsisten aja).
- **Mood:** workshop/game-library hybrid — vibe Steam library / itch.io personal page,
  **bukan** landing page SaaS.

## 3. Layout yang Dibutuhkan

Nav public final: **Home | APK | Web** (F8, tanpa kata "My", zero login surface F1 AMEND — Keluar HANYA di session admin). CTA hero: "Buka karya".

### 3.0 Landing `/` (Home, F8 + F11)
- **Hero full-viewport:** RAXE mecha-R mark + wordmark, tagline workshop,
  animasi signature mark premium, gradient graphite backdrop, parallax layers.
- Scroll-reveal section: 3 tile rilis terbaru (preview APK + Web),
  manifesto 1-2 baris, CTA "Masuk library" → `/apk`.
- Scroll-driven: nav hairline opacity muncul pas scroll.
- **Magnetic cursor** di CTA/tile, **3D-ish tilt/perspective** di kartu rilis,
  smooth scroll (Lenis/setara), scroll-triggered reveal (GSAP ScrollTrigger).
- **Section "Tentang"** (F12): bio workshop singkat — **DILARANG data asli Raxe**
  (nama asli, sekolah, domisili, kontak). Persona generic "Raxe Workshop".
  Mark + brand boleh. **Copy lock (final, approval Raxe 2026-11-22):**
  - Label: `Tentang`
  - Judul: `Raxe Workshop`
  - Body (**VERBATIM**, jangan dipotong/parafrase): "Alias Raxe. Semua APK dan web di
    rak ini dirakit sendiri, dilepas buat teman-teman yang butuh. Kodenya masih
    berantakan di sana-sini, tapi semuanya jalan."
- `prefers-reduced-motion`: color-only, no motion (wajib fallback).

### 3.1 `/apk` (Rak APK)
- **Hero:** RAXE mecha-R + wordmark + tagline workshop + CTA "Masuk library" → `/apk`.
  Parallax plates graphite di belakang, **BUKAN glow**. Tahan 360px.
- **Grid kartu app** responsive: 1 kolom (360px) → 2 (720px) → 3-4 (1080p).
  - Katalog v1.2: KROMA (featured lifted), Tabungku, GPS Tracker — semua **Rilis**.
    F6 coming-soon card **DROPPED** (approval Raxe 2026-11-22). Jangan bikin AVS,
    placeholder silhouette, atau modal teaser di v1.2.
  - Kartu: icon app (R2), nama app, tagline 1 baris, chip versi monospace,
    badge `Rilis`/`WEB` muted mono (bukan cyan).
  - Hover state: surface step card→raised + lift 4-8px, 160ms. Touch: no hover dependency.

### 3.2 Detail `/app/:slug`
- Header: icon besar + nama + tagline + tombol **Download** (prominen, cyan gradient).
- Meta row: ukuran file, SHA256 (truncated + copy button, monospace), tanggal rilis.
- **Section screenshot gallery**: horizontal scroll (mobile) / grid (desktop), lampu-box
  klik perbesar.
- **Section changelog**: list versi monospace `v2.0.1` + release notes (line-break plain).
  Versi lama = dropdown kecil "Download versi lama".
- Info box: *"APK belum terverifikasi Google Play — aktifkan Install Unknown Apps
  di pengaturan HP"* (ikon info, tidak menggurui, Indonesia).

### 3.3 Admin `/admin` (Raxe only)
- Form simpel: select app / isi app baru (nama, slug, tagline, deskripsi, status),
  upload APK (drag-drop / file picker — HP camera-roll friendly), versi name/code,
  release notes textarea.
- Upload progress bar + SHA256 hashing indicator (client-side).
- Daftar app existing di bawah (edit status, add screenshot, lihat versi).

### 3.4 Auth (PIVOT PUBLIC: admin-only)
- Clerk `<SignIn />` embed hanya muncul pas akses `/admin` tanpa session.
- Public pages (Home/APK/Web/detail) **gak ada login UI apapun**.
- Halaman reject: non-admin yang login ke /admin → simple centered message "Akun
  ini tidak punya akses admin", tombol logout. On-brand.
- Nav "Keluar" hanya muncul di session admin.

### 3.5 `/web` (Galeri Karya Web, F9)
- Grid kartu web: thumbnail, nama, tagline, stack chip (Next.js, Firebase, dll),
  description short 2-3 baris (F10).
- Tombol: **Buka live** (live_url, external new tab) + **Source** (repo_url).
- Kartu web gak punya versi/changelog/SHA — bedain visual via badge `WEB`.

### 3.6 User Flow

```
Link share → SignIn (Google / magic-link)
  → Library (grid app)
  → Klik app released → Detail → Download → APK terdownload
  → Klik app coming-soon → modal teaser → close
Admin: login same way → /admin → upload → katalog auto-update (next visit)
```

## 4. Deliverable dari Artisan

1. **3 konsep kontras** hero banner + library grid (tone: minimal / blueprint-heavy /
   neon-glow maximal) — Raxe pilih satu, baru lanjut.
2. `DESIGN.md` final: design tokens (warna, spacing, radius, font size scale, shadow),
   komponen inventory (card, badge, button, modal, gallery, form), state list
   (hover/focus/disabled/uploading/error).
3. Aset siap pakai: hero banner composition (PNG/SVG), app icon frame/placeholder
   silhouette, badge COMING SOON.
4. **Scan anti-slop** (`hallmark` skill) + contrast check (WCAG AA) sebelum serah.
5. Artisan **dilarang** sentuh `functions/`, `pages/` code logic. Hanya visual asset +
   DESIGN.md. Integrasi = Forge.

## 5. Catatan Constraint

- Semua harus tampil bagus di **A21s (360px)** dan laptop 1366×768 — Inspector akan QA
  responsive dua titik itu.
- Untuk Raxe HP sendiri (A21s), download flow harus 3 tap: buka link → login persist
  (session) → Download. Session persistence Clerk default = fine.
- Screenshot app real (gps-tracker, KROMA) = diambil manual Raxe dari HP, upload via
  admin — placeholder Artisan hanya frame-nya.
