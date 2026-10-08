# API Specification

## Current product revision — 8 October 2026

Pre-test is retired from account and guest flows. Start with the first material; reading plus required core practice still unlocks the next. The final assessment is named **Tantangan Akhir / Final Challenge**, still unlocked after all required materials, graded server-side and passed at 75. Historical diagnostic questions/sessions/results remain archived; old pre-test URLs redirect to materials. Earlier baseline descriptions below are historical and do not define the active flow. A mobile-first database discussion forum is now explicitly in scope at the user's request; see planning/2026-10-08-forum.md.

## Learner routes

- GET /pre-test: diagnostic baseline with no passing gate, one completed result.
- GET /post-test: scored final test after required material completion.
- GET /lab: index of paired core labs and optional supporting tools.
- GET /assessments: redirects to /post-test; historical session/result URLs remain valid.
- POST /api/materials/[lessonId]/read: authenticated reading acknowledgement; checks sequence/publication and denies while any test is active. Does not accept a user ID or score.

- GET /learn/[pathSlug]: flat numbered published-material list in prerequisite order.
- GET /learn/[pathSlug]/lessons/[lessonSlug]: reading-only published/preview prose and examples, with server-side lock checks.
- GET /learn/[pathSlug]/lessons/[lessonSlug]/practice: authenticated, lock-checked lab and practice; paused during active assessment.
- GET /learn/[pathSlug]/lessons/[lessonSlug]/pdf: dynamic A4 PDF of public material, authorized identically to reading. Returns application/pdf with attachment filename and private/no-store; 404 for unavailable/locked material, safe 503 on generation failure. No progress mutation or private grading data.
- POST /api/exercises/[id]/check: validates a practice answer, requires baseline, available material and read_at, records the user's own attempt, and returns safe visible feedback plus lessonCompleted. Required deterministic checks can complete the material; optional checks alone cannot. Browser SQL results are formative and are not trusted as assessment evidence.
- GET /api/ai/tutor?lessonId=…: authenticated, no-store conversation history for the selected available lesson; also rejects during an active assessment.
- POST /api/ai/tutor: authenticated, bounded database tutoring. Rejects during an active assessment.
- POST /api/assessments/[slug]/start: verifies prerequisites and creates one owned session.
- GET /api/assessment-sessions/[sessionId]: returns public assessment prompts only.
- POST /api/assessment-sessions/[sessionId]/submit: grades deterministic answers and bounded SQL authoring on the server; forged score fields are rejected. SQL uses `{sourceCode: string}` (≤4096 characters) for a strict mode=sql item. Invalid ownership/status/answer shapes are rejected before execution.

## SQL Run

Practice SQL runs entirely in the browser Worker against synthetic in-memory SQLite. It supports lesson-approved read queries and narrowly scoped one-row `INSERT`, `UPDATE`, and `DELETE`. It does not post learner statements to a Next.js SQL endpoint, Supabase, or an external runner.

The protected `/playground` page reuses this Worker with a registered dataset selection without a lesson-specific prompt or progress write. It checks active assessment state server-side and pauses while an assessment is in progress. `/chatbot` is a protected UI over the existing tutor API and selects the user's current/next lesson as context; it adds no new provider endpoint.

`UPDATE` and `DELETE` must show the matching target rows before confirmation. The Worker returns only visible result rows, affected-row count, and safe errors. Reset reseeds the disposable database. Course Worker startup accepts `{ action: "init", datasetId: "campus" | "library" | "shop" }` only; all table definitions and rows come from the shipped registry. Public transfer exercise config includes only its dataset ID, question options, or output columns—not its answer or grading configuration.

## Admin

GET `/admin/lessons/[lessonId]/preview`: ADMIN-only full lesson preview, including saved draft prose and a separate disclosure for browser-local SQL lab and non-grading exercise preview. Reads do not depend on learner progress and never record completion.

Admin routes under /api/admin require a valid session and ADMIN role for every operation. Content is draft-first; publish is an explicit validated server action.

## Input limits

Bound SQL text, statement count, practice payloads, AI context, answer count, affected rows, result rows/cells, and assessment attempts. Do not return hidden answers/test values or raw provider errors.


## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

## Assessment SQL boundary

The submit handler loads private references/fixtures only after session ownership and active status checks. SQLite/WASM runs in a disposable server Worker; it never runs against Supabase. The response allowlist contains score, passing state, topic summaries and fixture pass counts only, never query references, hidden rows, expected results or raw SQLite errors. Public session JSON allowlists options/blocks or mode=sql, registered dataset, operation and table. Coba query stays browser-local on public seed and has no grading endpoint. Runtime/configuration failure returns safe 503 and keeps the session open for retry.

## SQLab AI database designer

`POST /api/sqlab/generate` accepts `{ prompt: string }` (10–2,000 characters; request ≤10 KB). Requires authentication, no active assessment and shared AI quota. Returns `{ draft: SqlabDocument }` only after validating schema, PK/FK and bounded synthetic rows. Statuses: 400 invalid input, 401 guest, 403 active assessment/cross-origin, 429 quota, 502 provider/invalid generated draft, 503 assessment state unavailable. Private/no-store response; no automatic write or publish.

SQLab query execution has no server endpoint: a dedicated browser Worker receives a validated document and one SELECT/INSERT/UPDATE/DELETE statement. It returns result rows/columns and a revalidated local snapshot, or a safe error with no changed snapshot. Custom schema/data never enter the course registry, progress API or assessment grader. See 06-ARCHITECTURE.md for caps.

## Named guest demo APIs

Namespace `/api/guest` accepts a signed HttpOnly guest session rather than a Supabase account. It only exposes published course content. `/tutor`, `/sqlab`, `/check/[id]`, `/pdf/[slug]`, and `/tests/[id]/submit` reuse bounded server services without writing progress, attempts, AI history, or official assessment results. Guest tests use trusted server grading and return only aggregate scores; answer keys and hidden fixtures never leave the server. Demo tests block guest AI/helpers; an active official account test also blocks guest endpoints. Same-origin checks, request validation and process-local quotas apply. Production deployments spanning instances require a shared upstream abuse limit.
