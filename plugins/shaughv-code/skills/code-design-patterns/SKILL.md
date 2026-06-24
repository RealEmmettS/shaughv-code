---
name: code-design-patterns
description: >
  Gang of Four design patterns reference and analyzer. Covers all 22 GoF
  patterns (5 Creational, 7 Structural, 10 Behavioral) from
  refactoring.guru, with Python, TypeScript, and SQL examples. Trigger
  when the user names a pattern (Singleton,
  Factory, Strategy, Observer, Adapter, Decorator, Builder, Proxy, Facade),
  asks "what pattern fits", "how should I structure this", "is this
  over-engineered", "how do I refactor this", "what SOLID violation is
  this", or shows code that smells like a pattern — god objects,
  switch-on-type, deep inheritance, leaky abstractions, duplicated
  conditionals, hard-coded dependencies. Also trigger on "code smell",
  "anti-pattern", "tight coupling", or architectural review. REFERENCE +
  ANALYZER — names patterns, recommends them, flags anti-patterns. NOT
  the executor; hand multi-file refactors to a `refactoring` skill.
---

# Code Design Patterns — GoF Reference & Analysis Toolbelt

This skill is a pocket reference for the 22 Gang of Four design
patterns, plus an active toolbelt for spotting them (and their absence) in
your codebases. The pattern entries are sourced from
[refactoring.guru/design-patterns](https://refactoring.guru/design-patterns)
and adapted with code examples in widely used languages:
Python, TypeScript, and SQL where the pattern has a meaningful database
analogue.

## What this skill does — three modes

This skill operates in **three distinct modes**. Pick the one that matches
the conversation. They can also compose: a recognition pass often surfaces
a smell, which leads naturally into a recommendation.

### 1. Reference mode — "What is pattern X?"

The user names a pattern, or asks about one obliquely ("how do I make a
class that has only one instance"). Read the relevant `references/*/`
file and ground the answer in the canonical definition, structure,
participants, and code example. Don't recite the whole file — answer the
specific question, then offer to expand.

### 2. Recognition mode — "What patterns are in this code?"

The user shows a file, module, or snippet and asks what patterns are
present (or which are missing). Read `references/recognition.md` for the
fingerprint catalog (structural signatures, naming conventions, behavior
hints), then walk the code and name what you see. Be precise — there's a
real difference between "this looks like a Strategy" and "this IS a
Strategy with the context-holding-strategies pattern from p.315 of GoF."

Recognition mode is also where you call out **anti-patterns** — god
objects, switch-on-type, primitive obsession, feature envy, etc. Each
anti-pattern in `references/anti-patterns.md` is paired with the pattern
that typically resolves it.

### 3. Recommendation mode — "What pattern would help here?"

The user describes a design problem ("I have three classes that almost do
the same thing", "I need to swap out the persistence layer at test time",
"adding a new export format means touching seven files"). Read
`references/recommendations.md` — it's a problem → pattern decision tree.
Surface 1–3 candidate patterns, name the trade-offs, and recommend the
one that fits the user's actual constraints (team size, language, test
strategy, deploy cadence).

## The mental model — read this first

The Gang of Four organized 22 patterns into three families. Each family
answers a different design question:

| Family | The question it answers | Patterns |
|---|---|---|
| **Creational** (5) | *How does this object get made?* | Factory Method, Abstract Factory, Builder, Prototype, Singleton |
| **Structural** (7) | *How are these objects composed?* | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
| **Behavioral** (10) | *How do these objects talk to each other?* | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor |

If you can't name the family for a pattern you're considering, you haven't
done enough thinking yet. The family tells you *what category of problem*
you're solving; the specific pattern is the move you pick within that
category.

**A grounding intuition:** patterns are not goals. They're vocabulary for
trade-offs. The best use of this skill is to give you (and any teammate)
the same vocabulary the broader software-engineering community uses, so
that "I think this wants a Strategy" lands as a precise design move rather
than a vague refactor instinct.

## The pattern catalog — load on demand

Each pattern lives in its own reference file. **Don't load them all at
once** — read only the one(s) the conversation calls for. The index below
is the routing table.

For the full lookup table including the analysis aids, see
`references/INDEX.md`.

### Creational (5)

| Pattern | When to read | File |
|---|---|---|
| Factory Method | Subclass-decides-which-class-to-instantiate problems | `references/creational/factory-method.md` |
| Abstract Factory | Families of related objects that must be created together | `references/creational/abstract-factory.md` |
| Builder | Step-by-step construction with many optional parameters | `references/creational/builder.md` |
| Prototype | Cloning expensive-to-construct objects | `references/creational/prototype.md` |
| Singleton | One-instance-per-process discipline (use sparingly) | `references/creational/singleton.md` |

### Structural (7)

| Pattern | When to read | File |
|---|---|---|
| Adapter | Make an incompatible interface fit | `references/structural/adapter.md` |
| Bridge | Decouple abstraction from implementation so both can vary | `references/structural/bridge.md` |
| Composite | Tree of objects treated uniformly with leaves | `references/structural/composite.md` |
| Decorator | Add behavior without subclassing | `references/structural/decorator.md` |
| Facade | One front door over a complicated subsystem | `references/structural/facade.md` |
| Flyweight | Share fine-grained objects to reduce memory | `references/structural/flyweight.md` |
| Proxy | Stand-in that controls access (lazy load, auth, remote) | `references/structural/proxy.md` |

### Behavioral (10)

| Pattern | When to read | File |
|---|---|---|
| Chain of Responsibility | Pipeline of handlers, each decides whether to handle | `references/behavioral/chain-of-responsibility.md` |
| Command | Encapsulate a request as an object (undo, queue, log) | `references/behavioral/command.md` |
| Iterator | Traverse a collection without exposing its shape | `references/behavioral/iterator.md` |
| Mediator | Centralize many-to-many comms through one hub | `references/behavioral/mediator.md` |
| Memento | Snapshot + restore an object's state | `references/behavioral/memento.md` |
| Observer | Publish/subscribe between objects | `references/behavioral/observer.md` |
| State | Object behavior changes with internal state | `references/behavioral/state.md` |
| Strategy | Swap algorithms behind a stable interface | `references/behavioral/strategy.md` |
| Template Method | Skeleton in the base, steps overridden in subclasses | `references/behavioral/template-method.md` |
| Visitor | Add operations to a class hierarchy without modifying it | `references/behavioral/visitor.md` |

### Analysis aids — read when entering recognition / recommendation mode

| File | What's in it |
|---|---|
| `references/recognition.md` | How to spot each pattern in existing code — structural signatures, naming hints, behavior fingerprints |
| `references/recommendations.md` | Problem → pattern decision tree. "I have problem X" → which patterns to evaluate |
| `references/anti-patterns.md` | God Object, Switch-on-Type, Primitive Obsession, Feature Envy, Shotgun Surgery, etc. — each paired with the pattern(s) that resolve it |
| `references/solid-principles.md` | The five SOLID principles, with the patterns that most often enforce them |
| `references/pattern-relationships.md` | How the 22 patterns relate to each other (Strategy vs State, Decorator vs Proxy, Facade vs Adapter, etc.) — the disambiguations you'll actually need in conversation |

## How to behave in this skill

**Don't recite the catalog.** The user doesn't need a textbook chapter —
they need the right move named at the right moment. State the pattern,
state the trade-off, point at where in the reference they can read more.
Two-paragraph answers beat ten-paragraph answers.

**Cite refactoring.guru when you cite a pattern.** Every reference file
links to its source page on refactoring.guru. When you state a pattern's
intent, you're effectively quoting that source — say so. The team should
be able to follow the link and verify.

**Use modern languages in the examples.** If you're showing a code
example, prefer Python or TypeScript over Java/C++ (the GoF originals). If
the pattern has a SQL or schema analogue (Singleton ↔ unique constraint;
Observer ↔ database triggers; Strategy ↔ table-driven dispatch), surface
it — especially if the work is data-flavored.

**Patterns are vocabulary, not goals.** If the user is reaching for a
pattern when the answer is "just write a function" or "delete the
abstraction", say so. The most common failure mode in this skill is
recommending Strategy where a `dict` of callables would do. Restraint is
a feature.

**Anti-patterns aren't always anti.** Singleton has bad press, but a
process-wide logger or DB pool genuinely is one instance. God Object is
bad in `core/orchestrator.py`, but a 600-line script that does one
thing and exits is fine. State the smell, then ask whether the cost of
the smell exceeds the cost of the fix in *this* codebase.

**Recognize where this skill ends.** This skill *identifies* and
*recommends*. The actual multi-file refactor — moving methods, splitting
classes, threading new abstractions through call sites, updating tests —
belongs to the forthcoming `refactoring` sibling skill. When the
conversation crosses from "what should this be" to "let's change it",
name the handoff and pause for confirmation before touching code.

**Hand off when better skills exist:**
- A git workflow question about how to land the refactor → `git-workflow`
- A bug that's surfaced *during* the analysis → `bug-triage`
- Teaching a teammate one of these patterns → `learn`

## Format of each pattern reference

Every file in `references/creational/`, `references/structural/`, and
`references/behavioral/` follows the same template, in this order:

1. **Source** — direct link to the refactoring.guru page
2. **Intent** — one or two sentences, paraphrased from GoF / refactoring.guru
3. **Problem** — the design situation that calls for the pattern
4. **Structure** — the participants (Context, Strategy, ConcreteStrategy, etc.) and how they relate
5. **Code example (Python)** — minimal, runnable, idiomatic
6. **Code example (TypeScript)** — same problem, TS idioms
7. **SQL / data analogue** — when one exists
8. **When to use it** — the specific signals that say "yes, this pattern fits"
9. **When NOT to use it** — the common over-applications
10. **Related patterns** — which patterns it pairs with, conflicts with, or might be confused for
11. **Anti-patterns it resolves** — links into `anti-patterns.md`
12. **Real examples in your codebase** — placeholder section, to be populated as you find them

The template lives in `references/_template.md` if a new pattern (e.g.,
modern ones outside GoF) is ever added.

## Living sources of truth

- **External canonical reference**: https://refactoring.guru/design-patterns
- **The classic book** (cited in every reference file): *Design Patterns:
  Elements of Reusable Object-Oriented Software* by Gamma, Helm, Johnson,
  Vlissides (1994). When refactoring.guru and the book disagree, the book
  wins on intent; refactoring.guru wins on modern idioms.
- **Sibling skill (forthcoming)**: `refactoring` — executes the multi-file
  changes that this skill recommends.
