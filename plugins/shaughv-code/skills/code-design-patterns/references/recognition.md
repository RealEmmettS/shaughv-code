# Pattern Recognition — Reading Code for the 22 Patterns

This file is the fingerprint catalog. When you're in **recognition mode**
(see SKILL.md), read the relevant section and walk the code methodically.

The goal is not to slap a pattern label on everything — most code is
"just functions and classes." The goal is to spot **deliberate** uses
of a pattern (or **missed opportunities** for one) so you can name the
design move precisely.

## How to walk a file

1. **List the classes and their methods.** What are the nouns? What are the verbs?
2. **Note inheritance edges.** Who extends what? Abstract classes? Interfaces / Protocols?
3. **Note composition edges.** What does each class hold a reference to?
4. **Find the polymorphic call sites.** Where does the code call `something.do_x()` and `something` could be one of several concrete types?
5. **Find the conditionals on type / enum / status.** `if isinstance(...)`, `match obj:`, `if kind == "...":`. These are usually patterns trying to be born.
6. **Match against the fingerprints below.**

A fingerprint is **not** proof. It's an invitation to look closer. If three
fingerprints point at the same pattern, you've got it.

---

## Creational family — fingerprints

### Factory Method
- Abstract / base class with one method like `create_X()` left unimplemented.
- Subclasses each return a different `Product` from that method.
- The base class uses `self.create_X()` in its other methods — the subclass decides what `X` actually is.
- **Look for:** A method named `make_*`, `create_*`, `build_*`, `new_*` declared on a base and overridden in subclasses.

### Abstract Factory
- A class whose entire job is producing **a family** of related objects (`create_button`, `create_dialog`, `create_menu`).
- Concrete factories (`MacFactory`, `WinFactory`) each produce the family in their own style.
- Clients hold a reference to "a Factory" without knowing which one.
- **Look for:** A class whose methods are *all* creators returning interface types.

### Builder
- A class with many `with_*` / `set_*` / `add_*` methods that return `self`.
- A terminal `build()` / `to_*()` method that produces the final object.
- The product has many optional fields and no telescoping constructor.
- **Look for:** Method-chaining (`X().a().b().c().build()`) where each call configures one piece.

### Prototype
- A `clone()` / `copy()` method on a class.
- Objects are created by copying an existing instance, not by calling a constructor.
- A registry of "prototype" instances that get cloned on demand.
- **Look for:** `copy.deepcopy(prototype)`, `clone()`, or a `prototypes` dict that callers index into.

### Singleton
- A class with a private constructor (or, in Python, a `__new__` that returns the existing instance).
- A class-level attribute that holds *the* instance.
- A `get_instance()` / `instance()` method.
- Or: a module-level singleton (Python's natural way — the module *is* a singleton).
- **Look for:** `cls._instance`, `if cls._instance is None`, `@functools.cache` on a no-arg factory, `__new__` overrides.

---

## Structural family — fingerprints

### Adapter
- A wrapper class whose only job is to translate one interface to another.
- Methods are mostly one-liners that rename/reshape and delegate to a wrapped object.
- The wrapped object has an "old" or "third-party" interface; the adapter exposes the interface our code expects.
- **Look for:** Class names ending in `Adapter`, `Wrapper`, `Translator`. Constructors that take an object of one type and expose methods of another.

### Bridge
- Two parallel inheritance hierarchies — one for the abstraction, one for the implementation.
- The abstraction holds a reference to the implementation (composition, not inheritance, between them).
- Lets you vary `(Abstraction × Implementation)` independently rather than `Abstraction × Implementation` subclasses.
- **Look for:** An `Abstraction` class with a `self.impl` field typed as an interface, plus distinct hierarchies for each.

### Composite
- A node interface with `add_child(child)` / `remove_child(child)` and operations like `render()` / `total()`.
- Leaf classes implement the operation directly.
- Container classes implement the operation by **iterating their children** and recursing.
- **Look for:** `for child in self.children: total += child.total()`. Recursive structure where leaves and containers share an interface.

### Decorator
- A wrapper class that **implements the same interface** as the thing it wraps.
- Constructor takes an instance of that interface and stores it.
- Methods call `self.wrapped.method()` then add behavior (before or after).
- Decorators can stack: `LoggingDecorator(CachingDecorator(real))`.
- **Look for:** Class names like `LoggingX`, `CachingX`, `RetryingX`. Or Python `@decorator` syntax used to wrap.

### Facade
- A single class with broad, coarse-grained methods that orchestrate calls to many subsystem classes.
- The subsystem classes are themselves complex; clients never see them directly.
- The Facade does NOT necessarily implement an interface — it's just the one front door.
- **Look for:** A `Service` / `Manager` / `Client` class whose methods read like high-level user intents (`book_trip()`, `import_invoice()`) and whose bodies call into many other modules.

### Flyweight
- An object split into "intrinsic" (shared, immutable) and "extrinsic" (per-context) state.
- A factory / registry that hands out the *same* instance for the same intrinsic state.
- Used when you'd otherwise allocate millions of nearly-identical small objects.
- **Look for:** `String.intern()`, `sys.intern()`, an LRU cache on a constructor, a factory that returns the same object twice for the same args.

### Proxy
- A class that implements the same interface as a target and holds a reference to it.
- Methods either: lazy-load the target, check auth before delegating, log/cache around it, or send to a remote.
- **Look for:** Class names like `LazyX`, `RemoteX`, `CachedX`, `AuthedX`. SQLAlchemy lazy relationships. ORM proxy objects.

---

## Behavioral family — fingerprints

### Chain of Responsibility
- A linked list of handlers, each with a `set_next(handler)` and a `handle(request)` method.
- Each handler either processes the request or passes it to `self.next`.
- Express/Koa middleware, ASP.NET handlers, logging handlers all use this.
- **Look for:** `self.next = next_handler`. `if self.can_handle(): ... else: self.next.handle(...)`. Middleware chains.

### Command
- A class with one method, often `execute()` (and sometimes `undo()`).
- Constructor binds the receiver and parameters; `execute()` calls the receiver with those parameters.
- A separate "Invoker" stores Commands in a list (queue, undo stack, log).
- **Look for:** Classes named `*Command`, `*Action`, `*Job`. An `execute()` method. A queue or history list of these objects.

### Iterator
- A class with `__iter__` / `__next__` (Python) or `next()` / `done` (JS/TS) or `IEnumerator` (C#).
- Or: a generator function (`yield`).
- Lets clients walk a collection without knowing whether it's an array, tree, linked list, or DB cursor.
- **Look for:** `yield`, `__iter__`, `Symbol.iterator`, custom classes implementing the iteration protocol.

### Mediator
- A "Hub" / "Dispatcher" / "Controller" class that many other components reference.
- Components do NOT reference each other directly — they call `self.mediator.notify(self, event)`.
- The mediator routes the event to whichever other components care.
- **Look for:** A central `EventBus`, `Dispatcher`, `Coordinator`, `Controller` (in the form-controller sense). Components hold one back-reference each.

### Memento
- An object captures another object's internal state into an opaque "memento."
- The memento is later passed back to restore the state.
- The memento's internals are private to the originator — outside code can hold it but not poke at it.
- **Look for:** `save_state()` / `restore(memento)` pairs. Undo stacks where each entry is a snapshot rather than an inverse command.

### Observer
- A "Subject" with `subscribe(observer)` / `unsubscribe(observer)` / `notify()` methods.
- A list of observers.
- On state change, the subject calls `observer.update(...)` for each observer.
- Or, in TS/JS: an `EventEmitter` with `.on()` / `.emit()`.
- **Look for:** `subscribers`, `listeners`, `on()`, `emit()`, `addEventListener`, RxJS streams, Vue/React reactivity.

### State
- An object holds a reference to a `State` object (`self.state`).
- Methods on the object delegate to `self.state.do_x(self)`.
- State methods may **change `self.state` to a different state** — the state machine transitions.
- **Look for:** `self.state = NextState()` inside a State method. A `State` interface with the same methods as the host. A status enum that drives a `match`/`switch`.

### Strategy
- An object holds a reference to a `Strategy` object that has one method.
- The host's method delegates to `self.strategy.execute(...)`.
- The client picks the Strategy at construction time and the host never changes it on its own.
- In Python/TS, very often a plain callable in a `dict` rather than a class.
- **Look for:** `self.algorithm = ...`. A `dict[str, Callable]` selected by key. A `--strategy foo` CLI flag.

### Template Method
- A base class with a method that defines a fixed sequence of steps.
- Some steps are concrete; others are abstract / hook methods.
- Subclasses override the hooks to vary the algorithm.
- **Look for:** A `run()` / `execute()` method on a base class that calls `self.step_a()`, `self.step_b()`, where `step_b` is abstract.

### Visitor
- An interface `Visitor` with one `visit_X(x)` method per concrete element type.
- Elements have an `accept(visitor)` method that calls `visitor.visit_<self_type>(self)`.
- Double dispatch — the right `visit_X` runs because the element knows its own type.
- **Look for:** `def accept(self, visitor): visitor.visit_invoice(self)`. AST walkers. SQL query analyzers. Compiler passes.

---

## Negative space — common false positives

- **A class named `Manager` is not a Facade** unless it actually fronts a subsystem. Most "Managers" are just god objects.
- **A function passed as an argument is not necessarily a Strategy.** It's only Strategy if the receiver delegates to it as part of a stable interface contract. A one-off callback is just a callback.
- **A class with one method is not necessarily a Command.** It might be a Strategy. Command implies the request is *captured* (parameters bound) for later execution. Strategy is called immediately.
- **An event handler is not always an Observer.** A DOM `onClick` is not the GoF Observer pattern in any meaningful sense — it's just an event listener. Observer specifically refers to objects subscribing to **a Subject's state changes** with a defined `notify` protocol.
- **A method named `create_X` is not always a Factory Method.** It's only a Factory Method if it's overridden by subclasses to vary which concrete class gets created. Otherwise it's just a constructor wrapper.

When in doubt: name what the code is *actually doing*, not what its
filename suggests. Then check if a GoF pattern names that thing precisely.
If not — it's just code. That's fine too.
