# ThinkCode — Learning System

## Learning Philosophy

ThinkCode berfokus pada logika pemrograman terlebih dahulu, syntax kedua.

Setiap lesson yang cocok dapat mengikuti alur **Problem → Flowchart → Pseudocode → JavaScript → Predict → Run → Visualize → Practice**. JavaScript tidak mengubah learning path menjadi course web development.

Learning system harus:

- Terarah.
- Sequential.
- Practice-driven.
- Feedback-oriented.
- Tidak mengandalkan AI sebagai pemberi jawaban utama.

## Learning Structure

```text
Learning Path
└── Chapter
    └── Lesson
        ├── Concept
        ├── Example
        ├── Practice
        └── Summary
```

## Sequential Progression

Default behavior:

- Chapter/lesson berikutnya terkunci.
- User harus memenuhi prerequisite.
- Mandatory practice harus lulus.
- Optional lesson tidak menghalangi progression.

After each required chapter group, the learner must pass its checkpoint to unlock the next group: chapters 1–3, 4–6, and 7–9. Final assessment requires all required lessons and checkpoints. Completed lessons remain reviewable.

## Lesson Completion

Lesson dianggap selesai jika:

- Semua mandatory content requirement terpenuhi.
- Semua mandatory practice lulus.

Scrolling ke akhir halaman tidak boleh otomatis dianggap selesai.

## Exercise Types

### 1. Code Completion

User melengkapi bagian kode yang hilang.

### 2. Predict Output

User memprediksi hasil program.

### 3. Debugging

User memakai Bug Lab: Observe → Run → lihat perilaku atau timeout → Inspect → Fix → Check.

### 4. Problem Solving

User menulis solusi berdasarkan problem statement.

### 5. Pseudocode

MVP menggunakan:

- Arrange blocks
- Complete missing step
- Multiple choice

### 6. Simplified Flowchart

MVP menggunakan block/puzzle-based flowchart.

Tidak ada freeform diagram editor pada MVP. Block order dan pilihan node diperiksa secara deterministik oleh server.

## JavaScript Lab

Source satu berkas `main.js` berjalan di browser sandbox. `input` adalah teks masukan opsional yang tersedia bagi kode. Output `console.log`, `console.error`, dan exception ditampilkan. Visualizer menunjukkan snapshot variabel, kondisi, iterasi, array, pemanggilan fungsi, return, dan output. Jejak dibatasi agar loop panjang tidak menghasilkan state tanpa batas.

Run tidak menyimpan progres. Check coding menjalankan test yang terlihat di browser dan mengirim hasilnya untuk pencatatan attempt. Karena hasil browser dapat dimanipulasi, ini adalah feedback edukasional, bukan penilaian tepercaya untuk assessment. Predict Output, pseudocode, dan flowchart memakai jawaban yang diperiksa server.

## Assessment Grading

Assessment coding uses the separate server-side `AssessmentRunner` backed by QuickJS/WASM; the server loads hidden test cases and returns only aggregate hidden pass counts. Assessment session ownership, active state, prerequisites, score, and result history are enforced server-side. The QuickJS runtime is capability-limited and resource-bounded but shares the Vercel function process, so it is not equivalent to an OS/container sandbox.

## AI Tutor

The contextual tutor is available on lessons and practice. The server supplies only the active published lesson/exercise, bounded source and learner-visible execution context, a progress summary, and the current hint level. Hints escalate; a full solution requires an explicit request. The tutor never reads hidden tests or writes progress/scores. Active assessment blocks tutor requests before provider use.

## Practice vs Assessment

### Practice Mode

- AI: ON
- Hint: ON
- Explanation: ON
- Retry: Unlimited
- Feedback: Immediate

### Assessment Mode

- AI: OFF
- Hint: OFF
- Solution: OFF
- Retry assessment: Unlimited after completion
- Feedback per soal dapat dibatasi sampai assessment selesai
- Run dan output tetap tersedia; grading assessment terpisah dari practice Check

## Assessment Placement

Recommended:

```text
Chapters 1–3
→ Checkpoint 1

Chapters 4–6
→ Checkpoint 2

Chapters 7–9
→ Checkpoint 3

Chapter 10
→ Final Assessment
```

## Score

- Range: 0–100
- Default passing score: 75
- Store:
  - attempt_count
  - latest_score
  - highest_score
  - completed_at
