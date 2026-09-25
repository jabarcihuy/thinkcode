# ThinkCode — Project Overview

## Ringkasan

ThinkCode adalah **Interactive Programming Logic Lab** untuk belajar logika pemrograman secara terarah melalui materi, flowchart, pseudocode, prediksi output, JavaScript Lab, visualisasi eksekusi, practice dengan auto-check, AI Tutor kontekstual, serta checkpoint/final assessment.

Platform ditujukan untuk pemula secara umum. Struktur learning path terinspirasi dari urutan pembelajaran dasar pemrograman yang umum dipakai pada RPL/PPLG kelas X, namun identitas produk tidak dikunci sebagai platform RPL.

## Tujuan Utama

- Mengajarkan logika pemrograman, bukan sekadar menghafal syntax.
- Menggabungkan materi, editor, output, dan jejak eksekusi dalam satu lesson.
- Memberikan pengalaman belajar bertahap dan terstruktur.
- Memberikan feedback otomatis melalui auto-check.
- Memberikan bantuan kontekstual melalui AI Tutor saat practice.
- Memisahkan mode belajar dengan mode assessment.

## Target Pengguna

### Primary
Pemula yang ingin belajar logika pemrograman dari nol.

### Secondary
Siswa yang membutuhkan alur belajar terstruktur seperti pembelajaran dasar pemrograman di RPL/PPLG.

## Role MVP

- `USER`
- `ADMIN`

Role lain seperti `TEACHER` direncanakan untuk fase berikutnya dan tidak termasuk MVP.

## Bahasa Pemrograman MVP

- JavaScript (`displayName: JavaScript`, `slug: javascript`, `runtime: browser`)

JavaScript menjadi medium untuk belajar logika, bukan course pengembangan web. Bahasa lain hanya kemungkinan masa depan di luar MVP.

## Prinsip Produk

1. Learning path harus terarah.
2. Lesson berikutnya terkunci sampai prerequisite selesai.
3. Practice wajib diselesaikan untuk menandai lesson selesai.
4. AI aktif saat belajar dan practice.
5. AI nonaktif sepenuhnya saat assessment.
6. Kontrak CodeRunner dan AIProvider tetap terpisah dari implementasi.
7. MVP menargetkan Vercel Hobby, Supabase Free, dan runtime JavaScript di browser tanpa compiler eksternal wajib. Kuota serta syarat penggunaan setiap layanan tetap berlaku.
8. Browser sandbox, visualizer, dan prediksi sebelum Run membantu user memahami sebab sebuah output muncul.

## Current MVP Scope

Phase 0–7 are implemented: foundation, learning core, browser JavaScript workspace, auto-check practice, contextual AI Tutor, checkpoint/final assessment, Admin CMS, and UX polish. Practice code runs in an isolated browser sandbox; assessment code uses server-only QuickJS/WASM with resource limits. AI is server-blocked during active assessment. CMS operations are authorized on every server request; content is drafted, previewed, and explicitly published. The initial deploy target is Vercel Hobby and Supabase Free, subject to current quotas/terms.
