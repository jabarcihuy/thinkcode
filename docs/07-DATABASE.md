# ThinkCode — Database Design

Database: Supabase PostgreSQL.

## Core Tables

### profiles

```text
id uuid PK -> auth.users.id
role enum(USER, ADMIN)
display_name text
created_at timestamptz
updated_at timestamptz
```

### learning_paths

```text
id uuid PK
slug text unique
title text
description text
position int
is_published boolean
created_at
updated_at
```

### chapters

```text
id uuid PK
learning_path_id uuid FK
title text
description text
position int
is_required boolean
is_published boolean
```

### lessons

```text
id uuid PK
chapter_id uuid FK
title text
slug text
summary text
content text
position int
is_required boolean
is_preview boolean
is_published boolean
```

`content` may store Markdown/MDX-compatible source depending on final renderer.

### exercises

```text
id uuid PK
lesson_id uuid FK
type enum
title text
prompt text
starter_code text nullable
solution_code text nullable
config jsonb
position int
is_required boolean
is_published boolean
```

Exercise types:

```text
CODE_COMPLETION
PREDICT_OUTPUT
DEBUGGING
PROBLEM_SOLVING
PSEUDOCODE
FLOWCHART
```

### test_cases

```text
id uuid PK
exercise_id uuid FK
stdin text nullable
expected_output text nullable
is_hidden boolean
weight numeric
position int
```

### lesson_progress

```text
id uuid PK
user_id uuid FK
lesson_id uuid FK
status enum(LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED)
started_at
completed_at
```

Unique:

```text
(user_id, lesson_id)
```

### exercise_attempts

```text
id uuid PK
user_id uuid FK
exercise_id uuid FK
source_code text nullable
answer jsonb nullable
score numeric
passed boolean
feedback jsonb
created_at
```

### assessments

```text
id uuid PK
learning_path_id uuid FK
title text
type enum(CHECKPOINT, FINAL)
passing_score numeric default 75
position int
is_published boolean
```

### assessment_items

```text
id uuid PK
assessment_id uuid FK
type enum(CODE_COMPLETION, PREDICT_OUTPUT, DEBUGGING, PROBLEM_SOLVING, PSEUDOCODE, FLOWCHART)
title text
topic text
prompt text
starter_code text nullable
public_config jsonb
answer_config jsonb (server only)
entry_function text nullable (server only)
weight numeric
position int
```

Unique `(assessment_id, position)`.

### assessment_test_cases

```text
id uuid PK
assessment_item_id uuid FK
args jsonb
stdin text
expected_output text (server only)
is_hidden boolean default true
weight numeric
position int
```

Unique `(assessment_item_id, position)`. USER has no direct grants/read policy for this private table. The grading route reads cases only after authentication and ownership/session checks.

### assessment_sessions

```text
id uuid PK
user_id uuid FK
assessment_id uuid FK
status enum(IN_PROGRESS, COMPLETED, ABANDONED)
score numeric nullable
started_at
completed_at nullable
```

### assessment_results

```text
id uuid PK
user_id uuid FK
assessment_id uuid FK
attempt_count int
latest_score numeric
highest_score numeric
passed boolean
completed_at nullable
updated_at
```

### ai_sessions

```text
id uuid PK
user_id uuid FK
lesson_id uuid nullable
exercise_id uuid nullable
created_at
updated_at
```

### ai_messages

```text
id uuid PK
session_id uuid FK
role enum(USER, ASSISTANT, TOOL)
content text
metadata jsonb
created_at
```

## RLS Principles

USER:

- Can read published content.
- Can read/write own progress through allowed paths.
- Can read own attempts/results.
- Cannot read hidden test cases.
- Cannot read other users' progress.
- Cannot write content tables.

ADMIN:

- Content mutations run through an authorized Next.js server route using privileged server credentials.
- Direct browser writes remain revoked for content tables.

Hidden practice/assessment tests are queried only by server grading paths with privileged server credentials after authorization. AI routes never fetch them.

## AI Tutor Tables

`ai_sessions` and `ai_messages` are owner-readable with RLS. Direct client writes are revoked; Next.js server code inserts bounded user/assistant messages after checking ownership. Tutor history does not persist source, output, or execution trace.

## Assessment Data and Atomic Functions

`assessment_sessions` stores `IN_PROGRESS`, `COMPLETED`, or `ABANDONED`, answers, trusted score, completion time, and safe feedback. A partial unique index allows at most one active session per user/assessment. `assessment_results` stores attempt count, latest/highest score, pass state, and completion time. Users can read their own sessions/results; direct writes and private config/test access are revoked. `start_assessment_session` verifies required lessons and earlier checkpoints, returning the active session if one already exists. Service-only `finalize_assessment_session` serializes finalization and derives pass state from the server score/threshold.

`phase1_lesson_is_available` enforces checkpoint gates for lessons after chapters 3, 6, and 9; completed lessons remain reviewable. Required lessons and passed checkpoints gate the final assessment.

## JavaScript Browser Migration

Migration `20260925000012_javascript_lab.sql` converts published seed lessons/exercises to JavaScript, renames the first program lesson, makes seed coding tests visible, and invalidates old-language attempts/progress from chapter 3 onward. Applied migration history may retain Java-era names/content; active MVP seed data uses JavaScript only.

`test_cases.is_hidden` remains server-only; browser coding Check refuses hidden cases. Deterministic checker answers stay in private `exercises.config`; the public catalog exposes only `public_config`. `code_request_limits` stores check, AI, and assessment quota buckets. Assessment-only cases live in `assessment_test_cases`, separate from browser practice checks.

Migration `20260925000013_flowchart_missing_node.sql` adds an optional deterministic choice exercise for a missing flowchart node. Its answer stays in private config; it does not block progression.

Migrations `20260925000014_ai_tutor.sql` and `20260925000015_assessment.sql` create tutor persistence and assessment/content/result tables, owner-only RLS, server-only private config/test data, rate-limit buckets, start/finalize RPCs, checkpoint-gated progression, and initial checkpoint/final seed items.

Migration `20260925000016_admin_cms.sql` adds `learning_paths.position` for path ordering and revokes direct content insert/update/delete grants from `anon` and `authenticated`. The CMS uses existing content tables and their publication columns; it does not delete learning content. Hidden assessment cases stay in `assessment_test_cases` and are only loaded by an authorized admin server request or trusted assessment grader.
