# Mediator

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/mediator](https://refactoring.guru/design-patterns/mediator)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Reduce chaotic dependencies between objects by routing all of their communication through a central mediator object. Components stop talking to each other directly; they talk to the hub.

## Problem
A form has a checkbox, a dropdown, a text field, and a submit button. The checkbox enables the dropdown; the dropdown populates the text field; the text field gates the submit button. If each widget reaches into the others, you end up with an N-to-N web of references that's impossible to reuse or test. Add a fifth widget and you've added a dozen new edges.

## Structure
```
ComponentA  ComponentB  ComponentC
     \         |         /
      \        |        /
        +--Mediator--+
              ^
        notifies / asks
```
Participants: `Mediator` (interface — `notify(sender, event)`), `ConcreteMediator` (the hub, knows every component), `Component` (holds a reference to the Mediator, never to siblings).

## Code example — Python
```python
from __future__ import annotations
from typing import Protocol

class Mediator(Protocol):
    def notify(self, sender: object, event: str) -> None: ...

class Checkbox:
    def __init__(self, m: Mediator) -> None: self.m, self.checked = m, False
    def toggle(self) -> None:
        self.checked = not self.checked
        self.m.notify(self, "toggled")

class Dropdown:
    def __init__(self, m: Mediator) -> None: self.m, self.enabled = m, False
    def set_enabled(self, v: bool) -> None:
        self.enabled = v
        print(f"dropdown enabled={v}")

class FormMediator:
    def __init__(self) -> None:
        self.checkbox = Checkbox(self)
        self.dropdown = Dropdown(self)
    def notify(self, sender: object, event: str) -> None:
        if sender is self.checkbox and event == "toggled":
            self.dropdown.set_enabled(self.checkbox.checked)

form = FormMediator()
form.checkbox.toggle()   # dropdown enabled=True
form.checkbox.toggle()   # dropdown enabled=False
```

## Code example — TypeScript
```typescript
interface Mediator { notify(sender: object, event: string): void; }

class Checkbox {
  checked = false;
  constructor(private m: Mediator) {}
  toggle() { this.checked = !this.checked; this.m.notify(this, "toggled"); }
}

class Dropdown {
  enabled = false;
  constructor(private m: Mediator) {}
  setEnabled(v: boolean) { this.enabled = v; console.log(`dropdown enabled=${v}`); }
}

class FormMediator implements Mediator {
  checkbox = new Checkbox(this);
  dropdown = new Dropdown(this);
  notify(sender: object, event: string) {
    if (sender === this.checkbox && event === "toggled") {
      this.dropdown.setEnabled(this.checkbox.checked);
    }
  }
}

const form = new FormMediator();
form.checkbox.toggle();
form.checkbox.toggle();
```

## SQL / data analogue
A "dispatcher" stored procedure that other procs call instead of calling each other. Or a message broker (RabbitMQ, Azure Service Bus, an internal `dispatch_event` table) — services publish to the broker, the broker routes. Centralizes the topology so adding a new service doesn't touch the existing ones.

## When to use it
- Components are tightly coupled in an N-to-N mesh and you can't reuse any of them in isolation.
- The coordination logic (who triggers what when) is itself complex and worth naming.
- You want to plug components in/out without editing the others.

## When NOT to use it
- Only two components talk to each other — direct reference is fine.
- The mediator becomes a god-object that knows everyone's secrets — split it, or rethink the design.
- You actually want pub/sub broadcast — use Observer; Mediator is for *coordinated* interactions, not fan-out.

## Related patterns
- **Observer** — Mediator can be implemented *using* Observer (components subscribe to mediator events). **Often confused with Observer** because both involve indirection; the distinction is that Observer is one-to-many *broadcast* (subject doesn't know subscribers), while Mediator is many-to-many *coordination* through a hub (mediator knows every component by name).
- **Facade** — also a single point of entry, but Facade hides a subsystem from *outside* clients; Mediator coordinates *internal* peers.

## Anti-patterns it resolves
- Spaghetti UI / spaghetti microservices where every component imports every other.
- "Change one widget, break three others" — centralize the rules.
- Duplicated coordination logic scattered across event handlers.

## Real examples in our codebase
> _To be populated as the team finds them._
