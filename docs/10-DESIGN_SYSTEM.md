# Quethink Design Direction

## Product feel

Calm, clear, educational, technical, and focused on understanding data. A learner should immediately know which table is the source, which filter is applied, and what rows are returned.

## Simplicity

- One primary action per screen.
- Use text labels with color; never communicate match state by color alone.
- Keep SQL editor, result table, and table canvas visually related. In each exercise, stack data/table, SQL editor, then output/change summary vertically; stack practice prompt and response controls vertically too.
- Reading pages use one comfortable column and a visible Unduh PDF control; no lab, exercise, AI panel or submateri outline. The flat material list uses Materi N, title, summary and a textual progress state.
- On separate practice pages, keep a Lab/optional-check outline in the desktop sidebar and a compact collapsible outline on mobile.
- Use a 2D schema visualizer inspired by the readable table/column structure of Supabase Studio. Attach FK connections to the exact columns; show SQLite types and PK/FK labels. Keep pan/zoom/fit/reset together in one restrained toolbar. Select a table to inspect records below; no 3D or app-wide canvas.
- Use a compact labeled schema selector for transfer tasks and Playground. Render one active schema at a time, with its actual table count and dataset title. Explain that switching restarts local lab state; exercise canvases stay fixed to their own dataset.
- Avoid repeated cards, decorative animation, glass effects, and dense controls.
- Keep optional video near the reading concept; interactive help belongs to practice.

## Typography and components

Use readable sans-serif for lesson prose and monospace for SQL. Preserve accessible labels, focus states, semantic tables, responsive tabs, alerts, progress, and buttons. shadcn/ui is a primitive library, not the visual identity.

## Query visualization

Show only what the current lesson teaches: table/source and fields, key relationships for a supported JOIN lesson, matching or filtered records, actual SQLite result rows, and aggregate groups only in the aggregation lesson. For Write lessons, make the target preview, affected rows, and after-state legible. Learners may pan, zoom, and reset the predefined table layout. The canvas is conceptual, not a query-plan simulator.

## Mobile

The separate Pembuat Skema surface uses three mobile tabs, Susun/Diagram/Periksa, and stacked labeled forms. Columns are edited through controls rather than precision dragging. Keep the diagram in its own scrollable viewport at readable scale and provide direct table focus. On wider screens the editor and diagram/feedback may sit side by side. Reuse existing fonts, surfaces, touch targets, and focus states; auto-place tables.

At approximately 360px, show one working area at a time: query, visualization, or result. Stack tables vertically inside the exercise canvas, keep pan/zoom controls touch sized, and let result tables scroll inside their own region.

## Current course progression

Pre-test → Materi → optional Lab SQL → Post-test. The authoritative behavior is defined in docs/03-LEARNING_SYSTEM.md. Reading acknowledgement replaces practice completion; historical checkpoints are unpublished and no longer gate the course. Existing history is retained.

## Tests and course navigation

Preserve incumbent tokens. Pre-test and post-test each have a separate calm page and a two-link switch. Diagnostic results use neutral “Pemahaman awal tercatat”; only post-test shows pass/fail. Aggregate topic rows use correct/total text without answer keys. Mobile bottom navigation has five labeled targets: Beranda, Materi, Lab, Tes, Profil. Lab is central; supporting tools are linked from Lab, ADMIN access from Profil.
