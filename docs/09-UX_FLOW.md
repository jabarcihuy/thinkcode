# ThinkCode — UX Flow

## Guest Flow

```text
Landing
→ Explore Learning Path
→ Preview Lesson
→ Register / Login
→ Start Learning
```

## User First Run

```text
Register
→ Dashboard
→ Programming Logic Fundamentals
→ Start
→ Chapter 1
→ Lesson 1
```

## Lesson Flow

```text
Open Lesson
→ Read Concept
→ See Flowchart / Pseudocode
→ Predict Output
→ Edit JavaScript main.js
→ Run in browser
→ Compare prediction and actual output
→ Visualize Execution (Previous / Next / Play / Pause / Reset)
→ Mandatory Practice
→ Check Answer
```

If failed:

```text
Visible result
→ Try Again
or
→ Ask AI Tutor
```

If passed:

```text
Practice Passed
→ Lesson Completed
→ Next Lesson Unlocked
```

## Assessment Flow

```text
Checkpoint Available
→ Start Assessment
→ Assessment Session = IN_PROGRESS
→ AI Disabled
→ Answer Questions
→ Submit
→ Score
→ Pass / Not Passed
```

Before final submission, the user reviews a confirmation dialog explaining that the answers will be graded and the session closed. The question navigator shows answered state, and the progress indicator reports the number of completed answers.

If failed:

```text
Review allowed feedback
→ Return to learning/practice
→ Retry later
```

## Desktop Lesson Layout

Recommended:

```text
┌────────────────────────────────────────────────────────┐
│ Top navigation                                         │
├──────────────┬──────────────────────┬──────────────────┤
│ Lesson Nav   │ Problem / Logic Flow │ JavaScript Editor│
│              │                      │                  │
│              │                      │                  │
├──────────────┴──────────────────────┼──────────────────┤
│ Contextual AI Tutor                  │ Output / Trace   │
└──────────────────────────────────────┴──────────────────┘
```

Exact split may change during design iteration.

## Mobile Lesson Layout

Do not shrink desktop panels blindly.

Recommended tabs:

```text
Problem | Code | Result / Trace
```

Assessment mobile:

```text
Question | Code | Output
```

No AI tab.

The app supports Light, Dark, and System theme selection. Small-screen account navigation uses an explicit menu disclosure. The lesson JavaScript workspace keeps Code and Result in mobile tabs while retaining editor state as the user changes panels.

## Bug Lab

Observe → Run broken JavaScript → see wrong output or timeout → inspect trace → fix → Check. Check is practice feedback; a browser-reported coding result is not a trusted assessment grade.

## Dashboard

Show:

- Continue Learning.
- Overall progress.
- Current chapter.
- Latest checkpoint.
- Learning path overview.

Avoid gamification overload in MVP.

## Admin Content Workflow

```text
Create draft
→ Edit structured content and tests
→ Preview lesson with learner Markdown renderer
→ Validate required fields
→ Explicit Publish
```

Unpublish keeps existing lesson progress and historical attempts. User management displays role and completed lesson count read-only; role promotion/demotion remains a trusted database/server operation.
