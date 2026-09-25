# ThinkCode — Product Requirements Document

## 1. Product Vision

ThinkCode adalah **Interactive Programming Logic Lab** yang membantu pemula memahami logika pemrograman melalui pengalaman belajar terpadu:

**Learn → Practice → Run → Check → Understand → Progress**

Pengguna tidak perlu berpindah ke IDE eksternal hanya untuk menjalankan contoh atau latihan dasar.

## 2. Problem Statement

Pemula sering mengalami hambatan berikut:

- Materi dan editor berada di tempat berbeda.
- Sulit memahami hubungan antara konsep dan implementasi kode.
- Error sintaks dan runtime membingungkan.
- Latihan sering tidak memberikan feedback otomatis.
- Learning path tidak terarah.
- AI umum sering langsung memberikan jawaban tanpa mengajarkan proses berpikir.

ThinkCode menggabungkan pembelajaran, code execution, assessment, progress tracking, dan AI Tutor dalam satu aplikasi.

## 3. Goals

### MVP Goals

- Menyediakan learning path programming logic yang sequential.
- Menyediakan materi logika menggunakan JavaScript browser-safe untuk pemula.
- Menyediakan Monaco-based code editor.
- Menjalankan JavaScript di browser sandbox dengan batas waktu dan output.
- Memvisualisasikan perubahan variabel, kondisi, loop, array, fungsi, dan output.
- Mengajak user memprediksi output sebelum Run.
- Memberikan auto-check pada exercise.
- Menyimpan progress pengguna.
- Menyediakan AI Tutor kontekstual pada practice.
- Memblokir AI selama assessment.
- Menyediakan admin CMS untuk mengelola konten.

## 4. Non-Goals MVP

Tidak termasuk MVP:

- Teacher role
- Classroom
- Assignment guru
- Leaderboard
- XP
- Badge
- Streak
- Certificate
- Forum
- Social features
- Mobile application
- Bahasa pemrograman selain JavaScript
- Multi-language learning
- Freeform flowchart editor

## 5. User Roles

### USER

Dapat:

- Register/login.
- Melihat dashboard.
- Mengikuti learning path.
- Membaca lesson.
- Menjalankan JavaScript di browser sandbox.
- Mengerjakan practice.
- Menggunakan AI Tutor pada practice.
- Mengikuti checkpoint dan final assessment.
- Melihat progress dan score.

### ADMIN

Dapat:

- Mengelola users.
- Mengelola learning path.
- Mengelola chapters.
- Mengelola lessons.
- Mengelola exercises.
- Mengelola test cases.
- Mengelola assessments.
- Melihat ringkasan user dan progress dasar. Perubahan role tetap melalui trusted server/database process.
- Publish/unpublish content.
- Menggunakan AI Content Assistant untuk membantu draft konten.

## 6. Guest Experience

Guest dapat:

- Membuka landing page.
- Melihat preview learning path.
- Membuka preview lesson terbatas.

Guest harus register/login untuk:

- Memulai learning path.
- Menyimpan progress.
- Mengerjakan practice penuh.
- Menggunakan AI Tutor.
- Mengikuti assessment.

## 7. Core User Journey

1. User membuka landing page.
2. User melihat learning path.
3. User register/login.
4. User memulai chapter pertama.
5. User membaca konsep.
6. User mencoba kode.
7. User mengerjakan mandatory practice.
8. Auto-check memvalidasi jawaban.
9. Jika gagal, user dapat menggunakan AI Tutor.
10. Jika semua mandatory practice selesai, lesson ditandai complete.
11. Lesson berikutnya terbuka.
12. Setelah beberapa chapter, user mengikuti checkpoint.
13. AI dinonaktifkan selama checkpoint.
14. User mendapatkan score.
15. User melanjutkan learning path.
16. Setelah seluruh path selesai, user mengikuti final assessment.

## 8. Functional Requirements

### Authentication

- Email/password registration.
- Email/password login.
- Logout.
- Session persistence.
- Password reset dapat ditambahkan jika implementasi sederhana.

### Learning

- Sequential chapter/lesson order.
- Locked prerequisite.
- Required vs optional lesson support.
- Progress persistence.
- Continue learning.

### Code Editor

- Monaco Editor.
- JavaScript syntax highlighting dengan label `main.js`.
- Starter code.
- Reset code.
- Run.
- Check answer.
- Console/output display.
- Prediksi output dan visualisasi eksekusi langkah demi langkah.

### Exercise

Supported MVP types:

- Code Completion
- Predict Output
- Debugging
- Problem Solving
- Pseudocode
- Simplified Flowchart

### Auto-check

Mendukung:

- Exact/normalized output comparison.
- Visible test cases.
- Hidden test cases hanya ketika dapat divalidasi sepenuhnya di server; browser-only coding MVP memakai test terlihat.
- Structural requirement jika diperlukan.
- Manual/configured checker untuk non-code exercise.

### Assessment

- AI disabled.
- Hint disabled.
- Solution disabled.
- Score 0–100.
- Passing score default 75.
- Unlimited retry.
- Store latest score.
- Store highest score.
- Store attempt count.

### AI Tutor

AI hanya tersedia pada learning/practice mode.

Capabilities:

- Explain concept.
- Explain code.
- Explain syntax/runtime error.
- Give progressive hints.
- Read current lesson.
- Read current exercise.
- Read current code.
- Read visible output.
- Read user-provided browser output and visible test summary. AI may guide the learner to use Run/Check, but it does not execute or grade code itself.
- Generate similar practice.
- Read user learning progress.

Default assistance progression:

1. Small hint
2. More specific hint
3. Explanation
4. Example
5. Full solution only when explicitly requested

### Admin CMS

- Learning path CRUD.
- Chapter CRUD.
- Lesson CRUD.
- Exercise CRUD.
- Test case CRUD.
- Assessment CRUD.
- Publish/unpublish.
- Reorder content.
- Preview content before publish.

## 9. Success Criteria MVP

MVP dianggap berhasil jika user dapat:

- Membuat akun.
- Mengikuti learning path dari lesson pertama.
- Menjalankan JavaScript di browser dan melihat jejak eksekusinya.
- Menyelesaikan exercise dengan auto-check.
- Mendapat bantuan AI saat practice.
- Tidak dapat mengakses AI saat assessment.
- Menyelesaikan checkpoint.
- Menyimpan progress secara persisten.
