# Trusted SQL post-test — 6 October 2026

## Decision

Pre-test stays diagnostic (10 choices, zero weight). A versioned post-test adds six authoring tasks to the ten existing concept questions. Each concept weighs 1; each SQL task weighs 5: concepts 25%, SQL 75%; pass threshold stays 75. Task-level partial credit follows the proportion of passing fixtures, not query text. This is evidence of the taught bounded SQL subset, not unrestricted database proficiency.

## Execution boundary

Reuse @sqlite.org/sqlite-wasm Node in-memory support. A disposable worker_threads Worker receives only source, registered synthetic schema/seed, operation, private reference and bounded fixture variants. env is empty. It loads the installed WASM artifact, never evaluates learner JavaScript. SQLite authorizer permits SELECT/registered-table reads, six aggregate functions and only the configured single-row mutation. It rejects DDL, attachment, PRAGMA, transaction control, system tables and unsupported functions. Common input validation rejects multiple statements, comments and oversized source. SQL cannot access host APIs. Worker separation is scheduling isolation, not a general hostile JavaScript security boundary.

Each database is :memory:. Foreign keys are enabled; extension loading, host callbacks, file/network access and Supabase clients are absent. A SQLite progress handler interrupts expensive statements (250 ms / 250,000 VM instructions / 32 MiB observed WASM heap). Source ≤4096 characters, ≤100 result rows, ≤24 columns, cells ≤2000 characters; response data ≤80,000 characters. Parent terminates the Worker after 5 seconds, including initialization. Initialization/configuration failures keep the session open for retry; invalid learner queries score zero.

## Grading

Private answer_config stores referenceQuery, ordered and 2–4 fixtures. First fixture uses the public seed; hidden variants change data to reject hardcoded output. For SELECT compare column count and typed cell values; column aliases are not graded. Ordered results require exact order; unordered results compare row multisets including duplicates. For mutations require the configured action/table, exactly one affected row and identical full post-state across all tables to an independently run reference database. No expected rows or hidden fixture values are returned.

Run uses a fresh browser-only public seed, with UPDATE/DELETE preview and confirmation. It never checks hidden fixtures. SQL input, local draft recovery, data inspection and output are stacked vertically on mobile. No AI, hints or answer-key feedback during assessment.

## History and rollout

Create post-test-basis-data-sql-v2, copy existing concept items, append six authoring items. Publish only after code/build and fixture checks pass; unpublish the old post-test without altering its questions, sessions or results. Rollout aborts if an old session is still active; finish it before switching. Old results remain accessible by their URLs. Old concept-only scores are not evidence of passing v2; the dashboard follows the published version. Material progress and diagnostic baseline stay intact. No new infrastructure/key is required. Vercel deployment remains a separate action and needs a hosted smoke check for traced worker/WASM assets.

## Evidence

- SQLite WASM Node support is in-memory only: https://github.com/sqlite/sqlite-wasm#nodejs-support
- SQLite authorizer: https://sqlite.org/c3ref/set_authorizer.html
- SQLite progress interruption: https://sqlite.org/c3ref/progress_handler.html
- Worker termination and resource limits: https://nodejs.org/api/worker_threads.html
- Next.js tracing includes: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md

## Verification

Migration applied through Supabase MCP to project dadjfyjvalnaqqrmqpfa. Pre-test remains published with 10 concept questions; the retired post-test and its records remain; SQL v2 is published with 16 items, including 6 SQL tasks. Lint and typecheck pass; 251 unit tests pass; production build passes. Local production browser integration passes real SQL Run, write preview/confirmation, draft recovery, server submit, score 100, incorrect SQL score 25, retry/highest-score retention, ownership, AI blocking, forged-score rejection, input and rate limits, private-field/secret bundle scans, and 360/768/1280 layouts. Worker/WASM artifacts are present in submit and admin publish build traces. Hosted Vercel Node 24 execution has not been tested.

The complete browser/API regression also passes diagnostic submission, reading/PDF, all 11 core completions including schema modeling, prerequisite unlocks, optional-task non-completion, SQL post-test/retry, owner-only scores, admin restrictions, AI blocking in both test modes, browser SQL smoke, and mobile/tablet/desktop layouts. Temporary test accounts are removed after both integrations.
