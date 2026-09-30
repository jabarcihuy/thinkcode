# Quethink — Roles & Access

## Roles

The application uses USER and ADMIN. Authorization uses the role enum and server-side checks, not an isAdmin boolean.

## USER

A user may read published database content, run SQL against the synthetic browser dataset, manage their own progress and practice attempts, use the AI Tutor during lessons/practice, and read or submit their own assessments.

A user may not read hidden assessment answers, modify content, alter another user's progress, or access admin routes.

## ADMIN

An admin may do all learner actions and manage learning paths, chapters, lessons, exercises, video links, publication state, assessments, and user overview through the protected CMS.

## Enforcement

Use Supabase RLS and server-side authorization. Validate ownership for progress, attempts, conversations, and assessment sessions. Hiding a control in the UI is not authorization.

## Admin lesson preview

`/admin/lessons/[lessonId]/preview` requires ADMIN on the server and rechecks authorization before privileged content reads. Draft and published lessons can be inspected without learner prerequisites. Reuse lesson prose, dataset labs, and exercise display; preview does not invoke grading, create attempts, mutate progress, or include AI Tutor. Exercise display fields are allowlisted and answer/test configuration is excluded. Learner routes and their progression rules remain unchanged.
