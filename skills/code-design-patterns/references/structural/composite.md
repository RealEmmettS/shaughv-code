# Composite

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/composite](https://refactoring.guru/design-patterns/composite)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly through a shared interface.

## Problem
You have a hierarchy — a folder containing files and other folders, an assembly containing parts and sub-assemblies, a work breakdown structure where tasks contain tasks, an estimate composed of line items and sub-estimates. The client wants to ask "how big are you?" or "render yourself" without caring whether it's a leaf or a branch. Without Composite, every operation needs `if isinstance(x, Folder)` branching scattered through the client. With it, leaves and composites implement the same interface and recursion handles the tree naturally.

## Structure
```
        Component (interface)
         /         \
        /           \
     Leaf        Composite ──has many──> Component
                  (children)
```
- **Component** — common interface for both leaves and composites.
- **Leaf** — terminal node; does the real work.
- **Composite** — holds children (each a Component) and delegates / aggregates results.

## Code example — Python
```python
from __future__ import annotations
from typing import Protocol

class CostItem(Protocol):  # Component
    def total(self) -> float: ...
    def render(self, depth: int = 0) -> str: ...

class LineItem:  # Leaf
    def __init__(self, name: str, amount: float) -> None:
        self.name, self.amount = name, amount
    def total(self) -> float:
        return self.amount
    def render(self, depth: int = 0) -> str:
        return f"{'  ' * depth}- {self.name}: ${self.amount:,.2f}"

class CostGroup:  # Composite
    def __init__(self, name: str) -> None:
        self.name = name
        self.children: list[CostItem] = []
    def add(self, item: CostItem) -> None:
        self.children.append(item)
    def total(self) -> float:
        return sum(c.total() for c in self.children)
    def render(self, depth: int = 0) -> str:
        head = f"{'  ' * depth}+ {self.name} (${self.total():,.2f})"
        return "\n".join([head, *(c.render(depth + 1) for c in self.children)])

estimate = CostGroup("Concrete")
estimate.add(LineItem("Rebar", 12_000))
sub = CostGroup("Formwork"); sub.add(LineItem("Plywood", 4_500)); sub.add(LineItem("Labor", 8_000))
estimate.add(sub)
print(estimate.render())
```

## Code example — TypeScript
```typescript
interface CostItem {
  total(): number;
  render(depth?: number): string;
}

class LineItem implements CostItem {
  constructor(private name: string, private amount: number) {}
  total() { return this.amount; }
  render(d = 0) { return `${"  ".repeat(d)}- ${this.name}: $${this.amount.toLocaleString()}`; }
}

class CostGroup implements CostItem {
  private children: CostItem[] = [];
  constructor(private name: string) {}
  add(c: CostItem) { this.children.push(c); }
  total() { return this.children.reduce((s, c) => s + c.total(), 0); }
  render(d = 0): string {
    const head = `${"  ".repeat(d)}+ ${this.name} ($${this.total().toLocaleString()})`;
    return [head, ...this.children.map(c => c.render(d + 1))].join("\n");
  }
}

const e = new CostGroup("Concrete");
e.add(new LineItem("Rebar", 12000));
const sub = new CostGroup("Formwork");
sub.add(new LineItem("Plywood", 4500)); sub.add(new LineItem("Labor", 8000));
e.add(sub);
console.log(e.render());
```

## SQL / data analogue
**Recursive CTEs over hierarchical data.** Org charts, cost-code rollups, work breakdown structures, parent-child project structures — anywhere a row references its parent row by id. A `WITH RECURSIVE` CTE walks the tree and aggregates leaves into their composites, which is the SQL expression of the same idea: treat a node and a subtree uniformly. Any `task(id, parent_id)` self-referencing table or nested category taxonomy is a direct candidate.

## When to use it
- The domain is genuinely a tree (or DAG): folders/files, BOM, WBS, GL account hierarchies, comment threads, menu structures.
- Clients want to call the same operations on a single node and an aggregate (`.total()`, `.render()`, `.validate()`).
- The tree depth is unbounded or dynamic — recursion beats hand-rolled levels.

## When NOT to use it
- The "tree" is always one or two levels deep — a simple list-of-lists or `Group { items: Item[] }` is clearer.
- Leaves and composites have meaningfully different operations — forcing a single interface hides the distinction and produces `NotImplementedError`-ridden Leaf classes.
- The hierarchy is flat in practice (you only ever have leaves) — Composite is overhead.

## Related patterns
- **Decorator** — also composes recursively, but Decorator wraps ONE object to add behavior; Composite assembles MANY objects of the same kind into a tree. Decorator chains are linear; Composite trees branch.
- **Iterator** — almost always paired with Composite to walk the tree (DFS/BFS).
- **Visitor** — adds new operations across a Composite tree without modifying its classes.
- **Chain of Responsibility** — Composite can serve as the structure a CoR traverses.

## Anti-patterns it resolves
- **Type-checking soup** — `if isinstance(x, Folder): ... else: ...` at every traversal site.
- **Duplicated recursion** — every operation reimplementing the walk; Composite owns the walk per operation, once.

## Real examples in your codebase
> _To be populated as you find them._
