# UX Flow

## Public landing

Explain in one sentence that Quethink teaches learners to understand relationships, read data, and safely change a practice database. Show the simple cycle: inspect → predict → query → see the result/change. Primary action is to start learning.

## Learner

1. Register or sign in.
2. Dashboard shows the next lesson and progress.
3. Open Database Fundamentals.
4. Follow the sequence Relasi → Read → Write.
5. In Relasi, read a concise concept and inspect sample table records and keys without SQL. Query writing begins in Read.
6. Optionally watch the linked Indonesian video.
7. In Read/Write, predict the query result or the target records/change.
8. In Read/Write, edit SQL and press Run.
9. Inspect returned rows or the visible before/after change.
10. Complete formative practice; retry as needed.
11. Take checkpoints and final assessment separately.

## Account tools

The signed-in navigation provides separate **Chatbot** and **SQL Playground** entries. Chatbot uses the current or next available lesson as context, links to that lesson, and offers concept-level help; it does not claim to see a query unless the learner asks from an inline lesson lab. SQL Playground offers the registered Campus Mini, Katalog Buku, and Toko Mini synthetic datasets through the same browser SQLite Worker for independent, disposable practice. It requires login and is paused during an active assessment. Playground queries do not affect lesson progress.

## Pembuat Skema

Open it from the mobile Lainnya menu, SQL Playground, or the key/relationship lesson. Choose one guided case, add a table, edit its columns, mark one PK, and use selects to connect a FK to another table's compatible PK. On mobile use Susun → Diagram → Periksa; keyboard arrows/Home/End switch tabs. The diagram has native scrolling, zoom/reset, and a table-focus selector. Larger screens show editor and diagram/feedback side by side.

Each case preserves its own local draft. Reset requires confirmation, storage failure is explained, and invalid stored data can be discarded explicitly. Feedback points to incomplete structure and asks for an explanation; after trying, learners can reveal a reference model. This optional tool does not complete lessons or determine scores and is paused during an active assessment.

Videos remain optional disclosures within lesson material. They load a YouTube no-cookie iframe only after the learner chooses Putar video, can be closed, and always offer a link to YouTube if playback fails. Use the lesson's dataset and bounded SQL conventions rather than asking learners to install the tools shown in a video.

## Lesson workspace

Desktop: Relasi uses the lesson content, sample tables, and key visualization. Read/Write use the lesson prompt/content, query editor, and result/visualization panels.

Mobile: Relasi keeps sample tables in a vertical, horizontally scrollable table layout; Read/Write use focused tabs for Materi, Query, Hasil, and Visualisasi. Do not shrink a multi-panel desktop layout onto a phone.

Within Relasi, keep **concept → sample tables/records → key relationships → practice**. In Read/Write, keep **tables/data → SQL query → result or changed data**. Practice prompts and answer controls are stacked vertically. A lesson outline stays in the sidebar on desktop; on mobile, keep its links in a compact collapsible contents section.

Read lessons show the actual SQLite result rows. Write lessons show a target preview when applicable, the affected-row count, and the resulting table state. `UPDATE` and `DELETE` require an explicit confirmation after the learner reviews target rows. Reset restores the known seed and clearly discards local practice changes.

Keep visible actions simple: Run, Check, Reset data, and Previous/Next. The table canvas has pan, zoom, and reset controls; table positions stay fixed.

## Assessment

Show assessment mode, question count, answer progress, and an explicit submit confirmation. Do not show AI Tutor or hints. Results show score, pass/fail, and safe topic feedback.

## Admin

Use one simple content navigation. Editors support lesson Markdown, SQL starter examples, video links, exercise configuration, preview, and explicit publish.

## Investigasi Kampus Mini

Each lesson has three subtopics: two optional exploration checks and one required closing practice. Use a concrete campus question, inspect → predict → try → explain, then change one variable and compare. Optional attempts are saved but never block unlocking.

Use one 2D schema visualizer with table names, SQLite column types, PK/FK labels, and relationship lines attached to columns. Selecting a table opens its records below the canvas. Selecting a key explains the relationship; selecting a record enables following or filtering its linked records. Mobile table buttons focus one schema node at readable scale; vertical touch gestures still scroll the page. Keep data → SQL → output vertical and exercise exploration collapsible.

## Transfer across schemas

Relasi: choose Campus Mini, Katalog Buku, or Toko Mini to compare keys and relationships without SQL. Read/Write: use the original campus lab, then select its concept-aligned alternate task. Practice: an optional transfer exercise fixes the canvas to its own schema. Playground: choose any registered dataset. A schema switch restarts local data, query, prediction, and output; it never changes saved progress.
