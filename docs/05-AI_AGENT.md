# ThinkCode — AI Tutor Specification

## Purpose

AI Tutor berfungsi sebagai programming mentor kontekstual, bukan chatbot umum.

Tujuan:

- Membantu user memahami konsep.
- Membantu user menemukan kesalahan sendiri.
- Memberikan hint bertahap.
- Membantu debugging.
- Membuat latihan serupa.
- Tidak menggantikan proses berpikir user.

## Availability

### Allowed

- Lesson mode.
- Practice mode.

### Forbidden

- Active checkpoint.
- Active final assessment.
- Any assessment session marked `in_progress`.

Blocking must happen server-side, not only through UI.

## Context

AI may receive:

- Current lesson.
- Current exercise.
- User JavaScript source dan trace yang aman untuk ditampilkan.
- Visible console output.
- Visible test results.
- User progress.
- Previous hints in the current tutoring session.

AI tidak boleh menerima hidden test cases, private answer config, assessment data, atau seluruh database user. Server membentuk context ringkas dari lesson aktif, exercise publik, source user, output dan hasil visible yang diberikan client, trace terbatas, progress ringkas, dan hint level. Source/output/trace tidak disimpan dalam riwayat.

## Tools

The current `TutorContextTools` is a server-scoped context interface, not provider function-calling. Reading lesson/exercise/code/output/trace/progress is bounded to the current request. Run and Check remain learner-initiated in the browser; tutor receives their visible result when the learner asks again. It cannot mutate lesson progress, score, or completion.

Recommended tool abstraction:

```text
getCurrentLesson()
getCurrentExercise()
readStudentCode()
readVisibleOutput()
runPracticeCode() // tutupannya mengarahkan user ke Run di browser; tutor tidak menjalankan arbitrary code di server
runVisiblePracticeChecks() // hasil check browser diberikan oleh user; bukan bukti assessment
getStudentProgress()
generateSimilarPractice()
```

## Tutor Behavior

Default escalation:

1. Small hint
2. More specific hint
3. Explain relevant concept
4. Give analogous example
5. Full solution only if user explicitly asks

Do not immediately overwrite or replace user code.

## Assessment Guard

Before every AI request:

```text
if activeAssessmentSession:
    reject AI request
```

Route `POST /api/ai/tutor` memeriksa assessment aktif dari server/DB sebelum provider dipanggil. Request selama session `IN_PROGRESS` mendapat 403 product-safe response. Rate limit: 8 request/menit per user; input dan history dibatasi.

## Shipped Provider

`AIProvider` memiliki adapter OpenAI Chat Completions-compatible yang dikonfigurasi server-side lewat `AI_API_URL`, `AI_API_KEY`, dan `AI_MODEL`. Streaming dan non-streaming berada di provider adapter; domain tutor tidak mengimpor SDK vendor. Provider live tidak diperlukan untuk build/test lokal, dan request live dapat memakai quota/biaya akun provider.

## Shipped UX and Persistence

Contextual Tutor Panel tersedia pada lesson dan practice. Quick actions: explain concept/code/error/trace, why wrong, hint, similar practice; free-form prompt juga tersedia. Hint level bereskalasi 1–5 dan solusi penuh hanya pada permintaan eksplisit. Session serta pesan user/assistant tersimpan; data context sensitif tidak disimpan. Similar practice menghasilkan ide/latihan dalam jawaban tutor, tidak menulis ke kurikulum.

## Provider Architecture

AI provider must be abstracted.

```text
AIProvider
├── providerA
├── providerB
└── futureProvider
```

Business logic must not directly depend on one vendor SDK throughout the codebase.

## Admin AI Content Assistant

Admin may use AI to draft:

- Lesson explanation.
- Examples.
- Exercises.
- Visible test cases.
- Hidden test cases.
- Summaries.

The Admin CMS includes a server-only AI drafting helper for explanations, examples, exercise prompts, tests, and summaries. AI output is inserted as an unpublished suggestion for administrator review. It cannot publish content. Hidden assessment cases remain outside tutor context and user-facing responses.
