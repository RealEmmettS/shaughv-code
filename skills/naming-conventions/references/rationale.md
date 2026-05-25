# Rationale — Why Naming Matters

> **Scope:** The *why* behind every rule in this skill. Load this file when:
> - You're being asked "why are we so strict about naming?"
> - You're onboarding to a SHAUGHV repo and need to explain the discipline to a contributor (human or agent).
> - You're considering an exception and need to weigh it against the underlying reasoning.
> - An edge case isn't covered by any of the other reference files, and you need to choose by analogy.
>
> **Authoritative sources:** Steve McConnell, *Code Complete* 2nd ed. (Microsoft Press, 2004); Gene Kim, Jez Humble, Patrick Debois, John Willis, *The DevOps Handbook* (IT Revolution, 2016/2021).

## The reading-to-writing ratio

> *"Code is read far more times than it is written. Be sure that the names you choose favor read-time convenience over write-time convenience."*
> — McConnell, *Code Complete* 2nd ed., p. 285, KEY POINT (also reprised on p. 289)

This is the master argument. McConnell estimates the read:write ratio at 10–20:1 — and that's just for code. For shared artifacts like commit messages, branch names, and folder names, the ratio is higher still. A name that takes 30 seconds to choose well saves 30 minutes of confusion across the artifact's lifetime, and the lifetime is *years*.

Every close call in this skill resolves by asking *which way does the reader benefit?* The agent's job is to optimize for the next person who reads the name — not for the agent that's writing it.

## The variable IS the name (Code Complete p. 259)

> *"Unlike the dog and its name, which are different entities, a variable and a variable's name are essentially the same thing. Consequently, the goodness or badness of a variable is largely determined by its name."*

A poorly-named variable is a poor variable. A poorly-named function is a poor function. A poorly-named file is a poor file. The name is the artifact's representation in human (and agent) memory; there is no underlying "real" variable that the name merely points to.

This is the principle that makes naming a load-bearing design decision, not a cosmetic one.

## The six reasons to have a convention (McConnell pp. 270–271)

Verbatim, in McConnell's order:

1. **"They let you take more for granted."** One global decision instead of many local ones. The agent doesn't re-decide "kebab or snake?" for every file; the convention pre-decides it.
2. **"They help you transfer knowledge across projects."** A pattern learned on one repo transfers cleanly to the next. The agent doesn't have to relearn norms when switching repos.
3. **"They help you learn code more quickly on a new project."** No re-learning of personal styles. The next SHAUGHV repo follows the same conventions as the last one; the agent doesn't have to relearn norms when switching contexts.
4. **"They reduce name proliferation."** Without conventions, `pointTotal` and `totalPoints` coexist for the same thing. With conventions, the canonical form wins and the synonyms die.
5. **"They compensate for language weaknesses."** Patterns like `UPPER_SNAKE` for constants emulate language features (named constants in languages that lack them, scope tags in dynamically-typed languages).
6. **"They emphasize relationships among related items."** `employeeAddress`, `employeePhone`, `employeeName` clearly group. `address`, `phone`, `name` do not. The naming convention IS the grouping mechanism.

### McConnell's master argument

> *"The key is that any convention at all is often better than no convention… The power of naming conventions doesn't come from the specific convention chosen but from the fact that a convention exists."*
> — McConnell, p. 271, KEY POINT

This is why this skill is loud about *picking* a convention even when the choice is somewhat arbitrary. Conventional Commits is one valid commit format; a simpler `<type>: <summary>` is another; either works. What matters is that each repo picks one and sticks to it. **A wrong-but-consistent choice beats a right-but-inconsistent one.**

## The Three Ways (DevOps Handbook)

The DevOps Handbook's organizing frame. Conventions serve all three.

### First Way — Flow

> *"The First Way enables fast left-to-right flow of work from Development to Operations to the customer."*
> — *The DevOps Handbook*, Part I

Convention reduces friction at every handoff. A standard branch name lets CI know what to run. A standard service name lets infra know where to deploy. A standard environment name (`dev` / `staging` / `prod`) lets ops know what's prod. When the name varies, the handoff stalls — the agent on the other side has to ask, or worse, guess.

### Second Way — Feedback

> *"The goal of almost any process improvement initiative is to shorten and amplify feedback loops so necessary corrections can be continually made."*
> — *The DevOps Handbook*, Part I

Automation is what makes feedback fast. And automation is brittle when naming is inconsistent. A metric named `auth.login.failure` triggers an alert; a metric named `Auth.Login.Failure` matches no alert at all — and the alert never fires. The cost of an inconsistent name in observability isn't a loud error; it's silence.

### Third Way — Continuous Learning

> *"Experimentation and taking risks are what ensures that we keep pushing to improve."*
> — *The DevOps Handbook*, Part I

Conventions make knowledge transferable. A new contributor reading `payments-api` knows what it is. A new contributor reading `psvc2-final` learns nothing — and has to ask. The Phoenix Project's "Brent" character is the canonical example of *un-transferable knowledge* — the heroic engineer whose tribal knowledge of un-named, un-documented systems makes him a bottleneck. Conventions prevent Brents from forming.

## The industry receipts

Three cautionary tales. These come up in DevOps and engineering literature as the canonical examples of why naming matters.

### Knight Capital "Power Peg" (2012)

Knight Capital, a Wall Street market maker, repurposed an old, unused feature-flag name ("Power Peg") to activate brand-new RLP (Retail Liquidity Program) code. The deployment landed on 7 of 8 servers; the 8th still had the old Power Peg code wired to the same flag. When the flag flipped on at market open, the 8th server ran the dead code path and started buying high and selling low.

**$440M loss in 45 minutes. Knight was acquired the next year.**

The lesson — from Doug Seven's retelling ("Knightmare: A DevOps Cautionary Tale," dougseven.com) — is that **a flag name is a contract**. Recycling a name violates the contract silently. Never reuse a flag name across semantically different features. If a flag is retired, leave the name retired.

### Etsy's metric vocabulary

By 2014, Etsy tracked 800,000+ business-layer metrics — the "Church of Graphs" culture documented in DevOps Handbook Ch. 14:

> *"If Engineering at Etsy has a religion, it's the Church of Graphs. If it moves, we track it."*
> — Ian Malpass, "Measure Anything, Measure Everything" (2011), quoted in DevOps Handbook Ch. 14

That scale is only navigable because metric names follow a strict StatsD-style dotted-namespace grammar. Etsy's 168x MTTR delta over low-performing peers (DevOps Handbook Ch. 14) depends entirely on the naming grammar making metrics findable, correlatable, and chartable at scale.

**Naming is the prerequisite to observability.** You cannot build the dashboards without the vocabulary; you cannot detect without the dashboards; without detection, MTTR balloons.

### HP LaserJet trunk consolidation (Gruver, 2008–2014)

Gary Gruver's HP LaserJet firmware team **eliminated separate branches for 24 printer models, putting them all into a single trunk**, with printer capabilities established at runtime via an XML configuration file. Outcomes (DevOps Handbook Ch. 11):

- Cycle time: months → 1 day
- Cost: down 40%
- Programs under development: up 140%
- Cost per program: down 78%

The lesson the Handbook draws is structural: **convention** (one trunk, runtime config, consistent build) is what made the scale tractable. **Not heroism. Not better individual engineers. The names and the discipline.**

## What McConnell rejects

- **Classic Hungarian notation** (type prefixes like `pszName`, `fIsActive`). The IDE shows the type on hover; the prefix is noise. Modern languages with sound type systems make Hungarian obsolete.
- **Single-letter names outside the smallest loops.** `i`, `j`, `k` are fine for tight `for` loops. `x` for "the customer record" is not.
- **Abbreviations that save keystrokes at the cost of comprehension.** `cmptr` instead of `computer`. `addr` is borderline.
- **Phonetic abbreviations.** McConnell: *"This seems too much like asking people to figure out personalized license plates to me, and I don't recommend it."* No `sk8ing`, no `b4`, no `xqt`.
- **Names that conflict with the standard library.** Don't shadow built-ins.

## What the DevOps Handbook rejects

- **Long-lived feature branches.** *"Merging branches back in sporadically only creates a 'merge hell' resulting in chaos, delayed feedback, and rework."* (Ch. 11) Branches that live longer than a few days cost more than they save.
- **Untraceable commits.** A commit history that can't be parsed for type/scope defeats automated changelog generation, blame archaeology, and incident forensics. Names are load-bearing in incidents.
- **Inconsistent resource names across environments.** A `dev-` vs `staging-` vs `prod-` prefix mistake has caused real outages industry-wide.
- **Feature flag name recycling.** Knight Capital. Never.

## How to apply this when facing an edge case

When a naming situation doesn't fit any row in the decision tree, work through this checklist:

1. **What is the name's audience?** Agents only? Humans only? Both? — *Agents first, humans adapt.* Lowercase kebab, ISO dates, strict regexes win when an agent is in the loop.
2. **What is the name's lifetime?** Hours (a temp branch)? Years (a database column)? — *Longer lifetime = higher discipline.*
3. **What is the cost of a wrong name?** Silent (a metric that doesn't fire, an auto-API that returns 404 because of PascalCase)? Loud (a syntax error)? — *Silent failures justify more rigor.*
4. **Is there an existing analogous name?** Match it. *Consistency is the rule even when the specific choice is arbitrary.*
5. **When in doubt, ask the user.** Propose 2–3 candidates and the rule each one obeys.

The agent isn't expected to know every edge case. The agent IS expected to know the principles and apply them — and to ask when uncertain rather than guessing.

## A closing reminder

> **Convention beats invention. Reading beats writing. Names beat code. Discipline beats heroism.**

These four short statements summarize every rule in this skill. When in doubt, return here.

---

*Authoritative sources: McConnell, *Code Complete* 2nd ed. (Microsoft Press, 2004); Kim, Humble, Debois, Willis, *The DevOps Handbook* (IT Revolution, 2016/2021). Knight Capital case via Doug Seven, dougseven.com. Etsy quote via Ian Malpass, "Measure Anything, Measure Everything" (2011), Etsy Code-as-Craft blog. HP LaserJet outcomes via Gruver and the DevOps Handbook Ch. 11.*
