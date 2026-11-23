# ARCHITECTURE — RaxeHub v1.0 "Private APK Library"

**Tanggal:** 2026-11-22
**Fungsi:** Blueprint teknis dari PRD v1.0. Kontrak untuk Forge (#2) & Vanguard (#27).
**Status:** Diapprove 2026-11-22; GATE 1 PASS (lokal); Phase 2 tertunggu DESIGN.md final

---

## 1. Component Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (User / Admin HP)                                   │
│  - Clerk JS SDK (publishable key only)                      │
│  - Web Crypto API: SHA256 client-side saat upload           │
└───────────────┬─────────────────────────────────────────────┘
                │  HTTPS
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Pages (static frontend)                          │
│  - HTML/CSS/JS statik (dark theme)                          │
│  - Domain: raxehub.pages.dev                                │
└───────────────┬─────────────────────────────────────────────┘
                │  /api/*
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Pages Functions = Workers runtime                           │
│  Env: CLERK_SECRET_KEY, DATABASE_URL (Neon), R2 creds       │
│  CPU budget: 10 ms/request → presign only, NO file proxy    │
└──────┬───────────────────────┬──────────────────┬───────────┘
       │                       │                  │
       ▼                       ▼                  ▼
┌──────────────┐      ┌──────────────┐   ┌──────────────────┐
│ Clerk        │      │ Neon Postgres│   │ Cloudflare R2    │
│ (auth + JWT  │      │ (metadata:   │   │ (binary: APK,    │
│  verify)     │      │  apps,       │   │  icon, screenshot│
│              │      │  versions,   │   │  private bucket) │
│  whitelist   │      │  screenshots)│   │                  │
└──────────────┘      └──────────────┘   └──────────────────┘
```

| Komponen | Fungsi | Handel data | Pihak |
|---|---|---|--- Forge |
| `pages/` static | Katalog UI, detail, admin form | — | Forge |
| `functions/api/` | Backend edge: auth verify, query, presign | metadata via SQL | Forge |
| Clerk | Identitas (Google/magic-link), JWT sessi | email + UID | config Vanguard |
| Neon | Source of truth katalog | teks metadata saja | migration Vanguard |
| R2 bucket `raxehub-apk` | Penyimpanan APK, icon, screenshot | binary | config Vanguard |

## 2. API Contract (Pages Functions)

Semua route di-prefix `/api`. Response JSON, error format `{error, code}`.

| Method | Route | Auth | Behavior |
|---|---|---|---|
| GET | `/api/health` | none | `{status, neon, r2, clerk}` probe cepat |
| GET | `/api/apps?type=apk\|web` | **none (public)** | list app + versi active terbaru, filter per tab (F8) |
| GET | `/api/apps/:slug` | **none (public)** | detail + screenshots + semua versi |
| GET | `/api/download/:slug` | **none (public)** | presign GET R2 (apk_key versi active) → **302 Location** |
| GET | `/api/download/:slug/:versionId` | **none (public)** | sama, versi spesifik (F7) |
| POST | `/api/admin/presign-upload` | admin | body `{fileName, sizeBytes, sha256}` + opsional `{slug, versionName}` → presign PUT R2, kunci object server-side `apps/<slug>/<name>-<versionName>.apk` |
| POST | `/api/admin/apps` | admin | insert row apps |
| POST | `/api/admin/versions` | admin | insert row versions (apk_key, sha256) |
| POST | `/api/admin/upload-screenshot/:appId` | admin | presign PUT untuk screenshot |
| PATCH | `/api/admin/apps/:id` | admin | edit metadata / status coming-soon |

**Aturan kontrak:**
- Request body max 4 KB (metadata JSON). Binary file **nopek** via Worker — selalu presign.
- Presigned URL: expiry **15 menit** (`X-Amz-Expires=900`), host S3 API `<accountid>.r2.cloudflarestorage.com` — bucket private, **bukan** domain publik `*.r2.dev` — method GET/PUT sesuai route. aws4fetch tandatangan query (param expiry diset sebelum sign).

### 2.1 Frontend Pages (F8–F11)

| Route | Isi |
|---|---|
| `/` | Landing Home: hero mark RAXE + manifesto + CTA "Masuk library" + 3 tile rilis (F8, F11 animasi) |
| `/apk` | Rak APK: grid kartu app type=apk (F2–F7) |
| `/web` | Galeri karya web: grid kartu type=web + tombol Buka live/Source (F9) |
| `/app/:slug` | Detail app (apk atau web — web: live/source, tanpa changelog/APK) |
| `/admin` | Upload + metadata (termasuk type, live_url, repo_url, stack) |

Nav public: Home | APK | Web (3 tab). Nav "Keluar" HANYA muncul pas session admin (Zero login surface, PRD F1 AMEND). CTA hero "Buka karya". Dark-only, animasi native (F11).

**PIVOT PUBLIC (2026-11-23):** route publik (/, /apk, /web, /app/:slug, /api/apps,
/api/download) = anonymous, no auth. Clerk middleware **hanya guard `/admin` +
`/api/admin/*`**, cek `ADMIN_EMAIL` match. `E-WHITELIST` deprecated (hapus dari
errors.ts). Keluar nav hanya tampil pas admin login session.

**SEO (v1):** `public/robots.txt` allow-all + `sitemap.xml` statis (4 route),
meta description per page. Stop kapan saja kalau mau pull dari index.
- Error code standar: `E-AUTH` (no/bad session), `E-WHITELIST` (email di-luar), `E-NOTFOUND`, `E-R2PRESIGN`, `E-DB`.
- `GET /api/download/:slug` **wajib** return `Content-Disposition: attachment` pada URL R2 (set di R2 object metadata saat upload atau param presign `response-content-disposition`).

### 2.2 Local Test Mode (GATE 1)

Dev lokal (`wrangler pages dev` port 8807) jalan tanpa Clerk/R2 asli:

- Aktif HANYA saat env `RAXEHUB_TEST_MODE=1` **DAN** `CLERK_SECRET_KEY` kosong. Fail-closed:
  secret ada → mode off, flag diabaikan.
- Identitas: `Authorization: Bearer *** (lowercase). Admin gate tetap
  jalan via `ADMIN_EMAIL` (route publik bypass, admin auth strict).
- Presign R2 signature dummy (`X-Amz-Signature=local-test-signature`) — gak pernah valid di R2 asli. PUT ke host dummy gagal by design; verifikasi upload end-to-end hanya di prod (Phase 3).
- `GET /api/health` → `clerk: "local"`.
- **Invariant:** `RAXEHUB_TEST_MODE` NEVER di-set di Pages dashboard env.

## 3. Data Flow Utama

### 3.1 Download (user)
```
User klik [Download]
  → GET /api/download/gps-tracker
  → Worker: verifyJwt(session Clerk) [env CLERK_SECRET_KEY]
  → Worker: cek email UID di whitelist env var `ALLOWED_EMAILS` comma-separated (v1: env var; Neon table = v1.1 kalau skala)
  → Worker: SELECT apk_key, version_name FROM versions WHERE active ORDER BY created_at DESC LIMIT 1
  → Worker: S3V4Signer (aws4fetch) presign GET R2 + ttl 900s
  → 302 Location: `https://<accountid>.r2.cloudflarestorage.com/raxehub-apk/<key>?X-Amz-Expires=900&…`
  → Browser unduh langsung dari R2 edge. Worker keluar, bandwidth nol di Worker.
```

### 3.2 Upload (admin, dari HP)
```
Admin /admin → pilih file APK
  → Browser: SHA-256 via crypto.subtle.digest (chunked stream, 80 MB aman)
  → POST /api/admin/presign-upload {fileName, sizeBytes, sha256}
  → Worker: verify admin (email == ADMIN_EMAIL env)
  → Worker: presign PUT → key: apps/<slug>/<name>-<versionName>.apk
  → Browser: fetch(PUT, body=file) langsung ke R2 (NO Worker bandwidth)
  → PUT done → POST /api/admin/versions {appId, versionName, versionCode, releaseNotes, apk_key, sizeBytes, sha256}
  → Worker: INSERT Neon, tag active=true (versi lama → active=false)
  → Katalog detail page refresh → versi baru tampil
```

### 3.3 Read katalog
```
GET / → static render, data via /api/apps
Cache strategy: Pages static cache 5 menit (swr) untuk katalog HTML state (html sudahcaching) || client fetch fresh setelah login (data personal = no cache di /api)
```
Katalog tetap statik-friendly: data inti dipublish ke JSON file di build? — **NO** (YAGNI,
data-admin berubah random via upload HP). Ambil pola: static shell + `/api/apps` client fetch.

## 4. Trust Boundary & Secret Matrix

| Secret | Lokasi | Exposed? |
|---|---|---|
| Clerk publishable key | client JS | iya, by design (aman) |
| CLERK_SECRET_KEY | Pages env (Worker) | NEVER client |
| DATABASE_URL Neon | Pages env | NEVER |
| R2 creds S3 API (`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) | Pages env | NEVER |
| R2 binding native `RAXEHUB_BUCKET` (wrangler.toml) | Worker binding | probe health/list; presign tetap S3 creds |
| Whitelist email list | Pages env var | backend only |
| Presigned URL | transient 900s | user sementara, fine |

**Invariant:** static bundle `pages/` tidak boleh mengandung token rahasia apapun.
Audit gate: `grep -rEn '(sk_|secret|password|BEGIN.{0,8}KEY)' public/` → 0 hit sebelum deploy (target = `pages_build_output_dir=public/`, bukan `dist/`).

## 5. State Machine

### Version lifecycle
```
created (upload selesai, row insert)
  → active=true (default, Visible di tombol Download)
  → [admin set active=false] (sembunyi dari tombol, masih accessible via URL versi)
  → [R2 object delete] → row ikut di-hapus (cascade manual admin UI)
```

### App status
```
coming-soon (tidak punya version row) ↔ released (≥1 version active)
```

### Tombol Unduh auto-disabled (F-DISABLE, 2026-11-23)
- Trigger: `latestVersion === null` (row `versions` kosong di Neon per slug)
- Detail `/app/:slug`: anchor Unduh → `<button class="btn btn-primary" disabled>Belum ada rilis</button>`
- Field select Versi disembunyikan saat `versions.length === 0`; SHA256 box tetap "Tersedia setelah versi dirilis."
- `.btn:disabled`: bg `--secondary`, color `--muted`, `cursor: not-allowed`, hover freeze (NO glow)
- Server tetap fail-closed: `/api/download/:slug` tanpa version row → 404 (tidak bergantung UI)
- Tile `/apk` sebagai `/web` — tombol nonaktif sudah ada pola `.field` placeholder

## 6. Failure Modes

| Failure | Trigger | Behavior | Mitigasi |
|---|---|---|---|
| Neon cold start | idle >5 menit | query first hit 1–3 s | static shell tetap render; katalog punya loading skeleton; Health endpoint melaporkan bukan 5xx |
| Clerk outage | vendor down | login impossible → download fail-closed | fail closed by design; katalog shell tetap tampil tanpa data |
| R2 presign error | creds/lima quota | `E-R2PRESIGN` 500 | error page deterministic + retry button |
| R2 object hilang | delete manual | presign sukses tapi download 404 | admin monitor: /api/health probe R2 HEAD setiap active apk_key nightly cron (v1.1, skip dulu — YAGNI) |
| Presigned leak | URL dipencet orang | 403 setelah 15 menit | expiry pendek by design |
| Worker CPU over | hashing server-side | gak pernah terjadi | hashing client-side wajib (PUT & verify) |
| Non-whitelist login | E-WHITELIST | 403 + page jelas | backend verify, bukan UI hide |
| Upload > 80 MB | client check + presign reject | error awal | maxsize di form upfront |

## 7. Dependency & Runtime Pin

| Dependency | Versi | Catatan |
|---|---|---|
| wrangler | latest 4.x | Pages + Functions dev/deploy CLI |
| @clerk/backend | latest | verifyJwt di Worker |
| @neondatabase/serverless | latest | HTTP driver compatible Workers |
| aws4fetch | latest | presign R2 S3v4 |
| Clerk JS SDK | load via CDN script tag | publishable key |

**Constraint:** dep list <= 5 package (runtime). Zero build framework preferred — vanilla
HTML/CSS/JS kecuali Forge justifikasi (RAM 8 GB constraint saat dev).

## 8. Domain & Deploy

- Preview deploy otomatis tiap push branch (Pages git integration).
- Production deploy = branch `main` manual approve via Pages dashboard (anti-oops).
- Environment variables di Pages dashboard (8): `CLERK_SECRET_KEY`, `DATABASE_URL`,
  `ALLOWED_EMAILS`, `ADMIN_EMAIL`, `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`. Plus binding R2 `RAXEHUB_BUCKET` di `wrangler.toml` (sudah ada).
  `RAXEHUB_TEST_MODE`=1 **local-only**, NEVER di Pages (lihat §2.2).
- R2 bucket `raxehub-apk`, region: APAC (Singapore) — user semua Indonesia.
- Kebutuhan akun baru: Raxe bikin Cloudflare account (kalo belum), Neon project, Clerk app
  (Google OAuth client). **Routing: Vanguard setup bimbingan, Raxe yang pegang control panel.**
- **Custom domain (DEFERRED):** calon `raxehub.my.id` (promo registrasi, deferred karena
  minimum deposit $1 di registrar). Pas connect, DNS CNAME ke Pages + SSL Cloudflare auto,
  nol biaya tambahan. Dokumen tetap memakai `raxehub.pages.dev` sampai benar-benar connect.
