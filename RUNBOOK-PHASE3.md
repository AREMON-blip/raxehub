# RUNBOOK Phase 3 — Seeding APK Pertama + Smoke Test HP

**Prasyarat:** Phase 0 infra ✅, Phase 2 frontend merge ✅, domain live.
**Eksekusi:** Raxe (browser HP/desktop), 15 menit.

---

## 1. Login circle pertama

1. Buka `https://raxehub.pages.dev` → Masuk (Google / magic-link)
2. Email whitelist → Library terbuka, katalog seed: 3 APK + 2 Web
3. **Verify home:** hero mark RAXE, section "Tentang" (teks lock), 3 tile rilis
   (KROMA, Tabungku, GPS Tracker), 2 kartu Web. Screenshot dapet bukti A3.

## 2. Upload APK rilis pertama (KROMA)

1. Siapkan **signed release APK**:
   `D:/unduhan/KROMA-v1.0-release.apk`
   — verified: 14.7 MB (15,499,843 byte), APK Sig Block v2/v3 present,
   nama file = label rilis `KROMA-v1.0-release`.
2. Buka `/admin` (direct URL) → login Clerk (admin email) → pilih app **KROMA**:
   - versionName: `1.0` (rilis publik pertama)
   - versionCode: `155`
   - releaseNotes: changelog singkat (cek `kroma/` CHANGELOG bila ada)
3. Pilih file APK → browser hash SHA-256 client-side (progress bar) →
   PUT presigned ke R2 → metadata insert Neon otomatis
4. **Verify:** detail KROMA sekarang muncul versi + tombol Download aktif

## 2b. Upload lanjutan (Tabungku + GPS Tracker)

**Tabungku** (`D:/unduhan/tabungku-v3.0.0-arm64-vc13.apk`, 19,316,456 B, sig v2/v3):
- versionName `0.3` (rename publik Raxe), versionCode `13`. Splits: arm64 (A21s arm64 — OK; note arm-only)
**GPS Tracker** (`D:/unduhan/gpstracker-v2.0.6-release.apk`, 8,412,843 B, sig v2/v3):
- versionName `0.26` (rename publik Raxe), versionCode `14`
Flow sama: `/admin` → pilih app → isi → upload → verify detail page versi + Download aktif.

## 3. Smoke test download (A4)

1. Klik Download di detail KROMA (anonim)
2. Response harus **302 redirect otomatis** — browser mulai download file, no new tab
3. Setelah download: `shasum -a 256 <file.apk>` di terminal / HP
4. **Verify:** SHA256 file == nilai di detail page == DB (MATCH = A4 PASS)

## 4. Install test di A21s

1. Buka file APK → Android warning "unknown apps" → Settings → allow
2. Install → jalanin app
3. **Verify:** app launch normal, gak crash (A3 install-on-device PASS)
4. Screenshot bukti: APK jalan di home screen A21s

## 5. Presign expiry test (A6)

1. Download → copy presigned URL dari network tab (`Location` header)
2. Tunggu **16 menit** → paste URL lagi di browser
3. **Verify:** 403 / expired (URL expired, fail-close)
4. Klik Download lagi → URL baru, download jalan normal

## 6. Rekap gate

| Gate | Bukti | Status |
|---|---|---|
| A3 | katalog + login + tile (screenshot) | PENDING |
| A4 | shasum match file vs page | PENDING |
| A5 | upload admin → versi muncul | PENDING |
| A6 | presign expired → 403 | PENDING |
| Install A21s | screenshot app jalan | PENDING |

## Troubleshoot

- **Upload gagal PUT** → cek R2 token punya Object Read & Write; cek bucket region
- **SHA mismatch** → re-upload; jangan manual-fix DB (integrity invariant)
- **Download streaming** → pastikan `response-content-disposition=attachment`
  di presign param (ARCHITECTURE.md §2). Inline = browser liat APK, bukan download
- **404 setelah presign** → object key mismatch (slug/version penamaan), cek row `apk_key`
