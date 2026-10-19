# AGENTS.md — Konteks untuk AI Agent Lain

## Konteks wedding planner Samuel & Ledy

Untuk tugas terkait persiapan pernikahan dan integrasi undangan, baca
[WEDDING_KNOWLEDGE.md](WEDDING_KNOWLEDGE.md). File tersebut merupakan versi publik;
angka, jadwal operasional, dan data keluarga harus dikonfirmasi dari sumber
privat yang diberikan pengguna. Jangan menambahkan data privat ke repo ini.

Repo ini berisi **website undangan pernikahan digital** (Raka & Kirana),
static site (HTML/CSS/JS, tanpa build step, tanpa backend).

Dibuat oleh sebuah sesi Claude Code yang berjalan di **environment sandbox
dengan network egress terbatas** — domain `withyou.id` (referensi desain
yang diminta owner repo untuk ditiru) **diblokir oleh proxy jaringan
environment tersebut** dan tidak bisa diakses dari sana. Jika kamu (agent
lain) sedang membaca file ini dan **punya akses internet ke `withyou.id`**,
inilah tugas yang dibutuhkan.

## Tujuan

Owner repo minta tampilan (layout, desain, fitur) situs ini dibuat semirip
mungkin dengan preview publik tema "whatsup" di:

```
https://www.withyou.id/preview/whatsup
```

Situs itu publik (tidak butuh login), jadi seharusnya bisa langsung diakses
kalau environment-mu tidak memblokirnya.

## Yang perlu kamu lakukan

1. **Buka dan jelajahi** `https://www.withyou.id/preview/whatsup` secara
   menyeluruh: scroll dari cover sampai section paling bawah, klik tombol
   "Buka Undangan" kalau ada gate pembuka, buka semua menu navigasi.
2. **Ekstrak detail konkret** (bukan kesimpulan umum), idealnya lewat
   DevTools / computed styles / View Source kalau tool-mu memungkinkan:
   - Urutan & nama section persis dari atas ke bawah.
   - Teks yang dipakai di tiap section (heading, label, quote, placeholder).
   - Struktur visual tiap komponen: bentuk cover (image/video/parallax),
     bentuk countdown, kartu mempelai, love story (timeline/carousel),
     galeri (grid/masonry/carousel), kartu acara (Akad/Resepsi terpisah
     atau tab).
   - Palet warna (kode hex, dari computed CSS kalau bisa).
   - Font (`font-family` heading vs body, cek juga request Google Fonts
     di tab Network).
   - Navigasi: bottom nav / sidebar / hamburger, isinya apa saja.
   - Fitur interaktif: tombol musik, share/copy link, RSVP, ucapan,
     amplop digital/kado, animasi scroll/reveal, loading screen.
   - **Dashboard/admin**: withyou.id adalah produk SaaS — biasanya ada
     dashboard pengelolaan undangan terpisah dari halaman preview (mis.
     `app.withyou.id` atau sejenis). Kalau kamu bisa lihat (dari landing
     page marketing mereka atau demo), catat fitur dashboard yang mereka
     tawarkan: kelola tamu, lihat RSVP masuk, statistik kehadiran, ganti
     tema, dsb.
   - Breakpoint responsif (mobile-first? ada versi desktop berbeda?).
3. **Tulis hasil temuanmu** ke file baru `REFERENCE_NOTES.md` di root repo
   ini (buat file itu, jangan overwrite file lain), terstruktur per poin
   di atas, sekonkret mungkin (warna hex, ukuran, urutan elemen). Kalau
   memungkinkan, sertakan cuplikan HTML/CSS relevan.
4. Kalau kamu **juga diminta mengimplementasikan** perubahannya (bukan cuma
   riset), file yang relevan untuk diedit ada di bawah — lihat bagian
   "Struktur Repo" & "Batasan Desain" sebelum mengubah apa pun.

## Struktur Repo

```
weddingsamuelledy/index.html  # Halaman undangan utama (single-page, mobile-first)
admin.html        # Dashboard panitia sederhana (password gate)
css/style.css     # Style undangan utama (design tokens di :root)
css/admin.css     # Style dashboard
js/script.js      # Interaksi undangan: countdown, RSVP, lightbox, dst
js/admin.js       # Logic dashboard: baca localStorage, stats, CSV export
assets/           # Taruh foto asli / music.m4a di sini
```

Design tokens (warna, font) ada di `:root` pada `css/style.css` — ubah di
situ dulu kalau mau ganti palet warna/font secara global, jangan hardcode
warna baru di tempat lain.

## Batasan & Keputusan yang Sudah Diambil

- **Tanpa backend/build step** — semua static, sengaja begitu (owner repo
  belum mau full SaaS multi-tenant dengan login/database). Jangan
  tambahkan dependency npm/build tool tanpa izin eksplisit.
- **Dashboard RSVP** sengaja pakai `localStorage` (per-browser, bukan
  terpusat). Ada hook opsional `window.RSVP_WEBHOOK_URL` di `index.html`
  untuk forward submission RSVP ke Google Apps Script/Sheets kalau mau
  data terpusat lintas perangkat — jangan bangun backend custom untuk ini
  kecuali owner minta.
- **Jangan meniru aset berhak cipta secara identik** (logo, foto asli,
  copy marketing withyou.id) — tiru *pola desain* (layout, warna, tipe
  komponen, alur fitur), bukan konten proprietary mereka kata demi kata.
- Konten saat ini (nama "Raka & Kirana", tanggal, alamat, dsb) adalah
  **data contoh/placeholder** — beri tahu owner repo kalau kamu mengganti
  data ini dengan sesuatu yang lain.

## Komunikasi Balik ke Owner / Agent Berikutnya

- Commit dengan pesan jelas per perubahan, jangan campur "riset" dan
  "implementasi" dalam satu commit kalau bisa dipisah.
- Kalau kamu hanya riset (langkah 1–3 di atas), **jangan langsung ubah
  `index.html`/CSS/JS** — cukup tulis `REFERENCE_NOTES.md`, biar agent
  berikutnya (atau owner) yang menyesuaikan implementasi berdasarkan
  temuanmu.
- Update file ini (`AGENTS.md`) kalau ada keputusan/batasan baru yang
  perlu diketahui agent berikutnya.

## Keputusan fidelity WhatsApp iOS (2026-09-28)

- Sumber kebenaran visual: screenshot WhatsApp iOS dark dari owner (iPhone
  393pt). Ukuran di `css/style.css` diberi komentar pt dari screenshot itu
  (header 44+10 di bawah safe-area, pinned 52, composer 48 + safe-area,
  bubble radius 18, lebar media 290, avatar 28, input 30, tombol aksi 32).
- Tidak ada Google Fonts lagi: pakai font sistem (SF Pro di iPhone).
- Dokumen tidak pernah scroll (`body{position:fixed}`); hanya `.chat-feed`.
  JS menyalin `visualViewport` ke `--app-h`/`--app-top` supaya header &
  composer tidak terdorong saat toolbar Safari / keyboard berubah.
- Pengelompokan pesan dihitung JS (`groupMessages`): nama pengirim di bubble
  pertama satu run, avatar + tail di bubble terakhir. Jangan tulis `.sender`
  manual di HTML.
- Ucapan yang dikirim tamu dirender sebagai pesan keluar (hijau, centang
  biru) karena localStorage per-perangkat = tulisan tamu itu sendiri.
- Musik hanya mulai dari gesture pembuka (swipe/tap notifikasi), tanpa
  atribut `autoplay`.
- Tidak ada animasi reveal per section; motion hanya untuk perpindahan state
  (unlock, pinned berganti, panel info, highlight setelah lompat pinned).

## RSVP terpusat (19 Oktober 2026)

- Pengguna meminta implementasi dan pengujian RSVP ke Google Sheets. Ini
  menggantikan hook browser opsional di atas: `worker.js` menjadi proxy
  khusus `/weddingsamuelledy/api/rsvp`; halaman lain tetap static.
- `js/rsvp.js` menerima konfirmasi server sebelum menampilkan sukses.
  Apps Script menulis ke tab RSVP, memperbarui respons dengan key yang sama,
  dan mempertahankan data Tamu yang disusun manual.
- Pengulangan dari cookie/browser yang sama memperbarui satu baris. Ini
  bukan autentikasi tamu: perangkat/domain berbeda atau cookie hilang perlu
  rekonsiliasi nama oleh pemilik. Batas jumlah tamu tetap dua orang.
- Rahasia Worker dan ID spreadsheet tidak boleh ditulis ke file publik.
  Detail setup dan tes: `scripts/rsvp/README.md`. Kredensial deployment
  berada di luar repo. Jangan menimpa Worker dengan deploy static lama.
- Admin lama hanya riwayat browser. Rekap terpusat dilihat pada tab RSVP
  mengikuti pengaturan berbagi planner; jangan menambahkan endpoint publik yang membocorkan daftar tamu.

### Kehadiran tanpa ucapan

- Nama, pilihan kehadiran dan jumlah orang disimpan melalui tombol utama;
  ucapan memakai disclosure opsional dan dapat ditambahkan kemudian pada
  respons yang sama. Jangan menjadikan ucapan syarat pencatatan kehadiran.
- Tampilkan satu status tersimpan dan jumlah orang; waktu simpan hanya
  ditampilkan di Sheets. Hindari petunjuk berulang. Pulihkan semua isian
  setelah reload agar perubahan jumlah tidak menghapus ucapan lama.
- Rekap Sheets membedakan hadir tanpa/dengan ucapan; keduanya tetap masuk
  total hadir. Pertahankan batas dua orang sampai pemilik mengubahnya.

## Proporsi desktop undangan

- Lebar frame desktop mengikuti tinggi viewport agar tetap potret pada laptop
  dengan toolbar atau display scaling Windows. Pada jendela pendek, jam dan
  notifikasi lebih ringkas agar wajah pada foto cover tetap terlihat.
- Aturan ponsel tetap memakai seluruh viewport; jangan menerapkan batas lebar
  desktop ke perangkat sentuh.

## Link tetap per tamu

- Tab Tamu memakai B (nama), K (link), L (ID acak tetap, disembunyikan).
  ID literal telah dialokasikan pada baris yang tersedia sampai 1000. Jangan
  mengganti ID saat nama dikoreksi; tamu berbeda memakai baris baru dengan ID
  berbeda. Tambahan baris di luar kapasitas ini perlu ID baru dan rumus link.
- Gunakan filter seluruh A:L untuk pengurutan; jangan mengurutkan nama saja.
  K memakai rumus per baris, bukan spill, agar ID ikut berpindah bersama nama.
- URL `?guest=<id>` dibaca Worker pada setiap pembukaan. Apps Script hanya
  mengembalikan nama untuk satu ID. HTMLRewriter meneruskannya ke script.js;
  hasil tidak disimpan cache. ID hilang/duplikat dan kegagalan lookup tidak
  boleh menampilkan nama tebakan. Link `?to=` lama tetap didukung.
- Ini hanya personalisasi nama. Identitas RSVP tetap cookie dan batas dua
  orang tetap berlaku; jangan menganggap ID undangan sebagai login tamu.

## Invitation dan announcement

- `/weddingsamuelledy/invitation` adalah alias undangan utama. Alamat lama
  dan link pribadi `?guest=` tetap berlaku, termasuk pada alias invitation.
- `/weddingsamuelledy/announcement` adalah halaman kabar pernikahan untuk
  penerima yang tidak diundang. Isinya foto, tanggal, kota, dan permohonan
  doa restu. Tidak memuat RSVP, rekening, alamat, peta, jam acara, kalender,
  atau tautan menuju invitation. Parameter guest tidak diproses di halaman ini.
- Announcement memakai stylesheet dan foto yang sama, tanpa JavaScript atau
  panggilan data RSVP. Tanggal di kedua halaman perlu disesuaikan bersama
  jika rencana berubah. Jangan memakai draft announcement lokal lama yang
  masih mencantumkan tanggal berbeda.
- Design Read: gaya chat WhatsApp yang sudah dipilih pengguna; foto pasangan
  menjadi fokus, pesan singkat meminta doa. ENERGY 1 / RHYTHM 2 / MOTION 1.
  Tidak menambah tombol, statistik, atau aktivitas chat palsu. Tema terang,
  gelap, keyboard scroll, dan viewport ponsel telah diperiksa.
