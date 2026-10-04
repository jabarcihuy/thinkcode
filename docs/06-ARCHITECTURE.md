# Quethink Architecture

## Product and stack

Quethink teaches relational database concepts and SQL through one Next.js App Router application. It targets Vercel with Supabase PostgreSQL/Auth.

- Strict TypeScript, Tailwind, and shadcn/ui primitives.
- Supabase stores accounts, published content, progress, practice attempts, tutor conversations, and assessments.
- SQLite WASM runs only in a disposable browser Web Worker against a synthetic dataset.
- SQL results and write changes are stacked vertically as data objects → SQL → accessible result tables. The 2D schema and record inspector share the same public synthetic snapshot.
- AI Tutor and Admin CMS use server-side authorization.
- Signed-in learners can open `/chatbot` for lesson-context help and `/playground` for independent SQL practice; the latter reuses the same browser-only synthetic SQLite Worker as lesson labs.
- No paid SQL runner or separate backend is required.

JavaScript and TypeScript are application implementation languages only. They are not learner course content.

## Curriculum organization

The three content topics are Relasi, Write, and Read. The required learning sequence is Relasi → Read → Write. The content model uses chapters for the three topics and lessons for their materials; lesson Markdown/config can hold smaller subtopic sections.

## Runtime boundaries

Browser:
- Learner UI and SQL editor.
- A Worker initializes a fresh in-memory SQLite database with only the selected shipped schema and its valid seed rows.
- The Worker permits bounded `SELECT` queries plus the narrow `INSERT`, `UPDATE`, and `DELETE` subset required for lessons. It rejects schema changes, database attachment, pragma/transaction control, multiple statements, unauthorized tables, and unsupported SQL.
- `UPDATE` and `DELETE` require a target-row preview and explicit confirmation. The lab reports changed-row count and visible after-state; Reset rebuilds the known seed.
- Worker execution has source, time, statement, changed-row, and output limits; the Worker is terminated on timeout.
- SQL changes exist only in the disposable practice database and are never saved to user or Supabase data.
- The SVG/HTML schema visualizer and accessible record inspector share `DatasetSnapshot`. Dataset-specific FK metadata connects exact column anchors; record relationships come from actual FK matches. Confirmed Worker mutations replace the changed table snapshot; preview does not modify it. Use predefined responsive layouts, bounded pan/zoom, and mobile table focus. There is no WebGL or 3D dependency. The diagram is a conceptual schema, not a query-plan simulator.
- The browser sends only a validated dataset ID at Worker startup. Schema definitions, seed rows, column types, FK links, and write validation come from the same shipped registry. The authorizer allows only the selected dataset tables; arbitrary identifiers, SQL schemas, seed payloads, or Supabase data cannot initialize the Worker. Switching schemas remounts the lab and disposes the previous Worker, including pending mutation previews.
- No Supabase token, private key, user record, or hidden assessment answer enters the SQL Worker.

Next.js server:
- Auth/session, ownership, role checks, published content, progress, practice attempt records, assessment session lifecycle, deterministic assessment grading, and AI Tutor.
- Admin mutations use server-only authorization.
- Assessment answer keys remain server-side.
- No learner SQL is run against production Supabase tables or on the Next.js server.

Supabase:
- PostgreSQL content/progress schema, Auth, RLS, and narrow privileged workflows.

## SQL practice

The registry contains Campus Mini, Katalog Buku, and Toko Mini. Lessons retain campus anchor examples and add aligned transfer activities; public exercise config may select a registered `datasetId`. Practice is local and disposable; user SQL never reaches Supabase. Read and write statements are separately validated against the lesson's supported subset. Invalid or unsupported queries return a safe message. SQLite foreign-key checks are enabled. A reset restores the deterministic seed. Browser results are formative and are not trusted assessment evidence.

The standalone SQL Playground uses the selected registered synthetic seed and Worker as lesson practice. It is account-protected, pauses during an active assessment, and does not save queries or change lesson progress. It never connects to Supabase.

## Assessments

Assessments use deterministic server-graded question formats: schema/key identification, query/result prediction, selecting a correct query, and ordering clauses. Browser-reported practice SQL results are never accepted as an official score. Arbitrary submitted SQL is not executed by the Vercel server.

## Guided visual modeling

`/schema-builder` is protected and checks the active assessment state before displaying practice helpers. `src/features/schema-builder` owns its draft validation, local storage, modeling scenarios, structural feedback, and diagram UI. Drafts are bounded to six tables, eight columns per table, and twelve valid FK links; a stored JSON payload larger than 50 KB or with invalid structure is rejected. Names, object IDs, unique identifiers, PK identity, FK endpoints, and compatible types are validated.

The model never enters `PracticeDataset`, the SQLite Worker, a query API, Supabase, AI, or grading. Tables have automatic responsive positions; mobile editing uses forms and three task tabs. Each guided scenario has its own versioned browser-local draft; reload restores valid drafts. Deleting an object removes its links, and changing key identity/type detaches stale relationships. The reference model is public formative content, not a hidden assessment answer.

Video references are stored as optional Markdown content in existing lessons, editable/previewable through Admin CMS. The append-only video content migration and `scripts/seed-database-videos.mjs` preserve original material/history and are idempotent by video URL. The script uses a server secret locally, never in application UI.

## Layers

- src/app: pages, route protection, server APIs.
- src/features/learning: learning path, lesson access, progress.
- src/features/database: synthetic dataset, SQL validation, Worker runner, query diagram, write preview/reset.
- src/features/practice: SQL practice renderers and safe feedback.
- src/features/assessment: private answer loading and deterministic server grading.
- src/features/ai: bounded SQL tutor context and provider service.
- src/features/admin: protected content workflow.
- src/lib/supabase: browser, server, and privileged clients.
- supabase/migrations: PostgreSQL content, RLS, and seed changes.

## Content reset and history

The active learning path is Database Fundamentals. Old programming/PTI paths are unpublished rather than deleted so existing progress and assessment history are preserved. When replacing the current database lessons, preserve attempts and results; archive or unpublish replaced content rather than deleting history. Admin/CMS data and user accounts remain.

## Admin lesson preview

`/admin/lessons/[lessonId]/preview` requires ADMIN on the server and rechecks authorization before privileged content reads. Draft and published lessons can be inspected without learner prerequisites. Reuse lesson prose, dataset labs, and exercise display; preview does not invoke grading, create attempts, mutate progress, or include AI Tutor. Exercise display fields are allowlisted and answer/test configuration is excluded. Learner routes and their progression rules remain unchanged.

## Reading, practice and PDF boundaries

The learner catalog is flat (Materi 1–11). Chapters remain internal grouping for existing checkpoint gates. `/learn/[pathSlug]/lessons/[lessonSlug]` loads public prose only. `/practice` under that material loads the existing labs and allowlisted exercises after login and lock checks, and pauses during assessment. `/pdf` is a dynamic Node.js route using the shared material access helper; it renders only public Markdown into an A4 document, with bundled Geist fonts and no remote resource fetching. It never loads private exercise configuration or changes progress. PDFs use private/no-store responses. The server owns PDF generation and font dependencies; neither reaches browser execution.
