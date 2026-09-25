# ThinkCode — Roles & RBAC

## Roles

MVP menggunakan enum role:

```text
USER
ADMIN
```

Jangan menggunakan boolean seperti `isAdmin`.

Future-compatible:

```text
USER
ADMIN
TEACHER
```

## USER Permissions

Allowed:

- Read published learning content.
- Start learning path.
- Read own progress.
- Update own progress through valid learning actions.
- Submit own exercise.
- Run code.
- Use AI Tutor outside assessment.
- Start assessment.
- Submit assessment.
- Read own assessment results.

Forbidden:

- Read hidden test cases.
- Modify learning content.
- Modify another user's progress.
- Access admin routes.
- Access AI Tutor during active assessment.

## ADMIN Permissions

Allowed:

- All USER capabilities.
- Manage learning paths.
- Manage chapters.
- Manage lessons.
- Manage exercises.
- Manage test cases.
- Manage assessments.
- Manage content publication state.
- View user management data.
- Use admin AI content assistant.

## Ownership Rules

Authorization must check both role and ownership.

Example:

- USER can only read/write their own progress.
- USER can only read their own submissions.
- Hidden test cases must never be returned to USER clients.
- Admin-only mutations must be enforced server-side.

## Enforcement Layers

Use both:

1. Supabase RLS
2. Next.js server-side authorization

Never trust client-side role checks as the only protection.
