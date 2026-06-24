# Stack Surface — Rust

Applies when the stack includes Rust (service or tooling code). Rust kills
memory safety as a category (per the hard exclusions: do NOT report buffer
overflows/UAF in safe Rust), so the audit shifts to: `unsafe` blocks, injection
through the same universal sinks (SQL, shell, paths), panics in service code,
and the dependency tree.

## Surface map

| Where | What can go wrong |
|---|---|
| `unsafe` blocks | the only place memory safety re-enters; FFI boundaries |
| SQL (`sqlx`, `tiberius`, `diesel`) | `format!`-built queries beside macro-checked ones |
| Process spawning | `Command::new` with shell wrappers and dynamic args |
| Path handling | `Path::join` with user input (absolute-path replacement gotcha) |
| Panics in services | `.unwrap()`/`.expect()` on request-derived data = 500s; in handlers serving many = reliability finding only if it gates security logic |
| Secrets | `include_str!`/`env!` baking secrets into the binary at compile time |
| Serde | `deny_unknown_fields` absent on security-bearing configs; untagged enums on untrusted input |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| RS1 | unsafe inventory | `rg -n "unsafe\s*\{|unsafe fn" -trust` |
| RS2 | SQL string building | `rg -n "format!\(.{0,80}(SELECT|INSERT|UPDATE|DELETE|WHERE)" -i -trust` |
| RS3 | raw query APIs | `rg -n "sqlx::query\(|query_as\(|\.execute\(.*&str|simple_query" -trust` (vs `query!` macro / bind) |
| RS4 | shell spawning | `rg -n "Command::new\((\"sh\"|\"bash\"|\"cmd\"|\"powershell\")|\.arg\(.{0,40}(input|param|req|user)" -trust` |
| RS5 | path joins from input | `rg -n "\.join\(.{0,50}(input|param|name|req|file)" -trust` |
| RS6 | compile-time secrets | `rg -n "env!\(|include_str!\(.{0,60}(key|secret|token|\.env)" -i -trust` |
| RS7 | unwrap on external input | `rg -n "\.(unwrap|expect)\(" -trust` — triage only those on request/parse boundaries |
| RS8 | TLS bypass | `rg -n "danger_accept_invalid_certs\(true\)|DANGER" -trust` |

## Checklist

1. **Every RS1 hit gets read.** For each `unsafe` block: is there a `// SAFETY:`
   comment stating the invariant? Does the invariant actually hold under
   attacker-controlled lengths/indices? FFI: who owns the memory, who frees it?
   Unjustified or wrong invariants on input-reachable paths = `unsafe_rust`
   (severity by reachability). Absent SAFETY comments with plausible invariants:
   hardening note, not a finding.
2. **SQL** (RS2/RS3): `sqlx::query!` macro and `.bind()` parameterize — safe.
   `format!` interpolating runtime values into query text = `sql_injection`,
   same identifier-allow-list rule as the other stacks.
3. **Shell** (RS4): `Command::new("sh").arg("-c").arg(user_string)` =
   `command_injection`. Direct `Command::new(binary).args([...])` is safe
   unless the binary path itself is user-influenced.
4. **Paths** (RS5): Rust gotcha — `base.join(user_path)` REPLACES base when
   `user_path` is absolute. Require relative-component validation
   (`Path::components()` rejecting `ParentDir`/`RootDir`) or canonicalize +
   prefix check. Missing = `path_traversal`.
5. **Panics** (RS7): `.unwrap()` on parse of request data is a crash-on-demand;
   per the DoS exclusion this is NOT reportable as DoS — report only when the
   panic path bypasses a security decision (e.g. a failed authz parse that
   panics in a handler whose framework converts panics to 200-with-default).
   Otherwise: hardening appendix.
6. **Secrets** (RS6): `env!()` (compile-time) bakes the value INTO the binary —
   if the binary ships outside the team, that's `secret_exposure`. Runtime
   `std::env::var` is the correct pattern (and is trusted input per precedent).
7. **Dependencies**: run `cargo audit` (Phase 3); flag `git` dependencies
   pinned to branches (not revs) and build.rs in small/unknown crates —
   route to `stack-supply-chain.md`.

## Example

```rust
// BAD — absolute path replaces base; no component check
let requested = PathBuf::from(query.file_name);
let full = REPORTS_DIR.join(&requested);          // /etc/passwd wins
let body = std::fs::read(full)?;

// GOOD — reject non-normal components, then anchor
use std::path::Component;
let requested = Path::new(&query.file_name);
if requested.components().any(|c| !matches!(c, Component::Normal(_))) {
    return Err(StatusCode::BAD_REQUEST.into());
}
let full = REPORTS_DIR.join(requested);
debug_assert!(full.starts_with(&*REPORTS_DIR));
let body = std::fs::read(full)?;
```

## False-positive notes

- NEVER report buffer overflow / use-after-free / double-free in safe Rust
  (hard exclusion 3) — the compiler owns those.
- `unsafe` in well-known vendored crates or generated bindings (e.g.
  `bindgen` output) — note as surface, don't audit line-by-line unless the
  binding wraps attacker-reachable parsing.
- `.unwrap()` in tests, examples, build scripts — skip entirely.
- `lazy_static`/`once_cell` init panics at startup — config errors, not findings.
