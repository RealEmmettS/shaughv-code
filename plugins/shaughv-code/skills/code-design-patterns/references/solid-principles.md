# SOLID Principles — and the Patterns That Enforce Them

SOLID is a set of five OO design principles popularized by Robert C.
Martin. They predate, complement, and overlap with the GoF patterns —
most GoF patterns exist to enforce one or more of these principles.

This file is the principle-to-pattern bridge. When the conversation is
"this code violates SRP" or "the Open/Closed principle says...", come
here for the precise definition and the patterns that fix it.

> **Caveat — principles are tools, not laws.** Like every other thing
> in this skill, SOLID is a vocabulary for trade-offs. Code that
> "violates" SRP because two responsibilities are genuinely tightly
> coupled and changing for the same reason is fine. Don't auto-flag
> violations. State the principle, ask whether applying it actually
> reduces pain in *this* code.

---

## S — Single Responsibility Principle (SRP)

**"A class should have one, and only one, reason to change."**

The principle is about *reasons to change*, not "do one thing." A
`User` class that holds identity, login, and email behaviors has three
reasons to change: auth team, identity team, notifications team.
That's the smell.

**Patterns that enforce SRP:**
- **Facade** — when a class is god-shaped, push the work into focused subsystem classes and keep the facade as the entry point.
- **Strategy** — extract a *policy* into its own object; the host class loses one reason to change.
- **Command** — extract an *action* into its own object.
- **Visitor** — when you keep adding operations to a hierarchy, the operations belong outside it.

**Anti-patterns it addresses:** God Object, Feature Envy.

---

## O — Open/Closed Principle (OCP)

**"Software entities should be open for extension, but closed for modification."**

You should be able to add a new variant *without editing existing code*.
The classic failure: a `switch` on type that must be edited every time
you add a new type.

**Patterns that enforce OCP:**
- **Strategy** — new algorithm = new class (or new dict entry). No edit to the host.
- **Decorator** — new wrapping behavior = new decorator class. The wrapped object is untouched.
- **Visitor** — new operation = new visitor. The element classes are untouched. **But:** adding a new *element type* requires editing every visitor — Visitor closes you over operations but opens you to types.
- **Chain of Responsibility** — new step = new handler in the chain.
- **Abstract Factory** — new product family = new factory class.

**Anti-patterns it addresses:** Switch-on-Type, Shotgun Surgery.

**Subtle:** OCP is about *the kind of variation you've already seen*.
Over-applying it leads to over-abstraction. The standard advice is
"design for the second case, not the first" — wait until you have
two concrete variants before you abstract.

---

## L — Liskov Substitution Principle (LSP)

**"Subtypes must be substitutable for their base types."**

If `Square` extends `Rectangle` and `Rectangle.set_width()` is supposed
to leave height alone but `Square.set_width()` also changes height to
match, then any code that holds a `Rectangle` reference and expects
"setting width doesn't change height" breaks when handed a `Square`.
The subtype lied about being a Rectangle.

The principle is about **contract**, not signature. A subtype must
honor the same preconditions, postconditions, and invariants as the
base.

**Patterns that help honor LSP:**
- **Strategy** over **Inheritance** — composition naturally avoids LSP traps.
- **Bridge** — separates "what varies by abstraction" from "what varies by implementation," preventing inheritance from being asked to do both.
- **Template Method** — works *with* LSP when the hook contract is precise. Goes wrong when subclasses override more than the hooks.

**Anti-patterns it addresses:** "Subclass for code reuse" (use composition instead). Deep inheritance hierarchies.

**Practical test:** Can you write code against the base class and have it work with any subtype? If not, the subtype isn't really a subtype.

---

## I — Interface Segregation Principle (ISP)

**"Clients should not be forced to depend on methods they do not use."**

Many small, role-focused interfaces beat one fat interface. If a class
must implement methods it doesn't need (`raise NotImplementedError`),
the interface is too wide.

**Patterns that enforce ISP:**
- **Adapter** — when a client needs a narrower interface than the third-party class provides, adapt it down.
- **Facade** — exposes only the relevant slice of a subsystem.
- **Composite + leaf-specific interfaces** — leaf and container often want different methods; force them into one and you violate ISP.
- **Decorator** — naturally segregates because it conforms to a small interface.

**Anti-patterns it addresses:** Fat interfaces with optional methods. `is_supported()` flags. `raise NotImplementedError` in subclasses.

**Practical move:** In Python, `Protocol` types let you define narrow,
structural interfaces. In TS, interfaces are already structural — just
write the small one.

---

## D — Dependency Inversion Principle (DIP)

**"Depend on abstractions, not concretions. High-level modules should not depend on low-level modules; both should depend on abstractions."**

The classic example: `OrderProcessor` should depend on a `Notifier`
abstraction, not directly on `SendGridClient`. That way you can swap
SendGrid for AWS SES (or a fake in tests) without touching
`OrderProcessor`.

**Patterns that enforce DIP:**
- **Abstract Factory** — clients depend on the factory interface, get concrete products.
- **Strategy** — host depends on the strategy interface.
- **Bridge** — abstraction depends on implementation interface.
- **Adapter** — lets a concrete third-party class satisfy an abstract interface you define.
- **Dependency Injection** (not GoF, but the most important DIP enabler) — pass the abstraction as a constructor parameter.

**Anti-patterns it addresses:** Hard-Coded Dependencies, Singleton Abuse.

**Practical move:** Constructor injection. Take collaborators as
parameters. Let the composition root (your `main()`, your framework's
container) wire concretes to abstractions.

---

## Putting it together — when to invoke SOLID in conversation

- **Naming a code smell** — "this looks like an SRP violation: the class is changing for both reasons X and Y" is more precise than "this class does too much."
- **Justifying a refactor** — "we want OCP here because we keep editing this `switch` every sprint" gives a measurable reason.
- **Resisting an over-abstraction** — "this is YAGNI / speculative OCP — there's one variant today, no second one on the roadmap" pushes back on premature pattern application.

SOLID *and* GoF patterns share the same trap: they're tools for
managing change. If the code isn't changing, the principles don't
earn their cost. **Optimize for the change you can see, not the change
you imagine.**
