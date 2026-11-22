# RUNBOOK Phase 0 — RaxeHub Infra Setup

**Eksekusi:** Raxe sendiri (Vanguard #27 dialihkan — topic 27 eksternal).
**Estimasi:** 20-30 menit. Semua free tier. Zero biaya.

---

## 0. Pra-syarat

- Akun Cloudflare (daftar `dash.cloudflare.com` — gratis)
- Akun GitHub (sudah punya)
- Email buat Clerk/Neon (boleh email pribadi)
- **Repo GitHub** `raxehub` (push kode Forge hasilnya ke sini dulu, atau public nanti)

## 1. Cloudflare Pages (10 mnt)

1. `dash.cloudflare.com` → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pilih repo `raxehub`, framework = `None` (static + Pages Functions), build output = `dist` atau `public` ( Forge tentukan pas wiring)
3. Project name: **`raxehub`** → domain jadi `raxehub.pages.dev` ✅
4. Deploy pertama = repo apa adanya, nanti Forge re-deploy otomatis tiap push

**Verify:** buka `https://raxehub.pages.dev` → loading/pl, 200 OK (bukan 404)

## 2. Cloudflare R2 (5 mnt)

1.Dashboard → **R2 Object Storage** → enable (butuh card? **TIDAK** — free tier 10 GB gak butuh kartu, 2026-11-22)
2. **Create bucket**: name = **`raxehub-apk`**, location = **APAC (Singapore)**
3. Bucket → **Settings** → Public access = **OFF** (private, presigned only) ✅

**Verify:** bucket muncul di list, "Public access: Disabled"

## 3. Neon Postgres (5 mnt)

1. `console.neon.tech` → sign up (GitHub/Google)
2. **Create project**: name `raxehub`, region `AWS Asia Southeast (Singapore)`
3. Copy **`DATABASE_URL`** (connection string) → simpan di password manager sementara
4. Buka **SQL Editor** → paste `schema.sql` (repo root) → **Run** → paste `seed.sql` → **Run**

**Verify:** SQL Editor → `\dt` muncul 3 table (apps, versions, screenshots). Query `SELECT slug,type FROM apps;` → 5 row (3 apk + 2 web)

## 4. Clerk Auth (10 mnt)

1. `dashboard.clerk.com` → **Add application** → name `raxehub`
2. Pilih sign-in methods: **Google** + **Email address** (magic link)
   - Google: butuh Google OAuth client — Clerk bikinin otomatis (klik "Set up" ikuti wizard)
3. **Users & Organizations** → manual invite email: email lu sendiri + circle (Denis, Dillah, Mirza, Sigit) — atau pakai allowlist approach (lihat §5)
4. API Keys → copy **Publishable key** (client) + **Secret key** (server)

**Verify:** sign-in page live di `https://raxehub.clerk.accounts.dev` (domain bawaan Clerk)

## 5. Env Vars di Pages (5 mnt)

Dashboard Pages project → **Settings** → **Environment variables** (Production + Preview) → add:

| Var | Isi | Dari |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Clerk API Keys |
| `CLERK_SECRET_KEY` | `sk_live_...` | Clerk API Keys |
| `DATABASE_URL` | `postgres://...` | Neon |
| `R2_ACCOUNT_ID` | account ID cloudflare | R2 sidebar |
| `R2_ACCESS_KEY_ID` | R2 API token | R2 → Manage R2 API Tokens (readonly + read/write object) |
| `R2_SECRET_ACCESS_KEY` | secret token | R2 API Tokens |
| `R2_BUCKET` | `raxehub-apk` | fix |
| `ADMIN_EMAIL` | email lu | whitelist admin |
| `ALLOWED_EMAILS` | `lo,denis,dillah,mirza,sigit` comma | whitelist circle |

Trigger redeploy (Pages → Deployments → redeploy) biar env dibaca.

**Verify:** `curl https://raxehub.pages.dev/api/health` → `{"status":"ok"}` (GATE 0 — butuh Forge backend udah wired, ini pas Phase 2 merge)

## 6. Setelah ini

- Forge Phase 2 merge → deploy → **GATE 0 health** real
- Phase 3: upload APK rilis pertama (gps-tracker signed release) via `/admin` → katalog live

## Troubleshoot

- **R2 create bucket minta CC** → free tier seharusnya gak. Coba region lain / clear cache, atau buat via CLI `wrangler r2 bucket create raxehub-apk --location apac`
- **Neon cold start first request lambat (~2s)** → normal, free tier scale-to-zero. Frontend udah ada skeleton fallback
- **Clerk magic-link gak nyampe email** → cek spam; alternatif Google login
- **Build Pages gagal "output dir gak ada"** → set build command `npm run build` (Forge sediain) atau fix output dir di Settings

## Security checklist

- [ ] R2 public access OFF
- [ ] CLERK_SECRET_KEY di Production env (bukan di kode)
- [ ] Neon DATABASE_URL gak diair di repo
- [ ] `grep -rE "(sk_|secret|password)" dist/` 0 hit (Forge GATE)
- [ ] Allowlist email backend enforced (Worker), bukan UI hide
