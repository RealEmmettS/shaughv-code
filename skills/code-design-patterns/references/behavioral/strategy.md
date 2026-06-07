# Strategy

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/strategy](https://refactoring.guru/design-patterns/strategy)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Define a family of interchangeable algorithms, encapsulate each one, and let the client pick which to use at runtime.

## Problem
A function needs to do "the same kind of thing" several ways — different shipping cost calculators, different tax rules per jurisdiction, different sort orders, different parsers per file type. Stuffing them all into one function as a giant `if/elif` makes the function fat, hard to test in isolation, and impossible to extend without editing it (open/closed violation). You want to swap the algorithm without touching the caller.

## Structure
```
Context --uses--> Strategy (interface)
                    ^
                    |
        ConcreteStrategyA, ConcreteStrategyB, ...
```
Participants: `Context` (holds a reference to a Strategy, delegates to it), `Strategy` (interface with one method), `ConcreteStrategy` (one implementation).

## Code example — Python
```python
from __future__ import annotations
from typing import Callable

# Pythonic Strategy: a callable. No class hierarchy needed.
TaxFn = Callable[[float], float]

def tax_ca(amount: float) -> float: return amount * 0.0725
def tax_tx(amount: float) -> float: return amount * 0.0625
def tax_or(amount: float) -> float: return 0.0          # no sales tax

TAX_STRATEGIES: dict[str, TaxFn] = {"CA": tax_ca, "TX": tax_tx, "OR": tax_or}

def total(amount: float, state: str) -> float:
    strategy = TAX_STRATEGIES[state]
    return amount + strategy(amount)

print(total(100, "CA"))  # 107.25
print(total(100, "OR"))  # 100.0
```

## Code example — TypeScript
```typescript
type TaxFn = (amount: number) => number;

const taxStrategies: Record<string, TaxFn> = {
  CA: a => a * 0.0725,
  TX: a => a * 0.0625,
  OR: _ => 0,
};

function total(amount: number, state: string): number {
  const strategy = taxStrategies[state];
  if (!strategy) throw new Error(`no tax strategy for ${state}`);
  return amount + strategy(amount);
}

console.log(total(100, "CA")); // 107.25
console.log(total(100, "OR")); // 100
```

## SQL / data analogue
Table-driven dispatch — a lookup table maps a key to a function name (or a SQL expression) and the caller picks the row, then invokes the named thing. In our CDP, mapping each `source_tenant` to its sync handler, or each entity to its output-view name, is Strategy stored in a table. Beats hard-coded `CASE WHEN tenant = 'X' THEN ...`.

## When to use it
- You have two or more algorithms that do the same kind of thing differently.
- The choice depends on runtime data (user, region, file type, config flag).
- You want to add a new algorithm without editing the caller (open/closed).

## When NOT to use it
- **There's exactly one algorithm.** You don't need a Strategy interface for a single function.
- **A `dict` of callables or a lookup table already does the job.** In Python and TS, functions are first-class — you very rarely need `class Strategy(ABC)` with a single method. A `dict[str, Callable]` is Strategy, written shorter and read faster. Reach for a class only when each strategy carries its own configuration/state.
- The "algorithm" is two lines and never changes — inline it.

## Related patterns
- **State** — **often confused with State** because both delegate to a swappable object. The distinction: in Strategy the *client* picks the algorithm and strategies are independent; in State the *object's own state* picks the behavior, and states know about each other (each decides the next state).
- **Template Method** — **often confused with Template Method** because both let you vary an algorithm. The distinction: Strategy uses **composition** (inject the algorithm), Template Method uses **inheritance** (override hook methods). Prefer Strategy unless the algorithm has a fixed skeleton with small variations.
- **Command** — **often confused with Command** because both are "object with one method." The distinction: Command captures a *request* (parameters bound, intended to be queued/undone/logged); Strategy captures an *algorithm* (interchangeable, called immediately by the host).
- **Visitor** — Visitor adds an operation across a class hierarchy via double dispatch; Strategy swaps one operation within one class.

## Anti-patterns it resolves
- Long `if/elif` ladders selecting behavior based on a string/enum.
- "Just add a flag" — every new flag adds a branch; new strategy = new entry.
- Untestable mega-functions doing seven things — split them into named strategies.

## Real examples in our codebase
> _To be populated as the team finds them._
