# Product Requirements — Quethink Database Learning

## Current product revision — 8 October 2026

Pre-test is retired from account and guest flows. Start with the first material; reading plus required core practice still unlocks the next. The final assessment is named **Tantangan Akhir / Final Challenge**, still unlocked after all required materials, graded server-side and passed at 75. Historical diagnostic questions/sessions/results remain archived; old pre-test URLs redirect to materials. Earlier baseline descriptions below are historical and do not define the active flow. A mobile-first database discussion forum is now explicitly in scope at the user's request; see planning/2026-10-08-forum.md.

## Goal

Help beginning university learners understand relational data and answer practical questions with SQL through clear, interactive lessons.

## Core learner flow

Landing → account → dashboard → Pre-test → Materi 1–11 / reading/PDF → separate Lab SQL → Post-test. Knowledge still progresses Relasi → Read → Write.

## Learners can

- Inspect a small relational schema and synthetic records.
- Explain rows, columns, primary keys, foreign keys, and basic relationships.
- Read data with `SELECT`, `FROM`, `WHERE`, ordering, joins, and simple aggregation.
- Safely change synthetic practice data with one-row `INSERT`, targeted `UPDATE`, and guarded `DELETE`.
- Preview the target of a change, see affected rows, and reset the dataset.
- Predict results, run queries, compare outcomes, and explain their reasoning.
- Read one complete material without embedded labs/forms, download its PDF, and optionally watch its Indonesian video.
- Retry formative practice without penalty.
- Take a diagnostic pre-test and a separately scored post-test.
- Acknowledge reading, pass the paired core check, and unlock the next material.

## Three main learning topics

Internal content grouping uses Relasi, Write, and Read. Learner navigation is a flat numbered list, not topic/chapter/submateri pages. The prerequisite sequence is Relasi → Read → Write, so learners understand tables and how to select target rows before changing data.

## Administrators can

- Manage published database learning content with the existing Admin CMS.
- Preview lessons and exercises before publishing.
- Manage videos, SQL examples, and visible/private practice configuration as lesson content.

## Non-goals

No JavaScript or general programming course; no PTI mapping; no C++, Python, DOM/web development, 3D or AR, app-wide infinite canvas, database administration console, production-data query access, collaboration, social features, or paid SQL execution service. Learner practice does not include DDL, transactions, schema changes, or unrestricted SQL.

## Product rules

- Keep Campus Mini as the consistent anchor, and offer small Katalog Buku and Toko Mini schemas for concept-aligned transfer activities and Playground.
- Run practice SQL in a disposable browser SQLite Worker; official post-test SQL runs only in the bounded server-only SQLite/WASM assessment Worker on synthetic data.
- Permit only the SQL subset needed by the lesson: read queries and bounded single-row data changes.
- Keep reading focused on prose, static examples/tables, summary and PDF. Keep the separate practice UI focused on the prompt, query editor, Run/Check, result/change summary, and 2D exploration.
- SQL editing may use a labeled plain editor; no full IDE features are needed.
- Show progress and lock state with text as well as color.
- Never use practice output reported by the browser as official assessment evidence.
- Keep private answer keys server-side. Assessment uses deterministic server-checked answers and does not trust client scores.

## Success criteria

A new learner can complete the Relasi → Read → Write path, inspect the data before and after a safe change, retry practice, and understand what to learn next without seeing programming-course or PTI-specific content.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

Local guest data survives renewed guest access, is shared by guests on the same browser profile, and is reset explicitly from Profile without deleting account drafts. Local progress/results are untrusted and unofficial: never accept them for account authorization, official scores, or migration to an account. Server validates the signed active-test session and grades published fixtures, keeping private data off the client. Storage failures must be shown; reset/clear-browser-data removes local recovery. AI conversation remains transient and server quotas unchanged.

## English and Bahasa Indonesia

English is the default language. A compact labeled header selector is available on public, sign-in, guest and account pages, including mobile. A validated first-party locale cookie preserves the choice for one year; server rendering and the HTML language use the same locale. Existing routes and content/progress identities remain unchanged. UI, published course reading, public questions/options, instructions, results and downloadable PDFs are localized from checked-in catalogs. SQL identifiers, literal dataset values and submitted answers are preserved. AI tutors/content helpers respond in the selected language. Existing optional YouTube audio remains Indonesian and is labeled in English mode. New/edited CMS content must receive catalog translations before claiming bilingual publication; original text is retained if no translation exists. Browser storage and grading security are unchanged.
