# PLAN — RaxeHub v1.0 "Private APK Library"

**Tanggal:** 2026-11-22
**Eksekusi:** setelah approval Raxe + DESIGN.md final Artisan
**Dokumen pendamping:** `PRD.md`, `ARCHITECTURE.md`, `DESIGN_BRIEF.md` (sama folder).

---

## Phase 0 — Akun & Infra Setup (DIY RAXE — Vanguard #27 dialihkan: topic 27 eksternal)

> **Jalankan via `RUNBOOK.md`** (folder ini) — 20-30 menit, semua free tier.
> Tidak menunggu Forge/Artisan. Lanjutkan setelah 4 akun + 9 env var ter-set.

- **0.1** Cloudflare account + Pages project `raxehub` (git connect repo). Verify:
  `wrangler pages project list` exit 0.
- **0.2** R2 bucket `raxehub-apk` region APAC, private. Verify: bucket visible di
  dashboard, public access = off.
- **0.3** Neon project + jalankan `schema.sql` (PRD §5). Verify: `\d apps` via
  `psql`/Neon SQL Editor exit 0.
- **0.4** Clerk app: enable Google OAuth + email magic-link, set admin email.
  Verify: sign-in page live di Clerk domain.
- **0.5** Env vars di Pages dashboard (8: CLERK_SECRET_KEY, DATABASE_URL, ALLOWED_EMAILS,
  ADMIN_EMAIL, R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) +
  binding `RAXEHUB_BUCKET` wrangler.toml (sudah ada). Verify:
  `wrangler pages deployment tail` jalan, no missing-env warning. NEVER set
  `RAXEHUB_TEST_MODE` di Pages (local-only, ARCH §2.2).
- **GATE 0:** `curl https://raxehub.pages.dev/api/health` → `{"status":"ok"}`.
  EXIT: health endpoint landing wajib sebelum Phase 2 mulihkan.

## Phase 1 — Backend Edge (Forge #2)

- **1.1** `functions/api/health.ts` — probe Neon reachable. Test: curl 200.
- **1.2** Clerk session verify middleware (`@clerk/backend`), whitelist email
  check (env). Test: request tanpa session → 401 `E-AUTH`; email asing → 403 `E-WHITELIST`.
- **1.3** `GET /api/apps`, `GET /api/apps/:slug` (Neon serverless driver, SQL murni,
  no ORM). Test: seeded data → JSON match fixture.
- **1.4** `GET /api/download/:slug` (+ /:versionId) — presign via aws4fetch, ttl 900s,
  `response-content-disposition=attachment`. Test: curl `-I` → 302, Location di
  host `<accountid>.r2.cloudflarestorage.com`, expiry param = 900. Presign URL > 15 menit → 403 (verifikasi manual).
- **1.5** `POST /api/admin/*` — presign PUT, insert rows, PATCH metadata.
  Idempotency: re-presign same fileName = URL baru, no duplikat row.
  Test: admin upload flow end-to-end di `wrangler pages dev` local, row DB muncul,
  R2 object ada (local r2 binding / miniflare).
- **GATE 1:** unit probe script `test-api.sh` lokal exit 0 untuk semua route +
  response shape sesuai ARCHITECTURE §2.

## Phase 2 — Frontend Statik (Forge #2)

- **GATE UI:** tunggu **DESIGN.md final + preview PNG** dari Artisan (Topic #542).
  STOP kalau belum landing.
- **2.0** Root shell: hero banner + grid katalog + skeleton loading (cache fallback
  Neon cold start). Konsumsi `/api/apps` client-side.
- **2.1** Nav 3 tab + landing page (F8): `/` (landing animated) → `/apk` → `/web`
  (route detail `/app/:slug` shared). Landing hero animasi mark native CSS,
  reduced-motion fallback.
- **2.2** Detail page `/app/:slug` — gallery, changelog, SHA256 display + copy,
  info-box unknown-apps, dropdown versi lama.
- **2.3** Download button wiring → `GET /api/download/:slug` (browser ikuti 302,
  no new tab).
- **2.4** Clerk JS SDK + protected layout, halaman reject E-WHITELIST on-brand.
- **2.5** `/admin` — form + chunked SHA256 client-side (`crypto.subtle`) + presign
  PUT upload progress. Reject > 80 MB di form sebelum hashing.
- **2.6** Secret audit: `grep -rEn '(sk_|secret|password|BEGIN.{0,8}KEY)' public/` →
  harus 0 hit (wrangler.toml `pages_build_output_dir=public/`, bukan dist/).
- **GATE 2:** A1–A7 acceptance test manual di browser (PROD URL), screenshot bukti
  tiap AC. A4 SHA256 download file == DB (`shasum -a 256 file`).

## Phase 3 — Penyemaian Data + UX Lifecycle (Vanguard #27 / DIY Raxe)

> Jalankan via `RUNBOOK-PHASE3.md` — upload APK rilis pertama (gps-tracker signed
> release) + smoke test download/install di A21s. 15 menit.

- **3.1** Upload **KROMA v14.0.1** (versionCode 155) APK rilis signed —
  `D:/default project/kroma/androidApp/build/outputs/apk/release/androidApp-release.apk`
  (verified: 15.5 MB, APK Sig Block v2/v3).
  Verify: katalog root tampil + tombol Download functional. v1.2: katalog KROMA +
  Tabungku + GPS Tracker semua Rilis (F6 coming-soon DROPPED); seed row DB sesuai.
- **3.2** Test install di A21s: download → install unknown apps → jalan. Screenshot bukti.
- **GATE 3:** A4 + A5 + install-on-device PASS, lampirkan screenshot + `shasum` diff.

## Phase 4 — QA & Audit

- **4.1** Inspector #5501: black-box responsive QA @ 360px + 1080p, semua flow.
- **4.2** Arbiter #419: 5-pillar review (PRD §6), secret audit, API contract audit.
- **GATE 4:** verdict PASS, Gate Status table diappend section bawah.

---

## Routing (Dispatch Matrix)

| Phase | Target | Mekanisme |
|---|---|---|
| 0 (infra cloud) | Vanguard #27 | dispatch_task(target=vanguard) — Raxe yang pegang control panel, Vanguard bikin runbook |
| 1 (backend edge) | Forge #2 | dispatch_task(target=forge) — pure logic, zero visual |
| 2 (frontend) | Forge #2 | dispatch setelah DESIGN.md landing |
| 3 (seeding) | Vanguard #27 | runtime ops |
| 4.1 | Inspector #5501 | QA visual/responsive |
| 4.2 | Arbiter #419 | review gate |
| Antrian | Orcas #11662 | registrasi task ID |

**Artisan #542 dispatch (FLEKSIBEL — sebelum Phase 2):** 3 konsep hero banner + library
grid sesuai DESIGN_BRIEF.md. Artisan gak boleh author code / sentuh `functions/`, `pages/`.
Setelah Raxe pilih konsep, Artisan finalize DESIGN.md + asset PNG, Forge baru lanjut Phase 2.

## Verification Gates Summary (Exit 0 != Done)

| Gate | Bukti |
|---|---|
| GATE 0 | curl /api/health → 200 JSON on prod URL |
| GATE 1 | test-api.sh exit 0, response shape match contract |
| GATE 2 | A1–A7 manual test screenshot; shasum diff == 0 |
| GATE 3 | install sukses di A21s, APK jalan |
| GATE 4 | Inspector + Arbiter verdict PASS |

## Known Risk (Watch)

- **Clerk JWT real path belum teruji** — GATE 1 cuma mode lokal. Klaim email di token
  (`claims.email`) wajib dicek Phase 0.4/2; kalau kosong, whitelist fail-closed ngeblok
  semua user. Mitigasi: Clerk session claims template ato Backend API lookup via secret.

- Neon cold start UX (PRD §8.3) — skeleton + swr cache, monitor first-hit latency.
- Clerk magic-link di some mail client bisa_delay; Google OAuth = primary path.
- R2 free 10 GB — purge versi lama otomatis belum di-scope (v1.1 feature).

## Gate Status

| Gate | Status | Bukti |
|---|---|---|
| GATE 0 | ✅ PASS PROD | 2026-11-23 01:21: `/api/health` 200 `{status,neon,r2,clerk:ok}` CF-RAY a5e9f3c50d42a2a7-CGK; `/` 200 anonim; `/api/apps` 200 5 row; `/api/admin` unauth 401. Commit aadbc16 |
| GATE 1 | ✅ PASS PROD | Hotfix TSK-20261123-013807: Clerk loader resmi (PK via Worker `/config`, 0 hit pk/cdn.clerk.io), `/admin` gate DOM hidden + middleware 302, schema.sql sync 8 field, seed copy §9.5 5/5. Oracle verify all |
| GATE 2 | ✅ PASS LOKAL (prod nunggu push) | Round 2 TSK-20261123-020352: 3 ikon + 4 preview aset wired (`iconHtml`/`previewHtml`), CTA Buka karya, audit `masuk\|login\|keluar\|tanpa login` 0, secret 0, copy lock 10/10, nav anonim 3-tab. Bundle 23 file |
| GATE 2 QA | ✅ PASS PROD | 2026-11-23 Vanguard: A1 health 200, A2 login-text 0, A3 ikon 512 + A3b preview real, A4 kroma 302 attachment, A5 admin hidden + 401/403 fail-closed, A6 presign expired 403, A7 AAA 7.84:1, A8 scrollWidth 360. CF-RAY a5eb7047b99d0a12-CGK. Oracle re-probe: health ok, /apk 200, /admin noindex, /api/download/kroma 302, latestVersion 1.0 |
| NEON+PUSH | ✅ DONE | Neon schema 3 table + 5 seed row live. Push Round 2 c4b1800, Round 3 85c39b5, Clerk v6 f9c9fba, 59a9851 → origin/main live. `/api/apps` 5 row type field OK |
| GATE 3 | ✅ UPLOAD PASS | KROMA v1.0 live: R2 `apps/KROMA/KROMA-v1.0-release-1.0.apk` (15,499,843 byte), `/api/download/kroma` 302 attachment CF-RAY a5ebcf20ff83c5f0, SHA256 `5581e003…1324`, versionName 1.0 vc 155. Commit 59a9851 (Clerk v6 + R2 CORS + logo fix + Tampilan wired). Tabungku & GPS upload = berikutnya |
| GATE 3b | ✅ LOKAL | Screen pack 9 slot (kroma, tabungku, gps-tracker ×3) wired `STATIC_SHOTS` DB prioritas. Puppeteer 360/1080 9/9 render, hash match. Microupdate Tabungku (msg 14458). **Unpushed — nunggu Vanguard Round 4** |
| GATE 4 | ⏳ | Upload Tabungku + GPS APK → install A21s → shasum match → launch |
