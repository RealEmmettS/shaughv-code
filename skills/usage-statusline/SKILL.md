---
name: usage-statusline
description: Install and standardize Emmett's Claude Code usage status line — a two-row status line showing live 5-hour and weekly usage percentages with color-coded progress bars, plus a burn-rate estimate of how much time is left before the 5-hour limit is hit at the current pace (with a red/green trend indicator). Use this whenever the user wants to set up, install, reinstall, or standardize their Claude Code status line; show usage / rate-limit percentages in the status line; add a 5h or weekly usage bar, burn-rate, or "time left" / "time until reset" indicator; replicate this status line on a new machine; or verify, customize, troubleshoot, or uninstall it. The canonical, byte-identical script ships with this skill so every machine that has the plugin can reproduce the exact same status line on request. Requires Node.js ≥18; the live usage numbers appear only on Pro/Max subscription sessions.
metadata:
  runtime: node (zero dependencies)
  install-target: <CLAUDE_DIR>/statusline-usage.mjs (e.g. ~/.claude/)
  source-of-truth: scripts/statusline-usage.mjs (bundled, verbatim)
---

# Usage status line

Installs a Claude Code status line that renders two rows:

```
Opus · ctx 12% · $1.84 session
5h ▕██▎░░░░░░░▏ 23% ~2h45m left · resets 3:45p   ·   7d ▕████▏░░░░░▏ 41% · resets Mon
```

| Field | Meaning |
|---|---|
| `5h … %` | % of the **5-hour rolling limit** used (ground truth from `rate_limits.five_hour` on stdin — same number `/usage` shows). |
| `~Xh Ym left` | Locally computed burn-rate projection of when the 5h window hits 100% at the current pace. Color = **trend**: red = usage accelerating, green = easing off, plain = steady; **bold red <30 min** (urgency overrides trend). Hidden when idle. |
| `resets 3:45p` / `resets Mon` | When each window resets. |
| `7d … %` | % of the **weekly (7-day) limit** used. |
| `ctx 12%` · `$1.84 session` | Context-window fill and session cost. |

Bars shift color as a window fills: green `<50` → yellow `50–75` → orange `75–90` → red `90–95` → bold red `≥95`.

The percentages are **not estimates** — Claude Code hands them to the status line on stdin (`rate_limits`), derived from the API's rate-limit response headers. Only the "time left" projection is computed locally (burn-rate fit over a small rolling state file). Full design rationale and the algorithm are in [`references/build-guide.md`](references/build-guide.md).

## The bundled script is the source of truth

`scripts/statusline-usage.mjs` is the **canonical, byte-identical** program (Node ≥18, zero dependencies, with a built-in `--selftest`). "Standardized across the plugin" means: install *this* file rather than re-authoring it, so every machine renders the same status line. Don't hand-rewrite it — copy it.

## Install (recommended procedure)

> **Copy the script into `<CLAUDE_DIR>` — do not point `settings.json` at the plugin copy.** The plugin's cache path is version-stamped (changes on every update) and may be read-only, and the script writes a small state file next to itself. Installing into `~/.claude/` gives it a stable, writable home.

1. **Copy the canonical script** to `<CLAUDE_DIR>/statusline-usage.mjs` (usually `~/.claude/statusline-usage.mjs`). Source is this skill's `scripts/statusline-usage.mjs` (resolve its real path from `${CLAUDE_PLUGIN_ROOT}/skills/usage-statusline/scripts/statusline-usage.mjs`).
   - PowerShell: `Copy-Item "$env:CLAUDE_PLUGIN_ROOT/skills/usage-statusline/scripts/statusline-usage.mjs" "$env:USERPROFILE/.claude/statusline-usage.mjs" -Force`
   - bash: `cp "$CLAUDE_PLUGIN_ROOT/skills/usage-statusline/scripts/statusline-usage.mjs" ~/.claude/statusline-usage.mjs`
   - If `$CLAUDE_PLUGIN_ROOT` isn't set in the shell, copy from wherever this skill is installed.

2. **Merge this block into `<CLAUDE_DIR>/settings.json`** (user-level), preserving any existing keys. Use an **absolute path with forward slashes** — Node accepts `/` on Windows:
   ```json
   "statusLine": {
     "type": "command",
     "command": "node /ABSOLUTE/PATH/TO/.claude/statusline-usage.mjs",
     "padding": 0,
     "refreshInterval": 1
   }
   ```
   `refreshInterval: 1` is the most real-time; `2–5` looks identical with fewer Node spawns. (Note: a `statusLine` cannot be shipped by the plugin itself — Claude Code only reads it from `settings.json` — which is why this is a copy-and-wire skill, not an automatic plugin component.)

3. **Verify before going live:**
   ```sh
   node <CLAUDE_DIR>/statusline-usage.mjs --selftest    # expect: ALL PASS
   echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":12},"cost":{"total_cost_usd":1.84},"rate_limits":{"five_hour":{"used_percentage":23.5,"resets_at":9999999999},"seven_day":{"used_percentage":41.2,"resets_at":9999999999}}}' | node <CLAUDE_DIR>/statusline-usage.mjs
   ```
   On Windows PowerShell, pipe the JSON as a single-quoted string.

4. **Reload Claude Code** (restart the session). Once live, the `5h` / `7d` percentages should match the `/usage` panel exactly.

## Verify the live fields (optional, once per machine)

`rate_limits` is present **only on Pro/Max sessions, after the first API response**. To confirm your install actually receives it: create an empty `<CLAUDE_DIR>/statusline-debug` file (or set `STATUSLINE_DEBUG=1`), run one assistant turn, then check that `<CLAUDE_DIR>/statusline-stdin-sample.json` contains `rate_limits.five_hour` and `.seven_day`. Delete the debug file when done.

## Customize

Tunables are constants at the top of the script (`BAR_WIDTH`, `RED_SECONDS`, `refreshInterval` in settings, the `colorFor` thresholds, burn-rate half-lives, trend ratios, etc.). The shipped values *are* the standardized build — change them only for a deliberate personal variant, and note that editing the installed copy diverges it from the canonical one. See [`references/build-guide.md`](references/build-guide.md) §0 and §8 for the meaning of each.

## Runtime artifacts (leave them alone)

Next to the installed script: `statusline-usage-state.json` (rolling burn-rate history, auto-managed) and — only while debug capture is on — `statusline-stdin-sample.json`.

## Troubleshoot

| Symptom | Fix |
|---|---|
| Shows `warming up` / no `5h` % | `rate_limits` not yet sent — only on Pro/Max, after the first API response. API-key / Bedrock / Vertex sessions never get it. |
| No status line at all | Check `settings.json` path is absolute with `/`; run the `--selftest`; reload the session. |
| `node: command not found` | Install Node ≥18, or use an absolute path to the node binary in `command`. |
| `~time left` never appears | Expected when idle/steady — it only shows when actively burning toward the cap before the reset. |
| Percentages disagree with `/usage` | They shouldn't once warmed up; re-fetch by running an assistant turn. |

## Uninstall

Remove the `statusLine` block from `<CLAUDE_DIR>/settings.json` and delete `statusline-usage.mjs` + `statusline-usage-state.json` from `<CLAUDE_DIR>`. Reload.

## Limits

Node ≥18 required. Percentages are relative (0–100) — there's no public absolute token ceiling, so "tokens left" can't be shown. Per-model weekly windows and overage credits aren't in the status-line payload (see `references/build-guide.md` §8 for the experimental SDK alternative).
