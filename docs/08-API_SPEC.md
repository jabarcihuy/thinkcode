# ThinkCode — API Specification

## Auth and Learning

Supabase Auth provides signup, login, logout, and session. Next.js server pages load published learning paths and enforce preview, prerequisite, and ownership rules. Lesson completion is triggered only after mandatory practice passes. The previous manual completion action is disabled.

## Local Code Execution

There is **no** `/api/code/run` in the JavaScript MVP. `BrowserJavaScriptRunner` implements `CodeRunner` in the client. Monaco edits `main.js`; the browser sends source and optional text `input` only to an opaque-origin iframe and its disposable worker. Run returns stdout, stderr, status, execution time, and capped execution trace to the UI. Run never changes progress.

## POST `/api/exercises/:id/check`

Requires authenticated USER/ADMIN, a published exercise, and an unlocked lesson. Input is size-limited and validated by exercise type. Requests are rate-limited.

- Predict Output: `{ pathSlug, answer: { output } }`.
- Pseudocode/Flowchart: `{ pathSlug, answer: { choiceId } }` or `{ pathSlug, answer: { order } }`.
- Coding: `{ pathSlug, sourceCode, runResults: [{ position, status, stdout, stderr }] }`. The client obtains `runResults` by executing all **visible** tests in the browser sandbox.

The server reads private exercise configuration, compares deterministic answers or reported visible outputs, records an attempt, and returns score, safe feedback, visible results, and lesson completion. The coding result is client-reported and therefore unsuitable for trusted assessment. The server refuses a coding exercise configured with hidden tests; hidden values are never serialized to the browser.

## AI Tutor

- `GET /api/ai/tutor?lessonId=...&exerciseId=...`: authenticated owner context/history, with no private exercise config or tests.
- `POST /api/ai/tutor`: authenticated, schema-limited contextual message/action; streams provider output. Reads only published lesson/exercise context and current user's summary progress. Rejects active assessment server-side with 403 before provider invocation. Rate-limited and history/source/output/trace are bounded.
- AI session/message writes occur server-side after ownership checks. Client cannot call tutor tools to change progress, scores, or completion.

## Assessment

- `POST /api/assessments/:slug/start`: authenticated user, prerequisite and earlier checkpoint checks; returns one active session per assessment/user.
- `GET /api/assessment-sessions/:sessionId`: owner-only, returns an allowlisted assessment and public item fields. Never returns `answer_config`, `entry_function`, test cases, or hidden expected values.
- `POST /api/assessment-sessions/:sessionId/submit`: owner-only active session, limited/validated answers, server-side QuickJS assessment runner, trusted score calculation, safe result. No client score is accepted. Hidden test values/results are removed; only hidden pass counts are returned.

Assessment coding runs in a server-only QuickJS/WASM interpreter adapter with capability-limited context, memory/stack/output/time bounds. It is not an OS process or a separately deployed sandbox service; see `11-SECURITY.md` for limitations. QuickJS remains isolated from the route/domain through `AssessmentRunner`.

## Admin CMS

- `GET /api/admin/overview`, `GET /api/admin/users`, and `GET /api/admin/:resource`: ADMIN only. Admin exercise and assessment item responses may include private configuration and hidden test cases because the caller is verified as ADMIN on the server.
- `POST /api/admin/:resource`: ADMIN only, schema validated. New content is forced to draft state.
- `PATCH /api/admin/:resource/:id`: ADMIN only; supports validated updates, explicit publish/unpublish, and position changes. Assessments require items and coding assessment items require server test cases before publish. Browser practice coding exercises must have visible cases; hidden code tests cannot be securely graded in the browser and therefore block publication.
- `DELETE /api/admin/test-cases/:id`, `assessment-items/:id`, or `assessment-test-cases/:id`: ADMIN only, limited to child test/question records. Learning paths, chapters, lessons, and exercises are unpublished instead of deleted.
- `POST /api/admin/assistant`: ADMIN only, bounded and rate limited. Returns an AI suggestion; it never persists or publishes content by itself.

Every route verifies the profile role before using server-only privileged Supabase access. Content table writes are revoked for browser roles.

## Future APIs

Admin content mutations must verify `ADMIN` server-side. AI Tutor and core checkpoint/final assessment APIs are implemented; future work includes Admin CMS, more content, and further hardening.
