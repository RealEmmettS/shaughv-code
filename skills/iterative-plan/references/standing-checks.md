# Standing checks — the recurring dispatch-time surprises

These are the things that keep biting us at *execution* time that should have been surfaced at *planning* time (Phase 0 Clarify or Phase A Profile). Each one is here because it has cost us real rework more than once. Skim this list during Profile and ask the question for any that apply to the milestone — surfacing them now is far cheaper than discovering them at hour three of a slice.

This is a **living list**. It grows via the meta-loop: when a re-plan or retro surfaces a recurring dispatch surprise (~2–3 times), add it here with a one-line receipt. That promotion is what turns a painful one-off into a standing check the next milestone gets for free.

---

## 1. Auth & identity model

**The question:** How does the thing authenticate, and does the identity exist *before* the code that references it?

**Why it bites:** OAuth flows, service principals, managed identities, and `FROM EXTERNAL PROVIDER` SQL all assume an identity is already provisioned. A recurring class of defect: a migration said `CREATE USER ... FROM EXTERNAL PROVIDER` and "deploy before T5," but T5 was the task that *created* the identity the migration resolved against — a prompt-vs-dependency-graph contradiction the planner wrote from precedent without opening the actual files. Surface the auth/identity ordering at Profile, against the real files, not from a precedent that may have assumed the identity already existed.

## 2. Rate limits & API tier

**The question:** What's the call budget, what's the backoff behavior on 429s, and is the data we need even available on our current paid tier?

**Why it bites:** API ingestion milestones live or die on rate limits. A whole optimization milestone existed *because* of third-party API budget pressure. Separately, a "missing data" gap turned out to be a paid-tier access limitation — work that looked like a bug was actually a tier gap. Profile the rate limits and the tier coverage before scoping the sync, and take the baseline call-count number here (it doubles as the optimization baseline).

## 3. Schema / grant / deploy ordering

**The question:** What GRANTs, principals, and migration steps does this need, and does any prompt specify an order the dependency graph forbids?

**Why it bites:** The runtime layer (a dashboard, a query result) can look fine while the code layer (the migration, the grant, the principal creation) is contradictory. A "deploy this before X" where X is an upstream dependency is an automatic contradiction. Open the precedent file *and* the target file at scoping time; quote real identifiers. Assign one owner per cross-task action (an identity binding, a deferred grant) so two tasks don't both half-own it.

## 4. Freshness model & observability surface

**The question:** What does "fresh" mean for *each* entity (webhook vs. poll vs. nightly), and where is freshness/health actually observed?

**Why it bites:** Two recurring shapes. (a) *Freshness semantics*: webhook-driven entities show perpetual false-red if you measure poll-recency instead of webhook-health. Decide per-entity what fresh means before building the card. (b) *Implicit observability*: if the success criterion says "reliable" or "monitored" but no task produces the logging wiring, the dashboard tile, or the alert path, the monitoring surface silently goes missing and gets bolted on in a later revision (a real milestone had to add data-trust integration and a monitoring extension after the fact). If the criterion implies monitored/reliable, name the observability surface as an explicit slice or task.

## 5. "Done elsewhere" assumptions

**The question:** Does this milestone depend on work that lives in another project/milestone/skill, and is that dependency flagged in both places?

**Why it bites:** Cross-project dependencies drift silently — a task in one project quietly blocked on a task in another. The dependent side knows it's waiting; the depended-on side often doesn't know anything waits on it. Flag cross-project/cross-skill dependencies in both task descriptions during Clarify.

---

## How to use this during planning

You don't need to run all five every time. During Profile, glance down the list and ask the question only for the ones the milestone plausibly touches. A data-source-onboarding milestone touches 1–4 almost always; a frontend-only milestone might touch only 4. The cost of asking is one sentence; the cost of not asking is a slice that breaks at hour three for a reason you could have named on day one.
