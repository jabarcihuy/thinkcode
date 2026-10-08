# Quethink Roadmap

## Current product revision — 8 October 2026

Pre-test is retired from account and guest flows. Start with the first material; reading plus required core practice still unlocks the next. The final assessment is named **Tantangan Akhir / Final Challenge**, still unlocked after all required materials, graded server-side and passed at 75. Historical diagnostic questions/sessions/results remain archived; old pre-test URLs redirect to materials. Earlier baseline descriptions below are historical and do not define the active flow. A mobile-first database discussion forum is now explicitly in scope at the user's request; see planning/2026-10-08-forum.md.

## Active product — Database Learning

Quethink is a focused platform for learning relational data through SQL. Previous programming/PTI learning paths are unpublished and kept only for historical progress. JavaScript/TypeScript remain application implementation languages only.

## Active MVP learning path

Three main content topics are Relasi, Write, and Read; learner progression follows the prerequisites **Relasi → Read → Write**.

1. **Relasi:** table structure, records, columns, keys, one-to-many and many-to-many relationships.
2. **Read:** `SELECT`/`FROM`, `WHERE`, ordering/limit, joins, simple aggregation, and an integrated data question.
3. **Write:** one-row `INSERT`, targeted `UPDATE`, and guarded `DELETE` on synthetic data, with target preview and reset.

## Product capabilities to preserve

- Supabase Auth and profile roles.
- Learner dashboard, flat Materi 1–11 list, sequential access, reading-only pages with PDF, progress, and separate practice.
- Read and bounded write practice on synthetic SQLite data in a disposable browser Worker.
- Predict before Run and an accessible 2D schema visualizer with real record/relationship exploration.
- Optional Indonesian video references.
- Optional guided 2D schema modeling with local drafts, formative feedback, and mobile-first controls.
- Contextual AI Tutor during lessons/practice, blocked during assessment.
- Separate diagnostic pre-test and versioned post-test with concept questions plus trusted SQL-authoring grading.
- Admin CMS with draft, preview, and publish flow.
- Vercel and Supabase free-plan deployment target.

## Explicitly out of scope

Programming-language lessons, PTI mapping, external/paid query runner, arbitrary Supabase query access, SQL administration/DDL, bulk or unbounded data mutations, transaction control, 3D, AR, freeform scene authoring, app-wide infinite canvas, and unrelated course paths.

## Current supporting work

- Schema creation now lives in SQLab: custom tables/columns/PK/FK, 2D diagram, local row editing, bounded SQLite queries and AI-generated synthetic drafts with review/apply. Guided modeling and structural grading remain in the Relasi core exercise.
- Four optional lesson videos: source metadata/descriptions checked, dialect notes included; reflection belongs to practice. Full audiovisual review and Write segment selection remain pending.
- [Student trial package](evaluation/2026-10-03-uji-mahasiswa/README.md): moderator protocol, participant tasks, rubric/survey, empty observation sheets, and report template prepared. Student sessions and results are not yet available.

## Simplified learning flow


## Completion gate

The published path presents numbered Materi 1–11 in prerequisite order without chapter/submateri navigation. Relasi/Read/Write remain internal content groups. Reading and PDF stay separate from interactive practice. User practice can inspect, predict, read, safely modify, verify, and reset the synthetic dataset. Progression, video, assessment, admin content flow, mobile usability, RLS, lint, typecheck, tests, and production build remain valid. No unrelated feature phase starts automatically.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.
