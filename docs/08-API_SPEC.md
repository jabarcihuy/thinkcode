# API Specification

## Learner routes

- GET /learn/[pathSlug]: flat numbered published-material list in prerequisite order.
- GET /learn/[pathSlug]/lessons/[lessonSlug]: reading-only published/preview prose and examples, with server-side lock checks.
- GET /learn/[pathSlug]/lessons/[lessonSlug]/practice: authenticated, lock-checked lab and practice; paused during active assessment.
- GET /learn/[pathSlug]/lessons/[lessonSlug]/pdf: dynamic A4 PDF of public material, authorized identically to reading. Returns application/pdf with attachment filename and private/no-store; 404 for unavailable/locked material, safe 503 on generation failure. No progress mutation or private grading data.
- POST /api/exercises/[id]/check: validates a practice answer, records the user's own attempt, and returns safe visible feedback. Browser SQL results are formative and are not trusted as assessment evidence.
- GET /api/ai/tutor?lessonId=…: authenticated, no-store conversation history for the selected available lesson; also rejects during an active assessment.
- POST /api/ai/tutor: authenticated, bounded database tutoring. Rejects during an active assessment.
- POST /api/assessments/[slug]/start: verifies prerequisites and creates one owned session.
- GET /api/assessment-sessions/[sessionId]: returns public assessment prompts only.
- POST /api/assessment-sessions/[sessionId]/submit: grades deterministic answers on the server; client scores are ignored.

## SQL Run

Practice SQL runs entirely in the browser Worker against synthetic in-memory SQLite. It supports lesson-approved read queries and narrowly scoped one-row `INSERT`, `UPDATE`, and `DELETE`. It does not post learner statements to a Next.js SQL endpoint, Supabase, or an external runner.

The protected `/playground` page reuses this Worker with a registered dataset selection without a lesson-specific prompt or progress write. It checks active assessment state server-side and pauses while an assessment is in progress. `/chatbot` is a protected UI over the existing tutor API and selects the user's current/next lesson as context; it adds no new provider endpoint.

`UPDATE` and `DELETE` must show the matching target rows before confirmation. The Worker returns only visible result rows, affected-row count, and safe errors. Reset reseeds the disposable database. Worker startup accepts `{ action: "init", datasetId: "campus" | "library" | "shop" }` only; all table definitions and rows come from the shipped registry. Public transfer exercise config includes only its dataset ID, question options, or output columns—not its answer or grading configuration.

## Admin

GET `/admin/lessons/[lessonId]/preview`: ADMIN-only full lesson preview, including saved draft prose and a separate disclosure for browser-local SQL lab and non-grading exercise preview. Reads do not depend on learner progress and never record completion.

Admin routes under /api/admin require a valid session and ADMIN role for every operation. Content is draft-first; publish is an explicit validated server action.

## Input limits

Bound SQL text, statement count, practice payloads, AI context, answer count, affected rows, result rows/cells, and assessment attempts. Do not return hidden answers/test values or raw provider errors.
