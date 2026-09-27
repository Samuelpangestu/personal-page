# AGENTS.md — Konteks untuk AI Agent Lain

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
index.html        # Halaman undangan utama (single-page, mobile-first)
admin.html        # Dashboard panitia sederhana (password gate)
css/style.css     # Style undangan utama (design tokens di :root)
css/admin.css     # Style dashboard
js/script.js      # Interaksi undangan: countdown, RSVP, lightbox, dst
js/admin.js       # Logic dashboard: baca localStorage, stats, CSV export
assets/           # Taruh foto asli / music.mp3 di sini
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
