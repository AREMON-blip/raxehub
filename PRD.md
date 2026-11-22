# PRD — RaxeHub v1.0 "Private APK Library"

**Tanggal:** 2026-11-22
**Pemilik:** Rafa Ahmad Hidayatullah (@Arxen)
**Profile:** raxep / Topic #6 Oracle
**Status:** Draft menunggu approval Raxe + DESIGN.md v1 dari Artisan Topic #542
**Stack (divalidasi 2026-11-22):** Cloudflare Pages + Cloudflare R2 + Neon Postgres + Clerk Auth
**Domain default:** `raxehub.pages.dev` (custom domain opsional, v1+)

---

## 1. Latar Belakang & Tujuan

Raxe memproduksi APK Android sendiri (gps-tracker v2.0, KROMA, agent-virtual-studio, dan
proyek mendatang). Distribusi sekarang = share file manual ke teman. Tujuan: **satu web
"library" pribadi** tempat circle kecil bisa lihat katalog app + download APK dengan
**sekali klik, langsung download file**, tanpa redirect ke halaman pihak ketiga
(GitHub UI, Drive viewer, dsb).

**Fakta arsitektur penentu (divalidasi via riset, 2026-11-22):**
1. Cloudflare Pages maksimal **25 MiB per file statik** → APK (20–80 MB) **tidak mungkin**
   disimpen di Pages. Harus object storage.
2. Cloudflare R2 free tier: 10 GB storage, **egress 0 biaya selamanya** → unlimited
   download APK gratis. Ini penyimpanan binary-nya.
3. Neon Postgres free: 1 GB storage/project, 5 GB egress/bln, **scale-to-zero setelah
   5 menit idle** (konsekuensi: cold start ~1–3 detik pada hit pertama).
4. Clerk free: 50.000 **MRU** (monthly retained users). Circle 5 orang = gratis selamanya.
5. Resend **dihapus dari stack** (YAGNI): Clerk mengirim magic-link email sendiri.
6. Pages Functions (backend) memakai quota Workers free: 100.000 request/hari,
   10 ms CPU/request. Presigning R2 < 1 ms → aman.

**Tujuan v1.0:**
1. Web katalog app privat, login via Clerk (Google / magic-link), circle = whitelisted.
2. Download APK = **1 klik → file langsung terdownload** (presigned R2 URL, redirect 302).
3. Admin (Raxe) upload APK baru **dari HP, tanpa buka laptop** (presigned PUT browser→R2).
4. Brand: banner hero RAXE mecha-R monogram, dark theme, banyak placeholder/"coming soon"
   untuk app yang belum rilis.

**Interpretasi MVP (koreksi terbuka):** pipeline auth+download **harus berfungsi nyata**
dan disemai minimal 1 app rilis (gps-tracker v2.0). Kartu "coming soon" = untuk app yang
APK-nya belum ada (KROMA, agent-virtual-studio, dll). Bukan mockup kosong tanpa fungsi.

**Trade-off yang diterima Raxe (eksplisit):**
- **Bukan "zero-infra" murni** seperti gps-tracker v2.0: ada 4 layanan cloud (Pages, R2,
  Neon, Clerk). Imbalan: upload dari HP, URL presigned 15 menit, auth beneran.
- Vendor lock-in: 4 platform Google/Cloudflare/Neon/Clerk. Mitigasi: skema Postgres
  portabel, APK tetap milik Raxe di R2, export bisa manual.
- Neon scale-to-zero → hit pertama pagi bisa lambat ~2 detik. Mitigasi di ARCHITECTURE.md §6.

## 2. Non-Goals (YAGNI Drop)

- Download counter / analytics / rating / komentar — private circle, gak butuh.
- PWA / install web ke homescreen.
- Resend (email service) — Clerk kirim magic-link sendiri.
- Play Store connector, APK mirroring, update checker in-app.
- Multi-bahasa (Indonesia aja).
- Light theme — standing default: **dark-only**.
- **Data asli Raxe di web** — identitas pribadi (nama asli, sekolah, domisili, kontak)
  tidak ditampilkan; persona workshop generic aja (F12).

## 3. Persona

| Persona | Kebutuhan |
|---|---|
| Public visitor (anonim) | Buka link → lihat katalog langsung → 1 klik download APK / buka web live |
| Raxe (admin) | Login Clerk → `/admin` → upload APK baru, edit metadata |

## 4. Kebutuhan Fungsional

**F1 — Publik anonim, admin-only auth (PIVOT 2026-11-23).** Browsing + download
**tanpa login** untuk siapa saja. Clerk discope hanya buat `/admin` + `/api/admin/*`
(upload, insert metadata). Semua route publik (`/`, `/apk`, `/web`, `/app/:slug`,
`/api/apps`, `/api/download`) bypass auth. Whitelist email circle **dihapus**.
Rute admin wajib session Clerk email admin (`ADMIN_EMAIL`). Lihat §9.

**F2 — Katalog (library).** Grid kartu app: icon R2, nama, tagline, chip versi terbaru,
status (`released` / `coming-soon`). Klik kartu → halaman detail.

**F3 — Detail app.** Deskripsi, screenshot gallery (R2), changelog per versi, info
 SHA256, ukuran file, permission list (manual metadata), tombol Download.

**F4 — Download.** Klik tombol → `GET /api/download/:slug` → Worker verifikasi session
Clerk + whitelist → presign R2 GET 15 menit → **302 redirect** → browser download file
langsung dari R2 edge. Bukan open new tab, bukan halaman perantara.

**F5 — Admin upload (dari HP).** Halaman `/admin` (hanya Raxe): form metadata + button
upload APK. Browser minta presigned PUT → upload **langsung browser→R2** (bypass body
limit Worker) → SHA256 dihitung client-side (Web Crypto API, sebab 10 ms CPU Worker
gak cukup buat hashing 80 MB) → Worker insert metadata ke Neon.

**F6 — Placeholder "coming soon"** (v1.2: **DEFERRED** — katalog semua Rilis, coming-soon
card tidak dibangun; cadangan v1.1). Kartu app tanpa APK tampil dengan badge
`COMING SOON`, visual mockup, click = modal teaser. Banner hero RAXE mecha-R.

**F7 — Changelog.** Tiap versi punya release notes (markdown plain, render line-break).
Versi lama bisa didownload (dropdown versi).

**F8 — Nav 3 tab + landing page (Home | APK | Web).** Nav: Home, APK, Web, Keluar
(tanpa kata "My"). Home = landing page beranimasi (hero mark RAXE, manifesto singkat,
CTA "Masuk library", 3 tile rilis terbaru). APK = rak APK (F2–F7). Web = galeri karya web.

**F9 — Karya Web (Web tab).** Grid kartu karya web: thumbnail R2, nama, deskripsi
singkat, teknologi chip (mis. Next.js, Firebase, Remotion), tombol **"Buka live"**
(`live_url`) + **"Source"** (`repo_url`). Turunan apps table: field `type`
('apk' | 'web'). Web entry wajib live_url ATAU repo_url. Data seed awal =
lu isi manual pas Phase 3 (URL live belum diverifikasi, lihat Known Limitations).

**F10 — Deskripsi singkat tiap app.** Tiap kartu app/web punya tagline (1 baris)
\+ deskripsi singkat 2–3 baris (`description`). Muncul di kartu (truncated)
\+ lengkap di detail page.

**F11 — Animasi (FULL CREATIVE).** Landing = pengalaman animasi premium:
smooth scroll (Lenis atau setara), scroll-triggered reveal (GSAP ScrollTrigger),
parallax layers, magnetic cursor di CTA/tile, efek 3D-ish (tilt/perspective di kartu),
animated gradient/hero signature mark. Library boleh dipakai atas eksplisit permintaan
Raxe (override Pillar 5 YAGNI untuk halaman landing). **Constraint tetap:** graphite
chrome, no glow, dark-only, dan `prefers-reduced-motion` wajib color-only fallback.
Modern aesthetic: clean type, generous whitespace, hairline precision.

**F12 — Section "Tentang" (Home).** Section short bio workshop di Home.
**DILARANG pakai data asli Raxe** (nama asli, sekolah, domisili, kontak) — pakai
persona workshop generic "Raxe Workshop" (alias, tagline crafting APK + web,
semangat builder). Boleh link ke RAXE mark + brand, bukan identitas pribadi.

## 5. Arsitektur Data (Neon Schema)

```sql
CREATE TABLE apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'gps-tracker'
  name text NOT NULL,
  tagline text,
  description text,                   -- F10: deskripsi singkat 2-3 baris
  status text NOT NULL DEFAULT 'released',  -- released | coming-soon
  type text NOT NULL DEFAULT 'apk',   -- F9: 'apk' | 'web'
  live_url text,                      -- F9: web entry (wajib salah satu)
  repo_url text,                      -- F9: web entry
  stack text,                         -- F9: teknologi chip, comma-separated
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version_name text NOT NULL,          -- '2.0.1'
  version_code int NOT NULL,
  release_notes text,
  apk_key text NOT NULL,               -- R2 object key, ej: 'apps/gps-tracker/gpstracker-2.0.1.apk'
  size_bytes bigint NOT NULL,
  sha256 text NOT NULL,                -- hex, computed client-side at upload
  active boolean NOT NULL DEFAULT true,-- false = sembunyikan dari tombol utama
  created_at timestamptz DEFAULT now()
);

CREATE TABLE screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  r2_key text NOT NULL,
  caption text,
  sort int NOT NULL DEFAULT 0
);

CREATE INDEX idx_versions_app_active ON versions(app_id) WHERE active = true;
CREATE INDEX idx_screenshots_app ON screenshots(app_id, sort);
```

Note RACI: skema ini milik Vanguard/Forge buat dijalankan via migration SQL idempoten.
Planner gak nulis kode.

## 6. 5-Pillar Architecture Defense

**P1 Reliability & Fault Tolerance**
- No SPOF tunggal: 4 vendor independen (Pages, R2, Neon, Clerk). Clerk down = download
  blocked (fail-closed, aman), katalog statik cached tetap tampil.
- Operasi idempoten: presign request bisa diulang; upload PK = R2 object key unik per
  versi (re-upload versi sama = overwrite key + bump, bukan duplikat).

**P2 Hardware Constraint & Budgeting (Axioo Hype 5, 8 GB DDR4)**
- Nol beban di laptop: semuanya edge cloud. Dev lokal = build static (wrangler pages dev)
  atau `npx serve dist`, RAM footprint < 300 MB.
- Build CI = Cloudflare Pages (500/bln), bukan komputer Raxe.
- Frontend vanilla HTML/CSS/JS atau.light framework — keputusan Forge, constraint:
  build output statik, dependency install footprint wajar (RAM 8 GB saat `npm install`).

**P3 Security & Zero-Trust**
- Client hanya pegang Clerk publishable key. R2 private (bukan public bucket), akses
  presigned only. Neon connection string + Clerk secret + R2 creds = **env Worker**,
  never client.
- Whitelist email backend (Worker) — UI hide bukan security.
- Presigned URL expired 15 menit; leak URL = window kecil.
- SHA256 tiap APK tercatat + ditampilkan di detail page → user bisa verifikasi integritas.
- APK unsigned/unknown-source: dialog pencegahan + intruksi "install unknown apps"
  tampil di detail page ( UX decision, mencegah support question berulang).

**P4 Deterministic Observability**
- Cloudflare dashboard: Workers logs + R2 metrics + Pages deploy logs. Sentry: skip (YAGNI).
- Health endpoint: `GET /api/health` → `{neon, r2, clerk}` status probe, exit-code analog.
- Error client: halaman error deterministic dengan kode (E-xx) bukan blank.

**P5 Extreme YAGNI**
- Stack 4 layanan udah dipangkas dari referensi 5 (Resend drop). DB dipertahankan atas
  eksplisit request Raxe ("pake database bisa gk") + kebutuhan upload-dari-HP.
- No framework berat kalau statik enough. No ORM kalai SQL murni cukup (decide Forge).
- Tabel/Screenshot hanya diisi saat app rilis — coming-soon gak butuh APK row.

## 7. Acceptance Criteria (Runtime-Checkable)

| AC | Gate |
|---|---|
| A1 | `curl -s https://raxehub.pages.dev/api/health` → JSON 200 `{status: ok}` dgn Neon reachable |
| A2 | Buka root **tanpa login** → landing lengkap (hero, Tentang, tile rilis, Web) terrender. `/admin` tanpa session → redirect Clerk sign-in. Non-admin login → 403 `E-WHITELIST` hapus: admin email match `ADMIN_EMAIL` aja |
| A3 | Katalog tampil anonim: 3 APK + 2 Web seed, kartu detail tampil |
| A4 | Klik Download gps-tracker → response 302, header `Location` = presigned host `<accountid>.r2.cloudflarestorage.com` (bucket private, BUKAN `*.r2.dev`), download mulai otomatis, SHA256 file == nilai di DB & detail page |
| A5 | Admin upload APK baru via /admin (browser HP) → object muncul di R2, row versions tersimpan, katalog detail menampilkan versi baru |
| A6 | Link presigned didownload lagi setelah 16 menit → 403/404expired (verifikasi expiry) |
| A7 | Neon idle >5 menit → hit pertama <3 detik, page tetap render (catalog cache fallback) |
| A8 | fresh `git clone` + `wrangler pages deploy` → deploy sukses 0 error (reproducibility) |

## 8. Known Limitations

1. **R2 free tier 10 GB** ≈ 200 APK @ 50 MB. Lewat = $0,015/GB/bln (murah, catat).
2. **Worker CPU 10 ms** → hashing/CRC wajib client-side. Upload >100 MB dibatasi
   validasi frontend (max 80 MB per APK, reject + pesan jelas).
3. **Neon cold start** ~1–3 detik setelah 5 menit idle.
4. **Clerk magic-link email** rate limit free tier — untuk 5 orang non-issue; spike
   signup massal (public) akan kena limit (non-goal anyway).
5. **Egress Neon 5 GB/bln** — API JSON kecil, gak mungkin ketemu (R2 egress = 0 biaya).
6. **Status coming-soon = manual** — admin set sendiri, gak auto-detect.

## 9. Seed Data Web Karya (Terverifikasi Live 2026-11-22)

| Karya | live_url | Stack | Status |
|---|---|---|---|
| Tahun Baru Countdown (Callsign Radio) | `https://tahun-baru-countdown-eosin.vercel.app/` | Next.js, Vercel, Firebase RDB | live terverifikasi |
| Crypto Blog | `https://crypto-blog-ten.vercel.app/beranda` | Next.js 16, Vercel | live terverifikasi |

Entry `type='web'` lain (repo-only) bebas ditambah admin sewaktu-waktu.

## 10. Implikasi Publik (PIVOT 2026-11-23)

**Yang berubah:**
- Anonymous read + download untuk siapa saja. Tidak ada gate, whitelist, atau login
  untuk browsing.
- SEO: `robots.txt` allow-all + meta description per page. Default indexable
  (Google, Bing). Sitemap.xml statis (generate waktu build, YAGNI manual).
- Privasi: **semua konten komit ke publik**. Tentang = persona workshop (F12, no PII).
  License/serahan tidak ditampilkan. Kontak = link sosial brand RAXE aja
  (bukan email/no HP pribadi). Rekomendasi: taruh link sosial/control surfaces
  yang dimaksud untuk publik.

**Yang gak berubah (security invariant):**
- `/admin` + `/api/admin/*` tetap wajib Clerk session + `ADMIN_EMAIL` match.
- R2 private, presigned 15 menit, SHA256 publis di detail page (integrity publik).
- Secret env gak pernah ke client bundle. Secret audit gate tetap jalan.
- APK = sideload_unknownapps: info-box di detail page tetap wajib (UX + liability).

**Trade-off diterima Raxe (eksplisit):**
- Download abuse/scrapping: R2 egress 0 biaya → cost aman. Rate-limit belum dipasang
  (YAGNI; `api/download` Work/pro rate-limit opsional v1.1 kalau mulai disalahgunakan).
- APK bocor ke pihak tak dikenal = diterima (karya personal, bukan komersial).
