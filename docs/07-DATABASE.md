# Database and Content Model

## Supabase PostgreSQL

Supabase is the source for authenticated users, roles, learning paths, chapters, lessons, exercises, visible/private answer configuration, attempts, assessments, sessions, results, and tutor history.

### Learning content

- `learning_paths`: title, slug, description, publication and ordering.
- `chapters`: one main topic per chapter, with path relationship, sequence position, required and published state.
- `lessons`: one material per lesson, with chapter relationship, Markdown content, summary, order, preview and publication state. SQL examples and optional Indonesian video references remain lesson content/configuration.
- `exercises` and `test_cases`: practice prompt, type, starter SQL, public instructions, expected configuration and visible tests. Private expected values remain server-side where applicable.
- `assessments`, `assessment_items`, `assessment_test_cases`: checkpoint/final question order, private answer configuration, scoring and publication.
- `lesson_progress`, `exercise_attempts`, `assessment_sessions`, `assessment_results`: user-owned progress and outcomes.

All exposed tables retain RLS. Learners can read published content and their own progress/attempts/results. Content mutation uses server-side ADMIN checks.

## Active path structure

The published Database Fundamentals path has three main topics: **Relasi**, **Write**, and **Read**. They map to chapters; each chapter contains lessons, and lesson headings/exercise configuration hold its submaterials. Learner unlock order follows prerequisites: **Relasi → Read → Write**. Exact lesson titles and outcomes are maintained in docs/04-CURRICULUM.md.

When replacing the current seven-chapter shape, preserve accounts, progress, exercise attempts, assessment sessions/results, and AI conversations. Keep historical content records available but unpublished/archived as appropriate; do not delete historical learner data.

## Local SQL dataset

The two Relasi materials do not have a SQL starter or query lab. They show synthetic table records and key structure first. The query lab begins in the Read topic; Write uses the selected registered local dataset for bounded changes. Transfer exercises select `campus`, `library`, or `shop` using `config.public.datasetId`, exposed through public_config; answers and grading configuration stay private. Lesson anchor examples and existing mandatory exercises remain unchanged.

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
