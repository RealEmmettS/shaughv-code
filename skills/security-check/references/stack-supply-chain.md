# Stack Surface — Supply Chain (GitHub Actions, Dependencies, Docker)

Applies whenever the repo has CI (GitHub Actions), a dependency tree
(npm/pip/cargo), or Dockerfiles — e.g. workflows that deploy apps or publish
releases on push to main. Supply chain is where "we got owned" doesn't require
any bug in OUR code. Per the precedents: most Actions findings are NOT
exploitable — require a concrete untrusted-input trigger path before reporting.

## Surface map

| Where | What can go wrong |
|---|---|
| Workflow triggers | `pull_request_target` / `workflow_run` running attacker PR code with secrets |
| Script injection | `${{ github.event.* }}` interpolated into `run:` blocks |
| Action pinning | third-party actions at mutable tags (`@v3`) vs SHA pins |
| Workflow permissions | default `GITHUB_TOKEN` write-all; secrets passed to forked-PR contexts |
| npm | postinstall scripts; typosquats; lockfile absent or bypassed in CI (`npm install` vs `npm ci`) |
| pip / cargo | unpinned requirements; `--index-url` overrides (dependency confusion); build.rs in obscure crates |
| Docker | `FROM x:latest`; ADD from URLs; secrets via ARG; no digest pins |
| Release artifacts | who/what can publish (a repo that auto-releases on version bump is the classic case) |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| C1 | dangerous triggers | `rg -n "pull_request_target|workflow_run" -g '.github/workflows/*'` |
| C2 | event-data script injection | `rg -n "\$\{\{\s*github\.event\.(issue|pull_request|comment|head_commit|commits|review)[^}]*\}\}" -g '.github/workflows/*'` — hits inside `run:` blocks are the real ones |
| C3 | unpinned third-party actions | `rg -n "uses:\s*(?!actions/|github/|azure/|microsoft/)[^@]+@(v?\d|main|master|latest)" -g '.github/workflows/*'` |
| C4 | token permissions | `rg -n "permissions:" -g '.github/workflows/*'` — absent = default; check repo-level default |
| C5 | secrets into PR contexts | `rg -n "secrets\." -g '.github/workflows/*'` cross-checked against C1 triggers |
| C6 | npm install scripts | `rg -n "\"(pre|post)?install\"\s*:" -g 'package.json' -g '!node_modules'` |
| C7 | lockfile discipline | lockfile present per manifest? CI uses `npm ci` / `--frozen-lockfile`? `rg -n "npm (install|i)\b|pip install (?!-r)" -g '.github/workflows/*' -g 'Dockerfile*'` |
| C8 | index overrides | `rg -in "(--index-url|--extra-index-url|registry\s*=|replace-with)" -g '*.{txt,toml,npmrc,cfg}'` |
| C9 | docker pinning | `rg -n "^FROM .*(latest|^FROM [^:@]+$)|^ADD https?://" -g 'Dockerfile*'` |
| C10 | new/odd dependencies | in Mode B: any manifest diff line adding a package — run the new-package check below |

## Checklist

1. **Triggers first** (C1): `pull_request_target` with a checkout of
   `github.event.pull_request.head.sha` (or head ref) and ANY secret/`write`
   permission in scope = `supply_chain` CRITICAL-track — attacker PR code
   runs with your secrets. Plain `pull_request` from forks gets no secrets =
   fine. Per precedent 7, confirm the concrete path: trigger + checkout of
   attacker code + secret/permission in the same job.
2. **Script injection** (C2): `${{ github.event.pull_request.title }}` inside
   `run:` is shell injection by PR title = `supply_chain` HIGH on any
   public-or-forkable repo. Fix: route through `env:` then quote `"$VAR"`.
3. **Pinning** (C3): third-party actions at mutable refs = the action author
   (or their attacker) can rewrite your CI. SHA-pin third-party; tag-pin is
   acceptable for `actions/`, `azure/`, `microsoft/` (note as posture).
   Same logic for reusable workflows (`uses: org/repo/.github/...@main`).
4. **Token scope** (C4): workflows that only build/test should declare
   `permissions: contents: read`. Missing block + release-capable repo =
   hardening note; missing + C1/C2 finding = bundled into that finding's
   blast radius.
5. **Dependency hygiene** (C6–C8): lockfile missing, or CI installing
   without it = `supply_chain` MEDIUM (unpinned transitive code execution at
   build time). `--extra-index-url` mixing public+private indexes =
   dependency-confusion = MEDIUM (HIGH if private package names are
   guessable/public). New-package check (Mode B, C10): name a typosquat of
   something popular? weekly downloads / age / repo link sane? postinstall
   script present (C6)? Maintainer count = 1 and package = auth-adjacent?
   Any two of those = flag for human review before merge.
6. **Docker** (C9): `FROM image:latest` or tag-only = non-reproducible +
   silently mutable base = MEDIUM posture finding; digest pins
   (`@sha256:`) = good. `ADD https://...` = unverified remote code = HIGH if
   it lands in PATH/build steps. Build `ARG` secrets → `stack-azure-platform.md` A9.
7. **CVE scanners** (Phase 3 of the audit playbook): `npm audit`,
   `pip-audit`, `cargo audit` outputs are LEAD LISTS — reachability triage
   before any becomes a finding (hard exclusion 10 covers unreachable ones;
   they live in the dependency appendix).
8. **Release paths**: who can cause an artifact users install? In an
   auto-release repo, push-to-main = released-to-every-consumer — branch
   protection on main is the control; its absence is `config_insecure`
   (verify via repo settings when `gh` is available; otherwise posture note).

## Example

```yaml
# BAD — attacker PR title executes in your shell, with secrets in env
on: pull_request_target
jobs:
  greet:
    steps:
      - run: echo "Thanks for ${{ github.event.pull_request.title }}!"
        env: { SLACK_TOKEN: ${{ secrets.SLACK_TOKEN }} }

# GOOD — data flows through env, quoted; no secrets in PR-triggered jobs
on: pull_request
jobs:
  greet:
    permissions: { contents: read }
    steps:
      - env: { TITLE: ${{ github.event.pull_request.title }} }
        run: echo "Thanks for $TITLE!"
```

## False-positive notes

- `${{ }}` in `with:`/`env:` blocks (not `run:`) — data position, not shell —
  safe unless the receiving action shells it out (then it's that action's C3 problem).
- Private-repo-only workflows with no fork PRs possible: C1/C2 severity drops
  (the "attacker" is a teammate) — report as hardening unless external
  contributors exist.
- `dependabot`/`renovate` config — posture positive; don't flag automation PRs
  as supply-chain risk.
- Dev-dependency CVEs (vitest, eslint plugins) — appendix, not findings
  (build-time-only, not shipped).
- First-party actions (`actions/checkout@v4`) at tags — accepted practice; note only.
