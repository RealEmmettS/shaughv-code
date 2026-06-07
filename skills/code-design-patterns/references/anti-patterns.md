# Anti-Patterns — Code Smells and Their Resolutions

Anti-patterns are *recognizable bad shapes* — code structures that
consistently lead to maintenance pain. This file is the smell-to-pattern
mapping.

A smell is not a bug. The code probably works. The cost is paid later,
when someone (often Future You) has to change it.

> **Caveat — smells are situational.** A "God Object" in
> `core/orchestrator.py` is a real problem. A 600-line script that runs
> once and exits is not. State the smell, then ask: *does the cost of
> the smell exceed the cost of the fix in this codebase?* If no, leave
> it. Note it. Move on.

Each entry below has: the smell's name, what it looks like, why it
hurts, and which pattern(s) typically resolve it.

---

## God Object (a.k.a. The Blob)

**Looks like:**
- One class with 30+ methods and 20+ fields.
- Methods touch unrelated concerns (database, formatting, HTTP, business rules).
- Everything imports it. It imports everything.
- Names like `Manager`, `Service`, `Helper`, `Utils`, `Core`.

**Why it hurts:**
- Every change risks touching it. Reviews become impossible.
- Tests need to set up the whole world to test one method.
- Two developers can't work on it without conflicts.

**Resolutions:**
- **Facade** (`structural/facade.md`) — keep the convenient single entry point, but push the real work into smaller, focused subsystem classes behind it.
- **Strategy** (`behavioral/strategy.md`) — pull policy decisions out of the god class into swappable strategies.
- **Mediator** (`behavioral/mediator.md`) — if the god object is mostly *coordinating* others, formalize that as a Mediator and let it stop owning data.
- **Just split it.** Sometimes there's no pattern — just orthogonal responsibilities that belong in their own modules.

---

## Switch-on-Type (a.k.a. Type Code, Long Conditional)

**Looks like:**
```python
if shape.kind == "circle":
    area = math.pi * shape.r ** 2
elif shape.kind == "square":
    area = shape.side ** 2
elif shape.kind == "triangle":
    area = 0.5 * shape.base * shape.height
```
Or with `isinstance`. Or with `match` on a string discriminator. **Same chain repeated in multiple places** is the killer tell — every new shape needs N edits.

**Why it hurts:**
- Shotgun surgery for every new variant.
- Easy to miss a branch when adding a variant.
- Each branch reaches into shape-specific fields, so the data structure is shaped wrong too (Primitive Obsession is the parent smell).

**Resolutions:**
- **Polymorphism** — give each kind its own class with an `area()` method. This is the textbook fix.
- **Strategy** — if the variation is by configuration, not by class.
- **Visitor** (`behavioral/visitor.md`) — if you can't modify the kind classes (third-party, sealed hierarchy) and you keep adding operations.
- **State** (`behavioral/state.md`) — if the "type" is actually a *status* that an object moves through.

---

## Primitive Obsession

**Looks like:**
- Money as a `float`. Money everywhere as a `float`.
- Phone numbers, ZIP codes, ISBNs all as `str`.
- "Status" as a magic string repeated across files.
- Dictionaries-of-dictionaries used as ad hoc structs.

**Why it hurts:**
- No type safety — `add_dollars(usd_amount, eur_amount)` happily compiles.
- Validation rules are duplicated (or, worse, only enforced in some places).
- Refactor pain: changing the representation means touching every site.

**Resolutions:**
- **Value Object** (not strictly GoF but classic) — wrap the primitive in a small class / dataclass / NewType.
- **Builder** for constructing the wrapped values cleanly.
- In Python: `NewType`, `Enum`, `dataclass(frozen=True)`.
- In TS: branded types, `enum`, `Readonly<...>`.

---

## Feature Envy

**Looks like:**
- A method on class `A` that mostly reads fields of class `B`.
- Long `b.x`, `b.y`, `b.z` chains where `a` barely participates.

**Why it hurts:**
- The behavior lives in the wrong class. Changes to `B`'s shape ripple into `A`.
- Tests of `A` need a fully populated `B`.

**Resolution:**
- **Move method** — put the behavior on `B`. Often that's all you need.
- If `A` genuinely needs to do something *across* multiple `B`s, the method may belong on a Repository or Service that owns the relationship.

---

## Shotgun Surgery

**Looks like:**
- Adding a single conceptual feature (a new export format, a new tenant, a new field) requires edits in 7 files.
- No single class "owns" the concept — it's smeared across the codebase.

**Why it hurts:**
- Every new variant is a high-risk change.
- Easy to miss one of the sites. Bugs ship.
- New developers can't trust any one file to be complete.

**Resolutions:**
- **Strategy** — push the per-variant code into per-variant classes (or callables in a dict).
- **Abstract Factory** (`creational/abstract-factory.md`) — when each "variant" is a *family* of objects (e.g., per-tenant: schema, sync, output view).
- **Chain of Responsibility** — if the variants are alternate handlers and adding one is "register another handler."

---

## Hard-Coded Dependencies (Tight Coupling)

**Looks like:**
```python
class OrderProcessor:
    def __init__(self):
        self.db = PostgresClient(...)
        self.email = SendGridClient(...)
```
The class news up its collaborators in its constructor. You can't substitute them at test time without monkeypatching.

**Why it hurts:**
- Tests can't isolate the class. Either you run the real DB and SendGrid in tests (slow, flaky, expensive), or you patch the world (brittle).
- The class can't be reused in any context where you'd want a different DB or email backend.

**Resolutions:**
- **Dependency Injection** (not strictly GoF) — take collaborators as constructor parameters. The single most impactful refactor in most codebases.
- **Strategy** — when the variation is an *algorithm* rather than a *collaborator*.
- **Adapter** — when the collaborator's interface is wrong for your needs and you want to seal that translation in one place.
- **Abstract Factory** — when collaborators come in families that vary together.

---

## Telescoping Constructor

**Looks like:**
```python
class Pizza:
    def __init__(self, size, cheese=True, pepperoni=False, mushrooms=False,
                 olives=False, peppers=False, sauce="tomato", crust="hand",
                 ...):  # 14 more args
```

**Why it hurts:**
- Call sites are unreadable (`Pizza("L", True, False, True, False, ...)`).
- Adding a new option is a breaking change to every call site (or you wedge it in with `**kwargs` and lose type safety).

**Resolutions:**
- **Builder** — when construction is genuinely step-by-step.
- **Dataclass / Pydantic model with defaults** — try this first.
- **Factory functions for common cases** (`pepperoni_pizza(size)`, `vegetarian_pizza(size)`).

---

## Singleton Abuse

**Looks like:**
- Half a dozen Singletons across the codebase.
- "Just call `Config.instance().db` from anywhere" everywhere.
- Tests need elaborate teardown to reset Singleton state.

**Why it hurts:**
- Global state by another name. Test isolation is impossible.
- Hidden dependencies — methods quietly depend on Singletons no one declared.
- Forces strict construction ordering across the app.

**Resolution:**
- **Dependency Injection** — pass the thing explicitly. The class no longer cares whether there's "one" of it.
- A composition root (the `main()` function or framework's container) holds the actual single instance.
- Reserve Singleton for genuinely process-global concerns (loggers, metrics emitters) and even then prefer the *language's* module-level mechanism.

See `creational/singleton.md` for the long version.

---

## Lava Flow (Dead Code That Doesn't Get Cleaned Up)

**Looks like:**
- Comments labeled "TODO: remove after migration" from 2 years ago.
- Two implementations of the same thing, one used and one not.
- Branches gated behind feature flags that defaulted to ON in 2023.

**Why it hurts:**
- New developers can't tell which path is live.
- Bugs in dead code waste investigation time.
- The codebase looks bigger than it is, taxing every reading.

**Resolution:**
- Not a pattern problem — a *discipline* problem. When you ship the new path, **delete the old one** in the same PR or the very next one.
- Feature flag policy: every flag has a deletion date. (See `theia-tools:git-workflow` for the flag-cleanup rule.)

---

## Sequential Coupling

**Looks like:**
- A class where you MUST call `.connect()` before `.query()` before `.close()`, and getting the order wrong silently corrupts state.
- No type-level enforcement of the order.

**Why it hurts:**
- Bugs are runtime, not compile-time.
- Onboarding cost — new users don't know the dance.

**Resolutions:**
- **Builder** — terminal `.build()` produces an object that's only usable in the connected state.
- **Context managers** (`with`) in Python — the language enforces enter/exit.
- **State** — encode the lifecycle so illegal operations on the wrong state are impossible.

---

## Anemic Domain Model

**Looks like:**
- Data classes with only fields, no behavior.
- All the behavior lives in "Service" classes that take the data classes as parameters.
- Business rules duplicated across services because the rule belongs on the data.

**Why it hurts:**
- The data classes don't enforce their own invariants. Anyone can construct an invalid one.
- Behavior is split from the data it operates on — the worst of OOP and procedural.

**Resolutions:**
- **Move method** — put behavior where the data lives.
- **Value Object** with validators in the constructor.
- Sometimes the anemic model is fine (DTOs at API boundaries, ORM row objects in simple CRUD apps). Apply judgment.

---

## When the smell is justified

For each smell above, ask:

1. **How often does this code change?** Smells in stable code are cheap. Smells in churning code are expensive.
2. **Who reads this code?** If it's a script you wrote and only you maintain, conventional design rules carry less weight.
3. **How big is the fix?** Some smells require small refactors; others require an architectural redesign. Match the fix to the pain.
4. **Are we about to delete this anyway?** Don't refactor code that's being replaced.

The skill's job is to *name* smells precisely, not to demand fixes.
Christian decides what to fix.
