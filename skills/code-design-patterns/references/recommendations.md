# Pattern Recommendations — Problem → Pattern

This file is the **decision tree** for recommendation mode. The user
describes a design problem; you map it to 1–3 candidate patterns, name
the trade-offs, and recommend one.

## How to use this file

1. Listen to the user's *actual* problem. Don't pattern-match the first
   keyword — most pattern over-application happens here.
2. Find the section below that matches. If multiple match, surface all
   candidates.
3. Read the linked pattern reference file(s) for detail before answering.
4. Recommend ONE, name the others, explain why the recommendation fits
   *this* user's constraints (team size, language, test strategy, deploy
   cadence).
5. If the answer is "just write a function" or "delete the abstraction"
   — say so. Restraint is part of the toolbelt.

---

## Object creation problems

### "My constructor takes 10 parameters, half of them optional"
→ **Builder** (`creational/builder.md`)

Alternatives:
- Dataclass / TypedDict with defaults — simpler, no chaining. Try this first.
- Factory function with kwargs — if you don't need step-by-step config.

### "I need to construct different kinds of object depending on input"
→ **Factory Method** (`creational/factory-method.md`) — if the variation is along *one* class hierarchy.
→ **Abstract Factory** (`creational/abstract-factory.md`) — if you're producing *families* of objects (e.g., a whole UI toolkit, a whole database driver suite).

Alternatives:
- A `dict[str, Callable]` mapping kind → constructor. Often enough.
- A `match` / `switch` on a literal — fine for 3 cases, smells at 10.

### "I want one instance of this for the whole process"
→ **Singleton** (`creational/singleton.md`) — **with caution**

Alternatives (prefer when possible):
- Dependency injection — pass the instance explicitly. Testable.
- Module-level value in Python (the module already *is* a singleton).
- A connection pool object held by the application root and passed down.

Ask: *do you actually need uniqueness, or do you just want convenience?* Most "Singletons" are convenience.

### "Constructing this is expensive and I need many similar copies"
→ **Prototype** (`creational/prototype.md`)

Alternatives:
- `copy.deepcopy()` of a reference instance — Prototype with no ceremony.
- A factory function that caches the heavy bits.

---

## "I have N classes that almost do the same thing" problems

### "Three classes implement nearly the same algorithm with one step different"
→ **Template Method** (`behavioral/template-method.md`) — if the difference is a fixed slot in a fixed sequence.
→ **Strategy** (`behavioral/strategy.md`) — if the difference *is* the whole algorithm and you want to swap freely.

Pick by: do all three share a fixed skeleton (Template) or are they fully independent algorithms wearing the same interface (Strategy)?

### "Long if/elif chain on a type or string"
→ **Strategy** (table-driven dispatch) — if each branch is a self-contained algorithm.
→ **State** (`behavioral/state.md`) — if the branches represent *states of one object* and transitions matter.
→ **Visitor** (`behavioral/visitor.md`) — if you're switching on a type from a class hierarchy and adding the operation outside the hierarchy.

Alternative: a `dict` lookup. Try this first.

### "I want to add a new feature without modifying existing code"
This is the Open/Closed Principle being asked for. Candidates depending on what kind of extension:
→ **Strategy** — new algorithm variant.
→ **Decorator** (`structural/decorator.md`) — new cross-cutting concern (logging, retry, caching).
→ **Visitor** — new operation across an existing class hierarchy.
→ **Chain of Responsibility** (`behavioral/chain-of-responsibility.md`) — new step in a pipeline.

---

## "These objects need to talk to each other" problems

### "Component A needs to react when Component B changes"
→ **Observer** (`behavioral/observer.md`) — for one-to-many notification.

Alternatives:
- Polling — bad, but common.
- Direct call — fine if there's one consumer and the coupling is OK.
- An EventEmitter / signal library — Observer with batteries included.

### "Many components reference each other and the graph is spaghetti"
→ **Mediator** (`behavioral/mediator.md`)

Alternative:
- Pull state into a single store (Redux, Zustand, Pinia) — Mediator at the data layer.

### "I need to queue, log, undo, or schedule actions"
→ **Command** (`behavioral/command.md`)

The killer signal for Command: the request needs to be **captured** (with all its parameters) and **executed later** by someone else.

### "I want to send a request through a series of optional handlers"
→ **Chain of Responsibility**

Express/Koa middleware, FastAPI dependencies, ASP.NET pipelines all are this.

---

## "I need to bridge incompatible interfaces" problems

### "Third-party library has the wrong shape for my code"
→ **Adapter** (`structural/adapter.md`)

The adapter is a thin shim. If you find yourself adding real logic, you've drifted into Facade or your code is doing too much.

### "Complex subsystem and I want one simple entry point"
→ **Facade** (`structural/facade.md`)

### "I need to control access to an object (lazy load, cache, auth, remote)"
→ **Proxy** (`structural/proxy.md`)

### "I want to add behavior to an object without subclassing it"
→ **Decorator** (`structural/decorator.md`)

Decorator vs Proxy: Decorator **adds behavior**; Proxy **controls access**. Both wrap. The difference is intent.

---

## "Tree / hierarchical data" problems

### "I have a tree of objects and I want to treat nodes and leaves uniformly"
→ **Composite** (`structural/composite.md`)

### "I want to walk a tree and do different things at each node type"
→ **Visitor** — for adding operations without modifying node classes.
→ **Composite** — if the operation is naturally polymorphic and lives on the nodes.

### "I want to traverse a collection without knowing its shape"
→ **Iterator** (`behavioral/iterator.md`)

In Python / TS this is mostly free (generators, `__iter__`, `Symbol.iterator`). The pattern is everywhere; the question is usually whether to *expose* an iterator from a class that's currently leaking its internal collection.

---

## "Memory / performance" problems

### "I have millions of nearly-identical objects and memory is tight"
→ **Flyweight** (`structural/flyweight.md`)

### "Object construction is expensive and I keep redoing it"
→ **Prototype** — clone instead of constructing.
→ **Flyweight** — share if the data is identical.
→ A memoization cache around the constructor — both, lightly.

---

## "State, snapshots, undo" problems

### "An object's behavior changes based on its internal status, and I have if-status-then-do-X everywhere"
→ **State** (`behavioral/state.md`)

The smoking gun: the object's methods all start with `if self.status == ...`.

### "I need to snapshot and restore state"
→ **Memento** (`behavioral/memento.md`)

Alternative: serialize + deserialize. If your object is simple (`pydantic`, dataclass), JSON / pickle does the job.

### "I need full undo / redo"
→ **Command** + history list.
→ **Memento** + history list.

Pick by: do you want to invert each *action* (Command) or roll back to a *snapshot* (Memento)?

---

## "How do I structure this whole thing" problems

### "I have two dimensions of variation and N×M subclasses are exploding"
→ **Bridge** (`structural/bridge.md`)

Example: 4 shape types × 3 renderers shouldn't be 12 classes — it should be 4 shapes that hold a renderer.

### "I want consumers to depend on abstractions, not concretes"
This is the Dependency Inversion Principle. Most patterns serve it:
- **Strategy** for swappable algorithms.
- **Abstract Factory** for swappable object families.
- **Bridge** for swappable implementations behind an abstraction.
- **Adapter** for swappable third-party deps behind your own interface.

Often the right move is **none of these** — just take the concrete as a parameter (constructor injection) and document the contract.

---

## "I'm not sure if I need a pattern at all"

This is the most important section. Read it before recommending anything.

### Signals that you probably DON'T need a pattern

- The thing fits in one function and you can see all of it on a screen.
- There's exactly one implementation today and no plausible second one in the next quarter.
- The "abstraction" you're considering exists in only one place.
- Tests are easy because the code is short and concrete.
- The code is in a script that runs once a day, not a library used by 50 things.

In any of these cases — write the function. Use a dict. Use a closure.
Patterns earn their complexity when the problem has *real, current*
multiplicity. Speculative future multiplicity ("what if we need to swap
this later") is almost always a worse design than "we'll refactor when
we actually need to."

### Signals that you DO need a pattern

- You're about to write the third `if/elif` chain on the same enum.
- A new "kind" requires editing N existing files (Shotgun Surgery).
- Tests are painful because objects can't be substituted at the seams.
- The same wrapping behavior (logging, retry, cache) is reimplemented in 5 places.
- The system has a real plugin / extension point and outside teams will be adding to it.

When two or more of these hit, name the pattern, propose the smallest
version of it that resolves the smell, and hand off to the (forthcoming)
`refactoring` skill to actually do the move.
