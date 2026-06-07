# Bridge

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/bridge](https://refactoring.guru/design-patterns/bridge)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Decouple an abstraction from its implementation so the two can vary independently. Bridge replaces a 2-D inheritance explosion (M abstractions × N implementations) with composition (M + N).

## Problem
You have a class hierarchy that varies along two independent axes. Classic example: shapes (Circle, Square) × renderers (Vector, Raster). If you subclass naïvely you get `VectorCircle`, `RasterCircle`, `VectorSquare`, `RasterSquare` — and every new shape or renderer doubles the subclass count. The two dimensions are tangled in one inheritance tree. Bridge breaks them apart: the shape *has-a* renderer instead of *being-a* particular shape+renderer combo. Add a new renderer → one class. Add a new shape → one class.

## Structure
```
Abstraction ──has──> Implementor (interface)
    ^                     ^
    │                     │
RefinedAbstraction   ConcreteImplementorA / B
```
- **Abstraction** — high-level control; defines the interface clients use; holds a reference to an Implementor.
- **RefinedAbstraction** — variants of the abstraction.
- **Implementor** — interface for the implementation side (often lower-level primitives).
- **ConcreteImplementor** — actual platform/driver/backend.

## Code example — Python
```python
from typing import Protocol

class Renderer(Protocol):  # Implementor
    def render_circle(self, x: float, y: float, r: float) -> str: ...

class VectorRenderer:  # ConcreteImplementor
    def render_circle(self, x, y, r):
        return f"<circle cx='{x}' cy='{y}' r='{r}'/>"

class RasterRenderer:  # ConcreteImplementor
    def render_circle(self, x, y, r):
        return f"pixels(circle@{x},{y} r={r})"

class Shape:  # Abstraction
    def __init__(self, renderer: Renderer) -> None:
        self.renderer = renderer
    def draw(self) -> str: ...

class Circle(Shape):  # RefinedAbstraction
    def __init__(self, renderer, x, y, r):
        super().__init__(renderer)
        self.x, self.y, self.r = x, y, r
    def draw(self) -> str:
        return self.renderer.render_circle(self.x, self.y, self.r)

print(Circle(VectorRenderer(), 0, 0, 5).draw())
print(Circle(RasterRenderer(), 0, 0, 5).draw())
```

## Code example — TypeScript
```typescript
interface Renderer { renderCircle(x: number, y: number, r: number): string; }

class VectorRenderer implements Renderer {
  renderCircle(x: number, y: number, r: number) {
    return `<circle cx='${x}' cy='${y}' r='${r}'/>`;
  }
}
class RasterRenderer implements Renderer {
  renderCircle(x: number, y: number, r: number) {
    return `pixels(circle@${x},${y} r=${r})`;
  }
}

abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
}

class Circle extends Shape {
  constructor(renderer: Renderer, private x: number, private y: number, private r: number) {
    super(renderer);
  }
  draw() { return this.renderer.renderCircle(this.x, this.y, this.r); }
}

console.log(new Circle(new VectorRenderer(), 0, 0, 5).draw());
console.log(new Circle(new RasterRenderer(), 0, 0, 5).draw());
```

## SQL / data analogue
**Separating the connection/driver from the query interface.** SQLAlchemy is the canonical example: the high-level ORM (Abstraction) sits on top of Core/Dialect (Implementor) which sits on top of DBAPI drivers (ConcreteImplementor: pyodbc, psycopg2, pymssql). You can swap drivers — or jump between Azure SQL and Postgres — without rewriting query objects. Same pattern shows up in any ETL framework where pipeline definitions are decoupled from execution engines (Spark vs DuckDB vs Pandas).

## When to use it
- You can see two orthogonal dimensions of variation up front (shape × renderer, command × transport, report × output format).
- You need to swap implementations at runtime (driver selection, feature flag).
- You want to grow each dimension independently without combinatorial subclassing.

## When NOT to use it
- There's only one implementation today and no realistic second one — YAGNI; use a plain class.
- The two "dimensions" turn out to be correlated (you never mix-and-match) — the bridge is overhead with no payoff.
- You're trying to retrofit it onto incompatible existing interfaces — that's Adapter's job.

## Related patterns
- **Adapter** — Bridge is designed up front for two dimensions of variation; Adapter is retrofit to make incompatible interfaces work. Bridge separates concerns by design; Adapter glues things together after the fact.
- **Strategy** — looks identical in code (object holds another object), but Strategy is behavioral (swap an algorithm) and lives below a single abstraction. Bridge is structural and explicitly carves the hierarchy in two.
- **Abstract Factory** — often used to construct matching Abstraction + Implementor pairs.

## Anti-patterns it resolves
- **Inheritance explosion** — `M × N` subclasses collapsed to `M + N` classes.
- **Coupled hierarchies** — shapes that "know" how they're rendered, queries that "know" which driver they target.

## Real examples in our codebase
> _To be populated as the team finds them._
