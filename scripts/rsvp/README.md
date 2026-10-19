# RSVP terpusat

Alur: formulir → `/weddingsamuelledy/api/rsvp` pada Cloudflare Worker → Apps Script → tab `RSVP` pada planner privat.

Browser hanya menerima jawaban miliknya. Tidak tersedia endpoint daftar tamu publik. URL Apps Script dan shared secret disimpan sebagai Worker secrets `RSVP_WEBHOOK_URL` dan `RSVP_SECRET`; ID spreadsheet dan secret penerima berada di Script Properties atau konfigurasi privat Apps Script. Jangan memasukkannya ke Git atau aset situs.

Sumber Apps Script: `google-apps-script/Code.gs`. Manifest contoh: `scripts/rsvp/appsscript.json`. Jalankan `authorizeRsvp` sebagai pemilik dan tinjau izin Sheets sebelum mengaktifkan web app. Deployment web app memakai identitas pemilik; akses endpoint dilindungi shared secret yang dikirim Worker, bukan browser.

Tab RSVP mempunyai kolom: waktu diperbarui, nama, kehadiran, jumlah tamu, ucapan, key respons, nama pada kiriman, waktu dibuat, sumber. Kolom key dipakai untuk memperbarui baris. Pertahankan urutan kolom; jangan memindahkan atau menimpa key secara manual. Rekap jawaban dan jumlah orang ditampilkan terpisah.

Kirim ulang memperbarui satu respons dari browser/cookie yang sama. Menghapus cookie atau memakai perangkat lain menghasilkan respons baru; cocokkan nama di Sheets sebelum mengunci jumlah final. Ini bukan autentikasi atau penggabungan lintas perangkat. Tamu pada browser bersama menggunakan respons yang sama. Batas formulir dipertahankan 1–2 orang; ucapan opsional. Perubahan batas perlu disamakan pada HTML, Worker, Apps Script dan tes.

Respons baru hanya ditampilkan sebagai tersimpan setelah server mengonfirmasi. Jika gagal, isian dipertahankan untuk dicoba lagi. Riwayat lokal lama tetap diberi label “perangkat ini”; bukan bukti jawaban diterima server. Halaman admin lama adalah riwayat perangkat, bukan rekap seluruh tamu. Daftar Tamu pada planner tidak otomatis ditimpa karena kelompok/namanya perlu dicocokkan dahulu.

Tes: `node --test scripts/rsvp/rsvp.test.mjs`. Pengujian langsung memakai identitas uji yang jelas dan dibersihkan dari Sheets sesudah pemeriksaan; jangan mengirim RSVP atas nama tamu asli.

Deploy dari versi remote terbaru, pertahankan route domain dan aset halaman lain, lalu cek simpan/baca/ubah melalui situs dan cocokkan baris di Sheets. Jangan men-deploy checkout lama yang memiliki perubahan undangan lokal yang belum dimaksudkan untuk tayang.
