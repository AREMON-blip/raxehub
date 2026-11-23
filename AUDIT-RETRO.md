# Audit Retroaktif — 11 commit (a388612..0fc8317)

Tanggal: 2026-11-23 · Auditor: Oracle (opsi A, baca diff, no reset)

## Lingkup

| # | Commit | Ringkas |
|---|---|---|
| 1 | aadbc16 | Phase 2 public-anonymous: admin-only auth, R2 canonical host, SEO |
| 2 | c4b1800 | Round 2: DESIGN v1.3.1 ikon, web preview, PRD 9.5 copy, /admin 302 |
| 3 | 85c39b5 | Round 3: A4 uuid::text, A7 AAA #ADADAF, A2 home, A5 Clerk PK |
| 4 | 033f904 | /admin redirect Account Portal |
| 5 | b50b7b4 | Clerk SignIn inline mount |
| 6 | e4cd502 | clerk-js CDN @5 → @6 |
| 7 | dea4a26 | Clerk v6 headless Dev Browser handshake |
| 8 | f9c9fba | @clerk/ui@1 bundle + ctor |
| 9 | 59a9851 | Logo KROMA resmi + screenshot upload wire |
| 10 | 66e928c | Round 4: 9 slot STATIC_SHOTS |
| 11 | 0fc8317 | Round 5: F-DISABLE tombol unduh |

## 1. Reliability & Fault Tolerance — PASS

- `/api/admin/*` fail-closed: `authenticate` → 401, `isAdmin` → 403. Middleware `startsWith('/api/admin')` eksplisit, default `ctx.next()` publik (aman: katalog memang publik pas pivot).
- `verifyToken` di-guard `if (!env.CLERK_SECRET_KEY) return null` → secret hilang = tolak, bukan leak.
- Presign GET expired `X-Amz-Expires=900` (A6 403 ExpiredRequest terverifikasi prod).
- R2 key sanitize: `part.replace(/[^a-zA-Z0-9._-]+/g, '-')` + slice 120 — printable-only, no traversal.

## 2. Security & Zero-Trust — PASS (1 note)

- Secret scan diff: hanya `pk_test_…` (publishable, public by design, test mode). `sk_live` / `DATABASE_URL` literal / `ACCOUNT_TOKEN` = 0 hit di kode.
- `.gitignore` cover `.dev.vars`, `.env`, `.env.*`, `graphify-out/`. `git ls-files` = 0 file env.
- Whitelist (`E-WHITELIST`, `ALLOWED_EMAILS`) hapus total; `isAdmin` match tunggal `ADMIN_EMAIL` (casefold).
- **NOTE-1 (Low, accepted):** `authenticate` punya bypass `RAXEHUB_TEST_MODE === '1' && !CLERK_SECRET_KEY` → token `test:<email>` dianggap identity. Guard-nya AND (kedua kondisi), andal hanya kalau Pages env `RAXEHUB_TEST_MODE` diset `1` dan secret sengaja dihapus. **Verifikasi konfigurasi Pages: `RAXEHUB_TEST_MODE` tidak ter-set (atau `0`) di prod.** Kalau tidak diset sama sekali = aman.

## 3. Deterministic Observability — PASS

- E2E CF-RAY tertangkap setiap gate (a5e9f3… sampai a5ec94…, CGK edge).
- `test-api.mjs` assertion host R2 kanonik + disposition + (round 4) 9 screenshot.
- `gate2/*.txt` shasum bukti; Puppeteer 360/1080.
- Exit code: `typecheck exit 0`, `node --check PASS`, `test-api.sh PASS` direkap tiap commit.

## 4. YAGNI & Ladder — PASS

- 5 commit Clerk (033f904 → f9c9fba) = iterasi fix chaining, bukan over-abstraction. Masing-masing 1-2 file, `shared.js` doang. Acceptable — Clerk v6 + Dev Browser emang breaking, step-ladder fix wajar.
- Static fallback `STATIC_SHOTS` dibanding DB row prioritas — pola merge `[...db, ...static]`, DB menang: tepat, no double source of truth untuk content.
- F-DISABLE 3 titik diff kecil, token eksisting, no new abstraction.

## 5. Failure Modes — PASS

| Failure | Behavior |
|---|---|
| Neon down | health probe `neon` field, `/api/apps` anonim → frontend seed fallback |
| R2 down/expired | presign 900s, 403 ExpiredRequest (A6 verified) |
| Clerk down | `/api/admin/*` 401 (secret wajib), admin shell tersembunyi |
| Repo lumayan climb | 12 commit git, `git log` clean, no force-push |

## Catatan

- audit cara A (baca diff inline). Tidak ada reset, tidak ada commit/push oleh Oracle.
- Opsi B/C di-drop (biaya reset / scope Inspector Phase 4) — audit inline sudah cover security + observability.
- **NOTE-1 (CLOSED 2026-11-23, runtime proof):** prod probe `Authorization: Bearer *** → 401 `{"error":"missing or invalid session","code":"E-AUTH"}`. Bypass test-mode pasti nonaktif (`RAXEHUB_TEST_MODE` unset/0 di Pages env). Wrangler non-interactive butuh `CLOUDFLARE_API_TOKEN` — tidak dipakai karena runtime probe sudah decisive.
