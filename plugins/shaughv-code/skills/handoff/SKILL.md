---
name: handoff
description: >-
  Write a handoff document summarising this session for future agents/sessions. The primary
  moment: an agent is mid-task and the operator needs to leave for the day or wants to stop the
  agent — the handoff is how that work survives the stop. Use when ending a session, stopping a
  running agent, switching context, wrapping up for the day, or when the user says "/handoff",
  "wrap up", "write up what we did", "pick this up tomorrow", "pick this up later", "before I
  close this", or notes that context is running low or about to compact. The document must be
  fully comprehensive and exhaustive — the conversation arc, the active plan and where each part
  stands, every decision made, and exactly what's left — so a future agent resumes precisely
  where this one stopped without re-asking anything. Produces
  docs/agents/handoff/YYYY-MM-DD-NNN-<slug>.md, then defers to git-workflow for any commit.
allowed-tools: "Read,Write,Edit,Bash,Glob,Grep"
---

# Handoff Document Generator

Write a handoff document summarising this session for future agents/sessions.

**The primary moment for this skill:** an agent is mid-task and the operator needs to leave work
for the day — or wants to stop that agent — without losing the thread. The handoff document is
how the work survives the stop.

**The completeness bar:** a future agent with zero context, given only this document, must be
able to pick up *exactly* where this session left off — without re-reading the conversation and
without asking the operator anything that was already settled. That means the document is
**fully comprehensive and exhaustive** over four things:

1. **The conversation** — what was asked, how the ask evolved, what was tried.
2. **The plan** — the active plan and where each part of it stands.
3. **The decisions** — every decision made, with its rationale.
4. **What's left** — in order, with the exact next action first.

Tight prose, total coverage — cut padding, never substance.

## Steps

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
**Agent:** Claude Code
**Task/ticket ID(s):** [optional — issue-tracker IDs this session advanced]

---

## Session Narrative

[The conversation arc, exhaustively: what the operator originally asked for, how the ask evolved
(interruptions, re-scopes, new instructions mid-flight), what was tried — including dead ends —
and the current state of play. A future agent should not need the transcript after reading this.]

## The Plan & Where It Stands

[The active plan, item by item, each marked done / in progress / not started — with a pointer to
the plan file if one exists. For the in-progress item: exactly how far it got (file, function,
command, last verified-green state). If the session had no formal plan, reconstruct the implicit
one — the ordered list of things this session was working through.]

## What Was Accomplished

[Concrete deliverables. What exists now that didn't exist before this session? Be specific — list files created, commands added, features built, bugs fixed, configurations changed. Use bullet points. Include file paths.]

## Key Decisions

[Architectural choices, trade-offs, and things that were explicitly ruled out and why. These are the decisions a future agent would otherwise waste time re-discovering or re-debating. Format as bullets with brief rationale.]

## How It Works

[If the session produced something with behavior — a tool, a script, a pipeline, a prompt — explain how it works at the level a competent engineer needs to use or modify it. Skip this section if the session was purely investigative or planning.]

## Known Issues & Limitations

[Anything that doesn't work yet, known edge cases, temporary workarounds in place, or technical debt introduced. Be honest — this section saves future sessions from hitting the same walls.]

## Important Context for Future Sessions

[Anything a fresh agent would need to pick up this work without re-discovering it: data locations, environment requirements, branch status, relevant documentation paths, credentials or access needed, upstream/downstream dependencies, and any pre-existing failures or quirks in the system that affected this session.]

## What's Next

[If the work isn't finished, what's left to do — in priority order, with the **exact next
action first** (the command to run, the file to open, the question to answer). If it is
finished, what follow-up work did this session reveal or unblock? Be specific enough that a
future agent can start working immediately rather than asking "so what should I do?"]
```

---

## Writing Guidelines

- **Be concrete, not narrative.** "Created `output.rev_projections` view joining 4 staging tables, optimized from 12s to 3s" is good. "Worked on the database views and made them faster" is not.
- **Include file paths.** Every file created, modified, or deleted should be listed with its full path relative to the project root.
- **Capture the why, not just the what.** Decisions without rationale are useless to future sessions. "Used a materialized table instead of an indexed view because the database tier in use doesn't support indexed views" saves someone from re-researching.
- **Exhaustive in coverage, tight in prose.** Every plan item, decision, and open thread from the session appears — resumption beats brevity, and substance is never cut for length. But cut padding ruthlessly: if a section has nothing to say, write "None" and move on.
- **Run the resume test before saving.** Re-read the draft as a stranger: could you continue the work using only this document — no transcript, no questions to the operator? If anything would force a re-ask (a decision, a path, a branch name, where credentials live, the next command), it's missing. Add it.
- **Match existing handoff docs.** Before writing, read 1-2 existing files in `docs/agents/handoff/` (if any exist) and match their style, depth, and formatting conventions. Consistency matters.
- **Preserve failure context.** If something was tried and didn't work, document it. "Attempted the OData connection — failed due to a 100-record pagination limit, switched to the bulk-export approach" prevents a future session from trying the same dead end.

## After Writing

- **Commit per the `git-workflow` skill — never commit directly on `main`.** Commit the handoff on the session's existing task branch or worktree, with a Conventional Commits message: `docs(handoff): <topic-slug>`. If no branch exists and the user is mid-session, leave the file uncommitted and note that.
- Tell the user the file has been written (and whether it was committed), and suggest they can start a fresh session with `claude` and reference this handoff by reading the file.

## Related skills

- `naming-conventions` — owns the filename grammar (date format, zero-padded sequence, kebab-case slug).
- `human-changelog` — the sibling doc-content workflow in this plugin (translates `CHANGELOG.md` for non-engineers); adjacent, not overlapping.
- `git-workflow` — owns the commit/branch mechanics this skill defers to after writing.
