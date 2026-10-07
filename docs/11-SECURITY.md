# Security Model

## SQL practice sandbox

Learner SQL runs only in a disposable browser Worker with a small synthetic in-memory SQLite database. The Worker receives no application state, auth tokens, Supabase client, service key, user data, private answer key, or assessment hidden tests.

The course Lab Worker allows only the supported statement subset: lesson-approved `SELECT`, single-row `INSERT`, targeted `UPDATE`, and guarded `DELETE` against the active dataset’s registered synthetic tables. Reject schema changes, `PRAGMA`, transaction controls, attached databases, multiple statements, unauthorized tables, and unsupported clauses. Enforce source, execution-time, result-size, and changed-row limits; terminate the Worker on timeout. Enable SQLite foreign-key enforcement. Worker initialization accepts only a known dataset ID, never caller-supplied DDL or seed data. It creates only that dataset and cannot switch schemas after startup. Browser and Worker write validation both resolve columns and primary keys from that same registry.

Preview update/delete targets before confirmation. Display the affected-row count and visible after-state. Reset reinitializes the seed. The database exists only in the browser practice session and never connects to Supabase or private data.

This is an untrusted learning sandbox, not a trusted grading runtime. Learners can alter browser state/results; browser practice results never determine an official assessment score.

## Supabase

Use publishable keys only in browser code. Service/secret keys remain server-only. Apply RLS to exposed tables and owner predicates to progress, attempts, conversations, and assessment sessions. Every admin route and mutation checks role=ADMIN server-side.

## Assessment

Assessment prompts are allowlisted. Private answer_config and hidden cases never enter client responses or tutor context. Client submissions contain answer identifiers/values only. Server verifies session ownership/status, validates answers, calculates score, writes result, and blocks AI while IN_PROGRESS. Never accept a score or completion flag from the client.

## AI Tutor

Bound message/history and SQL source context. Rate limit requests. Do not include secrets, hidden assessment answers, other-user records, or unrelated database rows. Refuse requests during an active assessment before invoking the provider.

## 2D schema and record inspector

The course visualizer receives only registered synthetic dataset rows and public selection state. It never receives Supabase clients, account records, cookies, private grading configuration, or credentials. Schema metadata uses the selected dataset’s allowlisted tables; record links use current FK matches. SVG/HTML rendering does not execute queries. SQLite execution stays in the bounded Worker. Table positions are predefined, records/results remain accessible DOM tables, and confirmed mutations update only the corresponding local snapshot. No 3D or WebGL runtime is loaded.

## Visual modeling drafts

The guided course schema builder accepts only bounded, validated visual JSON; IDs/names are unique and FK links must target another table's matching-type PK. Render identifiers as escaped React text. Reject corrupt/oversized stored payloads and detach references when objects are removed or their identity/type changes. Draft storage contains only learner-created model metadata. No account token, secret, record data, private answer, DDL, or executable source is included. Schema drafts cannot initialize or extend the shipped SQL dataset registry.

Authentication and an active-assessment check guard the page; errors fail closed. Its browser feedback is formative and has no progress/attempt/score mutation endpoint. Pre-test is available as a diagnostic assessment with zero weight and no passing gate. Video sources use validated HTTPS YouTube URLs, deferred iframe loading, and an external fallback; playback is an external service.

## Admin lesson preview

`/admin/lessons/[lessonId]/preview` requires ADMIN on the server and rechecks authorization before privileged content reads. Draft and published lessons can be inspected without learner prerequisites. Reuse lesson prose, dataset labs, and exercise display; preview does not invoke grading, create attempts, mutate progress, or include AI Tutor. Exercise display fields are allowlisted and answer/test configuration is excluded. Learner routes and their progression rules remain unchanged.

## Material downloads

Reading, practice and PDF share published-material and sequential-unlock authorization. Guests can only download preview material; signed-in users cannot download locked material by URL. A PDF contains public prose/examples and optional video URLs, never exercises, answer keys, private grader data or credentials. HTML/resources are not executed or fetched; document length, page count and table size are bounded. Downloading/reading never changes completion. Practice additionally requires login and is paused while assessment is active.

## Reading and tests

Diagnostic baseline uses PRETEST and cannot be retaken once completed; it is a completion prerequisite, never a pass/fail or score prerequisite. Assessment start and reading acknowledgement serialize per user with transaction advisory locks. A start reuses the caller’s existing same-test session and rejects a different active test. The submit function is service-role-only; client score fields never determine recorded results. Reading acknowledgement takes only lesson ID, derives auth.uid(), verifies availability and denies active assessments. Optional checks alone cannot complete a material. Completion requires read_at and all required deterministic checks; browser output cannot grant completion. PRETEST weight and threshold are constrained to zero. Private grading configuration retains revoked client grants and owner-only RLS on session/results.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

## Browser input recovery

Local drafts are untrusted convenience data, not authorization, score, or completion records. Assessment keys include the authenticated account and session; practice/query keys include the account and task/dataset. Payloads are bounded and shape/content validated; hidden answers and credentials are never included. Successful submission clears its assessment draft. Shared-device browser storage is not confidential against a person with access to the browser profile. Clearing storage loses drafts; there is no cross-device or concurrent-tab synchronization guarantee. Server grading, active-test blocking, prerequisite validation, and owner-only RLS continue to decide all outcomes.

## Trusted SQL assessment sandbox

SQL post-test uses the documented assessment-only exception to browser practice execution. A server-only adapter sends bounded SQL and synthetic fixtures to a disposable Node Worker running SQLite/WASM in memory, with an empty environment. No learner JavaScript is evaluated. SQL authorizer, function/table allowlists, one-row mutation parser, FK enforcement, SQLite resource/progress limits and a parent termination deadline protect the runtime. No Supabase client, secret, filesystem SQL function, network callback or host extension is provided. Worker threads alone are not a generic hostile JavaScript sandbox. Results/reference/fixture values never leave the grader. Infrastructure failure preserves the session rather than awarding a false zero; SQL syntax/constraint/limit failures are failed cases. See planning/2026-10-06-trusted-sql-post-test.md for exact limits and known deployment considerations.

## SQLab custom database boundary

Only SQLab accepts user-created synthetic schemas/data. Course runners remain registry-only. Its Worker revalidates the entire document, quotes identifiers, uses bound inserts with foreign keys enabled, and authorizes queries against only the created tables. No SQL reaches Supabase. Deny schema/transaction/PRAGMA/ATTACH/system-table and unsafe-function operations; bound SQL/time/results/record count and discard failed mutations. Browser drafts are not trusted scoring evidence. AI schema generation authenticates and blocks active tests server-side, shares AI quota, accepts description only (no database contents), and validates bounded JSON. Generated data must be synthetic; explicit review/apply is required. This is local SQLite simulation, not a hosted database provisioning service.

## Named guest demo mode

Users may enter `/guest/start` with only a display name. This creates a signed HttpOnly session cookie, not a Supabase user/profile or new role. `/guest` provides dashboard, all published Database Fundamentals materials/PDFs, core Labs, SQLab, contextual AI and pre/post-test demos without learning prerequisites. Guest pages and APIs are separate from authenticated learner/admin routes; existing RBAC, RLS and official progression remain unchanged.

Guest answers, schema/data drafts and results are memory-only, disappear on leaving/reloading their workspace, and never create lesson_progress, exercise_attempts, AI conversations, assessment_sessions or assessment_results. Guest tests are graded by the existing trusted server adapters; private answer/fixture fields are never serialized. Only transient test mode and hint level are kept in the signed session cookie. AI/Lab helpers block during an active demo test. A signed-in user with an active official test is also blocked from guest endpoints. Guest mode never grants admin access.

The session lasts at most eight hours (session cookie; explicit exit clears it). Signing uses a purpose-specific HMAC with the existing server-only Supabase secret. Published content reads use narrowly projected server queries, never expose the privileged client. Same-origin mutations, bounded inputs, output limits, per-session/IP/process request caps guard the demo. Quotas are process-local; multi-instance production deployments require an upstream shared rate limit/WAF for reliable global AI cost protection. No database migration or anonymous Supabase sign-in configuration is required.


## Public offline fallback

The service worker intercepts same-origin document navigations only and attempts the network first. Its cache contains `/offline.html` only. Never cache authenticated HTML, RSC responses, APIs, assessment data, AI messages, access tokens or progress. Offline retry must reload the original URL so its normal auth/guest boundary runs again. No offline write queue is implemented.
