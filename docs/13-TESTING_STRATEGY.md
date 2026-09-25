# ThinkCode — Testing Strategy

## Unit Tests

Test:

- Progression rules.
- Score calculation.
- Passing logic.
- Output normalization.
- Exercise checker logic.
- Assessment AI guard.
- Role helpers.
- Provider adapters.

## Integration Tests

Test:

- Register/login flow.
- Lesson unlock flow.
- Exercise submission.
- BrowserJavaScriptRunner sandbox and trace generator.
- Hidden data isolation and refusal of browser grading when hidden coding tests exist.
- Assessment lifecycle.
- AI rejection during assessment.
- Admin publication flow.
- Admin CMS RBAC, schema validation, draft publication, hidden test administration, and AI draft-only response (`npm run test:admin:integration`).
- Admin CMS mobile overflow, responsive account navigation, and persisted-in-session light/dark/system theme selection at a 360px viewport.

## End-to-End Critical Flows

### Flow A

```text
Register
→ Start path
→ Complete lesson
→ Next lesson unlocked
```

### Flow B

```text
Run JavaScript in the browser sandbox
→ Receive stdout
→ Visualize trace
```

### Flow C

```text
Submit wrong solution
→ Fail
→ Retry
→ Pass
```

### Flow D

```text
Practice
→ AI Tutor works
```

### Flow E

```text
Start assessment
→ AI Tutor request rejected
```

### Flow F

```text
Admin creates draft lesson
→ Publish
→ User can read
```

Responsive smoke checks cover 360px, 768px, and 1280px layouts for the critical learner/admin surfaces. Check `documentElement.scrollWidth` against the viewport to catch horizontal overflow.

## Security Tests

Verify:

- USER cannot access admin API.
- USER cannot read hidden tests or private checker config.
- User code cannot access parent DOM, auth storage, or service secrets.
- Infinite loop terminates worker while main UI stays responsive.
- Coding browser results are classified as client-checkable; do not treat them as assessment evidence.
- USER cannot edit another user's progress.
- Assessment cannot call AI endpoint.
- Secrets are not exposed in client bundles.

## Browser Runner and Visualizer Tests

Verify:

- Syntax errors.
- Runtime errors.
- Timeout.
- Console logs and console errors.
- Empty output.
- Large output handling.
- Malformed source.
- Variable updates, condition branches, loop iterations, function calls, arrays, trace navigation, and max trace steps.
