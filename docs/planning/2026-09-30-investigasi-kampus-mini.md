# Investigasi Kampus Mini

> Visual direction updated on 30 September 2026: the user removed 3D in favor of a polished 2D schema visualizer. The original 3D decision and validation below are historical. Current behavior is defined in docs/10-DESIGN_SYSTEM.md and docs/06-ARCHITECTURE.md.

## Design decision

User requested varied interactive material and both 2D/3D visualization on 30 September 2026. Retain Relasi → Read → Write, 11 lessons, the small shared synthetic dataset, and separate server-graded assessments. 2D remains the default and 3D is an optional record/relationship viewer, not a new execution environment.

## Learner rhythm

Problem → inspect records → predict → try one change → compare → explain → optional subtopic checks → required practice. Use meaningful campus questions and varied task formats instead of repetitive query-result transcription alone. No points, streaks, leaderboard, or decorative rewards.

## Implementation

- Three subtopics per lesson, each with one aligned check: two optional, one required.
- 2D: schema canvas with pan/zoom/reset plus selectable accessible records.
- 3D: selectable record objects and real FK links; same snapshot and selection, lazy Three.js, render on demand, dispose resources on unmount.
- Write: apply confirmed Worker tableRows to the shared snapshot; preview does not change objects; reset restores the seed.
- Learning evidence: select concepts, order relational/safe-write steps, and predict SQL tables. Direct arbitrary SQL solutions remain formative local lab work, not official server scoring.
- Course/history: preserve lesson IDs, mandatory exercise IDs, attempts, progress, and assessment results.
- No video links added without verifying relevance and availability.

## Research basis and limits

[SQLBolt](https://sqlbolt.com/lesson/select_queries_introduction) pairs short SQL concepts with immediate practice. [CS2023 relational querying outcomes](https://csed.acm.org/query-the-relational-model/) connect schema/key understanding to translating data requirements into queries. These support the concept → task structure; they do not establish that a 3D viewer improves learning. Compare usability and understanding with actual beginner learners before making 3D the default.

Three.js [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html) and [resource disposal](https://threejs.org/manual/pages/cleanup.html) guide the optional client viewer. [SQLite SELECT](https://www.sqlite.org/lang_select.html) and [foreign keys](https://www.sqlite.org/foreignkeys.html) define actual query/constraint behavior. The visualizer is not a physical query-plan simulator.

## Acceptance

11 lessons, 33 published checks, one mandatory per lesson; optional success alone cannot unlock. Answers remain server-only. Both modes operate on public synthetic records; mode changes preserve SQL and selection. Lint, typecheck, tests, build, and available API integration pass; unavailable WebGL/browser checks are explicitly reported.

## Validation — 30 September 2026

- Applied `interactive_campus_curriculum` and `refine_relation_exploration_copy` via Supabase MCP to the authorized project.
- Remote contract: 11 published lessons, 33 checks, exactly one mandatory per lesson, existing mandatory IDs preserved, private answer/grading/feedback fields absent from public_config.
- Relasi lesson content has no SQL/query vocabulary or SQL starter lab.
- Lint, typecheck, 117 unit tests in 24 files, and production build passed.
- Live RLS checks passed. `scripts/check-interactive-curriculum.mjs` passed the API flow through 11 completed lessons and four passed assessments, optional/mandatory progression, assessment AI/Playground blocking, guest/admin guards, private configuration, and owner-only attempts. Disposable test accounts were removed.
- Static Impeccable detector returned no findings for the changed UI scope; no new suppressions added.
- Client chunk scan found zero matches for locally configured Supabase secret and AI key; values were never printed.
- WebGL rendering, touch gestures, and mobile visual layout still need browser smoke testing: computer-use inventory provided no browser surface. Build/unit/API success does not substitute for this visual check.
- 3D is a conceptual record/FK viewer, not physical query execution tracing or an SQL query-plan display. Official assessment grading remains server-side and does not use viewer state.

## Current decision — focused 2D schema

The user's subsequent request replaces the optional 3D viewer with a Supabase-inspired 2D schema. Three.js and its types are removed. HTML table objects show column names, SQLite types, PK/FK labels, and record counts; SVG one-to-many connections attach to their actual key columns. Selecting tables opens the record inspector below. Selecting records highlights real FK paths, with an optional related-record filter.

Keep the vertical order: schema and records → query → output. Query explanation controls are a disclosure rather than another always-open panel. Mobile starts with one table at readable scale; table selectors focus the canvas and vertical touch gestures preserve page scrolling. Pan, zoom, fit, reset, and keyboard arrow controls remain available. This is a conceptual relational view, not a physical execution plan or a database administration tool.

### Verification

- Applied `focus_schema_visualizer_2d` through Supabase MCP; local migration version matches the remote version. Published course still has 11 lessons, 33 checks, and 11 mandatory checks; no published lesson content mentions 3D. Progress and attempt history are unchanged.
- Lint, typecheck, 129 tests across 25 files, and production build pass.
- New tests cover named-column connection anchors, mobile/desktop geometry, focus/fit/pan bounds, actual record relationships, and SQL source highlighting without treating literals or comments as source tables.
- Live Supabase RLS checks pass for path visibility, previews, private progress, and guest mutation denial.
- Static Impeccable detector reports no findings in the changed UI scope. No suppressions added.
- Client bundle scan checks two configured private credential values and finds zero matches; credential values are never printed.
- Rendered desktop/mobile visual QA and touch interaction smoke tests remain unverified because computer-use inventory has no browser surface. Geometry tests and a successful build do not replace a rendered UI check.
