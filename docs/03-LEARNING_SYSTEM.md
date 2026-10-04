# Learning System

## Learner flow

**Pre-test → Materi → Lab SQL → Post-test.** These are separate pages. Learners see one flat list, Materi 1–11, ordered Relasi → Read → Write.

## Pre-test

`/pre-test` measures starting understanding with ten selected/adapted questions from the existing concept bank: three Relasi, four Read, three Write. It uses a different question/data variant from the post-test. Each question offers “Belum tahu”. A completed baseline is immutable and cannot be retaken. The score is diagnostic, has no passing threshold and has zero course weight. It never blocks learning. Learners who have already studied can take it, but the page must explain that this is no longer a before-learning baseline. Completion date and topic summary are retained. This instrument is a product baseline, not a psychometrically validated test or proof of causal learning gain.

## Materi

Reading pages contain explanations, static examples/tables, summary and optional video, and have per-material PDF downloads. No exercises, missions, SQL editor or AI panel is embedded in reading. Headings organize prose, not submateri.

Reading or downloading alone writes no progress. An authenticated learner explicitly chooses **Selesai dibaca** to acknowledge reading and unlock the next required material. This is reading progress, not mastery or an official score. The server and a narrowly granted database function enforce publication, ownership, prerequisite order and assessment pause. Optional materials never block. Previously earned completion/history is preserved.

## Lab SQL

`/lab` is the separate index of available concept-aligned labs. Existing `/learn/[pathSlug]/lessons/[lessonSlug]/practice` URLs remain compatible. All checks there are optional formative practice: inspect → predict → try SQL → see result/change → explain. They may be retried freely and attempts are saved, but neither a passing check nor browser output completes a material or changes an official score.

Relasi labs inspect records, PK/FK and relationships without SQL. Read/Write labs use only the selected synthetic SQLite Worker dataset. Preview target rows before UPDATE/DELETE, confirm one-row changes and allow deterministic reset. SQL never reaches Supabase or a server execution runtime.

## Post-test

`/post-test` opens after all published required materials have been acknowledged/completed. Ten parallel questions cover the same three/four/three concept distribution with different cases/data. Grading is deterministic and server-side. Pass at 75/100; retries are allowed after the previous session ends. The published post-test has 100% course weight; pre-test is excluded. Course completion requires all required reading plus a passed post-test. A displayed score is not automatically an institution-approved grade.

Historical checkpoints/final assessments are unpublished, not deleted, and cease gating the simplified course. Historical attempts/results remain intact. In-progress historical assessment sessions can still finish. Existing admin tools remain protected.

## Test mode and security

Pre-test/post-test sessions reuse the owned assessment session lifecycle. Only one active session per user is permitted by the start function. AI, hints, practice helpers and reading-progress mutations are blocked server-side while any assessment is IN_PROGRESS. Answer keys, test configuration and correct values stay server-only; public responses expose prompts/options and safe summaries only. Learners never submit trusted scores or passed/completion flags.

## Coverage

See docs/04-CURRICULUM.md for the eleven materials and synthetic datasets. Additional schema modeling, Playground and Chatbot are supporting tools accessible from the Lab, not required course stages.
