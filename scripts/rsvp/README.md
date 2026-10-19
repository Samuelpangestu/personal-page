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

Formulir menampilkan nama, ucapan dan doa opsional, pilihan hadir/berhalangan, lalu jumlah orang. Satu tombol “Simpan konfirmasi” menyimpan semuanya; ucapan kosong tetap valid. Nama dari link undangan diprioritaskan terhadap nama respons lama ketika halaman dimuat, tetapi tamu dapat mengeditnya. Status tersimpan dan jumlah orang ditampilkan dalam satu baris setelah konfirmasi server; pilihan dan isian dipulihkan setelah reload tanpa menimpa perubahan yang sudah diketik saat pemuatan. Waktu pada bubble ucapan berada di baris sendiri agar label riwayat perangkat tidak menutupi teks.

Design Read: mempertahankan percakapan WhatsApp iOS yang sudah ada. Focal point satu tombol simpan konfirmasi, dengan ucapan terlihat langsung di bawah nama sesuai permintaan pengguna. ENERGY 1 / RHYTHM 2 / MOTION 2; bubble muncul ringan saat masuk layar (lihat AGENTS.md). Label, jumlah termasuk diri sendiri dan satu status singkat mempunyai fungsi informasi. Waktu simpan tetap tersedia di Sheets. Tidak menampilkan angka suara dekoratif sebagai statistik tamu.

## Link tamu tetap

`?guest=<32 karakter hex acak>` mengambil nama terkini dari tab Tamu pada
setiap permintaan dokumen, termasuk reload. Worker membaca melalui action
`guest` Apps Script yang dilindungi secret yang sama, lalu menambahkan nama
sebagai atribut HTML melalui HTMLRewriter. Daftar tamu tidak dikirim ke browser.
Halaman personal memakai `private, no-store`; saat lookup gagal, halaman
meminta tamu mencoba lagi, tanpa memakai nama lama atau nama dari query lain.

Tab Tamu: B = nama, K = link per baris, L = ID literal tersembunyi. Baris
6–1000 sudah mempunyai ID unik dan rumus, termasuk baris kosong. Isi nama pada
baris kosong untuk tamu baru, koreksi nama pada baris yang sama untuk tamu lama.
Gunakan filter A:M saat mengurutkan. Jangan pakai ulang ID tamu yang dihapus
untuk orang berbeda. Jika kapasitas diperluas, buat ID acak baru untuk baris
baru, jangan menyalin ID lama. Link `?to=` yang telanjur dikirim tetap bekerja
sebagai nama tetap; bagikan link `?guest=` untuk perubahan nama otomatis.

RSVP dan jumlah pendamping tidak berubah oleh fitur ini.

## Jenis undangan per tamu

Kolom M tab Tamu ("Diundang ke") menentukan kartu acara: Gereja, Resepsi,
atau Gereja & Resepsi; kosong = Gereja. Action `guest` mengembalikan
`events` (`gereja`/`resepsi`/`semua`), lalu Worker menghapus kartu yang tidak
berlaku dari HTML. Apps Script lama tanpa `events` dan link tanpa `?guest=`
tetap aman: hanya Gereja. Setelah mengubah `Code.gs`, deploy versi baru web
app agar kolom M terbaca.
