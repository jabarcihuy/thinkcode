# ThinkCode — Agent Instructions

## Mission

Build ThinkCode according to the documents in `/docs`.

The documentation is the source of truth.

Do not invent major features outside the documented MVP.

## Product

ThinkCode is a sequential programming-logic learning platform.

MVP:

- JavaScript only (`javascript`, browser runtime).
- USER and ADMIN only.
- Contextual AI Tutor during learning/practice, using the server-only `AIProvider` abstraction.
- AI disabled during assessment by server enforcement as well as UI state.
- Browser JavaScript sandbox in an opaque-origin iframe and terminable worker.
- Assessment coding grading via server-only QuickJS/WASM `AssessmentRunner`; do not describe this as a separate OS/container sandbox.
- Supabase.
- Next.js full-stack.
- Vercel deployment target.

## Required Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Monaco Editor
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage where needed

Do not introduce a separate NestJS/Express backend unless documentation is explicitly revised.

## Architecture Rules

1. Keep frontend and backend in one Next.js codebase.
2. Use server-side boundaries for sensitive operations.
3. Code runner must use an adapter/interface.
4. AI provider must use an adapter/interface.
5. Hidden test cases must never reach the client.
6. Never execute user practice JavaScript inside Next.js/Vercel runtime or the main application context. Assessment code may only run through the isolated QuickJS/WASM adapter with the documented limits; never use Node's evaluator or host capabilities.
7. Use Supabase RLS plus server-side authorization.
8. Use role enum, not `isAdmin`.
9. Design schema so `TEACHER` can be added later without redesigning users.
10. Do not couple business logic directly to a single code-runner provider.
11. The MVP targets Vercel Hobby and Supabase Free without a paid code runner.
12. True hidden tests cannot be graded securely through browser execution. Keep assessment hidden tests server-only and exclude them from client responses, bundles, and AI context. Practice coding checks are client-checkable and untrusted.

## Product Rules

### Learning

- Sequential progression.
- Locked prerequisite.
- Mandatory practice required for lesson completion.
- Optional lessons may exist.

### AI

Practice:

- AI enabled.

Assessment:

- AI disabled both in UI and backend.

AI should give progressive hints instead of immediately replacing user code.

### Assessment

- Score 0–100.
- Passing score default 75.
- Unlimited retry.
- Store attempt count.
- Store latest score.
- Store highest score.

## UI Rules

- Clean educational interface.
- Code-first.
- Avoid excessive gradients.
- Avoid AI-slop visuals.
- Avoid decorative clutter.
- Avoid unnecessary emoji.
- Use icons only when they improve comprehension.
- Mobile should use intentional tab-based layouts rather than compressed desktop UI.

## Development Rules

- TypeScript strict mode.
- Prefer small focused modules.
- Avoid giant components.
- Separate:
  - UI
  - domain logic
  - data access
  - provider adapters
  - authorization
- Validate server inputs.
- Handle loading/error/empty states.
- Keep secrets server-only.
- Write tests for critical progression, assessment, AI guard, and code-checking logic.

## Before Implementing a Feature

Read the relevant docs:

- Product: `01-PRD.md`
- Roles: `02-USER_ROLES_RBAC.md`
- Learning: `03-LEARNING_SYSTEM.md`
- Curriculum: `04-CURRICULUM.md`
- AI: `05-AI_AGENT.md`
- Architecture: `06-ARCHITECTURE.md`
- Database: `07-DATABASE.md`
- API: `08-API_SPEC.md`
- UX: `09-UX_FLOW.md`
- Design: `10-DESIGN_SYSTEM.md`
- Security: `11-SECURITY.md`
- Roadmap: `12-ROADMAP.md`
- Testing: `13-TESTING_STRATEGY.md`

## Scope Control

If an implementation decision conflicts with documentation:

1. Do not silently improvise.
2. Prefer the documented behavior.
3. Record required changes before modifying product scope.

Phases 0–7, including Admin CMS and UX Polish, are implemented. Do not add scope beyond the MVP or start future roadmap phases unless explicitly requested.
