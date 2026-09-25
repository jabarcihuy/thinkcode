<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Read `docs/AGENTS.md` and the relevant files in `docs/` before changing ThinkCode. Those documents define product scope and architecture.

Current MVP decision: ThinkCode is an Interactive Programming Logic Lab using JavaScript (`javascript`, browser runtime). Practice source runs only in the isolated browser sandbox; assessment source uses the server-only QuickJS/WASM assessment adapter with strict resource limits. The MVP targets Vercel Hobby and Supabase Free without an external code runner. Browser coding checks are client-checkable and cannot be treated as trusted assessment evidence. Phases 0–7, including Admin CMS and UX Polish, are implemented. Do not add out-of-scope features without an explicit product decision.
