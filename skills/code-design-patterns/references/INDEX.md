# Pattern Index — Quick Lookup

The fast index for the 22 GoF patterns plus the analysis aids. When
you know what you want, jump straight here. When you don't, start
with `recommendations.md` or `recognition.md`.

## The 22 patterns

### Creational (5) — "How does this object get made?"

| Pattern | One-line | File |
|---|---|---|
| Factory Method | Defer instantiation to subclasses | [creational/factory-method.md](creational/factory-method.md) |
| Abstract Factory | Create families of related objects | [creational/abstract-factory.md](creational/abstract-factory.md) |
| Builder | Step-by-step construction | [creational/builder.md](creational/builder.md) |
| Prototype | Clone instead of construct | [creational/prototype.md](creational/prototype.md) |
| Singleton | One instance per process — use sparingly | [creational/singleton.md](creational/singleton.md) |

### Structural (7) — "How are these objects composed?"

| Pattern | One-line | File |
|---|---|---|
| Adapter | Make an incompatible interface fit | [structural/adapter.md](structural/adapter.md) |
| Bridge | Decouple abstraction from implementation | [structural/bridge.md](structural/bridge.md) |
| Composite | Tree of objects treated like its leaves | [structural/composite.md](structural/composite.md) |
| Decorator | Add behavior by wrapping | [structural/decorator.md](structural/decorator.md) |
| Facade | One front door over a subsystem | [structural/facade.md](structural/facade.md) |
| Flyweight | Share fine-grained objects to save memory | [structural/flyweight.md](structural/flyweight.md) |
| Proxy | Stand-in that controls access | [structural/proxy.md](structural/proxy.md) |

### Behavioral (10) — "How do these objects talk?"

| Pattern | One-line | File |
|---|---|---|
| Chain of Responsibility | Pipeline of optional handlers | [behavioral/chain-of-responsibility.md](behavioral/chain-of-responsibility.md) |
| Command | Encapsulate a request as an object | [behavioral/command.md](behavioral/command.md) |
| Iterator | Traverse a collection without exposing its shape | [behavioral/iterator.md](behavioral/iterator.md) |
| Mediator | Many-to-many comms through a hub | [behavioral/mediator.md](behavioral/mediator.md) |
| Memento | Snapshot and restore state | [behavioral/memento.md](behavioral/memento.md) |
| Observer | Publish/subscribe between objects | [behavioral/observer.md](behavioral/observer.md) |
| State | Object behavior changes with state | [behavioral/state.md](behavioral/state.md) |
| Strategy | Swap algorithms behind a stable interface | [behavioral/strategy.md](behavioral/strategy.md) |
| Template Method | Skeleton in base, hooks in subclasses | [behavioral/template-method.md](behavioral/template-method.md) |
| Visitor | Add operations to a class hierarchy without editing it | [behavioral/visitor.md](behavioral/visitor.md) |

## Analysis aids

| File | When to read it |
|---|---|
| [recognition.md](recognition.md) | "What patterns are in this code?" — fingerprints to spot each pattern |
| [recommendations.md](recommendations.md) | "What pattern fits my problem?" — problem → pattern decision tree |
| [anti-patterns.md](anti-patterns.md) | "Is this code smelly?" — God Object, Switch-on-Type, Primitive Obsession, etc., each paired with a fix |
| [solid-principles.md](solid-principles.md) | SRP / OCP / LSP / ISP / DIP — the principles and the patterns that enforce them |
| [pattern-relationships.md](pattern-relationships.md) | "Strategy or State?", "Decorator or Proxy?" — disambiguations |
| [_template.md](_template.md) | Template for adding a new pattern (modern patterns outside GoF, etc.) |

## When to come here

- **Reference mode** — User names a pattern, jump to its file via the tables above.
- **Recognition mode** — Read `recognition.md`, walk the code, name what you see.
- **Recommendation mode** — Read `recommendations.md`, map the problem, propose a pattern.
- **Disambiguation** — Read `pattern-relationships.md`.
- **Smell triage** — Read `anti-patterns.md`.
- **Principle conversation** — Read `solid-principles.md`.

## External canonical sources

- https://refactoring.guru/design-patterns — primary source for every reference file
- *Design Patterns* by Gamma, Helm, Johnson, Vlissides (1994) — the GoF book; canonical on intent
- Christopher Alexander, *A Pattern Language* (1977) — the architectural origin of the pattern-language idea

## Sibling skills (handoffs)

- `theia-tools:git-workflow` — when the refactor needs to land via PR
- `theia-tools:cdp-design-pattern` — for CDP-specific architecture
- `theia-tools:cto-advisor` — framing the refactor's business case
- `theia-tools:agile` — fitting the refactor into a sprint / iteration
- `theia-tools:bug-triage` — when analysis surfaces a defect
- `theia-tools:learn` — teaching a teammate one of these patterns
- **`refactoring`** (forthcoming) — actually carrying out the multi-file refactor this skill recommends
