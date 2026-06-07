# PR Templates

Every PR body should answer: **What, Why, How to test, Risk, Checklist.**
Keep them short. A PR description that takes 30 seconds to read gets reviewed
faster than one that takes 10 minutes.

## Standard template

```markdown
## What
One or two sentences. What does this change do?

## Why
Why are we doing this? Link the ticket if relevant: refs #142

## How to test
Concrete steps the reviewer can follow:
1. ...
2. ...

## Risk
Low / Medium / High — and what could go wrong.

## Checklist
- [ ] Tests added or updated
- [ ] Feature flag added if partial (name: `FLAG_NAME`)
- [ ] Docs updated if behavior changed
- [ ] Tried locally
```

## Feature with flag

```markdown
## What
Adds CSV export to reports via `/api/reports/:id/export?format=csv`.

## Why
Users have been pasting JSON into spreadsheets. refs #142

## How to test
1. Set `REPORTS_CSV_EXPORT=true` locally
2. `curl /api/reports/1/export?format=csv` — should return text/csv
3. Try a 10k-row report — should stream, not buffer

## Risk
Low. New endpoint, gated by existing report auth. Behind feature flag
`REPORTS_CSV_EXPORT` (default off in prod).

## Checklist
- [x] Tests added
- [x] Feature flag wired
- [x] Docs updated in `/docs/reports-api.md`
- [x] Tried locally
```

## Bug fix

```markdown
## What
Empty passwords were being accepted at the auth endpoint.

## Why
trim() was applied after the length check, so " " (whitespace) passed
validation but then failed at login with a confusing error. refs #156

## How to test
1. Try to log in with password `""` — should be rejected at validator
2. Try with `"   "` — should be rejected
3. Try with a valid password — should still work

## Risk
Low. Tighter validation, no users currently log in with empty passwords
(we checked the logs).

## Checklist
- [x] Test added covering empty and whitespace-only
- [x] Tried locally
```

## Refactor

```markdown
## What
Extracts PDF generation into a dedicated module.

## Why
The PDF logic was spread across the reports controller and the email
sender. Both call sites duplicated layout setup. Extracting reduces
duplication and prepares for adding PDF support to the export endpoint.

## How to test
Behavior unchanged. Existing tests should pass without modification.
Spot-check:
1. Generate a report PDF in the UI — same output
2. Send a report by email — PDF attachment same as before

## Risk
Medium-low. No behavior change intended but the refactor touches both
call sites. Existing test coverage is good.

## Checklist
- [x] No new tests (refactor only)
- [x] Existing tests pass
- [x] Tried both call sites locally
```

## Hotfix

```markdown
## What
Login endpoint was crashing on requests with no body.

## Why
URGENT — production login broken since 14:30 UTC. The body parser was
being called before the null check.

## How to test
1. `curl -X POST /api/login` (no body) — should return 400, not 500
2. Normal login still works

## Risk
Low. Two-line change. Added a test that reproduces the crash.

## Checklist
- [x] Test added
- [x] Tried locally
- [ ] Postmortem note (will add after merge)
```

## Draft / WIP (for early feedback)

Open as a draft PR (`gh pr create --draft`). Body:

```markdown
## Status
WIP — not ready to merge. Looking for early feedback on the API shape
before I wire up the implementation.

## What I'm trying to do
[describe]

## Open questions
1. Should this be a POST or a GET?
2. Does the response shape match what the UI needs?

## What's done / not done
- [x] API spec
- [ ] Implementation
- [ ] Tests
```
