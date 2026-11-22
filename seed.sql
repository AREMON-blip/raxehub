-- RaxeHub seed katalog — jalan SETELAH schema.sql (.apps/versions/screenshots)
-- Lock: katalog rilis DESIGN.md v1.2.1 (2026-11-22). AVS dihapus, no coming-soon.

-- ============ APK ============
INSERT INTO apps (slug, name, tagline, description, status, type, sort)
VALUES
  ('kroma', 'KROMA', 'Player musik pribadi',
   'Putar berkas lokal di HP. Antrian, sleep timer, tanpa akun.',
   'released', 'apk', 10),
  ('tabungku', 'Tabungku', 'Tabungan berdasar tujuan',
   'Satu tujuan, satu tabungan. Catat setoran, lihat sisa target.',
   'released', 'apk', 20),
  ('gps-tracker', 'GPS Tracker', 'Pelacak lokasi',
   'Lacak posisi HP. Riwayat rute, tanpa toko.',
   'released', 'apk', 30);

-- Versi: diisi PAS admin upload APK pertama via /admin (F5).
-- Row versions TIDAK di-seed manual — presign flow yang insert
-- (apk_key, size_bytes, sha256 harus cocok file real yang diupload).

-- ============ WEB ============
INSERT INTO apps (slug, name, tagline, description, status, type, live_url, stack, sort)
VALUES
  ('tahun-baru-countdown', 'Tahun Baru Countdown', 'Callsign Radio',
   'Hitung mundur tahun baru. Angka live Firebase, bukan palsu.',
   'released', 'web',
   'https://tahun-baru-countdown-eosin.vercel.app/',
   'Next.js, Firebase', 10),
  ('crypto-blog', 'Crypto Blog', 'Catatan beranda',
   'Tulisan crypto di Vercel. Next 16. Bukan sinyal trading.',
   'released', 'web',
   'https://crypto-blog-ten.vercel.app/beranda',
   'Next.js 16, Vercel', 20);

UPDATE apps SET repo_url = NULL WHERE type = 'web';  -- repo kosong: Source disabled
