---
name: handoff
description: >-
  Write a compact, evidence-typed handoff for a future agent or session. Use when ending or
  stopping mid-task, switching context, wrapping up for the day, approaching compaction, or when
  the user says "/handoff", "wrap up", "pick this up tomorrow/later", "before I close this", or
  "write up where we are." Preserves the objective and acceptance contract, authority and scope,
  verified state with evidence pointers, decisions, artifacts, live hypotheses, attempt ledger,
  failed routes and re-entry conditions, unresolved contradictions, open obligations, and the
  exact next bounded action. Keeps raw chronology at stable paths instead of dumping the
  transcript into active context. When an active task system already owns the continuation
  packet, update that canonical task record first and create a standalone
  docs/agents/handoff/YYYY-MM-DD-NNN-SLUG.md only on explicit request or when no task record owns
  the work. Defers to git-workflow for any commit.
allowed-tools: "Read,Write,Edit,Bash,Glob,Grep"
---

# Handoff Document Generator

Write a handoff document summarising this session for future agents/sessions.

**The primary moment for this skill:** an agent is mid-task and the operator needs to leave work
for the day — or wants to stop that agent — without losing the thread. The handoff document is
how the work survives the stop.

**The completeness bar:** a future agent with zero context can make the **next correct decision**
without re-asking anything settled or trusting an unsupported claim. Preserve decision-relevant
state and exact evidence pointers. Do not replay the conversation chronologically or paste raw
logs that can be retrieved from stable paths.

## Choose the authoritative continuation surface

Before creating a file, inspect the repository's active work system:

- If an active task record already owns the work—such as
  `.tasks/tasks/<id>.md` under `shaughv-tasks`—update that packet first using the task system's
  status, evidence, attempts, failed-route, obligation, and next-action contract. Do not create a
  second session file for a generic “wrap up” or “pick this up tomorrow” request.
- Create the standalone handoff below when the user explicitly asks for a handoff document, when
  no active task record owns the work, or when the receiving workflow cannot access the task
  system.
- If both artifacts are explicitly required, the active task packet is canonical. The standalone
  handoff points to it and contains only receiver-specific context; do not maintain two competing
  copies of the same state.

## Steps

The following steps apply when a standalone handoff is warranted.

1. **Determine today's date.** Use the `currentDate` context if available, otherwise run `date +%Y-%m-%d` (PowerShell: `Get-Date -Format yyyy-MM-dd`) to get it.

2. **Find the next sequence number.** List the existing files under `docs/agents/handoff/` to find the highest sequence number already used today, then increment by one. Format: `NNN` (zero-padded to 3 digits, starting at `001`). If the directory doesn't exist, create it and start at `001`.

3. **Derive the topic slug.** Use the current session name if one exists. Otherwise, derive a short kebab-case topic slug from the main subject of this session (e.g. `revenue-projections-spreadsheet-review`, `api-sync-optimization`, `prod-alert-investigation`). Keep it under 60 characters. It should be specific enough that someone scanning a file list can tell what the session was about without opening the file.

4. **Choose the filename.** Format: `docs/agents/handoff/YYYY-MM-DD-NNN-<topic-slug>.md`
   - Example sequence: `2026-03-23-001-...`, `2026-03-23-002-...`, `2026-03-24-001-...`
   - If you are within a chat, and do not have access to a filesystem, write out the handoff document as markdown inline in the chat.

5. **Write the handoff document** to the confirmed path. Structure it as follows:

---

```markdown
# Handoff: [Session Title — human-readable version of the slug]

**Date:** YYYY-MM-DD
**Session:** [sequence number for the day, e.g. "Session 1 of the day"]
**Runtime / model:** [current runtime and model/version if known; otherwise unknown]
**Task/ticket ID(s):** [optional — issue-tracker IDs this session advanced]

---

## Objective, Acceptance & Authority

[Objective; mandatory acceptance rows and their oracles; governing instructions; in-scope work,
non-goals, preservation invariants, approval boundaries, and truthful terminal status.]

## Verified Current State

[Only facts supported by observations. For each load-bearing fact, provide the exact command,
result, artifact, commit, URL, or evidence path. Mark inference, stale evidence, unrun checks, and
unknowns explicitly.]

## Plan & Dependency State

[Global dependency skeleton plus only the current bounded action window. Mark each item done / in
progress / not started / invalidated. For in-progress work: exact location, last verified state,
and what observation changes the plan.]

## What Was Accomplished

[Concrete deliverables. What exists now that didn't exist before this session? Be specific — list files created, commands added, features built, bugs fixed, configurations changed. Use bullet points. Include file paths.]

## Key Decisions

[Architectural choices, trade-offs, and things that were explicitly ruled out and why. These are the decisions a future agent would otherwise waste time re-discovering or re-debating. Format as bullets with brief rationale.]

## Artifacts & How the Current Result Works

[Material artifacts and exact paths. Explain changed behavior at the level needed to use or modify
it. Use a diff/status or manifest pointer for exhaustive file enumeration rather than copying a
huge list into the packet.]

## Evidence & Completion Receipts

[For each mandatory criterion: oracle, exact invocation/observation, raw result or pointer,
interpretation, limitation, and PASS / FAIL / NOT RUN / INDETERMINATE. The overall status is the
weakest mandatory row.]

## Live Hypotheses & Predicted Observations

[Distinguish hypotheses from facts. Record each live causal premise, its expected observation,
earliest disconfirming signal, and downstream state invalidated if false.]

## Attempt Ledger & Retired Routes

[For uncertain or repeated work: target, starting state, causal hypothesis, strategy/intervention,
oracle, prediction, actual observation/evidence pointer, state delta/information gain, verdict,
and re-entry condition. Preserve failed or superseded routes so they are not repeated blindly.]

## Open Obligations, Contradictions & Risks

[Unrun checks, blockers, missing authority, unresolved contradictory observations, known issues,
edge cases, temporary workarounds, evidence debt, and human decisions. Name the owner where known.]

## What's Next

[Put the **exact next bounded action first**: command/file/question, causal purpose, expected
observation under the live hypotheses, and stop/redirect condition. Then list later obligations in
dependency order. If finished, name only follow-up work this result actually revealed.]

## Source Pointers

[Stable paths to the transcript if available, raw logs, bulky reports, task records, plans,
references, and external tickets. Pointers preserve lossless history without loading it all into
the receiving agent's active context.]
```

---

## Writing Guidelines

- **Be concrete, not narrative.** "Created `output.rev_projections` view joining 4 staging tables, optimized from 12s to 3s" is good. "Worked on the database views and made them faster" is not.
- **Include exact artifact pointers.** List every materially affected artifact. For a large change,
  point to a diff, status, manifest, or generated inventory instead of inflating the packet.
- **Capture the why, not just the what.** Decisions without rationale are useless to future sessions. "Used a materialized table instead of an indexed view because the database tier in use doesn't support indexed views" saves someone from re-researching.
- **Typed and compact, not chronological.** Preserve every material decision, verified fact,
  failed route, open obligation, and next-step dependency. Keep raw chronology and logs at stable
  pointers. If a section has nothing to say, write "None."
- **Separate facts from inference.** Unsupported handoff claims remain unverified. The receiving
  agent must quarantine missing artifacts or receipts rather than silently trust them.
- **Run the resume test before saving.** Re-read the draft as a stranger: could you take the next
  bounded action without the transcript or re-asking a settled decision? If not, add the missing
  state or pointer.
- **Match existing handoff docs.** Before writing, read 1-2 existing files in `docs/agents/handoff/` (if any exist) and match their style, depth, and formatting conventions. Consistency matters.
- **Preserve failure context.** If something was tried and didn't work, document it. "Attempted the OData connection — failed due to a 100-record pagination limit, switched to the bulk-export approach" prevents a future session from trying the same dead end.
- **Never record secret values.** Record the access requirement and environment-variable,
  keychain, vault, or credential name only.

## After Writing

- **Commit per the `git-workflow` skill — never commit directly on `main`.** Commit the handoff on the session's existing task branch or worktree, with a Conventional Commits message: `docs(handoff): <topic-slug>`. If no branch exists and the user is mid-session, leave the file uncommitted and note that.
- Tell the user the file has been written (and whether it was committed), and suggest starting a
  fresh session in their current agent runtime with this handoff as the typed continuation packet.

## Related skills

- `naming-conventions` — owns the filename grammar (date format, zero-padded sequence, kebab-case slug).
- `human-changelog` — the sibling doc-content workflow in this plugin (translates `CHANGELOG.md` for non-engineers); adjacent, not overlapping.
- `git-workflow` — owns the commit/branch mechanics this skill defers to after writing.
- `shaughv-tasks:tasks-management` (when installed) — owns the canonical active task packet;
  update it before creating an optional standalone handoff.
