# Security Model

## SQL practice sandbox

Learner SQL runs only in a disposable browser Worker with a small synthetic in-memory SQLite database. The Worker receives no application state, auth tokens, Supabase client, service key, user data, private answer key, or assessment hidden tests.

The Worker allows only the supported statement subset: lesson-approved `SELECT`, single-row `INSERT`, targeted `UPDATE`, and guarded `DELETE` against the active dataset’s registered synthetic tables. Reject schema changes, `PRAGMA`, transaction controls, attached databases, multiple statements, unauthorized tables, and unsupported clauses. Enforce source, execution-time, result-size, and changed-row limits; terminate the Worker on timeout. Enable SQLite foreign-key enforcement. Worker initialization accepts only a known dataset ID, never caller-supplied DDL or seed data. It creates only that dataset and cannot switch schemas after startup. Browser and Worker write validation both resolve columns and primary keys from that same registry.

Preview update/delete targets before confirmation. Display the affected-row count and visible after-state. Reset reinitializes the seed. The database exists only in the browser practice session and never connects to Supabase or private data.

This is an untrusted learning sandbox, not a trusted grading runtime. Learners can alter browser state/results; browser practice results never determine an official assessment score.

## Supabase

Use publishable keys only in browser code. Service/secret keys remain server-only. Apply RLS to exposed tables and owner predicates to progress, attempts, conversations, and assessment sessions. Every admin route and mutation checks role=ADMIN server-side.

## Assessment

Assessment prompts are allowlisted. Private answer_config and hidden cases never enter client responses or tutor context. Client submissions contain answer identifiers/values only. Server verifies session ownership/status, validates answers, calculates score, writes result, and blocks AI while IN_PROGRESS. Never accept a score or completion flag from the client.

## AI Tutor

Bound message/history and SQL source context. Rate limit requests. Do not include secrets, hidden assessment answers, other-user records, or unrelated database rows. Refuse requests during an active assessment before invoking the provider.

## 2D schema and record inspector

The visualizer receives only registered synthetic dataset rows and public selection state. It never receives Supabase clients, account records, cookies, private grading configuration, or credentials. Schema metadata uses the selected dataset’s allowlisted tables; record links use current FK matches. SVG/HTML rendering does not execute queries. SQLite execution stays in the bounded Worker. Table positions are predefined, records/results remain accessible DOM tables, and confirmed mutations update only the corresponding local snapshot. No 3D or WebGL runtime is loaded.

## Visual modeling drafts

The schema builder accepts only bounded, validated visual JSON; IDs/names are unique and FK links must target another table's matching-type PK. Render identifiers as escaped React text. Reject corrupt/oversized stored payloads and detach references when objects are removed or their identity/type changes. Draft storage contains only learner-created model metadata. No account token, secret, record data, private answer, DDL, or executable source is included. Schema drafts cannot initialize or extend the shipped SQL dataset registry.

Authentication and an active-assessment check guard the page; errors fail closed. Its browser feedback is formative and has no progress/attempt/score mutation endpoint. Pre-test is available as a diagnostic assessment with zero weight and no passing gate. Video sources use validated HTTPS YouTube URLs, deferred iframe loading, and an external fallback; playback is an external service.

## Admin lesson preview

`/admin/lessons/[lessonId]/preview` requires ADMIN on the server and rechecks authorization before privileged content reads. Draft and published lessons can be inspected without learner prerequisites. Reuse lesson prose, dataset labs, and exercise display; preview does not invoke grading, create attempts, mutate progress, or include AI Tutor. Exercise display fields are allowlisted and answer/test configuration is excluded. Learner routes and their progression rules remain unchanged.

## Material downloads

Reading, practice and PDF share published-material and sequential-unlock authorization. Guests can only download preview material; signed-in users cannot download locked material by URL. A PDF contains public prose/examples and optional video URLs, never exercises, answer keys, private grader data or credentials. HTML/resources are not executed or fetched; document length, page count and table size are bounded. Downloading/reading never changes completion. Practice additionally requires login and is paused while assessment is active.

## Reading and tests

Diagnostic baseline uses PRETEST and cannot be retaken once completed; it never counts as a passing prerequisite. Assessment start and reading acknowledgement serialize per user with transaction advisory locks. A start reuses the caller’s existing same-test session and rejects a different active test. The submit function is service-role-only; client score fields never determine recorded results. Reading acknowledgement takes only lesson ID, derives auth.uid(), verifies availability and denies active assessments. Optional checks store attempts and cannot update reading completion. PRETEST weight and threshold are constrained to zero. Private grading configuration retains revoked client grants and owner-only RLS on session/results.

## Current course progression

Pre-test → Materi → optional Lab SQL → Post-test. The authoritative behavior is defined in docs/03-LEARNING_SYSTEM.md. Reading acknowledgement replaces practice completion; historical checkpoints are unpublished and no longer gate the course. Existing history is retained.
