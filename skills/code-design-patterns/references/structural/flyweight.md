# Flyweight

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/flyweight](https://refactoring.guru/design-patterns/flyweight)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Use sharing to support large numbers of fine-grained objects efficiently. Split each object's state into *intrinsic* state (shareable, immutable, stored once) and *extrinsic* state (unique per use, passed in by the client) so that thousands or millions of "objects" collapse to a small pool of shared instances.

## Problem
You're rendering a forest with a million trees. Each tree has a mesh, texture, and color (heavy, repeated) plus an `(x, y)` position (light, unique). Naïvely instantiating a million `Tree` objects each holding a copy of the mesh blows out memory. Flyweight stores one `TreeType` (mesh + texture + color) per species and passes the position in at draw time. Same idea for any domain with massive cardinality of objects sharing a small set of underlying values: characters in a document, particles in a simulation, cells in a spreadsheet, rows in a wide dataset with many low-cardinality columns.

## Structure
```
Client ──> FlyweightFactory ──> (cache of Flyweights)
                                      │
                                      ▼
                                 Flyweight (intrinsic state)
   Client passes ─── extrinsic state ───> Flyweight.operation()
```
- **Flyweight** — holds intrinsic, shareable state; methods accept extrinsic state as parameters.
- **FlyweightFactory** — caches and returns flyweights; ensures sharing.
- **Client** — owns the extrinsic state and supplies it on each call.

## Code example — Python
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class TreeType:  # Flyweight — intrinsic, shareable
    species: str
    texture: str
    color: str
    def draw(self, x: int, y: int) -> str:  # extrinsic state as params
        return f"{self.species}@({x},{y})"

class TreeTypeFactory:  # FlyweightFactory
    _cache: dict[tuple, TreeType] = {}
    @classmethod
    def get(cls, species: str, texture: str, color: str) -> TreeType:
        key = (species, texture, color)
        if key not in cls._cache:
            cls._cache[key] = TreeType(species, texture, color)
        return cls._cache[key]

# A million "trees" share ~3 TreeType instances
forest = [(TreeTypeFactory.get("oak", "bark.png", "green"), x, x % 7)
          for x in range(1_000_000)]
print(forest[0][0].draw(forest[0][1], forest[0][2]))
print(f"unique TreeTypes in memory: {len(TreeTypeFactory._cache)}")
```

## Code example — TypeScript
```typescript
class TreeType {  // Flyweight
  constructor(readonly species: string, readonly texture: string, readonly color: string) {}
  draw(x: number, y: number) { return `${this.species}@(${x},${y})`; }
}

class TreeTypeFactory {
  private static cache = new Map<string, TreeType>();
  static get(species: string, texture: string, color: string): TreeType {
    const key = `${species}|${texture}|${color}`;
    if (!this.cache.has(key)) this.cache.set(key, new TreeType(species, texture, color));
    return this.cache.get(key)!;
  }
  static size() { return this.cache.size; }
}

const forest: [TreeType, number, number][] = [];
for (let i = 0; i < 1_000_000; i++) {
  forest.push([TreeTypeFactory.get("oak", "bark.png", "green"), i, i % 7]);
}
console.log(forest[0][0].draw(forest[0][1], forest[0][2]));
console.log(`unique TreeTypes: ${TreeTypeFactory.size()}`);
```

## SQL / data analogue
**String interning and dimensional tables that deduplicate values.** A star schema is Flyweight at the database level: the fact table (`fact_cost_transaction`) carries only `customer_id`, `vendor_id`, `cost_code_id` integers, and the dim tables (`dim_customer`, `dim_vendor`) hold the heavy text/attributes once each. A million fact rows reference a few thousand dim rows. Python's `sys.intern()` and the `string` interning JVMs and CPython do automatically is the same pattern at the runtime level. Columnar databases (Parquet, columnstore indexes) push it further with dictionary encoding — each unique value stored once per column.

## When to use it
- You have a huge number of conceptually similar objects and memory is the bottleneck.
- Much of each object's state is duplicated and immutable.
- The extrinsic state can be cleanly separated from intrinsic and passed in at call time.

## When NOT to use it
- You don't have a memory problem — Flyweight trades complexity for bytes; without millions of objects it's overhead.
- The "shared" state is mutable — sharing then becomes a correctness hazard. Flyweights must be immutable.
- Splitting intrinsic/extrinsic feels forced — that's a sign the objects aren't really redundant.
- The pool itself grows unbounded (every "flyweight" is unique) — you just built a memory leak.

## Related patterns
- **Factory Method / Object Pool** — Flyweight Factory is a specific kind of object cache. Object Pool reuses *mutable* objects (DB connections); Flyweight shares *immutable* ones.
- **Singleton** — a Flyweight cache often produces what amounts to per-key singletons.
- **Composite** — Flyweight is commonly used to share leaf nodes in a Composite tree (think glyphs in a document tree).
- **State / Strategy** — these objects are good Flyweight candidates because they're typically stateless.

## Anti-patterns it resolves
- **Object bloat** — a million objects each carrying the same 200-byte texture path.
- **Memory leaks from copy-on-create** — caching by key replaces repeated allocation.

## Real examples in our codebase
> _To be populated as the team finds them._
