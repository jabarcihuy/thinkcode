# Product

## Platform

web

Quethink is an Indonesian-language platform for learning relational databases through a small synthetic dataset, SQL practice, and clear 2D visual explanations.

## Users

Beginners learning relational data and SQL. No programming background is required. Admins manage learning content through the internal CMS.

## Product Purpose

Help learners understand where data lives, how tables relate, and how SQL changes the rows and columns in a result. Quethink is an Interactive Database Learning Lab, not a general code editor or database administration console.

## Learning Cycle

Mandatory diagnostic pre-test once → numbered pure reading/PDF → paired visual Lab and server-checked core → next material → post-test ≥75 → completion. Videos, extra checks, free Playground and AI hints support the journey without becoming additional gates. Reading acknowledgement alone cannot unlock the next material. Historical completions remain reviewable.

## Active Scope

11 materials grouped internally into Relasi (2), Read (6), Write (3). Model tables and keys first; then query and safely change synthetic data. SQLite WASM in a browser Worker never connects to Supabase. Progress, deterministic answer checks, diagnostic/post-test scoring and private keys are server-owned. Tutor is optional in Lab/chatbot and paused during all active tests. Admin draft/preview/publish is protected server-side.

## Product Principles

1. Teach the data model before asking learners to write a query.
2. Ask for a prediction before showing the actual query result.
3. Keep schema, query, visual explanation, and result connected as one small learning task. The table canvas belongs to each exercise and stays separate from app-wide navigation.
4. Do not imply the diagram is SQLite's physical query plan. It is a teaching model beside real SQLite output.
5. Keep learner UI calm, accessible, and direct. Use a focused 2D canvas only for each exercise's database tables; learners can pan and zoom while table positions remain predefined. Do not add 3D or an app-wide canvas.
6. Preserve historical progress when retiring old course content; archive it instead of deleting it.

## Technical Constraints

Next.js App Router, strict TypeScript, Supabase Auth/PostgreSQL, SQLite WASM in the browser, and Vercel are the current stack. JavaScript and TypeScript are internal application languages only; they are not learner course content. There is no active programming or PTI course.
