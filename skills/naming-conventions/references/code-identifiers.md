# Code Identifiers — Variables, Functions, Classes, Constants

> **Scope:** Naming for code-level identifiers — variables, parameters, locals, functions, methods, procedures, classes, types, constants, booleans, loop indexes, enumerated types. Across Python, TypeScript / JavaScript, C# / .NET, SQL, Bicep, Bash, and KQL.
>
> **Authoritative source:** Steve McConnell, *Code Complete*, 2nd Edition (Microsoft Press, 2004). Chapters 6 ("Working Classes"), 7 ("High-Quality Routines"), and 11 ("The Power of Variable Names").
>
> Verbatim quotes below are page-cited; verify before quoting in a PR review or design discussion.

## The one rule for variable names

> *"The most important consideration in naming a variable is that the name fully and accurately describe the entity the variable represents."*
> — McConnell, *Code Complete* 2nd ed., p. 260, KEY POINT

The technique that falls out of this rule: **state in words what the variable represents — that statement is often the best name.**

| Bad | Good |
|---|---|
| `x = x - xx; xxx = fido + SalesTax( fido );` | `balance = balance - lastPayment; monthlyTotal = newPurchases + SalesTax( newPurchases );` |
| `r` (for the current interest rate) | `interestRate` (or `rate` in tight scope) |
| `n` (for number of team members) | `numTeamMembers` or `teamMemberCount` |

A name that describes the entity cannot be confused with something else and is easy to remember because the name *is* the concept.

## Language-idiom table (defer to the host language)

SHAUGHV repos defer to host-language idioms. The skill does not impose a house style that contradicts community norms — those exist for good reasons and your linter already knows them.

| Language | Vars / locals | Functions / methods | Classes / types | Constants | Files |
|---|---|---|---|---|---|
| **Python** (PEP 8 / Ruff) | `snake_case` | `snake_case` | `PascalCase` | `UPPER_SNAKE` | `snake_case.py` |
| **TypeScript / JavaScript** (Prettier / ESLint) | `camelCase` | `camelCase` | `PascalCase` | `UPPER_SNAKE` or `PascalCase` | `camelCase.ts` (modules); `PascalCase.tsx` (React components) |
| **C# / .NET** | `camelCase` (locals), `PascalCase` (properties / public fields) | `PascalCase` | `PascalCase` | `PascalCase` | `PascalCase.cs` |
| **SQL** | n/a | n/a | n/a | `UPPER_SNAKE` | **`snake_case` for ALL columns and tables** — PostgREST, OData, Hasura, Data API Builder, Supabase auto-generated APIs, and most other auto-API layers silently break on PascalCase or spaces. This is universal SQL wisdom, not a SHAUGHV preference. |
| **Bicep** | `camelCase` | n/a | `PascalCase` | n/a | `camelCase.bicep` |
| **Bash / shell** | `lower_snake` | `lower_snake` | n/a | `UPPER_SNAKE` | `kebab-case.sh` |
| **KQL** (Kusto) | `snake_case` | `snake_case` | `PascalCase` | n/a | n/a |

When in doubt, run the project's linter — Ruff for Python, ESLint + Prettier for TS/JS, dotnet-format for .NET. The linter is the source of truth at the moment of writing.

## Optimum name length

> *"Gorla, Benander, and Benander found that the effort required to debug a program was minimized when variables had names that averaged 10 to 16 characters (1990). Programs with names averaging 8 to 20 characters were almost as easy to debug."*
> — McConnell, p. 262, "Hard Data"

**Heads-up on a common misattribution:** This study is **Gorla, Benander, and Benander 1990** — not Shneiderman/Mayer. Shneiderman 1980 is McConnell's source for a different point: scope-of-variable governs length (longer for globals, shorter for locals and loop indexes; W. J. Hansen via Shneiderman).

The 10–16 char range is a **sanity-check guideline**, not a mechanical rule. McConnell's Goldilocks examples (Table 11-2, p. 262):

| Too short | Too long | Just right |
|---|---|---|
| `n`, `np`, `ntm` | `numberOfPeopleOnTheUsOlympicTeam` | `numTeamMembers`, `teamMemberCount`, `numSeatsInStadium`, `seatCount`, `teamPointsMax`, `pointsRecord` |

Loop indexes and tight-scope locals stay short (`i`, `j`, `k`, `temp` — though `temp` has its own warning, see below). Globals and rarely-used variables earn their length.

## Strong verb + object — for procedures

> *"To name a procedure, use a strong verb followed by an object. A procedure with functional cohesion usually performs an operation on an object… `PrintDocument()`, `CalcMonthlyRevenues()`, `CheckOrderInfo()`, and `RepaginateDocument()` are samples of good procedure names."*
> — McConnell, p. 172

In OO languages, **drop the object from the procedure name** because the call already supplies it: `document.Print()`, not `document.PrintDocument()`. Otherwise derived classes produce nonsense (`check.PrintDocument()` reads as "print the document representation of the check," which is probably not what the method does).

## Return-value description — for functions

> *"To name a function, use a description of the return value. A function returns a value, and the function should be named for the value it returns. For example, `cos()`, `customerId.Next()`, `printer.IsReady()`, and `pen.CurrentColor()` are all good function names that indicate precisely what the functions return."*
> — McConnell, p. 172

A function and a procedure differ in shape: function returns a value (name it after the value); procedure performs an action (name it as verb + object).

## Avoid wishy-washy verbs

McConnell's anti-pattern list (p. 171, verbatim):

> *"Routine names like `HandleCalculation()`, `PerformServices()`, `OutputUser()`, `ProcessInput()`, and `DealWithOutput()` don't tell you what the routines do."*

`handle` is allowed in the technical event-handling sense (`onClick`, `handleAuthCallback`). Everywhere else, replace with a strong verb that names the action.

Wishy-washy *names* are often a symptom of wishy-washy *purpose* — when the agent can't think of a strong verb, the routine itself may need to be reshaped, not just renamed.

## Don't differentiate by number

> *"Avoid `file1` and `file2`, or `total1` and `total2`."*
> — McConnell, p. 171

If the numerals are meaningful, use an array. McConnell's CODING HORROR on p. 171: a developer chopped a giant function into `Part1`, `Part2`, … `OutputUser`, `OutputUser1`, `OutputUser2` — the numerals communicate nothing.

## Use opposites precisely

| Pair | Pair |
|---|---|
| `add` / `remove` | `next` / `previous` |
| `begin` / `end` | `old` / `new` |
| `create` / `destroy` | `open` / `close` (or `opened` / `closed`) |
| `first` / `last` | `show` / `hide` (or `visible` / `invisible`) |
| `get` / `put` | `source` / `target` (or `source` / `destination`) |
| `get` / `set` | `start` / `stop` |
| `increment` / `decrement` | `up` / `down` |
| `insert` / `delete` | `lock` / `unlock` (or `locked` / `unlocked`) |
| `min` / `max` | `add` / `remove` |

Mixing pairs (`open` paired with `terminate`, or `FileOpen()` paired with `_lclose()`) is confusing and asymmetric — readers expect the opposite to be the symmetric partner.

## Class names — describe one ADT

> *"Each class should implement one and only one ADT. If you find a class implementing more than one ADT, or if you can't determine what ADT the class implements, it's time to reorganize the class into one or more well-defined ADTs."*
> — McConnell, p. 135

Class names are **noun phrases** describing a coherent abstract data type — `CustomerAccount`, `RevenueProjection`, `BidLifecycle`. Use problem-domain terms (`Employee` over `Record1`, `CustomerAccount` over `DataObject`).

McConnell's most-relevant warnings on Ch. 6 §6.2 (p. 155):

- **Avoid classes named after verbs.** *"A class that has only behavior but no data is generally not really a class. Consider turning a class like `DatabaseInitialization()` or `StringBuilder()` into a routine on some other class."* (p. 155)
- **Avoid god classes.** *"Avoid creating omniscient classes that are all-knowing and all-powerful. If a class spends its time retrieving data from other classes using `Get()` and `Set()` routines (that is, digging into their business and telling them what to do), ask whether that functionality might better be organized into those other classes rather than into the god class (Riel 1996)."* (p. 155)

### A note on the "no Manager / Handler / Processor suffix" rule

This rule is **Robert C. Martin's** (in *Clean Code*), **not McConnell's**. It is cited here as a useful heuristic: a class whose name ends in `-er` should be interrogated, because it often violates single-responsibility (`UserManager` usually wants to be `User` itself, plus a few focused services).

But if you cite a source for the rule, **cite Martin, not McConnell**. McConnell's directly-relevant guidance is the verbs-as-classes warning and the god-class warning above.

## Booleans — positive forms

| Good | Bad | Why bad |
|---|---|---|
| `isDone` | `notDone` | Compounds under negation: `if (!notDone)` is a parse-failure in the head |
| `hasError` | `noError` | Same |
| `isVisible` | `isInvisible` | Same |
| `isFound` | `notFound` | Same |

Canonical boolean names that read well in conditionals (p. 268):

- `done`, `error`, `found`, `success` (or `ok`)
- `if (dataReady) …`, `if (validationFailed) …`

The `is`-prefix convention works but makes simple conditionals slightly less readable. McConnell's preference (p. 269): *"`if (found)`"* over *"`if (isFound)`"* when context makes it unambiguous.

## Status variables — never named `flag`

> *"Think of a better name than `flag` for status variables. A flag should never have `flag` in its name."*
> — McConnell, p. 266

`statusFlag` carries no information. Replace with what the flag represents: `dataReady`, `recordType`, `paymentStatus`. Use enumerated types or named constants for the values.

## Temporary variables — a warning sign

> *"Be leery of `temporary` variables… In general, temporary variables are a sign that the programmer does not yet fully understand the problem."*
> — McConnell, p. 267

Rename them. `temp = sqrt(b*b - 4*a*c)` → `discriminant = sqrt(b*b - 4*a*c)`.

## Computed-value qualifiers — put them at the end

> Place qualifiers (`Total`, `Sum`, `Average`, `Max`, `Min`, `Record`, `String`, `Pointer`) at the **end** of the name.
> — McConnell, p. 263

```
revenueTotal     ✅  groups visually with revenueAverage, revenueMax
totalRevenue     ❌  groups with totalExpenses, totalLabor — different axis
```

`Num` is ambiguous (`numCustomers` = count; `customerNum` = index). McConnell's recommendation: use `Count` or `Total` for counts and `Index` for indexes, and avoid `Num` entirely.

## Enumerated types — group with a prefix

```
Color.Color_Red, Color.Color_Green, Color.Color_Blue    // C-style; group prefix
Planet.Planet_Earth, Planet.Planet_Mars                  // same
```

In languages where the enum class itself is the namespace (`Color.Red` already reads cleanly), drop the redundant prefix.

## Named constants — name what they represent

> *"`FIVE` is a bad name for a constant (regardless of whether the value it represents is 5.0). `CYCLES_NEEDED` is a good name… `BAKERS_DOZEN` is a poor constant name; `DONUTS_MAX` is a good constant name."*
> — McConnell, p. 270

The constant's name is for the **meaning**, not the **value**. If the value changes (5 → 6), the name `FIVE` lies; the name `CYCLES_NEEDED` still reads correctly.

## The 11 kinds of names to avoid

McConnell, §11.7, pp. 285–287:

1. **Misleading abbreviations.** (`FALSE` as a Fig and Almond Season abbreviation is McConnell's joke example.)
2. **Names with similar meanings** (the swap test): if you could swap two variable names without changing the program's correctness, both names are wrong. Examples: `input` / `inputValue`, `recordNum` / `numRecords`, `fileNumber` / `fileIndex`.
3. **Names with insufficient psychological distance** (the two-letter rule): `clientRecs` vs `clientReps` differs by one barely-noticeable letter. Use `clientRecords` and `clientReports`. *"Have at least two-letter differences between names, or put the differences at the beginning or at the end."* (p. 285)
4. **Names that sound similar** (the telephone test): McConnell's half-page dramatized phone call about XP's "Goal Donor" vs "Gold Owner" (p. 286).
5. **Numerals in names** (`file1`, `file2`, `total1`, `total2`). If meaningful, use an array.
6. **Misspelled words** (`hilite` for `highlight`).
7. **Commonly misspelled English words** (`absense`, `acummulate`, `calender`, `concieve`, `defferred`, `definate`, `independance`, `occassionally`, `prefered`, `reciept`, `superseed`).
8. **Differentiation by capitalization alone** (`frd`, `FRD`, `Frd` as three different concepts is arbitrary and unmemorable).
9. **Multiple natural languages.** Pick one. Within English, pick `color` or `colour`, `check` or `cheque`.
10. **Names of standard library types, variables, or routines.**
11. **Names totally unrelated to what the variable represents** (`margaret`, `pookie`, your favorite beer's name).
12. **Hard-to-read characters** (`l` vs `1`, `I` vs `1`, `O` vs `0`, `2` vs `Z`, `S` vs `5`, `G` vs `6`, `;` vs `:`, `.` vs `,`). The cost is real — Weinberg's 1970s anecdote about a FORTRAN `FORMAT` comma-vs-period that *"lost a space probe — to the tune of $1.6 billion"* (McConnell p. 286).

## Hungarian notation — don't

> *"The best known scheme for standardizing prefixes is the Hungarian naming convention… Although the Hungarian naming convention is no longer in widespread use, the basic idea of standardizing on terse, precise abbreviations continues to have value."*
> — McConnell, p. 279

McConnell prefers **semantic prefixes** (he calls them UDT + semantic prefix), not type-based ones:

| Semantic prefix | Meaning |
|---|---|
| `c` | count |
| `first` | first item |
| `g` | global |
| `i` | index |
| `last` | last item |
| `lim` | non-inclusive upper bound |
| `m` | class-level / member |
| `max`, `min` | maximum, minimum |
| `p` | pointer |

Modern IDEs render type-based Hungarian obsolete — the IDE shows the type on hover. SHAUGHV default: **trust the type system; skip prefixes entirely** unless the prefix carries information the type system can't (e.g., `min` vs `max` distinguishing two `int`s).

## Read-time bias — the master argument

> *"Code is read far more times than it is written. Be sure that the names you choose favor read-time convenience over write-time convenience."*
> — McConnell, p. 285, KEY POINT (and again as a chapter closer on p. 289)

And the related principle (p. 259):

> *"Unlike the dog and its name, which are different entities, a variable and a variable's name are essentially the same thing. Consequently, the goodness or badness of a variable is largely determined by its name."*

These two principles settle every close call. When choosing between a short write-now name and a clear read-later name, choose clear-and-read-later.

## Quick self-review test

McConnell's recommended habit (p. 285):

> *"Read code of your own that you haven't seen for at least six months and notice where you have to work to understand what the names mean. Resolve to change the practices that cause such confusion."*

For agents: after writing a function with a freshly-coined name, ask yourself *"if I came back to this in six months, would I know what this name means without reading the body?"* If no, rename.

## Pronounceability — the telephone test

> *"Apply the telephone test — if you can't read your code to someone over the phone, rename your variables to be more distinctive (Kernighan and Plauger 1978)."*
> — McConnell, p. 283

`xPos` beats `xPstn`. `needsComp` beats `ndsCmptg`. McConnell explicitly rejects phonetic abbreviations (`sk8ing`, `b4`, `xqt`): *"This seems too much like asking people to figure out personalized license plates to me, and I don't recommend it."* (p. 283)

## Distinguishability — psychological distance

> *"Psychological distance can be defined as the ease with which two items can be differentiated."*
> — McConnell, p. 556 (Ch. 23 §23.4)

| Low distance (bad) | High distance (good) |
|---|---|
| `claims1` / `claims2` | `productClaims` / `competitorClaims` |
| `product` / `products` (single letter) | `singleProduct` / `productList` |
| `frd` (could be `fired` or `full revenue disbursal`) | `dismissed` / `revenueTotal` |

Two-letter difference minimum. Differences at the start or end, not buried in the middle.

## Conventions exist for six reasons (the high-altitude case)

McConnell, p. 270–271:

1. **They let you take more for granted.** One global decision instead of many local ones.
2. **They help you transfer knowledge across projects.** Similar names → easier understanding of unfamiliar variables.
3. **They help you learn code more quickly on a new project.** No re-learning of personal styles.
4. **They reduce name proliferation.** Without conventions, `pointTotal` and `totalPoints` coexist for the same thing.
5. **They compensate for language weaknesses.** Emulate named constants, distinguish local / class / global, encode information the language can't.
6. **They emphasize relationships among related items.** `employeeAddress`, `employeePhone`, `employeeName` clearly group; `address`, `phone`, `name` do not.

> *"The key is that any convention at all is often better than no convention… The power of naming conventions doesn't come from the specific convention chosen but from the fact that a convention exists."*
> — McConnell, p. 271, KEY POINT

## Quick checklist when naming a code identifier

1. **Pick the host-language idiom** from the table above.
2. **Describe the entity** — state what it represents in words; that's often the name.
3. **Sanity-check the length** — 10–16 chars is the sweet spot for most variables; longer for globals; shorter for tight-scope locals.
4. **For procedures:** strong verb + object. For **functions:** return-value description. For **classes:** noun phrase, one ADT.
5. **Avoid the 11 anti-patterns** — especially numerals, similar-meanings, low psychological distance, and wishy-washy verbs.
6. **Boolean variables:** positive form, canonical names (`done`, `error`, `found`, `success`).
7. **No `temp`, no `flag`, no Hungarian type prefixes.**
8. **Run the linter** — Ruff / ESLint / dotnet-format. The linter encodes most of these rules already.

---

*Authoritative source: Steve McConnell, *Code Complete*, 2nd Edition, Microsoft Press, 2004. Page numbers cited inline; verify before quoting in a PR review or design discussion.*
