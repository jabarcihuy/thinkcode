# AI Tutor — Database Learning

## Purpose

The AI Tutor helps learners reason about relational data and their current SQL task. It gives progressive hints instead of taking over the work.

## Available context

The server may provide only bounded, current-task context:

- Current topic, lesson, and concept.
- Current practice prompt and type.
- Learner's current SQL statement.
- Visible SQLite output or a safe summary of the data change.
- Visible practice feedback.
- A short summary of the current 2D relationship/query explanation.
- Progress summary and hint level.

For Write lessons, context may describe the intended operation and visible affected-row count. Do not send hidden answer configuration or private assessment values.

Do not include another user's data, Supabase credentials, private CMS configuration, hidden assessment answers, or hidden tests. Assessment source is not included in tutor context.

The protected `/chatbot` page offers the same tutor outside a lesson workspace. It selects the learner's current or next available lesson as context (or the latest completed lesson when the path is complete), links back to that lesson, and does not invent query/output context. The inline tutor remains available in lesson practice and receives the visible SQL and Worker result when supplied.

## Actions

- Explain table/key/relationship concepts.
- Explain a query or visible SQLite error.
- Give a hint about an incorrect result or unexpected change.
- Explain visible query output or affected-row feedback.
- Create a similar practice prompt.

The tutor cannot run arbitrary SQL, change progress, publish content, change scores, or reveal assessment data. Running and confirming a statement remain learner actions in the browser.

## Hint progression

1. Give a general direction.
2. Point to a relevant table, key, clause, or target-row check.
3. Explain the related concept.
4. Use a similar example.
5. Show a complete SQL statement only when the learner explicitly asks for the solution.

## Safety and limits

The API checks authentication, active assessment state, per-user rate limits, prompt/source size, and trimmed conversation history before using the server-only AIProvider. AI is unavailable during every IN_PROGRESS test, including the Final Challenge. Provider keys stay server-side.

Write feedback must encourage a target preview before `UPDATE` or `DELETE` and must not claim a change happened unless the visible Worker result confirms it.

## Provider and admin drafting

Use the existing provider-agnostic AIProvider. The current OpenAI-compatible adapter reads AI_API_URL, AI_API_KEY, and AI_MODEL only on the server. Admin suggestions cover database explanations, SQL examples, practice prompts, and summaries; every suggestion remains a draft for admin review.

## Revisi alur wajib — 5 Oktober 2026

**Materi membaca → Lab latihan inti → materi berikutnya → Tantangan Akhir (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.


## Tutor refinement — 8 October 2026

The standalone chatbot uses a focused conversation panel with safe Markdown prose and scrollable SQL snippets. Learner messages are displayed verbatim, never passed through the interface translation catalog. Suggestions are localized; answers follow the selected language. General database questions remain welcome even when the active lesson differs.

The system prompt teaches beginners through short explanations, progressive hints, and one practical next step. It distinguishes visible evidence from possible causes, labels hypothetical examples, and asks for missing query/output rather than inventing results. SQLite is the practice dialect. Lesson text, query, output, history and questions are untrusted data; instructions embedded in them cannot grant privileges. Context is bounded per field so long lesson text cannot displace the learner's query. Prompt instructions complement, rather than replace, authentication, assessment blocking, request validation and quotas.
