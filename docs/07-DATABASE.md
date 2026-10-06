# Database and Content Model

## Supabase PostgreSQL

Supabase is the source for authenticated users, roles, learning paths, chapters, lessons, exercises, visible/private answer configuration, attempts, assessments, sessions, results, and tutor history.

### Learning content

- `learning_paths`: title, slug, description, publication and ordering.
- `chapters`: one main topic per chapter, with path relationship, sequence position, required and published state.
- `lessons`: one material per lesson, with chapter relationship, Markdown content, summary, order, preview and publication state. SQL examples and optional Indonesian video references remain lesson content/configuration.
- `exercises` and `test_cases`: practice prompt, type, starter SQL, public instructions, expected configuration and visible tests. Private expected values remain server-side where applicable.
- `assessments`, `assessment_items`, `assessment_test_cases`: pre-test/post-test and historical checkpoint question order, private answer configuration, scoring and publication.
- `lesson_progress`, `exercise_attempts`, `assessment_sessions`, `assessment_results`: user-owned progress and outcomes.

All exposed tables retain RLS. Learners can read published content and their own progress/attempts/results. Content mutation uses server-side ADMIN checks.

## Active path structure

The published Database Fundamentals path has three main topics: **Relasi**, **Write**, and **Read**. They map to chapters; each chapter contains lessons, and each lesson is one numbered material. Learner unlock order follows prerequisites: **Relasi → Read → Write**. Exact lesson titles and outcomes are maintained in docs/04-CURRICULUM.md.

When replacing the current seven-chapter shape, preserve accounts, progress, exercise attempts, assessment sessions/results, and AI conversations. Keep historical content records available but unpublished/archived as appropriate; do not delete historical learner data.

## Local SQL dataset

The two Relasi materials do not have a SQL starter or query lab. They show synthetic table records and key structure first. The query lab begins in the Read topic; Write uses the selected registered local dataset for bounded changes. Transfer exercises select `campus`, `library`, or `shop` using `config.public.datasetId`, exposed through public_config; answers and grading configuration stay private. Lesson examples and exercise identities remain unchanged; one published core per material is required; other checks remain optional.

The browser Worker creates an in-memory synthetic schema:

- `students(student_id PK, name, cohort)`
- `courses(course_id PK, course_code, course_name, credits)`
- `enrollments(enrollment_id PK, student_id FK, course_id FK, score)`

Course names are Basis Data, Matematika Diskrit, and Sistem Informasi. All values are fictional and never copied from Supabase user tables.

SQLite foreign-key checks are enabled. The Worker permits lesson-supported `SELECT` and single-row `INSERT`, `UPDATE`, and `DELETE` only. It rejects DDL, pragmas, transaction controls, attached databases, multiple statements, and unsupported tables/statements. Changed rows and result output are capped. Reset restores the known seed. Playground changes are not persisted to Supabase.

## Assessment answer security

Public assessment reads allowlist question text and public configuration. answer_config and private test values stay server-only. Browser practice and its SQL results are not trusted grading evidence; assessment answers are graded separately on the server.

## Migrations

Use additive migrations and preserve accounts, progress, and historical attempts. Reorganize content without destructive resets: archive/unpublish replaced learning content, keep stable historical references where possible, and seed the three-topic curriculum. Do not delete user-generated or historical records to reset the product surface.

## Diagnostic and post-test data

Assessment enum includes PRETEST. A published ten-item PRETEST has zero weight/passing score; a published ten-item FINAL serves as post-test, weight 100 and threshold 75. Both reuse assessment_items/sessions/results and their existing private-content/owner-only RLS. Historical checkpoint/final rows are unpublished. phase3_record_attempt stores attempts and completes a read material when all published required deterministic checks passed. Browser runtime outcomes cannot provide completion evidence. acknowledge_material_read is authenticated-only, checks availability and active sessions, and stores the caller’s read_at/IN_PROGRESS without completion. Serialized starts prevent multiple active tests and a completed PRETEST cannot restart. Historical content IDs, attempts and results are preserved.

## Constrained server-side writes

The security advisor flags authenticated SECURITY DEFINER RPCs as intentional review points. Reading acknowledgement needs constrained elevated writes because clients have no arbitrary progress-write grant. It derives the caller with auth.uid(), uses an empty search_path, checks publication/prerequisites/assessment state, and grants only authenticated execution. Anonymous access and client finalization are denied in live tests. Private assessment tables intentionally have no client policies/grants.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

## Mandatory core migration

`20261005091218_mandatory_learning_core.sql`: additive nullable `lesson_progress.read_at`, backfill historical COMPLETED, one required published core per material, one new FLOWCHART schema task. `course_has_baseline` service-only lookup; availability checks baseline and sequence; authenticated read RPC derives auth.uid(); service-only attempt RPC requires read_at and excludes browser coding types from completion. Start RPC requires baseline and all required completion for post-test. Existing RLS, ownership and active-session unique index are preserved.

Admin publication: required lessons must have a published deterministic core before publication. Draft exercise editors retain is_required and validate schema-model keys/edges.

## Trusted SQL post-test version

`post-test-basis-data-sql-v2` is a new FINAL assessment. The migration copies ten concept items and adds six PROBLEM_SOLVING items with strict public mode=sql, datasetId, operation and optional mutation table. Private answer_config holds referenceQuery, ordering and bounded synthetic fixture overrides. These JSON fields reuse existing schema; no new public grants or RLS changes. Old post-test items, attempts, sessions and results are retained unpublished.
