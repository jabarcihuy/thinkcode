# Testing Strategy

## Unit

- SQL validation: accept supported SELECT and bounded DML; reject oversized text, multiple statements, DDL, PRAGMA, transaction controls, and unsupported tables.
- SQLite synthetic seed, foreign-key behavior, changed-row and result limits, timeout, and deterministic reset.
- Read result normalization and formative grading.
- Write operations: one-row INSERT; UPDATE/DELETE target preview; missing/overbroad WHERE rejection; foreign-key rejection; before/after state.
- Progression: first lesson available; required practice unlocks the next lesson.
- Curriculum coverage: each of the 11 published required materials has one published required exercise aligned to its lab task and learning outcome.
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
- Each required material exposes its specific lab prompt and required practice; checks retain the intended type and can be retried.
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
- Complete practice, unlock the next lesson, and open a checkpoint.
- AI works in practice and is blocked during an active assessment.
- Admin creates a draft lesson, previews it, and publishes it.
- Mobile viewport near 360px has no critical overflow; desktop layout remains readable.

## Required gate

Run lint, typecheck, unit/integration tests available in the environment, and production build. Report unavailable live-provider or dashboard tests explicitly instead of claiming they passed.

## Interactive curriculum regression

- Three aligned subtopic checks plus one optional transfer check per lesson; exactly one required, with existing required IDs/history preserved.
- Optional check success alone does not complete a lesson or unlock the next.
- Schema PK/FK endpoints match named columns; selected records follow real one-to-many links without spreading to unrelated enrollments.
- Confirmed mutations update viewer rows/counts; preview and cancel do not; reset restores the seed.
- SQL table-answer grading accepts spaces around separators and equivalent numeric cells, while preserving row order, column count, text, and wrong values.
- Private answer keys and feedback configuration are absent from public content reads.
- Browser QA: key/table/record selection, pan/zoom/fit/reset, keyboard access, mobile table focus, vertical page scrolling, and 360/768/1280px layout without critical overflow.
