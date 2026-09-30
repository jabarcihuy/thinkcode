# Product Requirements — Quethink Database Learning

## Goal

Help beginning university learners understand relational data and answer practical questions with SQL through clear, interactive lessons.

## Core learner flow

Landing → account → dashboard → Database Fundamentals → Relasi → Read → Write → practice → separate assessments.

## Learners can

- Inspect a small relational schema and synthetic records.
- Explain rows, columns, primary keys, foreign keys, and basic relationships.
- Read data with `SELECT`, `FROM`, `WHERE`, ordering, joins, and simple aggregation.
- Safely change synthetic practice data with one-row `INSERT`, targeted `UPDATE`, and guarded `DELETE`.
- Preview the target of a change, see affected rows, and reset the dataset.
- Predict results, run queries, compare outcomes, and explain their reasoning.
- Reuse lesson notes and optional Indonesian video references.
- Retry formative practice without penalty.
- Take checkpoints and a final assessment separately from practice.
- See their progress and next available lesson.

## Three main learning topics

Content is organized under Relasi, Write, and Read. The prerequisite sequence is Relasi → Read → Write, so learners understand tables and how to select target rows before changing data.

## Administrators can

- Manage published database learning content with the existing Admin CMS.
- Preview lessons and exercises before publishing.
- Manage videos, SQL examples, and visible/private practice configuration as lesson content.

## Non-goals

No JavaScript or general programming course; no PTI mapping; no C++, Python, DOM/web development, 3D or AR, app-wide infinite canvas, database administration console, production-data query access, collaboration, social features, or paid SQL execution service. Learner practice does not include DDL, transactions, schema changes, or unrestricted SQL.

## Product rules

- Keep Campus Mini as the consistent anchor, and offer small Katalog Buku and Toko Mini schemas for concept-aligned transfer activities and Playground.
- Run learner SQL only in local SQLite in a disposable browser Worker.
- Permit only the SQL subset needed by the lesson: read queries and bounded single-row data changes.
- Keep the learning UI focused on the prompt, query editor, Run/Check, result or change summary, and 2D schema and record exploration.
- SQL editing may use a labeled plain editor; no full IDE features are needed.
- Show progress and lock state with text as well as color.
- Never use practice output reported by the browser as official assessment evidence.
- Keep private answer keys server-side. Assessment uses deterministic server-checked answers and does not trust client scores.

## Success criteria

A new learner can complete the Relasi → Read → Write path, inspect the data before and after a safe change, retry practice, and understand what to learn next without seeing programming-course or PTI-specific content.
