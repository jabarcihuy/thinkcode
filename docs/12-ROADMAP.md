# Quethink Roadmap

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
- Separate deterministic checkpoints/final assessment.
- Admin CMS with draft, preview, and publish flow.
- Vercel and Supabase free-plan deployment target.

## Explicitly out of scope

Programming-language lessons, PTI mapping, external/paid query runner, arbitrary Supabase query access, SQL administration/DDL, bulk or unbounded data mutations, transaction control, 3D, AR, freeform scene authoring, app-wide infinite canvas, and unrelated course paths.

## Current supporting work

- Pembuat Skema: guided library/shop cases, tables/columns/PK/FK, automatic 2D layout, local drafts, structural feedback, and public reference explanations.
- Four optional lesson videos: source metadata/descriptions checked, dialect notes included; reflection belongs to practice. Full audiovisual review and Write segment selection remain pending.
- [Student trial package](evaluation/2026-10-03-uji-mahasiswa/README.md): moderator protocol, participant tasks, rubric/survey, empty observation sheets, and report template prepared. Student sessions and results are not yet available.

## Parked for later

- Add a separate pre-test page before the learning materials to measure starting understanding. The retryable exercises on separate material practice pages remain formative practice and are not a pre-test. Decide question coverage, feedback, and how the result is used before implementing it.

## Completion gate

The published path presents numbered Materi 1–11 in prerequisite order without chapter/submateri navigation. Relasi/Read/Write remain internal groups for checkpoint gates. Reading and PDF stay separate from interactive practice. User practice can inspect, predict, read, safely modify, verify, and reset the synthetic dataset. Progression, video, assessment, admin content flow, mobile usability, RLS, lint, typecheck, tests, and production build remain valid. No unrelated feature phase starts automatically.
