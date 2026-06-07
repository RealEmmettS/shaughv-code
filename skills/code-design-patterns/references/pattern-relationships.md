# Pattern Relationships — Disambiguations

The 22 GoF patterns overlap, complement, and get confused with each
other constantly. This file collects the disambiguations Christian
will actually need in conversation: "Strategy or State?", "Decorator
or Proxy?", "Facade or Adapter?".

When the user asks "which one is this?" or "what's the difference
between X and Y?" — come here first.

---

## Strategy vs State

Both delegate to a swappable object that implements a small interface.
The difference is **who decides which one**.

| | Strategy | State |
|---|---|---|
| Who picks | The *client* (at construction, or by config) | The *object's own state* (transitions happen internally) |
| Do swappables know about each other? | No — they're independent | Yes — each state knows which state(s) come next |
| Lifetime of the choice | Usually for the object's lifetime | Changes during the object's lifetime |
| Mental model | "I have a sort algorithm; pick which one" | "The traffic light is RED; next it goes GREEN" |

If your "Strategy" objects are setting the host's strategy field
internally — that's State, not Strategy.

---

## Strategy vs Template Method

Both let you vary one piece of an algorithm.

| | Strategy | Template Method |
|---|---|---|
| Mechanism | Composition (`self.strategy = ...`) | Inheritance (override `hook()`) |
| Granularity | Whole algorithm swapped | Fixed skeleton with overridable hooks |
| Runtime swap | Yes — change strategy at runtime | No — variant fixed at subclass selection |
| Test isolation | Easy — inject mock strategy | Harder — must subclass to test |

**Default to Strategy.** Template Method is appropriate when the
algorithm truly has a fixed skeleton (open → process → close) and the
hooks are small. If you find yourself adding many hooks, you've
discovered Strategy.

---

## Strategy vs Command

Both encapsulate behavior in an object with one method.

| | Strategy | Command |
|---|---|---|
| What it captures | An *algorithm* (interchangeable) | A *request* (parameters bound) |
| When it runs | Immediately, called by host | Later, called by an invoker |
| Typical method name | `execute(input) → output` | `execute()` (parameters already bound) |
| State carried | Usually stateless | Carries the request's parameters |
| Used for | Algorithm selection | Undo stacks, queues, audit logs, transactions |

**Tell:** if the object can be put in a queue and run later, it's a
Command. If it's called inline by the host, it's a Strategy.

---

## Decorator vs Proxy

Both wrap an object and conform to the same interface.

| | Decorator | Proxy |
|---|---|---|
| Intent | *Add behavior* | *Control access* |
| Stacking | Designed to stack (`A(B(C(real)))`) | Usually one layer |
| Knows about real object | Yes — calls through to it | Yes — but may decline to call through (auth, lazy) |
| Typical examples | Logging, caching, retry, validation | Lazy load, auth check, remote stub, copy-on-write |

**Practical test:** Can you remove the wrapper and the program still
works (just without the extra behavior)? Decorator. Does removing it
break correctness or security? Proxy.

---

## Facade vs Adapter

Both wrap things. Different jobs.

| | Facade | Adapter |
|---|---|---|
| Wraps | A whole subsystem (many classes) | One class with the wrong interface |
| Interface relationship | Defines a *new*, simpler interface | Conforms to an *existing* expected interface |
| Why | Hide complexity | Bridge incompatibility |
| Code volume | Substantial — orchestrates many | Thin — mostly renaming |

A Facade is "I designed this front door." An Adapter is "the door
came in the wrong shape; I'm making it fit."

---

## Bridge vs Adapter

Bridge is **planned**. Adapter is **retrofit**.

| | Bridge | Adapter |
|---|---|---|
| Designed up front? | Yes — you knew both sides would vary | No — found out two interfaces don't match |
| Implementations interchangeable? | Yes — `(Abstraction × Implementation)` matrix | One implementation, one wrapper |
| Typical use | Cross-platform UI toolkits, multi-DB ORMs | Wrapping a vendor SDK to fit your interface |

If you find yourself writing many Adapters with the same wrapped
interface — that's a Bridge struggling to exist. Promote the wrapped
interface to a formal Implementation hierarchy.

---

## Composite vs Decorator

Both compose recursively. Both have a tree-ish structure.

| | Composite | Decorator |
|---|---|---|
| Purpose | Treat tree of objects uniformly | Add behavior by wrapping |
| Branching | Each container has *many* children | Each wrapper has *one* wrappee |
| Operations | Defined once, recurses into children | Each layer adds its own twist |
| Common shapes | Folders/files, UI containers, AST nodes | Middleware stacks, IO wrappers |

A Composite is a tree. A Decorator is a chain. The chain *is* a
degenerate tree, which is why they get confused — but the intent
diverges hard.

---

## Observer vs Mediator

Both decouple components from each other.

| | Observer | Mediator |
|---|---|---|
| Topology | One subject → many observers | Many components ↔ one hub ↔ many components |
| Direction | Mostly one-way (subject notifies observers) | Two-way (components both publish and listen via hub) |
| Coupling | Observers know about the subject (subscribe to it) | Components only know the mediator |
| Use when | One source of truth, many readers (UI state, model changes) | Coordinating an interactive system (form fields, dialog controls) |

A redux/zustand/pinia store is a Mediator dressed as a centralized
Observer. The pattern boundary is fuzzy in modern frontends.

---

## Factory Method vs Abstract Factory

Both create objects without exposing concrete classes.

| | Factory Method | Abstract Factory |
|---|---|---|
| Scope | One class hierarchy | Family of related classes |
| Mechanism | Override a method on a base class | Implement a factory interface with many methods |
| Output | One product | A coordinated family of products |
| Example | `Document.create_page() → Page` (subclass picks ReportPage vs InvoicePage) | `UIFactory.create_button(), .create_dialog(), .create_menu()` |

If the factory's interface has one method — Factory Method. Many
methods producing related things — Abstract Factory.

---

## Iterator vs Visitor

Both traverse structures.

| | Iterator | Visitor |
|---|---|---|
| What it does | Yields each element in turn | Performs an operation on each element, dispatching by element type |
| Element types | Usually one type | Multiple types in a hierarchy (Element + Visitor sets) |
| Where the operation lives | In the caller's for-loop | In the Visitor's `visit_X` methods |

For homogeneous collections — Iterator. For class hierarchies where
"the right thing to do" depends on the element type — Visitor.

---

## Singleton vs Module-Level Global

In Python especially, modules are already singletons. The class
ceremony of Singleton is almost always wrong in Python.

| | Singleton (class) | Module-level value |
|---|---|---|
| Construction | Lazy, controlled | At import time |
| Testability | Bad (global state, hard to reset) | Same problem, but with one less layer |
| Substitutability | Hard | Slightly less hard (monkeypatching) |
| Best alternative | **Dependency Injection** | **Dependency Injection** |

Prefer DI over both. If you must pick between them — module-level
value is simpler. Reserve the class-based Singleton for languages
that don't have first-class modules (Java, C#).

---

## The "is it really a pattern?" patterns

Some GoF entries are barely patterns in modern languages:

- **Iterator** — built into Python (`__iter__`), TS (`Symbol.iterator`), Java, C#. The "pattern" is now language syntax.
- **Singleton** — usually wrong (see above).
- **Prototype** — `copy.deepcopy()` and `structuredClone()` do this without ceremony.
- **Template Method** — still useful, but composition often wins.
- **Visitor** — heavy machinery; modern alternatives include `match` / pattern-matching, sum types, double-dispatch via tagged unions.

These patterns are still worth knowing — they're the vocabulary other
engineers use. But don't reach for the class hierarchy when the
language gives you the feature for free.

---

## A cheat sheet for fast classification

Christian gives you a snippet. You want to classify quickly:

1. **It's `wrap → add behavior`?** Decorator.
2. **It's `wrap → control access`?** Proxy.
3. **It's `wrap → simplify a big mess`?** Facade.
4. **It's `wrap → translate an interface`?** Adapter.
5. **It's `pick from N algorithms`?** Strategy.
6. **It's `transition between named states`?** State.
7. **It's `request as an object, queued or undone`?** Command.
8. **It's `pub/sub between components`?** Observer or Mediator (one-to-many vs many-to-many).
9. **It's `walk a class hierarchy adding ops`?** Visitor.
10. **It's `pipeline of optional handlers`?** Chain of Responsibility.

Half of all design questions Christian will ask are answered above.
The remaining half deserve a deeper read of the pattern's reference
file.
