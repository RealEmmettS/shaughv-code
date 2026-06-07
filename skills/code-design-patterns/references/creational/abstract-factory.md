# Abstract Factory

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/abstract-factory](https://refactoring.guru/design-patterns/abstract-factory)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Provide an interface for creating *families* of related or dependent objects without specifying their concrete classes. Clients work entirely against the abstract interfaces, and the choice of family happens in one place.

## Problem
You're building a cross-platform UI toolkit. On macOS you need a `MacButton`, a `MacCheckbox`, and a `MacMenu`; on Windows you need the Windows trio. These three widgets must be *consistent with each other* — you can't pair a Windows button with a macOS checkbox or you get a visually broken, half-native UI. If construction is left to callers, nothing stops them from mixing families. You want one place that says: "for this platform, here is the matched set of widgets."

## Structure
```
AbstractFactory
  + createButton()   -> AbstractButton
  + createCheckbox() -> AbstractCheckbox
  + createMenu()     -> AbstractMenu
       |
       +-- MacFactory     -> {MacButton,     MacCheckbox,     MacMenu}
       +-- WindowsFactory  -> {WindowsButton, WindowsCheckbox, WindowsMenu}

Client code depends only on AbstractFactory + Abstract* products.
```

## Code example — Python
```python
from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...

class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str: ...

class MacButton(Button):
    def render(self): return "[ mac button ]"
class MacCheckbox(Checkbox):
    def render(self): return "( mac checkbox )"

class WindowsButton(Button):
    def render(self): return "[ win button ]"
class WindowsCheckbox(Checkbox):
    def render(self): return "( win checkbox )"

class GUIFactory(ABC):
    @abstractmethod
    def button(self) -> Button: ...
    @abstractmethod
    def checkbox(self) -> Checkbox: ...

class MacFactory(GUIFactory):
    def button(self): return MacButton()
    def checkbox(self): return MacCheckbox()

class WindowsFactory(GUIFactory):
    def button(self): return WindowsButton()
    def checkbox(self): return WindowsCheckbox()

def render_form(f: GUIFactory) -> str:
    return f.button().render() + " " + f.checkbox().render()

print(render_form(MacFactory()))
print(render_form(WindowsFactory()))
```

## Code example — TypeScript
```typescript
interface Button { render(): string; }
interface Checkbox { render(): string; }

class MacButton implements Button { render() { return "[ mac button ]"; } }
class MacCheckbox implements Checkbox { render() { return "( mac checkbox )"; } }
class WindowsButton   implements Button { render() { return "[ win button ]"; } }
class WindowsCheckbox implements Checkbox { render() { return "( win checkbox )"; } }

interface GUIFactory {
  button(): Button;
  checkbox(): Checkbox;
}

class MacFactory implements GUIFactory {
  button() { return new MacButton(); }
  checkbox() { return new MacCheckbox(); }
}
class WindowsFactory implements GUIFactory {
  button() { return new WindowsButton(); }
  checkbox() { return new WindowsCheckbox(); }
}

const renderForm = (f: GUIFactory) =>
  `${f.button().render()} ${f.checkbox().render()}`;
console.log(renderForm(new MacFactory()));
console.log(renderForm(new WindowsFactory()));
```

## SQL / data analogue
**Per-tenant schema provisioning.** An onboarding routine that, given a tenant code, provisions a matched set of objects in one transaction — `{tenant}_raw`, `{tenant}_staging`, `{tenant}_marts` schemas plus the role grants and pipeline rows that go with them. The "family" is the cluster of schema + roles + pipeline rows that only make sense together. Mixing pieces from two tenants would corrupt the data.

## When to use it
- Your code must work with multiple **families** of related products, and one product from family A should never be paired with another from family B.
- You want to swap the entire family in one place (constructor injection of the factory).
- You're building a cross-platform or multi-vendor system where each "platform" has a coherent set of components.

## When NOT to use it
- You only have *one* product, not a family. Use Factory Method.
- The "family" has only one member today and adding more is speculative. You're inventing a hierarchy for a problem you don't have.
- The variation is per-call, not per-deployment — you'll just be passing the factory around as a parameter for no benefit.

## Related patterns
- **Factory Method** — Abstract Factory is typically implemented as a class with several Factory Methods, one per product type in the family.
- **Builder** — Builder constructs *one* complex object step by step; Abstract Factory constructs *families* of objects in one call. Often confused because both hide `new`; the distinction is "complex single object" vs. "matched set."
- **Often confused with Service Locator / DI container** because both wire up object graphs; the distinction is that Abstract Factory is a typed, narrow interface ("give me the widget set"), while a DI container is a generic untyped registry.

## Anti-patterns it resolves
- **Mismatched product families** — preventing the runtime "wrong button + wrong checkbox" combo via the type system.
- **Platform-branching spaghetti** — replaces `if platform == "X": ... elif platform == "Y": ...` repeated across the codebase with a single factory lookup at the edge.

## Real examples in your codebase
> _To be populated as you find them._
