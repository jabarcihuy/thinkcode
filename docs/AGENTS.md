# Quethink — Agent Instructions

## Product

Quethink is an Indonesian-language platform for learning relational databases through data exploration and SQL. The only active learning path is Database Fundamentals. JavaScript and TypeScript are app implementation languages, not learner course material. There is no programming course or PTI curriculum.

The learner flow is **mandatory diagnostic Pre-test → reading Materi → paired Lab core check → next material → Post-test → completion**. Materi 1–11 is a flat reading/PDF list in Relasi → Read → Write order, with optional video and no embedded exercises, editor or AI. Reading acknowledgement stores read_at; server-verified core practice completes the material. See docs/03-LEARNING_SYSTEM.md for progression and historical-completion policy. Pre-test has zero score weight; post-test requires ≥75. AI is contextual in Lab/chatbot and blocked server-side during any active test.

## Product guardrails

- Keep the interface focused and easy to follow. Learner Lab displays required core exercises only; preserve historical optional attempts without rendering the additional-exercise section.
- Teach relational tables, rows, columns, primary/foreign keys, SELECT, FROM, WHERE, AND/OR, ORDER BY, LIMIT, INNER JOIN, COUNT, AVG, GROUP BY, and single-row INSERT/targeted UPDATE/guarded DELETE.
- For course Labs and assessments use the shipped synthetic dataset registry: Campus Mini for the anchor examples and optional practice, Katalog Buku and Toko Mini for transfer activities. Keep each lab confined to its selected schema; switch/reset creates a fresh local session.
- SQL practice runs only against local SQLite WASM data. Post-test SQL authoring uses the same SQLite/WASM engine in a bounded, server-only Node Worker against isolated synthetic fixtures. Neither execution path connects to Supabase or production data.
- In course Labs keep the learner write subset narrow: one statement at a time, one row changed, target preview before UPDATE/DELETE, foreign keys enabled, and deterministic reset.
- In course query runners reject DDL/schema changes, PRAGMA, transaction control, ATTACH, multiple statements, unsupported tables, bulk mutations, and unbounded writes.
- Use a focused 2D schema visualizer with named tables, column types, PK/FK labels, and column-to-column relationship lines. Provide table/record selection, pan, zoom, fit, and reset. Keep positions predefined and mobile controls accessible; the app has no 3D viewer.
- Videos are optional support. Assessments stay separate from retryable practice and never trust browser SQL results as official scores.
- SQLab (`/playground`) includes the custom schema builder, row editor, SQL queries and AI database designer. `/schema-builder` redirects there. User-created schemas/data stay in an account-scoped browser draft and isolated SQLite Worker, never Supabase. Bound custom documents to six tables, eight columns/table, twelve FK relations, 100 rows/table, 500 characters/cell and 250 KB. AI returns a validated synthetic draft for explicit review/apply, not executable SQL. SQLab permits bounded multi-row local DML with confirmation; course single-row restrictions stay unchanged. Schema edits use validated forms, not arbitrary DDL. Block helpers during active assessments; AI endpoint must fail closed and share AI quota.
- The paired Relasi core task still uses the guided schema-modeling components and server grading; SQLab never changes progress.
- Keep USER/ADMIN roles, server-side authorization, RLS, progress, AI Tutor, and Admin CMS where they support the database course.
- Preserve historical user data when replacing old learning content. Unpublish/archive old content; do not delete attempts, assessment results, or progress.
- Use the existing Next.js Node runtime for the assessment-only SQLite Worker; keep learner practice browser-local. No separate server, paid runner, or always-on infrastructure.

## Stack and implementation

Use the existing Next.js App Router, strict TypeScript, Tailwind, shadcn/ui primitives, Supabase Auth/PostgreSQL, and Vercel target. JavaScript/TypeScript files are application code only.

Read the local Next.js guide under node_modules/next/dist/docs before changing App Router behavior. For Supabase auth, migrations, RLS, or database access, read the Supabase skill and current Supabase docs first. Read the relevant files in docs/ before changing product behavior.

Separate UI, SQL runner, content access, progress, authorization, validation, and provider code. Validate untrusted SQL and payload size at the execution boundary. Never expose service credentials or private assessment answers.

## Done means

The public app, dashboard, flat material list, reading/PDF, separate core labs and independent SQLab playground, pre-test/post-test, and Admin CMS present the database course only. SQL exercises run on local synthetic data with bounded read and write operations; practice and assessment remain separate. Lint, typecheck, tests, and production build pass.

## Named guest demo mode

Users may enter `/guest/start` with only a display name. This creates a signed HttpOnly session cookie, not a Supabase user/profile or new role. `/guest` provides dashboard, all published Database Fundamentals materials/PDFs, core Labs, SQLab, contextual AI and pre/post-test demos without learning prerequisites. Guest pages and APIs are separate from authenticated learner/admin routes; existing RBAC, RLS and official progression remain unchanged.

Guest answers, schema/data drafts and results are memory-only, disappear on leaving/reloading their workspace, and never create lesson_progress, exercise_attempts, AI conversations, assessment_sessions or assessment_results. Guest tests are graded by the existing trusted server adapters; private answer/fixture fields are never serialized. Only transient test mode and hint level are kept in the signed session cookie. AI/Lab helpers block during an active demo test. A signed-in user with an active official test is also blocked from guest endpoints. Guest mode never grants admin access.

The session lasts at most eight hours (session cookie; explicit exit clears it). Signing uses a purpose-specific HMAC with the existing server-only Supabase secret. Published content reads use narrowly projected server queries, never expose the privileged client. Same-origin mutations, bounded inputs, output limits, per-session/IP/process request caps guard the demo. Quotas are process-local; multi-instance production deployments require an upstream shared rate limit/WAF for reliable global AI cost protection. No database migration or anonymous Supabase sign-in configuration is required.
