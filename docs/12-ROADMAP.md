# ThinkCode — Roadmap

## Phase 0 — Foundation

- Project setup.
- Supabase setup.
- Auth.
- Roles.
- Base layout.
- Database migrations/schema.
- Provider abstractions.

## Phase 1 — Learning Core

- Learning path.
- Chapters.
- Lessons.
- Locked progression.
- Dashboard.
- Progress tracking.

## Phase 2 — JavaScript Lab (migrated)

- Monaco Editor.
- BrowserJavaScriptRunner in opaque-origin iframe and disposable worker.
- Run code.
- Console.
- Reset.
- Execution limits.

## Phase 3 — Practice & Auto-check

- Code Completion.
- Predict Output.
- Debugging.
- Problem Solving.
- Pseudocode.
- Simplified Flowchart.
- Visible tests.
- Visible coding tests; deterministic server grading for non-code types. True hidden coding grading is deferred until a trusted execution design exists.
- Attempt storage.

## Migration — Interactive Programming Logic Lab

- JavaScript is the MVP language (`javascript`, browser runtime).
- Predict before Run, execution trace, visualizer controls, and Bug Lab.
- Browser code execution replaces external compiler/runtime dependencies.
- Vercel Hobby + Supabase Free + browser runtime are the initial cost target, subject to plan terms and quotas.
- Hidden coding tests stay server-only and are not used by browser grading.

## Phase 4 — AI Tutor

- AI provider abstraction.
- Context injection.
- Tutor tools.
- Progressive hints.
- Error explanation.
- Similar practice generation.
- Assessment blocking.

**Status: implemented.** Context is assembled server-side from current lesson, public exercise, bounded learner-provided code/output/results/trace, progress summary, and hint level. The OpenAI-compatible streaming adapter is configured only with server environment variables. Active assessment requests are rejected before provider use. Tutor messages/sessions have owner-only RLS and server-side persistence. No tutor tool changes progress or reads hidden tests.

## Phase 5 — Assessment

- Checkpoints.
- Final assessment.
- Score 0–100.
- Passing score.
- Retry.
- Highest/latest score.

**Status: implemented.** Checkpoint 1–3 and final assessment sessions use deterministic non-code checks and server-side QuickJS/WASM coding checks. Assessment answers are allowlisted on reads; private answer/test data stays server-side. Start/finalize RPCs enforce prerequisites, one active session, server score and result history. Checkpoints gate progression into subsequent chapter groups; final assessment follows required lessons and checkpoints.

## Phase 6 — Admin CMS

- Learning path management.
- Chapter management.
- Lesson management.
- Exercise management.
- Test case management.
- Assessment management.
- Publish/unpublish.
- Admin AI drafting assistant.

**Status: implemented.** Server-authenticated ADMIN routes manage drafts, ordering, publication, visible practice tests, server-only assessment cases, and assessment items. Content tables have browser write grants revoked; new content is draft by default. Lesson Markdown preview reuses the learner renderer. User role changes remain unavailable in the CMS.

## Phase 7 — UX Polish

- Responsive landing, dashboard, learning path, lesson, practice, assessment, and CMS layouts.
- Accessible navigation, forms, tabs, progress, feedback, and submit confirmation.
- Light, dark, and system themes, including Monaco.
- Clear execution trace, prediction comparison, Tutor actions, and learner-facing status copy.
- Lazy-loaded Monaco editor and responsive viewport smoke coverage.

**Status: implemented.** UX was polished without introducing new product scope. Learning state is labeled with text as well as color; the lesson workspace switches code/result panels on small screens; the assessment requires explicit submit confirmation. CMS, theme selection, and the key mobile admin layout have production-browser coverage.

## Current Validation Gate

Phase 6 and Phase 7 are complete after lint, typecheck, unit tests, production build, Supabase RLS integration, user learning/practice/assessment browser flow, admin CMS browser flow, and mobile overflow/theme smoke checks pass. AI live-provider usage is not required for deterministic validation and may consume provider quota.

## Future

- Additional languages and trusted coding assessment infrastructure.
- Teacher role.
- Classroom.
- Assignment.
- Teacher analytics.
- Additional learning paths.
- More programming languages.
- Advanced algorithms.
- OOP course.
