# Quethink

Quethink is an Indonesian-language platform for learning relational databases by exploring data and practicing SQL.

## Product promise

Understand how data is related, how queries read it, and how carefully written commands change it.

## Audience

Beginning university learners. No prior programming or SQL experience is required.

## Three main learning topics

The course is grouped into **Relasi**, **Write**, and **Read**. Lessons unlock in prerequisite order: **Relasi → Read → Write**.

- **Relasi:** inspect tables, rows, columns, keys, and relationships.
- **Read:** use `SELECT`, `FROM`, `WHERE`, sorting, joins, and simple aggregation to answer data questions.
- **Write:** use one-row `INSERT`, targeted `UPDATE`, and guarded `DELETE` on the synthetic practice dataset.

The learner cycle is: inspect → predict → query → see the result or data change → explain → practice. Optional Indonesian videos support the lesson.

## Product boundaries

- SQL is the learner's query language; JavaScript/TypeScript build the application only.
- SQL practice runs in local SQLite WASM inside a disposable browser Web Worker on synthetic data.
- The practice database never connects to Supabase or user records. Changes can be reset to the seed data and are not persisted as user data.
- Each exercise offers a 2D schema visualizer with tables, column types, PK/FK connections, and selectable synthetic records. The result remains a separate readable table.
- Practice and assessment are separate. Browser SQL results are formative; assessment answers are checked server-side.
- USER and ADMIN remain the only roles.
- Initial deployment targets Vercel Hobby and Supabase Free; no external SQL runner is required.
