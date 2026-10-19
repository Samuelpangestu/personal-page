# RSVP terpusat

Alur: formulir → `/weddingsamuelledy/api/rsvp` pada Cloudflare Worker → Apps Script → tab `RSVP` pada planner pasangan.

Browser hanya menerima jawaban miliknya. Tidak tersedia endpoint daftar tamu publik. URL Apps Script dan shared secret disimpan sebagai Worker secrets `RSVP_WEBHOOK_URL` dan `RSVP_SECRET`; ID spreadsheet dan secret penerima berada di Script Properties atau konfigurasi privat Apps Script. Jangan memasukkannya ke Git atau aset situs.

Sumber Apps Script: `google-apps-script/Code.gs`. Manifest contoh: `scripts/rsvp/appsscript.json`. Jalankan `authorizeRsvp` sebagai pemilik dan tinjau izin Sheets sebelum mengaktifkan web app. Deployment web app memakai identitas pemilik; akses endpoint dilindungi shared secret yang dikirim Worker, bukan browser.

Tab RSVP mempunyai kolom: waktu diperbarui, nama, kehadiran, jumlah tamu, ucapan, key respons, nama pada kiriman, waktu dibuat, sumber. Kolom key dipakai untuk memperbarui baris. Pertahankan urutan kolom; jangan memindahkan atau menimpa key secara manual. Rekap jawaban dan jumlah orang ditampilkan terpisah.

Kirim ulang memperbarui satu respons dari browser/cookie yang sama. Menghapus cookie atau memakai perangkat lain menghasilkan respons baru; cocokkan nama di Sheets sebelum mengunci jumlah final. Ini bukan autentikasi atau penggabungan lintas perangkat. Tamu pada browser bersama menggunakan respons yang sama. Batas formulir dipertahankan 1–2 orang; ucapan opsional. Perubahan batas perlu disamakan pada HTML, Worker, Apps Script dan tes.

Respons baru hanya ditampilkan sebagai tersimpan setelah server mengonfirmasi. Jika gagal, isian dipertahankan untuk dicoba lagi. Riwayat lokal lama tetap diberi label “perangkat ini”; bukan bukti jawaban diterima server. Halaman admin lama adalah riwayat perangkat, bukan rekap seluruh tamu. Daftar Tamu pada planner tidak otomatis ditimpa karena kelompok/namanya perlu dicocokkan dahulu.

Tes: `node --test scripts/rsvp/rsvp.test.mjs`. Pengujian langsung memakai identitas uji yang jelas dan dibersihkan dari Sheets sesudah pemeriksaan; jangan mengirim RSVP atas nama tamu asli.

Deploy dari versi remote terbaru, pertahankan route domain dan aset halaman lain, lalu cek simpan/baca/ubah melalui situs dan cocokkan baris di Sheets. Jangan men-deploy checkout lama yang memiliki perubahan undangan lokal yang belum dimaksudkan untuk tayang.

Akses ke data Sheets mengikuti pengaturan berbagi planner. Endpoint website tidak menyediakan daftar tamu, tetapi itu tidak membatasi orang yang sudah dapat membuka spreadsheet. Pastikan berbagi Drive sesuai penerima yang dikehendaki sebelum mengumpulkan data tamu.

## Kehadiran tanpa ucapan

Formulir mendahulukan nama, pilihan hadir/berhalangan, dan jumlah orang. Tombol “Simpan kehadiran” bekerja meskipun bagian ucapan tidak pernah dibuka. Bagian ucapan menggunakan disclosure native dan bisa ditambahkan kemudian pada respons yang sama. Status tersimpan dan jumlah orang ditampilkan dalam satu baris setelah konfirmasi server; waktu simpan tetap tercatat di Sheets; pilihan dan isian dipulihkan setelah reload tanpa menimpa perubahan yang sudah diketik saat pemuatan.

Design Read: mempertahankan percakapan WhatsApp iOS yang sudah ada. Focal point satu tombol simpan kehadiran; ucapan memakai disclosure agar konfirmasi cepat. ENERGY 1 / RHYTHM 2 / MOTION 1; tidak menambah animasi. Label, tenggat, jumlah termasuk diri sendiri dan satu status singkat mempunyai fungsi informasi. Petunjuk berulang, waktu simpan di UI, serta bubble kehadiran tanpa ucapan dihilangkan sesuai preferensi pengguna; waktu tetap tersedia di Sheets. Tidak menampilkan angka suara dekoratif sebagai statistik tamu.
