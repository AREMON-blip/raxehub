-- RaxeHub seed katalog — jalan SETELAH schema.sql.
-- Lock copy: PRD.md §9.5 (2026-11-23). Idempoten: aman dijalankan ulang di Neon prod.
-- Katalog rilis DESIGN.md v1.2.1: 3 APK + 2 Web, AVS/coming-soon tidak di-seed.

INSERT INTO apps (slug, name, tagline, description, status, type, live_url, repo_url, stack, sort)
VALUES
  ('kroma', 'KROMA',
   'Pemutar musik lokal, tanpa akun',
   'Pemutar musik buat berkas audio lokal di HP. Susun antrian sendiri, pasang sleep timer, putar offline. Gak ada akun, gak ada iklan, gak ngumpulin data.',
   'released', 'apk', NULL, NULL, NULL, 10),
  ('tabungku', 'Tabungku',
   'Tabungan dengan tujuan',
   'Satu tujuan, satu tabungan. Bikin target, catat setoran, sisa target kelihatan langsung di layar utama. Semua data disimpan di HP, gak ada cloud.',
   'released', 'apk', NULL, NULL, NULL, 20),
  ('gps-tracker', 'GPS Tracker',
   'Catat jejak perjalanan HP',
   'Lacak posisi HP otomatis: rute harian, jarak tempuh, riwayat bisa diputar ulang. Data 100% lokal, tanpa server, tanpa orang lain yang bisa lihat.',
   'released', 'apk', NULL, NULL, NULL, 30),
  ('tahun-baru-countdown', 'Tahun Baru Countdown',
   'Hitung mundur tahun baru',
   'Angka live tersinkron lewat Firebase — semua yang buka lihat hitungan yang sama persis. Dipakai buat countdown bareng grup.',
   'released', 'web', 'https://tahun-baru-countdown-eosin.vercel.app/', NULL, 'Next.js, Firebase, Vercel', 10),
  ('crypto-blog', 'Crypto Blog',
   'Catatan tulisan crypto',
   'Kumpulan analisis dan catatan teknis crypto yang gw pelajari. Bukan sinyal trading, bukan ajakan beli apa pun.',
   'released', 'web', 'https://crypto-blog-ten.vercel.app/beranda', NULL, 'Next.js 16, Vercel', 20)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  type = EXCLUDED.type,
  live_url = EXCLUDED.live_url,
  repo_url = EXCLUDED.repo_url,
  stack = EXCLUDED.stack,
  sort = EXCLUDED.sort;

-- Versi: diisi PAS admin upload APK pertama via /admin (F5).
-- Row versions TIDAK di-seed manual — presign flow yang insert
-- (apk_key, size_bytes, sha256 harus cocok file real yang diupload).
