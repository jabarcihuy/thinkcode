<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Read `docs/AGENTS.md` and the relevant files in `docs/` before changing Quethink. Those documents define product scope and architecture.

`docs/AGENTS.md` is the canonical product and architecture guide. Read `docs/04-CURRICULUM.md` and relevant planning/research files before course changes. Before SQL runner or Supabase database changes, read `docs/06-ARCHITECTURE.md`, `docs/11-SECURITY.md`, and the applicable local framework/Supabase guidance. Learner SQL must remain confined to the synthetic SQLite Worker.
