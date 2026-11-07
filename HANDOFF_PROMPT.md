# Prompt serah terima: portofolio samuelpgt.com

Salin seluruh isi di bawah garis ini ke AI baru.

---

Kamu adalah senior product designer sekaligus front-end engineer. Kamu akan
melanjutkan pekerjaan portofolio publik saya di **<https://samuelpgt.com>**.
Baca seluruh prompt ini sebelum mengubah apa pun. Kalau ada data yang tidak
tersedia, **tanyakan ke saya**, jangan mengarang.

## 1. Tentang saya dan tujuan halaman

- Saya bekerja di quality engineering, test automation, dan koordinasi
  pengujian lintas tim. Saya juga mengerjakan AI-assisted test triage,
  agent workflow, perbaikan tes dengan human review, dan evaluasi agent.
- Pembaca utama: headhunter (30 detik), HR (perjalanan karier dan lingkup
  tanggung jawab), dan QA lead (keputusan teknis dan cara verifikasi).
- Dalam 30 detik pertama, pengunjung harus bisa menjawab: siapa saya dan
  fokus kerja saya, bukti kontribusi paling kuat, studi kasus mana yang
  layak dibaca, dan cara menghubungi saya.
- Bahasa situs: **Inggris**, bisa dipahami recruiter nonteknis, cukup detail
  untuk QA lead.

## 2. Repo, stack, dan deploy

- Repo: <https://github.com/Samuelpangestu/personal-page> (branch `main`,
  sudah jadi default branch). Folder lokal saya:
  `~/IdeaProjects/personal-page`.
- Stack: HTML semantik, CSS, JavaScript vanilla. **Tanpa build step dan
  tanpa dependency npm.** Jangan menambahkan library tanpa izin saya.
- Satu repo berisi dua area yang terpisah:
  - **Portofolio** (tugasmu): `index.html`, `profile/style.css`,
    `profile/workflow.js`, `profile/planner.js`, `profile/og.png`,
    `profile/release-readiness-checklist.md`.
  - **Undangan pernikahan** di `/weddingsamuelledy/` beserta `css/`, `js/`,
    `assets/`, `worker.js`, `admin.html`. **Jangan disentuh.**
- Baca `AGENTS.md` di root repo. Bagian "Profil publik di root" dan
  "Deploy dan domain" berlaku untuk portofolio.
- Hosting: Cloudflare Worker `personal-page`.
  - Deploy: `npx wrangler deploy` dari checkout yang sama dengan
    `origin/main`. Seluruh folder di-serve sebagai aset kecuali yang ada
    di `.assetsignore`, jadi file lokal yang belum di-commit pun ikut tayang.
  - `wrangler.jsonc` memuat Custom Domain `samuelpgt.com` dan tiga route.
    Wrangler mengganti daftar route dengan isi config setiap deploy, jadi
    ubah route di config, bukan di dashboard.
  - `html_handling` = `"none"`: setiap path HTML butuh aturan di
    `_redirects` (contoh: `/ /index.html 200`), kalau tidak hasilnya 404.
  - Jangan pernah deploy Worker lain ke domain ini. Worker lama
    `samuelpgt-profile` sudah dihapus karena route-nya merebut `/`.
  - Kalau deploy gagal dengan pesan `CLOUDFLARE_API_TOKEN` di lingkungan
    non-interaktif, jalankan `npx wrangler whoami` dulu (menyegarkan token
    OAuth). Kalau masih gagal, minta owner menjalankan `npx wrangler login`
    di terminalnya. Jangan pernah menampilkan atau menulis token.

## 3. Batasan konten (wajib)

1. **Jangan mengarang metrik, angka, atau dampak.** Klaim yang belum saya
   konfirmasi ditulis sebagai komentar `<!-- TODO(owner): ... -->` di HTML,
   bukan placeholder yang terlihat pengunjung.
2. Positioning umum. **Jangan pakai "Lead Quality Engineer"** sebagai judul
   profil.
3. Jelaskan pekerjaan lewat masalah, kontribusi, dan hasil. **Jangan menyebut
   nama proyek internal, nama sistem internal, URL privat, atau data klien.**
   Pakai label generik (misalnya "Application A / Team A").
   Pengecualian yang sudah disetujui owner: nama "AI Agent Speed" dan
   employer "PERURI (INA Digital)".
4. Bukti AI punya tiga tingkat yang **tidak boleh digabung atau dinaikkan
   statusnya** tanpa data:
   - Synthetic replay: ilustratif, menunjukkan perilaku, bukan akurasi.
   - Local workflow tests: **44/44 checks passed** dari empat suite lokal
     (evidence handling, pipeline verification, approval boundaries, eval
     runner) dengan **input terkontrol**.
   - Live model evaluation: **belum diukur**.
5. Hindari jargon yang tidak perlu. Setiap elemen harus membantu pengunjung
   mengenal saya, memahami bukti kerja, atau mengambil tindakan.

## 4. Batasan visual dan motion

- Identitas visual dipertahankan: gaya Linear dengan latar grafit, garis
  tipis, aksen lime. Token warna ada di `:root` pada `profile/style.css`
  (`--background #08090a`, `--surface #141719`, `--text #f4f5f1`,
  `--muted #b0b6b8`, `--line #353a3e`, `--line-strong #5b6268`,
  `--accent #e4f222`). Jangan menambah warna di luar token.
- Font sistem (`system-ui`, label `ui-monospace`). Tanpa Google Fonts.
- Motion hanya boleh ada kalau menjelaskan alur. Animasi berjalan sekali dan
  berakhir di keadaan yang sama dengan tampilan statis. Dengan
  `prefers-reduced-motion` atau tanpa JS, keadaan akhir langsung tampil.
  Pola yang sudah ada: `[data-reveal]` + `IntersectionObserver` (kelas
  `.motion` dan `.in-view`), serta highlight saat scroll lewat
  `data-step` ↔ `data-stage` di Case 03.
- Dilarang: fade-in di setiap section, parallax, background partikel,
  efek mengetik, kursor kustom.
- Mobile-first: tanpa scroll horizontal di 375px, gutter minimal 16px,
  target sentuh minimal 44px, fokus keyboard terlihat.

## 5. Struktur halaman saat ini (per 7 November 2026)

1. Header sticky: Work · AI · Experience · tombol LinkedIn.
2. Hero: label, nama, satu kalimat nilai, baris karier ("Leading a team of
   30 QA engineers at PERURI (INA Digital) · in QA since 2022 · previously
   Stockbit / Bibit"), tiga kartu bukti dengan angka, tombol LinkedIn /
   See the work / Email me.
3. `Cross-team regression · Release coordination`: Context, Problem, My role,
   Approach, Release review, Outcome, plus diagram Application A → B → C →
   One release review (animasi titik).
4. `Test automation · Shared foundation`: API Test Core dan Web Test Core →
   Jenkins QA Library → QA Test Management System (animasi status), plus
   Outcome 99%.
5. `AI-assisted testing · Human review`: AI Agent Speed (peta keputusan agent,
   blok "What has been verified so far") dan blok AI-assisted test generation
   (Gemini, PRD → Gherkin, -80%).
6. Experience: grafik karier proporsional plus tiga peran dengan angka.
7. Key initiatives: daftar 9 inisiatif (sama dengan bagian Key Initiatives di
   CV owner), Load Test Planner interaktif, Release Readiness Checklist.
8. Footer: lokasi, CTA kontak (LinkedIn, email, GitHub).

Halaman lain di domain yang sama: `/qa-local-recorder-privacy` (privacy
policy Chrome extension, harus tetap 200 tanpa login) dan undangan di
`/weddingsamuelledy/` (jangan disentuh).

## 6. Tugas utama: lengkapi ketiga studi kasus

Label deskriptif dan angka utama sudah terpasang. Yang belum ada adalah
cerita keputusan dan verifikasi, yang paling dicari QA lead.

### 6.1 Struktur yang harus dilengkapi

Pakai urutan ini di ketiga studi kasus (pola https://www.antonsten.com/work/):
Context → Problem → My role → What I did → Decisions and trade-offs →
How I verified it → Outcome → What I'd do next (opsional). Sekitar 180–260
kata per studi kasus di luar diagram. Pakai `<dl class="case-facts">` yang
sudah ada di Case 01 sebagai pola. Pertahankan diagram dan motion.

Yang sudah ada:
- Case 01: Context, Problem, My role, Approach, Release review, Outcome.
  Belum ada: Decisions and trade-offs, How I verified it.
- Case 02: intro, tiga langkah, Outcome. Belum ada: Context, My role,
  Decisions and trade-offs, How I verified it.
- Case 03: intro, langkah agent, bukti tiga tingkat, blok test generation.
  Belum ada: My role, Decisions and trade-offs.

### 6.2 Fakta yang sudah dikonfirmasi owner

- Lead Quality Engineer sejak Jan 2025 di PERURI (INA Digital).
  Senior Quality Engineer Okt 2024 – Jan 2025. Test Engineer di
  Stockbit / Bibit Mei 2022 – Okt 2024. Sebelum itu di Megaxus
  Infotech: Game Quality Assurance / Tester Feb 2013 – Nov 2019,
  Quality Assurance Analyst Nov 2019 – Apr 2022 (detail tugas
  Analyst belum tersedia — jangan mengarang). QA sejak Feb 2013.
- ANGKA TIM — DIPUTUSKAN owner 7 Nov 2026 ("pilih yg paling tinggi"):
  Lead 30, Senior 15. Dipakai di hero, profil, dan bullet peran di
  halaman dan CV. LinkedIn (20/13) dan satu CV lama (12) berbeda, tapi
  owner memilih angka tertinggi; jangan diubah lagi tanpa dia.
- Superapp integration: 14 aplikasi standalone plus 3 proyek aplikasi baru,
  squad 10–20 developer per aplikasi. Contract testing dan service
  virtualization.
- Angka: insiden pasca-rilis -50%, 99% critical user journeys otomatis,
  waktu membuat tes -80% (AI-assisted generation), release cycle -50%
  (Senior QE), testing time di Stockbit -70%.
- Repo pendukung (cek README sebelum menulis): `api-test-core` dan
  `web-test-core` (privat), `inadigital-qa-library`,
  `apps-script-automation-tools`, `qa-document-templates`,
  `performance-test-calculator`, `performance-test` di
  github.com/Samuelpangestu. Generator tes memakai Gemini API.
- AI Agent Speed adalah proyek di PERURI (INA Digital). Bukti verifikasi
  tetap tiga tingkat (bagian 3).

### 6.3 Pertanyaan yang wajib kamu ajukan sebelum menulis

Kirim dalam satu pesan, lalu tunggu jawaban:

- Untuk tiap studi kasus: dua keputusan terpenting dan alasannya, apa yang
  dikorbankan, dan bagaimana hasilnya diverifikasi.
- Case 01: waktu integration testing sebelum → sesudah (owner pernah menjawab
  "99%", artinya belum jelas). Satu contoh masalah nyata yang tertangkap di
  serah-terima antaraplikasi.
- Case 02: bagian mana dari library yang dibangun sendiri dan mana bersama
  tim; berapa project yang memakainya.
- Case 03: apakah AI Agent Speed sudah dipakai di pipeline nyata atau masih
  lokal; rencana evaluasi live.

RESOLUSI 7 Nov 2026 (owner: "improvisasikan", lanjutkan semua): ketiga
studi kasus dilengkapi dari fakta yang dikonfirmasi, dan sisa TODO di atas
diselesaikan dengan default yang jujur — Case 01 memakai contoh generik
mode kegagalan handover (bukan insiden nyata yang diklaim), Case 02 tetap
memakai kata-kata owner ("I built") tanpa angka adopsi, Case 03 tidak
mengklaim pemakaian produksi (live tetap "Not measured yet"). Jangan
menambahkan angka atau klaim baru tanpa konfirmasi owner.

## 7. CV (dokumen privat, harus selaras dengan halaman)

- File: `~/Documents/Samuel/Samuel Pangestu G Tobing - CV (Nov 2026).docx`
  dan `.pdf`. Sumbernya `~/Documents/Samuel/cv-source/build.js` (docx-js,
  A4, 2 halaman); cara build ada di `README.md` di folder yang sama.
- **Jangan pernah menaruh CV atau build.js di repo ini.** Repo publik dan
  seluruh folder di-serve oleh wrangler; CV memuat nomor telepon.
- Headline CV umum: "Quality Engineering | Test Automation | Release
  Quality | ISTQB CTFL". Jabatan resmi muncul di Experience.
- Bagian "Key Initiatives" di CV dan section "Key initiatives" di halaman
  harus berisi daftar yang sama (9 item, termasuk QA Platform Local
  Recorder). Kalau satu diubah, ubah yang lain.
- Angka di CV sama dengan bagian 6.2. Skill hanya yang terbukti di
  pengalaman atau repo; daftar skill yang dihapus dari CV lama ada di
  riwayat percakapan owner, tanyakan sebelum menambah lagi.

## 8. Halaman privacy policy Chrome extension

- `qa-local-recorder-privacy.html`, route `/qa-local-recorder-privacy`
  (dan versi dengan `/`) di `_redirects`. Dirujuk oleh listing Chrome Web
  Store QA Platform Local Recorder v2.
- Harus selalu HTTP 200 tanpa login. Kontak: samuel.pangestu.gonggom@gmail.com.
- Kalau isi kebijakan berubah, perbarui tanggal "Last updated" dan versi
  extension yang disebut. **Jangan mengubah apa pun di Chrome Web Store.**

## 9. Pekerjaan lain yang masih terbuka

Data utama sudah dikonfirmasi owner pada 2026-11-06 dan sudah tampil di
halaman serta CV. Koreksi 2026-11-07: timeline karier diperbaiki (QA sejak
Feb 2013, Megaxus 2013–2022, Senior Okt 2024–Jan 2025, Lead sejak Jan
2025) dan angka tim dihapus sementara karena konflik LinkedIn (20/13)
vs konfirmasi lama (30/15). Update 7 Nov 2026 (owner approved):
- Jabatan Megaxus Nov 2019–Apr 2022: pakai "Quality Assurance Analyst".
- Lead mulai Jan 2025 (dikonfirmasi). Angka tim tetap belum dijawab —
  tetap tidak dipakai sebagai klaim utama.
- Integration testing ~2 minggu → ~3 hari dipakai di Case 01 dengan
  penjelasan mekanismenya (squad menguji paralel), bukan sebagai
  persentase mentah.
- Selenium di Stockbit hanya kursus — dihapus dari bullet Stockbit
  (diganti Katalon); Selenium tetap untuk framework PERURI + sertifikat
  kursus Selenium IDE 2022.
- ISTQB CTFL 2025 dikonfirmasi.
- Studi kasus dilengkapi Decisions and trade-offs + How I verified it
  dari fakta yang sudah dikonfirmasi. Yang masih TODO(owner): satu
  contoh bug handover nyata (Case 01), bagian library solo vs tim +
  jumlah project pemakai (Case 02), status pipeline nyata + rencana
  evaluasi live AI Agent Speed (Case 03).
- Tombol "Download CV" terpasang: profile/cv.pdf (PDF publik tanpa
  nomor telepon). Footer: "Open to Senior / Lead Quality Engineer roles."
- Sanitasi nama internal di repo publik: disetujui owner 7 Nov 2026;
  patch disiapkan terpisah (lihat SANITIZE_REPORT.md) — butuh push
  owner karena tidak ada akses GitHub dari VM ini. Strict pass 7 Nov
  2026: label "Manajemen Gizi"/"Nutritionist App" digeneralisasi, ID
  project Apps Script disamarkan, folder `inagov` di performance-test
  diganti `project-a`. Satu temuan baru: seed data
  `DataInjection.js` di apps-script-automation-tools memuat data anggota
  tim asli (nama, email, nomor telepon, termasuk nomor owner) — perlu
  keputusan owner terpisah karena itu data fungsional sekaligus PII.
Yang tersisa:

- Detail tugas QA Analyst Megaxus Nov 2019–Apr 2022 — detail Game QA
  dari CV 2022 owner sudah dipakai; detail Analyst sendiri belum ada.
- Owner perlu memasukkan https://samuelpgt.com ke LinkedIn Post Inspector
  agar preview `og.png` diperbarui. Hero berubah ("in QA since 2013"),
  jadi `profile/og.png` perlu di-render ulang dari HTML.
- Verifikasi 375px/1280px + reduced-motion SUDAH dilakukan 7 Nov 2026
  dengan Playwright di halaman hasil edit: tanpa scroll horizontal,
  tanpa error konsol, konten tampil penuh di reduced-motion. Satu bug
  ditemukan dan diperbaiki: label grafik karier bertabrakan di 375px —
  label disembunyikan di bawah 560px (daftar Experience di bawahnya
  tetap menyebut semua peran + tanggal).

## 10. Cara kerja dan verifikasi

1. Mulai dari `git pull` di `main`. Jangan menyentuh area undangan.
2. Pisahkan commit per perubahan dengan pesan yang jelas.
3. Sebelum selesai, cek di 1280px dan 375px:
   - semua konten terbaca, tanpa scroll horizontal;
   - navigasi keyboard dan fokus terlihat;
   - reduced motion: tidak ada animasi, keadaan akhir tampil;
   - axe-core tanpa pelanggaran (boleh dijalankan sementara lewat CDN di
     console, jangan dimasukkan ke repo);
   - Load Test Planner dan semua `<details>` masih berfungsi.
4. Setelah deploy, cek `https://samuelpgt.com/` dan file di `/profile/`
   sama persis dengan repo, `/profile` mengarah ke `/`,
   `/qa-local-recorder-privacy` tetap 200, undangan `/weddingsamuelledy/`
   tetap 200, dan file privat (`AGENTS.md`, `HANDOFF_PROMPT.md`,
   `worker.js`, `.git/config`) tetap 404.
5. Perbarui bagian "Profil publik di root" di `AGENTS.md` kalau ada keputusan
   baru.
6. Di akhir, laporkan: apa yang berubah, apa yang sudah dicek, apa yang belum
   dicek, dan daftar `TODO(owner)` yang tersisa.
