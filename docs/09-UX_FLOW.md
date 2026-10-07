# UX Flow

## Public landing

Explain in one sentence that Quethink teaches learners to understand relationships, read data, and safely change a practice database. Show the simple cycle: inspect → predict → query → see the result/change. Primary action is to start learning.

## Learner

1. Register/sign in and see the next step on the dashboard.
2. Open `/pre-test`: ten diagnostic questions, including Belum tahu; no passing gate, no course weight, one completed baseline. Complete it before opening new materials; no passing score is required.
3. Open numbered Materi 1–11. Read prose/examples/video or download PDF.
4. Choose **Selesai membaca, lanjut ke Lab**. Store read_at on the server, then navigate directly to the paired core. If saving fails, stay on reading and offer retry. Previously acknowledged reading has a direct **Lanjut ke latihan inti** link.
5. Inspect tables/query and pass the required core. Optional worked examples explain concepts without revealing graded answers. Feedback offers retry and a link back to reading. After success, the next-material action appears immediately after the core, before AI help. Learner Lab renders only required exercises, without an additional optional-exercise section or extra schema-exercise link.
6. After all required material completion, take `/post-test`. Score is server-graded, pass ≥75, retry after the previous session ends.
7. Course complete means reading and core completion plus post-test passed. Historical checkpoint gates are unpublished.

Mobile navigation has five items: Beranda, Materi, Menu (center), Tes, Profil (rightmost). Menu expands upward above the bottom bar to expose Lab Materi, SQLab, Chatbot, Pre-test and Post-test. ADMIN also sees Admin CMS; users can sign out explicitly. The panel closes on choosing a destination, outside tap, Escape or its close control. All destination routes retain their existing server authorization, prerequisite and assessment restrictions. Tes opens pre-test with a post-test switch; both are also directly reachable from Menu.

## Account tools

**Lab Materi** (`/lab`) is required practice paired with numbered materials. **SQLab** (`/playground`) is the separate, optional SQL playground. These names distinguish course completion from independent experimentation.

The signed-in navigation provides separate **Chatbot** and **SQLab** entries. Chatbot uses the current or next available lesson as context, links to that lesson, and offers concept-level help; it does not claim to see a query unless the learner asks from an separate material practice lab. SQLab integrates schema creation, data editing, query execution, and a dedicated AI designer. Mobile uses Skema / Data / Query / AI tabs; the 2D diagram appears under schema forms, and query results under the editor. Name a database, add tables/columns, connect FK→PK, insert parent records before child records, then query. AI creates a synthetic draft from the user's request, shows schema and sample records, and replaces the current database only after explicit Apply. Reset also requires confirmation. SQLab is optional, requires login, pauses during active tests and never changes scores/progress. Browser-local persistence is clearly labeled.

## Pembuat Skema

Standalone schema creation lives inside SQLab; old `/schema-builder` links redirect to `/playground`. The mandatory Relasi core exercise retains its guided structural task and server-side grading.

Each case preserves its own local draft. Reset requires confirmation, storage failure is explained, and invalid stored data can be discarded explicitly. Feedback points to incomplete structure and asks for an explanation; after trying, learners can reveal a reference model. This optional tool does not complete lessons or determine scores and is paused during an active assessment.

Videos remain optional disclosures within lesson material. They load a YouTube no-cookie iframe only after the learner chooses Putar video, can be closed, and always offer a link to YouTube if playback fails. Use the lesson's dataset and bounded SQL conventions rather than asking learners to install the tools shown in a video.

## Lesson workspace

Reading is a single readable column on every viewport. Practice is separate: Relasi uses sample tables and key visualization; Read/Write use the prompt, query editor, and result/visualization panels.

Mobile: Relasi keeps sample tables in a vertical, horizontally scrollable table layout; Read/Write use focused tabs for Materi, Query, Hasil, and Visualisasi. Do not shrink a multi-panel desktop layout onto a phone.

Within Relasi, keep **concept → sample tables/records → key relationships → practice**. In Read/Write, keep **tables/data → SQL query → result or changed data**. Practice prompts and answer controls are stacked vertically. Only practice has a lab/exercise outline: sidebar on desktop and compact section links on mobile. Lab Materi opens with the core task; table/query exploration is a collapsed disclosure. Opening a section link expands exploration; closing it preserves the query during that page session. Reading has no submateri outline.

Read lessons show the actual SQLite result rows. Write lessons show a target preview when applicable, the affected-row count, and the resulting table state. `UPDATE` and `DELETE` require an explicit confirmation after the learner reviews target rows. Reset restores the known seed and clearly discards local practice changes.

Keep visible actions simple: Run, Check, Reset data, and Previous/Next. The table canvas has pan, zoom, and reset controls; table positions stay fixed.

## Assessment

Show assessment mode, question count, answer progress, and an explicit submit confirmation. Do not show AI Tutor or hints. Results show score, pass/fail, and safe topic feedback.

## Admin

Use one simple content navigation. Editors support lesson Markdown, SQL starter examples, video links, exercise configuration, preview, and explicit publish.

## Investigasi Kampus Mini

Each material links to separate practice: one required core. Use a concrete campus question, inspect → predict → try → explain, then change one variable and compare. Historical supporting attempts remain stored; additional optional exercises are not displayed.

Use one 2D schema visualizer with table names, SQLite column types, PK/FK labels, and relationship lines attached to columns. Selecting a table opens its records below the canvas. Selecting a key explains the relationship; selecting a record enables following or filtering its linked records. Mobile table buttons focus one schema node at readable scale; vertical touch gestures still scroll the page. Keep data → SQL → output vertical and exercise exploration collapsible.

## Transfer across schemas

Relasi: choose Campus Mini, Katalog Buku, or Toko Mini to compare keys and relationships without SQL. Read/Write: use the original campus lab, then select its concept-aligned alternate task. Practice: the required core fixes its canvas to its own schema. Playground: choose any registered dataset. A schema switch restarts local data, query, prediction, and output; it never changes saved progress.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

## Input recovery

Assessment answers and the active question are saved synchronously in browser storage, scoped to the signed-in user and session. Practice answers are scoped to user/exercise, query/prediction to user/lesson/dataset. Restore only bounded, validated data compatible with the current public question content. No scores, hidden keys, credentials, output results or SQLite mutations are stored in drafts.

Show recovery/loading, stored, failed, and invalid-draft states. Failed storage retains the current in-memory answers with an explicit retry; assessment warns before closing when storage has failed. Final submission failure does not clear a draft. A successful submission clears its session draft. If the server has already completed a submission whose response was lost, retry confirms server status before opening the result.

Drafts apply only to this browser profile; they are not cross-device saves or an offline version of the app. Clearing site data/private browsing can remove drafts. Avoid using the same task simultaneously in multiple tabs. Schema modeling already persists local drafts; the required model now also scopes its key to the account/exercise. Query drafts restore text/prediction only: re-entry creates fresh synthetic data and results must be run again. Reset discards this query/prediction draft. Dashboard points to the active session without promising a save it cannot verify.

## Named guest demo mode

Users may enter `/guest/start` with only a display name. This creates a signed HttpOnly session cookie, not a Supabase user/profile or new role. `/guest` provides dashboard, all published Database Fundamentals materials/PDFs, core Labs, SQLab, contextual AI and pre/post-test demos without learning prerequisites. Guest pages and APIs are separate from authenticated learner/admin routes; existing RBAC, RLS and official progression remain unchanged.

Guest answers, schema/data drafts and results are memory-only, disappear on leaving/reloading their workspace, and never create lesson_progress, exercise_attempts, AI conversations, assessment_sessions or assessment_results. Guest tests are graded by the existing trusted server adapters; private answer/fixture fields are never serialized. Only transient test mode and hint level are kept in the signed session cookie. AI/Lab helpers block during an active demo test. A signed-in user with an active official test is also blocked from guest endpoints. Guest mode never grants admin access.

The session lasts at most eight hours (session cookie; explicit exit clears it). Signing uses a purpose-specific HMAC with the existing server-only Supabase secret. Published content reads use narrowly projected server queries, never expose the privileged client. Same-origin mutations, bounded inputs, output limits, per-session/IP/process request caps guard the demo. Quotas are process-local; multi-instance production deployments require an upstream shared rate limit/WAF for reliable global AI cost protection. No database migration or anonymous Supabase sign-in configuration is required.


## Mobile shell and installed-app entry

- Five bottom destinations remain. Menu expands upward with the actual bar height and a scrollable bounded panel; guest pages show exactly one active destination.
- On coarse-pointer mobile devices, the bottom bar hides while typing into text fields and returns after blur. The viewport requests `interactive-widget=resizes-content`; physical Android keyboard behavior still needs device testing.
- The PWA/TWA launch URL is `/app`: an authenticated account resumes Dashboard, a guest resumes its demo/test, and an unauthenticated visitor sees Login. Destination authorization remains server-side.
- A production service worker caches only the public offline fallback. App pages, RSC, API responses, SQL results and user progress are network-only. Offline full-page navigation offers retry; it does not claim offline learning or submission support.
