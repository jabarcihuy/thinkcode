# ThinkCode — Technical Architecture

## Product and Stack

ThinkCode is an **Interactive Programming Logic Lab**. MVP language: `displayName: JavaScript`, `slug: javascript`, `runtime: browser`.

- One Next.js full-stack TypeScript codebase on Vercel.
- Tailwind CSS, shadcn/ui primitives, Monaco Editor.
- Supabase PostgreSQL and Auth. Storage only when a real need appears.
- Browser JavaScript sandbox and execution visualizer.
- Provider-agnostic AI Tutor for lessons and practice.
- Trusted assessment grading through a server-only QuickJS/WASM adapter.

The initial cost target is Vercel Hobby plus Supabase Free and browser execution. Eligibility and quotas are governed by each service's current terms. No mandatory paid runner, VPS, Docker execution service, or always-on worker is required.

## Runtime Boundaries

```text
Browser
├── Next.js client UI and Monaco main.js
├── Trace generator (parses source; never runs it in the app context)
├── sandboxed iframe (allow-scripts, opaque origin, restrictive CSP)
│   └── disposable Web Worker executing source
└── execution visualizer and visible coding tests
       ↓ authenticated Check request
Next.js on Vercel
├── session and role authorization
├── deterministic answer checking
├── visible coding result comparison and attempt recording
├── QuickJS/WASM assessment runner for trusted assessment grading
└── privileged Supabase access to private checker/assessment configuration
       ↓
Supabase PostgreSQL + Auth
```

`CodeRunner` stays generic; `BrowserJavaScriptRunner` is the practice adapter. It accepts source, text `input`, timeout, and visualization flag. A disposable worker captures console output and errors. The parent terminates the frame and worker on timeout. Practice source never runs in React or a Vercel function. Browser JavaScript receives no auth token, Supabase client, privileged key, or hidden test.

## Execution Trace

Acorn parses user source and MagicString inserts calls at supported statements. The sandbox runs this instrumented source and emits normalized `ExecutionTrace.steps[]` with line, event, variable snapshot, condition, iteration, function, array values, and output. The visualizer has Previous, Next, Play, Pause, Reset. Output and trace have separate bounds. The trace is explanatory, not a full debugger; dynamic constructs and asynchronous work are outside the MVP scope.

## Grading Trust Boundary

- Predict Output, pseudocode, and simplified flowchart answers are checked server-side against private configuration.
- Coding practice runs **visible** tests in each learner's browser. Check sends source and bounded results to the server, which compares against published expected outputs, rate limits, and records the attempt.
- Browser-reported output can be forged. Coding practice completion is educational feedback and must not be reused as a trusted assessment score.
- True hidden test input/output stays server-only. Browser practice refuses hidden coding tests. Assessment coding executes with QuickJS/WASM in a fresh server-side adapter with memory, stack, output and interrupt limits, and no Node/network/filesystem/environment bindings. It runs within the Vercel function runtime, not an isolated OS/container boundary.

## Application Layers

```text
src/app                    pages, protected routes, Check endpoint
src/components             shared UI and shadcn primitives
src/features/learning      progression domain, data access, UI
src/features/workspace     Monaco, sandbox protocol, trace generator, visualizer
src/features/practice      exercise renderers, validation, grading, data access
src/features/admin         CMS validation, server authorization, and admin UI
src/lib/providers          CodeRunner and AIProvider contracts, browser adapter
src/lib/auth               Supabase session handling
src/lib/authorization      USER/ADMIN checks
src/lib/supabase           public clients and server-only privileged client
src/types                  shared and generated database types
```

Hidden checker configuration, assessment sessions/results, attempts, and progression remain server-authorized with Supabase RLS and narrow RPCs. `AIProvider` isolates a server-configured streaming adapter; tutor context/history are bounded and cannot mutate score or progress. The server rejects AI requests during active assessment before provider invocation. `AssessmentRunner` isolates QuickJS grading; start/finalize RPCs enforce prerequisites, a single active session, and server-derived score/result aggregates. Public assessment reads explicitly omit private answer configuration and tests.

Admin content operations use `src/app/api/admin` route handlers. Every read and mutation checks the authenticated profile role server-side before creating a privileged Supabase client. Browser clients receive no content write grants. Publication is a separate validated action; new content starts unpublished. The CMS reuses the learner Markdown renderer for lesson preview. AI content suggestions are server generated and returned only as reviewable draft text; no provider route can publish content.
