# ThinkCode — Security Requirements

## JavaScript Sandbox

Practice source runs only in the browser: never in React, the main application window, or a Next.js/Vercel route. The browser runner uses `iframe sandbox="allow-scripts"` without `allow-same-origin`, giving an opaque origin, plus an iframe CSP denying network connections and unrelated resources. The iframe starts a disposable Web Worker for user source. Only source, bounded text input, and trace preference enter the sandbox. The parent accepts results only from its frame and matching request ID.

The worker captures `console.log`, `console.error`, syntax/runtime exceptions, and bounded trace. Limits: source 16 KB, input 4 KB, 100 output lines or 8 KB, 200 trace steps, worker timeout up to 3 seconds. The parent also has a timeout and removes the frame. Infinite loops therefore do not block the main UI. Browser isolation is a defense boundary, not a guarantee against browser engine vulnerabilities; keep browsers updated and do not use this for privileged grading.

## Hidden Tests and Grading

Hidden test cases and private answer configuration must never be sent in page payloads, network responses, client state, or AI context. Supabase RLS and column grants restrict direct access. Server code uses `SUPABASE_SECRET_KEY` only after authorization.

The browser cannot run a true hidden input without learning it. Current coding practice uses visible tests and sends client-observed results to server; those results can be forged and are not trusted assessment evidence. The server refuses hidden coding cases in browser practice. Deterministic Predict Output, pseudocode, and flowchart practice answers are checked against server-only configuration.

Assessment coding is separate: the server-only `QuickJSSandboxAdapter` runs JavaScript in QuickJS/WASM, not in Node's JavaScript evaluator, with a fresh runtime/context, no Node globals, no filesystem/network/environment bindings, 16 MiB memory cap, 512 KiB stack cap, 1.5 second interrupt deadline per test, 8 KiB/100-line output cap, and bounded source/inputs. Hidden test inputs/expected outputs are fetched only by the authenticated server grading path and never enter client payloads, AI context, public errors, or responses. Responses contain score, topic/item status, visible pass status, and hidden pass counts only.

This WASM interpreter runs within the Vercel Node function process and is not a hardened OS/container boundary. It limits JavaScript capabilities and resource consumption but still shares the function's host process/runtime; memory/CPU enforcement and function duration also depend on Vercel's current plan/runtime limits. Do not use it for arbitrary workloads or claim container-grade isolation.

## Auth, Role, and Ownership

Supabase Auth validates sessions. RLS plus server-side checks protect attempts, progress, locked lessons, and ADMIN operations. Do not rely on hidden buttons. Service keys and AI keys must never use `NEXT_PUBLIC_` or enter the browser bundle. Only public Supabase configuration belongs in the client.

Admin CMS routes re-check `profiles.role = ADMIN` on every request before using the privileged Supabase client. The CMS migration revokes browser insert/update/delete grants on content tables. Hidden practice/assessment case values may be returned to a verified admin only; learner exercise repositories continue to read visible test views, and assessment learner/session APIs remain allowlisted. The admin AI helper returns suggestions as client-visible draft text to an authorized admin and has no publication capability. User role mutation is not exposed in the CMS.

## Input, Rate, and Logging

Validate IDs, source size, test result count and size, answers, and admin content. Rate-limit authenticated Check, AI, assessment start, and assessment submit requests. Minimize source and sensitive content logs. Browser Run has no network API and no server quota. Practice AI may be on; active Assessment AI is off in both UI and server. The provider key is server-only, context is capped, conversation history is trimmed, and private assessment data is excluded.
