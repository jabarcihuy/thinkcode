# UX Flow

## Public landing

Explain in one sentence that Quethink teaches learners to understand relationships, read data, and safely change a practice database. Show the simple cycle: inspect → predict → query → see the result/change. Primary action is to start learning.

## Learner

1. Register/sign in and see the next step on the dashboard.
2. Open `/pre-test`: ten diagnostic questions, including Belum tahu; no passing gate, no course weight, one completed baseline. Learning can proceed without passing or taking it.
3. Open numbered Materi 1–11. Read prose/examples/video or download PDF.
4. Choose Selesai dibaca explicitly to record reading and unlock the next material. This does not demonstrate mastery.
5. Open `/lab` separately when ready to explore tables or query; all checks there are optional.
6. After all required reading, take `/post-test`. Score is server-graded, pass ≥75, retry after the previous session ends.
7. Course complete means reading complete plus post-test passed. Historical checkpoint gates are unpublished.

Mobile navigation has five items: Beranda, Materi, Lab (center), Tes, Profil (rightmost). Lab links to Playground, schema builder and tutor. Tes opens pre-test with a post-test switch; each has its own page.

## Account tools

The signed-in navigation provides separate **Chatbot** and **SQL Playground** entries. Chatbot uses the current or next available lesson as context, links to that lesson, and offers concept-level help; it does not claim to see a query unless the learner asks from an separate material practice lab. SQL Playground offers the registered Campus Mini, Katalog Buku, and Toko Mini synthetic datasets through the same browser SQLite Worker for independent, disposable practice. It requires login and is paused during an active assessment. Playground queries do not affect lesson progress.

## Pembuat Skema

Open it from the mobile Lainnya menu, SQL Playground, or the key/relationship practice page. Choose one guided case, add a table, edit its columns, mark one PK, and use selects to connect a FK to another table's compatible PK. On mobile use Susun → Diagram → Periksa; keyboard arrows/Home/End switch tabs. The diagram has native scrolling, zoom/reset, and a table-focus selector. Larger screens show editor and diagram/feedback side by side.

Each case preserves its own local draft. Reset requires confirmation, storage failure is explained, and invalid stored data can be discarded explicitly. Feedback points to incomplete structure and asks for an explanation; after trying, learners can reveal a reference model. This optional tool does not complete lessons or determine scores and is paused during an active assessment.

Videos remain optional disclosures within lesson material. They load a YouTube no-cookie iframe only after the learner chooses Putar video, can be closed, and always offer a link to YouTube if playback fails. Use the lesson's dataset and bounded SQL conventions rather than asking learners to install the tools shown in a video.

## Lesson workspace

Reading is a single readable column on every viewport. Practice is separate: Relasi uses sample tables and key visualization; Read/Write use the prompt, query editor, and result/visualization panels.

Mobile: Relasi keeps sample tables in a vertical, horizontally scrollable table layout; Read/Write use focused tabs for Materi, Query, Hasil, and Visualisasi. Do not shrink a multi-panel desktop layout onto a phone.

Within Relasi, keep **concept → sample tables/records → key relationships → practice**. In Read/Write, keep **tables/data → SQL query → result or changed data**. Practice prompts and answer controls are stacked vertically. Only practice has a lab/exercise outline: sidebar on desktop and collapsible on mobile. Reading has no submateri outline.

Read lessons show the actual SQLite result rows. Write lessons show a target preview when applicable, the affected-row count, and the resulting table state. `UPDATE` and `DELETE` require an explicit confirmation after the learner reviews target rows. Reset restores the known seed and clearly discards local practice changes.

Keep visible actions simple: Run, Check, Reset data, and Previous/Next. The table canvas has pan, zoom, and reset controls; table positions stay fixed.

## Assessment

Show assessment mode, question count, answer progress, and an explicit submit confirmation. Do not show AI Tutor or hints. Results show score, pass/fail, and safe topic feedback.

## Admin

Use one simple content navigation. Editors support lesson Markdown, SQL starter examples, video links, exercise configuration, preview, and explicit publish.

## Investigasi Kampus Mini

Each material links to separate practice: optional concept and consolidation checks. Use a concrete campus question, inspect → predict → try → explain, then change one variable and compare. Optional attempts are saved but never block unlocking.

Use one 2D schema visualizer with table names, SQLite column types, PK/FK labels, and relationship lines attached to columns. Selecting a table opens its records below the canvas. Selecting a key explains the relationship; selecting a record enables following or filtering its linked records. Mobile table buttons focus one schema node at readable scale; vertical touch gestures still scroll the page. Keep data → SQL → output vertical and exercise exploration collapsible.

## Transfer across schemas

Relasi: choose Campus Mini, Katalog Buku, or Toko Mini to compare keys and relationships without SQL. Read/Write: use the original campus lab, then select its concept-aligned alternate task. Practice: an optional transfer exercise fixes the canvas to its own schema. Playground: choose any registered dataset. A schema switch restarts local data, query, prediction, and output; it never changes saved progress.

## Current course progression

Pre-test → Materi → optional Lab SQL → Post-test. The authoritative behavior is defined in docs/03-LEARNING_SYSTEM.md. Reading acknowledgement replaces practice completion; historical checkpoints are unpublished and no longer gate the course. Existing history is retained.
