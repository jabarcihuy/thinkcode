# Audit mobile dan TWA Quethink — 7 Oktober 2026

## Verdict

**PARTIAL untuk pengalaman setara native; layout web mobile PASS pada cakupan yang diuji.**

Audit dijalankan pada production build setelah pembersihan komponen mati. 119 capture/varian, tanpa horizontal overflow halaman dan tanpa uncaught JavaScript error. Ini bukan sertifikasi accessibility atau jaminan APK: tidak ada perangkat pada `adb devices`, sehingga keyboard sistem, tombol Back Android, cutout/status bar, TalkBack dan unduhan PDF dalam APK belum dapat diuji langsung.

Tidak mengubah alur belajar, penilaian, RBAC/RLS, database konten, TWA signing atau konfigurasi deployment. Audit UI tidak sekaligus merombak desain. Pembersihan hanya menghapus file yang tidak terjangkau dari import graph seluruh App Router entrypoints dan tidak direferensikan oleh pencarian repo.

## Audit health score

Skor heuristik berbasis cakupan pengujian, bukan hasil WCAG conformance formal.

| Dimensi | Skor / 4 | Bukti utama |
| --- | --- | --- |
| Accessibility | 3 | Semua field terukur memiliki label; focus/reduced motion tersedia. Beberapa target sentuh kecil dan region Markdown perlu ditinjau. TalkBack belum diuji. |
| Performance | 3 | Production build berhasil, Worker SQL terpisah; entrypoint JavaScript lesson mati dihapus. Performa low-end Android belum diukur. |
| Responsive | 3 | 119 varian tanpa overflow global. Lab panjang dan target kecil masih mengurangi kenyamanan. |
| Theming | 3 | Indigo–apricot dan mode light konsisten, sesuai docs. Metadata chrome aplikasi belum mengikuti warna web. |
| Implementation integrity | 3 | Domain basis data dan boundary keamanan konsisten; menu tamu menduplikasi shell dan memiliki state aktif salah. |
| **Total** | **15 / 20 — Good** | **Perlu perbaikan shell/interaksi sebelum disebut setara native.** |

Implementation integrity: PASS untuk identitas produk dan batas arsitektur; PARTIAL untuk konsistensi shell akun/tamu. Tidak menuntut dark mode karena arah desain saat ini secara sengaja light.

Temuan terkonfirmasi: **0 P0, 1 P1, 7 P2**. Lima kategori risiko/verifikasi TWA dicatat terpisah dan tidak dihitung sebagai bug yang sudah direproduksi.

## Cakupan dan hasil

| Keluarga halaman | Pengujian browser |
| --- | --- |
| Landing, login, register, guest start, 404 | 320, 360, 390px; landing juga 1280px |
| Dashboard, daftar Materi, Lab index, SQLab, Chatbot, Pre-test, Post-test, Assessment index, Profil | 320, 360, 390px; dashboard juga 1280px |
| Materi 1–11 dan Lab 1–11 | Semua slug published pada 360px; halaman terakhir dibuka dengan fixture akun yang memang memiliki seluruh prerequisite |
| Halaman grouping chapter internal | Ketiga chapter aktif pada 360px; tidak mengubah flat-list produk |
| SQLab | Skema, Data, Query, AI pada 360px; `/schema-builder` dan lab prototype lama diverifikasi redirect |
| Assessment | Soal pilihan, penulisan SQL, hasil submit terpercaya; AI API mengembalikan 403 selama sesi aktif |
| Admin CMS | Ringkasan, tujuh section list, dan lesson preview. Bentuk editor/form diaudit melalui kode; tidak submit mutasi konten produksi |
| Akun baru/locked | Dashboard akun baru dan penolakan materi terakhir tanpa prerequisite |
| Tamu | Beranda, Materi, SQLab, AI, Tes, Profil; semua 11 reading/Lab dan layar tes demo |
| Loading/error/PDF/auth callback | Pemeriksaan kode/state bersama; bukan setiap failure jaringan dieksekusi atau setiap callback OAuth/konfirmasi diuji |

Tiap capture mengukur lebar dokumen, target kontrol, label/form/font, local table scrollers, metadata web dan state navigation. Tidak menjalankan setiap kemungkinan jawaban soal, setiap dataset alternatif atau seluruh state form admin pada semua ukuran. Browser memakai Chromium touch/mobile emulation, reduced motion, tinggi 800px. Native Android bukan hasil emulasi ini.

Akun USER/ADMIN uji bersifat sintetis, dibuat hanya untuk membuka view yang tepat. Progres/sesi fixture hanya terkait akun uji tersebut. Semua akun uji beserta record yang cascade telah dihapus pada cleanup. Tidak mengubah akun atau konten nyata. Tidak ada panggilan AI berbayar dalam audit ini.

Bukti lokal (diabaikan Git): `.impeccable/review/mobile-audit/results.json` dan screenshot per view. Script reproducible: `scripts/audit-mobile-pages.mjs` (`npm run audit:mobile`, sesudah build; memerlukan konfigurasi Supabase server lokal dan Chromium).

## Temuan terkonfirmasi

### [P1] Shell web belum mempublikasikan metadata aplikasi

- Lokasi: `src/app/layout.tsx:8–13`, `public/manifest.json`, `android/twa-manifest.json`.
- Seluruh 119 capture tidak memiliki `<link rel="manifest">` atau `<meta name="theme-color">`; manifest sudah ada tetapi tidak direferensikan oleh metadata Next.
- Domain TWA `www.barlabs.my.id` mengembalikan HTTP 200 dan JSON valid untuk manifest dan Digital Asset Links. Ini memverifikasi ketersediaan file, bukan sukses Digital Asset Link verification pada APK/sertifikat Play.
- Dampak: browser/installable app shell tidak memperoleh metadata manifest dari halaman; warna browser shell tidak konsisten. TWA yang sudah menggunakan manifest build sendiri tidak otomatis gagal hanya karena link ini hilang.
- Rekomendasi: referensikan manifest melalui Metadata Next dan themeColor melalui Viewport Next; pertahankan zoom accessibility. Periksa sertifikat APK/Play terhadap DAL pada perangkat sebenarnya.
- Workflow: `$impeccable harden`.

### [P2] Dua item navigasi tamu dapat aktif bersamaan

- Lokasi: `src/features/guest/components/navigation.tsx:26,86–91`.
- Pada `/guest/materials/*` dan `/guest/lab/*`, `view` kosong membuat Beranda aktif; kondisi pathname juga membuat Materi aktif. Snapshot guest Lab mencatat Beranda sebagai item pertama aktif.
- SQLab/Chatbot menggunakan query view tetapi Menu tidak mendapatkan tanda aktif sebagaimana shell akun.
- Dampak: orientasi pengguna tidak konsisten; bar yang sama memberi petunjuk berbeda di mode akun/tamu.
- Rekomendasi: satu resolver active destination; reuse dasar shell akun/tamu, jangan duplikasi state handling.
- Workflow: `$impeccable adapt`.

### [P2] Menu tamu belum setara menu akun

- Lokasi: `src/features/guest/components/navigation.tsx:51–56,94–100`; bandingkan `src/components/layout/mobile-bottom-navigation.tsx:41–60`.
- Menu tamu memakai bottom offset tetap, tanpa pengukuran tinggi navbar, max-height/scroll, close button atau aria-expanded. Menu akun telah menyediakan kemampuan tersebut.
- Dampak: menu tamu lebih rapuh saat font diperbesar atau ruang layar pendek; state expanded tidak dijelaskan sebaik mode akun.
- Rekomendasi: gunakan panel bersama, tinggi nav terukur, batas tinggi, close affordance dan dismissal saat desktop. Jangan menambahkan menu baru.
- Workflow: `$impeccable adapt`.

### [P2] Beberapa target sentuh di bawah desain minimum 44px

- `src/features/learning/components/lesson-outline.tsx:20–46`: link daftar isi Lab terukur 32–36px tinggi.
- `src/features/schema-builder/components/model-diagram.tsx:29–32`: dua tombol zoom terukur 42 × 44px.
- `src/app/(auth)/layout.tsx:4`: link brand 28px; link Masuk/Daftar footer auth sekitar 18px tinggi.
- `src/app/(protected)/chatbot/page.tsx`: breadcrumb Dashboard sekitar 18px tinggi.
- `src/features/admin/components/admin-console.tsx:231`: select AI 40px dan font 14px pada mobile (kode editor, belum interaksi keyboard perangkat).
- Dampak: kontrol kurang nyaman disentuh, khususnya dalam APK tanpa mouse. Tidak otomatis menganggap semua tautan inline melanggar WCAG 2.5.8; standar tersebut memiliki pengecualian dan minimum yang berbeda dari target produk 44px.
- Rekomendasi: perbesar hit area, bukan ukuran ikon/teks; ukur label wrapper untuk radio/checkbox, bukan hanya kotak input.
- Workflow: `$impeccable adapt`.

### [P2] Lab terlalu panjang untuk alur tindakan mobile

- Lokasi: `src/app/learn/[pathSlug]/lessons/[lessonSlug]/practice/page.tsx`, `src/features/database/components/dataset-lab-switcher.tsx:15–21`, `src/features/database/components/database-query-lab.tsx:179–229`.
- Pada 360px: Lab 3 = 5.222px; Lab 6 = 6.173px; Lab 7 = 6.044px; Lab 8 = 6.016px. Layar awal dapat berisi judul, daftar isi, pemilih skema dan beberapa pemisah sebelum interaksi database.
- Tinggi sendiri bukan bug: pembelajaran perlu penjelasan, dan user telah memilih urutan vertikal tabel → query → hasil. Namun lompatan ke bagian penting masih berada di details dan targetnya kecil.
- Dampak: bolak-balik query/hasil/check dan menemukan langkah berikutnya terasa seperti membaca halaman web panjang.
- Rekomendasi: pertahankan urutan vertikal; kurangi spacer/pengulangan pembuka; sediakan jump controls ringkas ke Tabel/Query/Hasil/Latihan, dengan target 44px dan focus/scroll offset yang benar. Jangan mengubah materi menjadi carousel tersembunyi atau membuang penjelasan penting.
- Workflow: `$impeccable layout`.

### [P2] Percakapan AI tidak mengikuti pesan terbaru

- Lokasi: `src/features/ai/components/tutor-panel.tsx:119–124`.
- Chat list dibatasi `max-h-80 overflow-y-auto`, tetapi tidak ada mekanisme mengikuti pesan terbaru saat streaming. Ini terkonfirmasi dari kode; audit ini tidak meminta respons AI live.
- Dampak: setelah percakapan panjang, jawaban baru dapat berada di bawah viewport daftar sementara pengguna melihat pesan lama.
- Rekomendasi: auto-follow hanya jika pengguna masih dekat bawah; beri tombol pesan terbaru bila ia sengaja menggulir ke atas. Hubungkan dengan audit keyboard, jangan paksa scroll setiap token.
- Workflow: `$impeccable harden`.

### [P2] Launch TWA selalu menuju landing marketing

- Lokasi: `android/twa-manifest.json` startUrl `/`, `public/manifest.json` start_url `/`, `src/app/page.tsx`.
- Landing tidak meresolve guest/account ke layar lanjut belajar. Konfigurasi APK saat ini meluncurkan `/`.
- Dampak: pengguna lama kembali ke hero/CTA publik, bukan konteks terakhir atau Beranda belajar; terasa lebih seperti website dibungkus APK.
- Rekomendasi: entry aplikasi yang meresolve akun/tamu/belum masuk dengan aman. Pertahankan landing web publik; perubahan APK start URL perlu diputuskan bersama alur login/guest, bukan hardcode redirect semua visitor.
- Workflow: `$impeccable onboard`.

### [P2] Region tabel Markdown belum diberi affordance akses setara tabel Lab

- Lokasi: `src/features/learning/components/lesson-content.tsx:9`.
- Tabel Markdown memakai overflow-x-auto tanpa role/label/focus eksplisit. Tabel data Lab sudah memiliki region berlabel dan tabindex=0.
- Dampak: tabel lebar dalam bacaan kurang jelas cara ditelusurinya untuk keyboard/assistive technology; visual scrolling saja tidak cukup untuk semua pengguna.
- Rekomendasi: reuse wrapper scrollable table yang berlabel, focusable bila overflow, dan penjelasan geser yang ringkas. Verifikasi TalkBack pada HP.
- Workflow: `$impeccable harden`.

## Risiko TWA yang masih perlu verifikasi/perbaikan

Ini **bukan bug yang telah direproduksi pada perangkat nyata**.

1. **[P1 readiness] Keyboard Android:** viewport hanya `viewportFit: cover`, tidak ada strategi interactive-widget/visualViewport. Fixed bottom nav dan AI composer perlu diuji saat OSK terbuka; Chrome Android default dapat mengecilkan visual viewport tanpa layout viewport. Pilih kebijakan menyembunyikan nav ketika mengetik atau viewport adaptation yang terukur; jangan menonaktifkan zoom. Lokasi: `src/app/layout.tsx:13`, kedua bottom nav, TutorPanel form.
2. **[P1 readiness] Cold-launch offline:** tidak ditemukan service worker atau offline navigation fallback pada web. Error boundary untuk fetch bukan jaminan halaman dapat diluncurkan tanpa jaringan. Simpan fallback ringan dan aksi coba lagi; jangan cache assessment/private data secara sembarang. Uji jaringan putus saat launch dan submit. Tidak mengklaim service worker sebagai syarat mutlak keberhasilan TWA.
3. **[P2 readiness] Edge-to-edge/safe area:** bottom safe area tersedia, tetapi tidak ada safe-area-inset-top/left/right pada shell. Cutout, Android system bar dan landscape perangkat nyata belum diuji; manifest/APK dikunci portrait. Tentukan dukungan landscape, uji terlebih dahulu sebelum mengubah orientation.
4. **[P2 readiness] Android Back / external surfaces:** browser history back diuji dan popover tertutup saat route berubah; itu tidak menggantikan hardware/gesture Back saat menu, dialog atau keyboard terbuka. PDF blob download dan YouTube external video juga perlu smoke test pada APK.
5. **[P2 readiness] Text scaling & assistive tech:** belum menguji system font 200%, TalkBack dan high zoom di APK. Shell akun telah mengukur menu height, shell tamu belum.

## Detector triage

Impeccable detector awal menemukan 0 primary failures dan 16 advisory: ukuran font di luar ramp dan literal warna PDF. Lima advisory terkait film-strip menghilang bersama file mati yang dihapus.

- Caption hero dan label soal 10px: advisory kecil, perlu ditinjau bersama keterbacaan phone; tidak disamakan dengan kegagalan WCAG otomatis.
- Caption/data diagram kecil: ada pengecualian file sebelumnya; audit tidak membuat suppression baru. Tinjau dengan zoom/hit target/TalkBack, bukan mengganti semua teks diagram membabi buta.
- Literal warna PDF: output dokumen server, bukan theming halaman; tidak dilaporkan sebagai bug theme web.
- ExecutionVisualizer masih dirujuk oleh renderer legacy exercise; bukan komponen mati hanya karena course aktif bukan JavaScript.
- Skip link 1 × 1px dari probe: **false positive** saat belum fokus karena sr-only; jangan membesarkan atau menghapusnya. Focus style tetap tersedia.

Tidak menambah ignore-rule, ignore-file atau ignore-value. Temuan aktif yang belum dibetulkan tetap dicatat.

## Pembersihan yang dilakukan

Dihapus:

- `src/components/film/film-strip.tsx` — landing lama, tidak diimpor.
- `src/components/motion/reveal.tsx` — wrapper animasi lama, tidak diimpor; animasi landing aktif tetap dipertahankan.
- `src/features/workspace/components/javascript-workspace.tsx` — workspace contoh lesson pemrograman lama, tidak diimpor.
- CSS `.film-frame` dan komentarnya, hanya digunakan file film-strip mati.

Total **448 baris kode/CSS dihapus**. Tidak menghapus provider/sandbox/grader atau komponen yang masih dirujuk oleh kompatibilitas exercise dan assessment historis. Tidak menghapus konten Supabase atau hasil belajar. Tidak menghapus redirect URL lama yang masih membantu link/bookmark pengguna.

## Hal yang sudah baik

- Lima bottom menu, posisi Menu tengah dan Profil kanan sesuai desain.
- Popover akun di atas navbar, focus/close behavior dan reduced motion tersedia.
- Seluruh input terukur berlabel; input utama mobile berukuran 16px.
- Schema/query/output ditata vertikal; scroll tabel dibatasi pada region, bukan seluruh halaman.
- Locked material tetap ditolak; official assessment AI API tetap 403.
- Semua 11 materi dan Lab tetap dapat dibuka dengan prerequisite yang benar, serta seluruh materi dalam demo tamu.
- Hidden keys/fixtures tidak digunakan untuk rendering peserta; trusted submit tetap server-side. Audit ini bukan pengganti audit keamanan menyeluruh.

## Prioritas tindak lanjut

1. `$impeccable harden`: metadata app, strategi keyboard, offline/error/resume, verifikasi APK.
2. `$impeccable adapt`: unify shell tamu/akun, active state, target sentuh, text scaling/safe area.
3. `$impeccable layout`: pendekkan perjalanan scroll Lab tanpa mengubah urutan vertikal yang disepakati.
4. `$impeccable harden`: auto-follow chat dan region tabel bacaan.
5. `$impeccable polish`: consistency pass akhir setelah perbaikan fungsi.

Perintah tersebut dapat dikerjakan satu per satu atau sekaligus. Setelah perbaikan, ulangi audit pada viewport dan APK untuk mengukur hasil.

## Validasi setelah cleanup

- Production build: PASS.
- Typecheck: PASS.
- Unit tests: **293 PASS / 52 files**.
- Lint: PASS setelah menghapus unused binding pada script audit.
- Browser audit: **119 capture; 0 overflow global; 0 uncaught page errors**.
- Assessment submit fixture: PASS; AI block 403.
- Manifest + DAL hosted: HTTP 200, valid JSON.
- HP/APK native smoke: **belum dilakukan; adb tidak memiliki perangkat terhubung**.

Tidak memerlukan migration atau konfigurasi database tambahan.

## Referensi resmi

- [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity): TWA merender web dengan browser dalam fullscreen; verifikasi hubungan aplikasi/domain melalui DAL.
- [Chrome Android keyboard viewport](https://developer.chrome.com/blog/viewport-resize-behavior): perbedaan visual/layout viewport dan efek pada fixed elements.
- [Edge-to-edge migration](https://developer.chrome.com/docs/css-ui/edge-to-edge): pengujian safe-area dan UI saat system controls berubah.
- Local Next 16.3.6 `generate-viewport.md`: konfigurasi Viewport server, themeColor dan interactiveWidget sesuai versi project.

## Implemented follow-up — 7 Oktober 2026

The findings above describe the baseline, before these fixes:

- Root metadata now links the manifest and theme color. `/app` is the installed-app entry; source Android launch configuration was updated, not the existing APK binary.
- Guest navigation selects one active destination. Account and guest share bar sizing/typing behavior; the guest upward menu now uses the measured offset, bounded scroll, close button and expanded state.
- Small outline, auth, guest-start, schema icon and chatbot controls were enlarged. Admin selects/textareas use mobile-readable input text. Markdown tables expose a named focusable scrolling region.
- Lab Materi uses compact section links and a collapsed table/query exploration panel. The core exercises remain immediately below; full question text/data remain. Table → query → result is still vertical. Opening the panel loads its code; subsequent collapse preserves editor state. Entering a different lesson resets that panel session.
- A previously unnoticed guest catalog bug was fixed: the authenticated exercise view filters on `auth.uid()`, so named guests saw no core tasks. Guest reads now verify published course catalog membership, then select only published required exercises and their generated `public_config`, never private `config` or tests. No database policy was relaxed.
- AI chat auto-follows near the bottom, preserves a reader's scroll position, and offers a latest-message button. Streaming sets the live region busy to avoid announcing every intermediate update.
- Viewport text entry behavior and safe-area padding were added. A production worker caches only a public offline document fallback. Authenticated pages/RSC/APIs are never cached. This is not offline learning.

### Page density evidence (360px, default collapsed view)

| Lab | Before | After |
| --- | ---: | ---: |
| 3 | 5,222px | 2,050px |
| 6 | 6,173px | 3,001px |
| 7 | 6,044px | 2,872px |
| 8 | 6,016px | 2,844px |

Measurements describe the initial view, not the height after opening all exploration panels. Roughly half the initial scrolling is removed without deleting the task.

### Navigation performance

- Learning loading boundary enables the framework's partial prefetch/loading behavior.
- Independent baseline/chapter data reads run concurrently; per-request account/overview deduplication and server authorization remain.
- Guest SQLab's workspace and course exploration load only when used; the browser SQL engine does not start on a collapsed Lab.
- One local production guest-to-materials navigation measured approximately 0.84s to the ready heading. This is a smoke measurement, not a benchmark, before/after speedup claim or Vercel SLA.
- Turbopack was tested and fails resolving a dynamic Worker URL in the installed SQLite WASM package. Webpack remains the working supported project setting. First development compilation is still slower than production navigation.

### Verification and remaining limits

Lint, typecheck, 300 unit tests and production build pass. Dedicated integration checks cover app entry, one active destination, lazy SQL startup, real SQL result, editor preservation, text-entry chrome, chat following/manual scroll, 200% font on a short viewport, offline/retry, and a cache containing only `/offline.html`. Mobile navigation tests also cover USER admin denial, ADMIN menu, keyboard/Escape/outside dismissal and logout. Reading/PDF/locked-access regression passes; mocked PDF failures run with service workers disabled in that test only (the dedicated offline test leaves them enabled).

The broad audit covers 119 captures; assessment AI blocking remains 403. Client secret scan finds no configured server secret in production static assets. Temporary test accounts are deleted by the scripts. No content/RLS/schema migration, new feature menu, curriculum rewrite or new design suppression is required.

Remaining native verification: actual Android keyboard resizing, Back gestures, cutouts, TalkBack, PDF downloads and Digital Asset Links/signing. First launch without a cached fallback still requires connectivity. Existing APK needs rebuild/signing to adopt `/app`. Vercel cold starts, Supabase latency and low-end Android performance are not measured by this browser audit.
