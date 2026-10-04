# Quethink — Agent Instructions

## Product

Quethink is an Indonesian-language platform for learning relational databases through data exploration and SQL. The only active learning path is Database Fundamentals. JavaScript and TypeScript are app implementation languages, not learner course material. There is no programming course or PTI curriculum.

The learner flow is **Pre-test → Materi → Lab SQL → Post-test**, on separate pages. Materi 1–11 is a flat reading/PDF list, ordered Relasi → Read → Write, with optional videos and no submateri, missions, exercises, query editor or AI panel. “Selesai dibaca” acknowledges reading server-side and unlocks the next material; it is not mastery. Labs and optional formative checks live separately at `/lab` and existing material `/practice` URLs. Pre-test is diagnostic, one completed baseline per user, zero weight, no passing gate. Post-test is server-graded after required reading, pass ≥75. Historical checkpoint/content/attempt records stay intact but unpublished gates are inactive. Follow docs/03-LEARNING_SYSTEM.md for progression and session rules.

## Product guardrails

- Keep the interface focused and easy to follow.
- Teach relational tables, rows, columns, primary/foreign keys, SELECT, FROM, WHERE, AND/OR, ORDER BY, LIMIT, INNER JOIN, COUNT, AVG, GROUP BY, and single-row INSERT/targeted UPDATE/guarded DELETE.
- Use the shipped synthetic dataset registry: Campus Mini for the anchor examples and optional practice, Katalog Buku and Toko Mini for transfer activities. Keep each lab confined to its selected schema; switch/reset creates a fresh local session.
- SQL practice runs only against local SQLite WASM data. It never connects to Supabase or private data.
- Keep the learner write subset narrow: one statement at a time, one row changed, target preview before UPDATE/DELETE, foreign keys enabled, and deterministic reset.
- Reject DDL/schema changes, PRAGMA, transaction control, ATTACH, multiple statements, unsupported tables, bulk mutations, and unbounded writes.
- Use a focused 2D schema visualizer with named tables, column types, PK/FK labels, and column-to-column relationship lines. Provide table/record selection, pan, zoom, fit, and reset. Keep positions predefined and mobile controls accessible; the app has no 3D viewer.
- Videos are optional support. Assessments stay separate from retryable practice and never trust browser SQL results as official scores.
- `/schema-builder` is a separate guided visual modeling exercise for tables, columns, PK/FK, and one-to-many relationships. Use bounded validated local drafts and automatic diagram positions. It pauses during assessment and never initializes the SQL Worker, generates executable DDL, or changes progress/scores. Mobile uses labeled forms and Susun/Diagram/Periksa tabs.
- Keep USER/ADMIN roles, server-side authorization, RLS, progress, AI Tutor, and Admin CMS where they support the database course.
- Preserve historical user data when replacing old learning content. Unpublish/archive old content; do not delete attempts, assessment results, or progress.
- Do not add a server, paid runner, or new infrastructure for SQL execution.

## Stack and implementation

Use the existing Next.js App Router, strict TypeScript, Tailwind, shadcn/ui primitives, Supabase Auth/PostgreSQL, and Vercel target. JavaScript/TypeScript files are application code only.

Read the local Next.js guide under node_modules/next/dist/docs before changing App Router behavior. For Supabase auth, migrations, RLS, or database access, read the Supabase skill and current Supabase docs first. Read the relevant files in docs/ before changing product behavior.

Separate UI, SQL runner, content access, progress, authorization, validation, and provider code. Validate untrusted SQL and payload size at the execution boundary. Never expose service credentials or private assessment answers.

## Done means

The public app, dashboard, flat material list, reading/PDF, separate optional labs, pre-test/post-test, and Admin CMS present the database course only. SQL exercises run on local synthetic data with bounded read and write operations; practice and assessment remain separate. Lint, typecheck, tests, and production build pass.
