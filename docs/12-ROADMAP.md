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
- Learner dashboard, sequential lesson access, progress, and practice.
- Read and bounded write practice on synthetic SQLite data in a disposable browser Worker.
- Predict before Run and an accessible 2D schema visualizer with real record/relationship exploration.
- Optional Indonesian video references.
- Contextual AI Tutor during lessons/practice, blocked during assessment.
- Separate deterministic checkpoints/final assessment.
- Admin CMS with draft, preview, and publish flow.
- Vercel and Supabase free-plan deployment target.

## Explicitly out of scope

Programming-language lessons, PTI mapping, external/paid query runner, arbitrary Supabase query access, SQL administration/DDL, bulk or unbounded data mutations, transaction control, 3D, AR, freeform scene authoring, app-wide infinite canvas, and unrelated course paths.

## Parked for later

- Add a separate pre-test page before the learning materials to measure starting understanding. The retryable exercises embedded in lessons remain formative practice and are not a pre-test. Decide question coverage, feedback, and how the result is used before implementing it.

## Completion gate

The published path presents the three topics and submaterials in prerequisite order. User practice can inspect, predict, read, safely modify, verify, and reset the synthetic dataset. Progression, video, assessment, admin content flow, mobile usability, RLS, lint, typecheck, tests, and production build remain valid. No unrelated feature phase starts automatically.
