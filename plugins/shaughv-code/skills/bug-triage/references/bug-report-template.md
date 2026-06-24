# Bug Report Template

Use this structure for every bug report. Adapt the depth of each section to the
severity and complexity of the bug — a critical data corruption issue gets a thorough
report; a cosmetic alignment bug gets a concise one.

---

## Report Structure

```markdown
# [BUG] [Short Descriptive Title]

**Severity:** [Critical / High / Medium / Low]
**Status:** [New — Awaiting Fix]
**Reported By:** [Name and role of original reporter]
**Investigated By:** [Name of person who ran the investigation, with AI assistance]
**Date Reported:** [Date]
**Date Investigated:** [Date]
**Affected System:** [Tool/platform name and specific area]

---

## Summary

[2–4 sentences describing the bug in plain language. What's broken, who's affected,
and what's the impact. Write this for someone who needs to understand the issue in
30 seconds — a manager, a developer picking up the ticket, or a stakeholder asking
"what's going on with X?"]

---

## Steps to Reproduce

[Numbered steps that reliably trigger the bug. Be specific enough that a developer
can follow these exactly and see the same result. Include URLs, specific inputs,
and the sequence of clicks/actions.]

1. Navigate to [specific URL or path in the application]
2. [Specific action — e.g., "Click the 'Filter' dropdown and select 'Active Projects'"]
3. [Next action]
4. [Continue until the bug manifests]

**Reproduction Rate:** [Always / ~X out of Y attempts / Intermittent — could not
reliably reproduce]

**Reproduction Notes:** [Any conditions that affect reproduction — specific data,
time of day, browser, user role, etc.]

---

## Expected vs. Actual Results

**Expected:**
[What should happen when following the steps above. Be specific.]

**Actual:**
[What actually happens. Include exact error messages, screenshots references,
incorrect values, or behavioral descriptions.]

---

## Environment

- **Application/Tool:** [Name and version if applicable]
- **URL:** [The specific URL where the issue occurs]
- **Browser:** [Browser name and version used during investigation]
- **Operating System:** [OS of the reporter or investigator]
- **User Role/Permissions:** [If relevant — what role was the user logged in as?]
- **Date/Time of Occurrence:** [When the reporter first experienced it]
- **Related Systems:** [Any integrations, APIs, or dependent systems involved]

---

## Investigation Findings

### Evidence Collected

[Document each significant piece of evidence discovered during the investigation.
This is the detailed technical section — include console errors, API responses,
data discrepancies, and anything else that illuminates the root cause.]

**Finding 1: [Brief label]**
- Action taken: [What you did]
- Observation: [What you found]
- Significance: [Why it matters]

**Finding 2: [Brief label]**
- Action taken: [What you did]
- Observation: [What you found]
- Significance: [Why it matters]

[Continue as needed]

### Hypotheses Tested

| # | Hypothesis | Test Performed | Result | Conclusion |
|---|-----------|---------------|--------|------------|
| 1 | [What you thought might be the cause] | [How you tested it] | [What happened] | [Confirmed / Ruled Out] |
| 2 | [Next hypothesis] | [Test] | [Result] | [Conclusion] |

### Root Cause Analysis

[Clear statement of what's causing the bug, supported by the evidence above.
If the root cause is confirmed, state it with confidence. If it's still a best
hypothesis, say so and explain what additional information would confirm it.]

**Root Cause:** [One sentence stating the cause]

**Explanation:** [2–4 sentences explaining the mechanism — how and why this
produces the observed behavior. Connect it to the evidence.]

**Scope of Impact:** [Who and what is affected? Is this isolated to one user/record,
or does it affect a broader population? Are there downstream consequences?]

---

## Reflection & Prevention

### How Was This Bug Likely Introduced?

[Based on your investigation, what's your best assessment of how this bug came to
exist? Consider:]
- [Was it a recent change that broke existing functionality?]
- [Was it an edge case that wasn't covered in original development?]
- [Was it a data quality issue from an upstream source?]
- [Was it a misunderstanding of requirements?]
- [Was it a configuration or environment issue?]

### What Could Prevent Similar Bugs?

[Specific, actionable suggestions — not generic "write more tests." Connect each
suggestion to the specific failure mode you observed.]

- [Suggestion 1 — e.g., "Add validation on the [field] input to reject [specific
  invalid values] before they reach the database"]
- [Suggestion 2 — e.g., "Add a monitoring alert for [specific condition] so the
  team is notified before users encounter the issue"]
- [Suggestion 3 — e.g., "Update the QA checklist to include [specific test scenario]
  for this type of feature"]

---

## Recommended Fix & Next Steps

### Recommended Fix

[Your best recommendation for how to fix the issue. Be specific enough to be useful
to the developer, but don't write the code — that's their job.]

### Workaround (if available)

[If end-users can work around the issue in the meantime, describe how. This is
critical for High and Critical severity bugs where the fix might take time.]

### Next Steps

- [ ] [Specific action — e.g., "Assign to [team/person] for code fix"]
- [ ] [e.g., "Verify fix against reproduction steps above"]
- [ ] [e.g., "Check for similar pattern in [related feature]"]
- [ ] [e.g., "Update [documentation/configuration] if root cause was config-related"]
- [ ] [e.g., "Communicate resolution to [reporter/affected users]"]
```

---

## Title Writing Guide

Write titles that a developer can scan and immediately understand:

**Good titles:**
- "Filter dropdown returns all records instead of filtered subset on Projects page"
- "Cost column shows $0 for active change orders created after March 15"
- "PDF export fails with timeout error for reports over 50 pages"
- "User role 'Estimator' cannot access Bid Summary tab despite correct permissions"

**Bad titles:**
- "Bug in the system" (too vague)
- "It doesn't work" (no information)
- "Dropdown issue" (which dropdown? what issue?)
- "Data problem on the dashboard" (which data? which dashboard?)

The title should include: **what's broken** + **where** + optionally **when/for whom**.

---

## Severity Decision Guide

When assigning severity, consider these questions:

1. **Can users complete their core work?** No → Critical or High
2. **Is data being corrupted or lost?** Yes → Critical
3. **How many users are affected?** All → bump up. One → bump down.
4. **Is there a workaround?** No → bump up. Yes, easy → bump down.
5. **Is this visible to external stakeholders (owners, subs)?** Yes → bump up.
6. **How long has it been happening?** Recently introduced → may be more urgent.
   Long-standing → lower urgency but may have wider impact.
