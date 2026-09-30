# Learning System

## Curriculum structure

The three main content topics are Relasi, Write, and Read. Learner progression follows **Relasi → Read → Write**. The labels organize the content; progression follows prerequisite knowledge.

- **Relasi:** understand table structure, records, columns, keys, and relationship paths by inspecting visual tables; do not write SQL yet.
- **Read:** select columns and records, order results, join related tables, and summarize data.
- **Write:** add, update, and delete a small amount of synthetic data after learners can read and identify the target records.

Each main topic contains lessons. Relasi lessons show table schemas and sample records before SQL is introduced. Read and Write lesson sections may include a query walkthrough, prediction, local SQL lab, practice, and summary. Video is optional support, not a replacement for the activity.

## Lesson cycle

1. Read a practical question about data.
2. In Relasi, inspect table structure, sample records, and keys without writing SQL.
3. In Read or Write, predict query results or the records that will change.
4. Write or adjust one SQL statement when the material introduces SQL.
5. Run it against the synthetic SQLite dataset in a disposable browser Worker.
6. Inspect returned rows or the before/after data change.
7. Explain why the outcome answers the question.
8. Complete the required formative practice for the material.

Each material pairs a suitable activity with one required check. Relasi uses visual table and key inspection; Read and Write pair a focused SQL task in the local lab with practice. SQL lab tasks are exploratory: predict, run, inspect, and explain. The required check targets the material's learning outcome, allows retries, and stores an attempt for progression. A local SQL result alone does not complete a material.

For `UPDATE` and `DELETE`, learners inspect the target rows using the same predicate before confirming the change. The lab shows the affected-row count and resulting data. Reset restores the deterministic seed.

## Progress

Required lessons unlock in order. The first required lesson is available; the next required lesson unlocks after required practice passes. Optional material never blocks progression. Completed lessons remain reviewable.

Checkpoints follow Relasi, Read, and Write. The final assessment follows the full learning path. AI Tutor and hints are blocked server-side during an active assessment.

## Practice and assessment

Practice allows unlimited retries and immediate educational feedback. Deterministic required checks are graded and saved server-side. SQL Run stays local and formative; its browser-reported results are not trusted evidence for an official score. Assessment remains a separate, official scoring flow.

Assessments are separate sessions. Use deterministic server-graded questions such as schema/key identification, query/result prediction, selecting a correct query, selecting the intended DML target, predicting a bounded data change, and ordering query clauses. Do not execute arbitrary learner SQL on the server for scoring unless a separately reviewed trusted design is added.

## Curriculum coverage

Learning outcomes and submaterials are defined in docs/04-CURRICULUM.md. Lessons retain a compact Campus Mini anchor to reduce context switching, with optional transfer tasks on Katalog Buku or Toko Mini. Required completion stays tied to the existing mandatory practice.
