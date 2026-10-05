# Testing Strategy

## Unit

- SQL validation: accept supported SELECT and bounded DML; reject oversized text, multiple statements, DDL, PRAGMA, transaction controls, and unsupported tables.
- SQLite synthetic seed, foreign-key behavior, changed-row and result limits, timeout, and deterministic reset.
- Read result normalization and formative grading.
- Write operations: one-row INSERT; UPDATE/DELETE target preview; missing/overbroad WHERE rejection; foreign-key rejection; before/after state.
- Curriculum coverage: each of the 11 published required materials has published core/optional checks aligned to its lab task and learning outcome.
- Assessment deterministic grading and passing score.
- AI assessment guard and bounded database context, including safe visible summaries for write lessons.
- Admin validation and role checks.

## Integration

- Published path displays Relasi → Read → Write, with lessons grouped under the correct topic.
- Published database content is readable; old unpublished course paths are not learner-visible.
- Users can access only their own progress, attempts, sessions, and results.
- User role is denied admin route and mutations.
- Hidden assessment answer configuration is absent from public reads and AI context.
- SQL practice never sends a statement or database change to Supabase or a paid runner.
- Each required material exposes its specific lab prompt and optional formative practice; checks retain the intended type and can be retried.
- Reset reinitializes the synthetic database without changing user/Supabase data.

## Dataset regression

- All three shipped schemas initialize with valid FK data; starter and transfer queries return known rows on SQLite.
- Library has two tables, campus three, shop four; geometry routes the actual named key columns and focuses each table at readable mobile scale.
- Write parser uses the active schema and denies unrelated tables, key changes, and non-PK targeting. Worker authorizer only permits that schema.
- Shop relationship traversal follows customer → order → detail → product without spreading to unrelated orders.
- Switch and reset dispose the previous Worker and discard pending mutations; optional transfer does not change required completion rules.
- All 11 transfer answer keys grade correctly and reject wrong answers; query-prediction keys match real SQLite results.
- SQLite integration fixtures use Node’s `node:sqlite` for test execution only; application SQL still executes exclusively in the browser WASM Worker.

## Browser smoke

- Landing → register/login → dashboard → database path → Relasi lesson.
- Inspect tables and keys; run SELECT/FROM/WHERE and inspect actual SQLite rows.
- Join synthetic tables; pan, zoom, and reset the exercise table canvas; inspect relationship/result output.
- Insert one practice record; preview and update a targeted row; delete a permitted row; reset and verify the original seed.
- Acknowledge reading, pass core, unlock the next material and open post-test after all required material completion.
- AI works in practice and is blocked during an active assessment.
- Admin creates a draft lesson, previews it, and publishes it.
- Mobile viewport near 360px has no critical overflow; desktop layout remains readable.

## Guided schema builder and video

- Validate bounded local JSON, names/IDs, unique tables/columns, one PK, FK endpoints/types, and duplicate/self relations. Reject corrupt/oversized storage.
- Removing tables/columns and changing PK/type must clean stale FK links. Case switching/reload preserve separate drafts; unavailable storage keeps the current session and displays a notice.
- Formative feedback gives structural next steps without accepting client scores or changing lesson progress.
- Browser smoke at 360/768/1280: add/edit/remove table and column, connect PK/FK using selects, keyboard tabs, focus/scroll/zoom diagram, restore draft, reset confirmation, no page overflow. Verify guest rejection and assessment pause.
- Video iframe loads after explicit activation only, closes correctly, has a descriptive title, uses validated HTTPS/no-cookie embed, and keeps an external fallback. Metadata verification is distinct from actual playback or full audiovisual review.
- Student trial protocol and blank instruments are in docs/evaluation/2026-10-03-uji-mahasiswa. Browser QA is not a substitute for observing students.

## Required gate

Run lint, typecheck, unit/integration tests available in the environment, and production build. Report unavailable live-provider or dashboard tests explicitly instead of claiming they passed.

## Interactive curriculum regression

- Three aligned subtopic checks plus one optional transfer check per lesson; one required core plus optional checks, with existing IDs/history preserved. Material 2 uses an additional model core.
- Optional check success alone does not complete a lesson or unlock the next.
- Schema PK/FK endpoints match named columns; selected records follow real one-to-many links without spreading to unrelated enrollments.
- Confirmed mutations update viewer rows/counts; preview and cancel do not; reset restores the seed.
- SQL table-answer grading accepts spaces around separators and equivalent numeric cells, while preserving row order, column count, text, and wrong values.
- Private answer keys and feedback configuration are absent from public content reads.
- Browser QA: key/table/record selection, pan/zoom/fit/reset, keyboard access, mobile table focus, vertical page scrolling, and 360/768/1280px layout without critical overflow.

## Reading-only material regression

Run `npm run test:materials:integration` against the production build and remote Supabase with temporary accounts that are deleted afterwards. Verify flat Materi 1–11 navigation, absence of embedded lab/exercise/AI controls, valid preview PDF downloads, denied non-preview guest and locked authenticated PDFs/practice, friendly retryable download failure, and no progress writes from reading/download. Capture list, reading and practice at 360/768/1280px with no page overflow. `test:flow:integration` still checks reading plus trusted core unlocking and diagnostic/post-test, and downloads all 11 PDFs after access is earned. PDF unit tests cover safe Markdown, Unicode, A4, code/tables, pagination and failure responses; render generated PDFs for visual inspection.

## Mandatory pre-test / reading / core Lab / post-test

`test:flow:integration` checks: diagnostic available before reading, Belum tahu scores zero with no pass/fail UI, baseline immutable, concurrent start idempotent, other-user session/results denied, no private keys in network, AI block during both tests, reading paused during active tests, optional practice saves attempts without progress, first/next/locked reading order, all eleven PDFs, post-test prerequisites, forged client scores ignored, post-test retry and course completion. Capture dashboard/test/session/result/reading/Lab at 360/768/1280px and execute a real browser SQLite query. Unit tests cover test policies/topic aggregation and admin PRETEST zero-weight validation.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.
