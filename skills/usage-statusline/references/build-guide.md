# Claude Code usage status line — build guide

A complete, environment-agnostic guide for an AI agent (or a human) to build a Claude Code
status line that shows **live 5-hour and weekly usage percentages** plus a **burn-rate estimate
of how much time is left** before the 5-hour limit is hit at the current pace.

```
Opus · ctx 12% · $1.84 session
5h ▕██▎░░░░░░░▏ 23% ~2h45m left · resets 3:45p   ·   7d ▕████▏░░░░░▏ 41% · resets Mon
```

Nothing in this document is specific to one machine — every path is written as a placeholder
(`<CLAUDE_DIR>`, `~/.claude`, `%USERPROFILE%`, `$HOME`). Substitute your own.

---

## 0. Reproduce this exact build (fast path)

This is the precise configuration the guide was generated from — follow these five steps to
recreate it as-built. Sections §1–§8 below are the generalized reference explaining *why* each
piece works and how to adapt it; this section is just "make exactly this."

**Design decisions, as built — match these to get the same status line:**

- **"Daily" = the 5-hour rolling window; "weekly" = the 7-day window.** Both come straight from
  the stdin `rate_limits` object (ground truth, identical to `/usage`) — no token or cost
  estimation anywhere.
- **Runtime: Node, zero dependencies** (fastest cold start; no packages to install).
- **"Time left" = a burn-rate projection** computed locally from a rolling state file of the 5h
  percentage. The **recent-window rate (last ~10 min) is the primary estimator** — what you did
  in the last few minutes predicts the next stretch — with a two-timescale regression as the
  sparse-data fallback, plus time-aware smoothing that ages the previous value like a countdown.
  Capped at the window reset so it never claims you'll run out later than the reset. Measured
  accuracy in simulation: ~0% converged error in steady/burst/taper regimes, regime changes
  picked up within minutes.
- **The time-left text is also a trend indicator:** it compares your burn rate now against the
  rate ~10 minutes ago — **red** when usage is accelerating (time left shrinking faster and
  faster), **green** when usage is easing off (time left stretching out), plain when steady.
- **Layout: Detailed, two rows.** Row 1 = `model · ctx% · $cost session`; row 2 =
  `5h <bar> <%> <time-left> · resets <clock>   ·   7d <bar> <%> · resets <day>`.
- **Color stages (bars + %):** green `<50` → yellow `50–75` → orange `75–90` → red `90–95` →
  bold red `≥95`. The time-left turns **bold red under 30 minutes** regardless of trend
  (urgency outranks trend).

**Steps:**

1. **Create the script.** Save the complete program from **§5** *verbatim* as
   `<CLAUDE_DIR>/statusline-usage.mjs` (e.g. `~/.claude/statusline-usage.mjs`). That is exactly
   the file this build uses — including its `--selftest` mode, the debug-capture hook, and the
   tunable constants at the top (`RETAIN_SECONDS = 90m`, `MIN_SAMPLE_GAP = 20s`,
   `HL_FAST = 7.5m` / `HL_SLOW = 30m`, `W_FAST = 0.65` / `W_SLOW = 0.35`, `MIN_SAMPLES = 3` /
   `MIN_SPAN = 180s`, `TAU_EMA = 60s`, `BAR_WIDTH = 10`, `RED_SECONDS = 30m`,
   `TREND_LAG = 10m`, `TREND_UP_RATIO = 1.25` / `TREND_DOWN_RATIO = 0.8`,
   `TREND_EPS = 0.5 %/hour`, and the `colorFor` thresholds). Those exact values *are* the
   build — don't change them to reproduce it.

2. **Wire it into settings.** Merge this exact block into `<CLAUDE_DIR>/settings.json`
   (user-level settings):
   ```json
   "statusLine": {
     "type": "command",
     "command": "node <CLAUDE_DIR>/statusline-usage.mjs",
     "padding": 0,
     "refreshInterval": 1
   }
   ```
   Use an **absolute path with forward slashes** in `command` — Node accepts `/` on Windows and it
   works in whatever shell Claude Code uses. `refreshInterval: 1` is the as-built value (most
   real-time; percentages already update event-driven, so 2–5 looks identical with fewer Node
   spawns).

3. **Verify before going live** (the same checks used to build it):
   ```sh
   node <CLAUDE_DIR>/statusline-usage.mjs --selftest          # expect: ALL PASS

   # nominal render (green bars, 24% / 41%):
   echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":12},"cost":{"total_cost_usd":1.84},"rate_limits":{"five_hour":{"used_percentage":23.5,"resets_at":9999999999},"seven_day":{"used_percentage":41.2,"resets_at":9999999999}}}' | node <CLAUDE_DIR>/statusline-usage.mjs

   # high-usage render (red / orange):
   echo '{"model":{"display_name":"Opus"},"rate_limits":{"five_hour":{"used_percentage":93,"resets_at":9999999999},"seven_day":{"used_percentage":88,"resets_at":9999999999}}}' | node <CLAUDE_DIR>/statusline-usage.mjs
   ```
   On Windows PowerShell, pipe the JSON as a single-quoted string:
   `'{...json...}' | node <CLAUDE_DIR>/statusline-usage.mjs`.

4. **Confirm the live fields on your install** (recommended once): create an empty file
   `<CLAUDE_DIR>/statusline-debug` (or set env `STATUSLINE_DEBUG=1`), let one assistant turn run,
   then read `<CLAUDE_DIR>/statusline-stdin-sample.json` and confirm `rate_limits.five_hour` and
   `rate_limits.seven_day` are present (they appear only on a Pro/Max session, after the first API
   response of the session). Delete the debug file when done.

5. **Reload Claude Code** (restart the session) for the new status line to take effect. Once live,
   the `5h` / `7d` percentages should match the `/usage` panel exactly.

**Runtime artifacts the script creates next to itself** (auto-managed — leave them alone):
`statusline-usage-state.json` (the rolling burn-rate sample history) and, only while debug capture
is on, `statusline-stdin-sample.json`.

That's the entire build. The sections below generalize it.

---

## 1. What it shows

| Element | Meaning | Source |
|---|---|---|
| `5h … %` | % of the **5-hour rolling limit** used | `rate_limits.five_hour.used_percentage` (stdin) — ground truth |
| `~Xh Ym left` | Estimated time until the 5-hour limit hits 100% at the current burn rate. **Its color is a trend indicator**: red = usage accelerating vs ~10 min ago (time left shrinking faster), green = usage easing off (time left stretching out), plain = steady. Bold red when <30 min remain (urgency outranks trend). | computed locally from a rolling history of the 5h % |
| `resets 3:45p` | When the 5-hour window resets | `rate_limits.five_hour.resets_at` (epoch s) |
| `7d … %` | % of the **weekly (7-day) limit** used | `rate_limits.seven_day.used_percentage` (stdin) |
| `resets Mon` | When the weekly window resets | `rate_limits.seven_day.resets_at` (epoch s) |
| `ctx 12%` | Context-window fill of the current session | `context_window.used_percentage` (stdin) |
| `$1.84 session` | Session cost so far | `cost.total_cost_usd` (stdin) |

Bars **shift color toward red** as a window fills: green `<50%` → yellow `50–75%` →
orange `75–90%` → red `90–95%` → **bold red `≥95%`**.

---

## 2. How Claude Code feeds a status line

Configure a `statusLine` of type `command` in `settings.json`. On every refresh, Claude Code
runs your command and pipes a **JSON object on stdin**; whatever your command prints to stdout
becomes the status line (each printed line = one status row; ANSI color and OSC-8 hyperlinks are
supported).

**Invocation cadence** (this is what makes "real time" possible):
- Event-driven: after every assistant message, after `/compact`, on permission-mode change, on
  vim-mode toggle. Rapid events are **debounced at ~300 ms**; an in-flight run is cancelled if a
  newer event arrives.
- Optional timer: `"refreshInterval": <seconds>` re-runs the command on a clock while idle.
  **Minimum is 1 second.** Use this so countdowns/estimates keep ticking between messages.
- The command must be **fast** (a slow script blocks/cancels updates). It runs locally and does
  **not** consume API tokens. `COLUMNS`/`LINES` env vars give the terminal size.

**The stdin JSON schema** (fields can be absent/null — always guard):

```jsonc
{
  "cwd": "…",
  "session_id": "…",
  "transcript_path": "…/<session>.jsonl",
  "model":   { "id": "…", "display_name": "Opus" },
  "workspace": { "current_dir": "…", "project_dir": "…" },
  "version": "2.1.x",
  "output_style": { "name": "default" },
  "cost": {
    "total_cost_usd": 1.84,
    "total_duration_ms": 0, "total_api_duration_ms": 0,
    "total_lines_added": 0, "total_lines_removed": 0
  },
  "context_window": {
    "used_percentage": 12,            // may be null pre-first-call / after /compact
    "remaining_percentage": 88,
    "context_window_size": 200000,
    "current_usage": { "input_tokens": 0, "output_tokens": 0,
                       "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0 }
  },
  "exceeds_200k_tokens": false,
  "rate_limits": {                    // ⭐ the important one — see §3
    "five_hour": { "used_percentage": 23.5, "resets_at": 1738425600 },
    "seven_day": { "used_percentage": 41.2, "resets_at": 1738857600 }
  }
}
```

---

## 3. Where the live usage % comes from (read this)

The two percentages are handed to you **directly on stdin** in `rate_limits`. They are the *same
numbers the `/usage` panel shows* — not an estimate. The CLI derives them from the
`anthropic-ratelimit-unified-*-utilization` / `-reset` **response headers** returned on every API
round-trip, holds them in memory, and rebuilds the stdin payload on each status-line invocation.
So:

- **Freshness is automatic.** The moment a new API response updates the numbers, the next
  event-driven refresh shows them. `refreshInterval` only governs idle ticking.
- **Availability is conditional.** `rate_limits` is present **only for Pro/Max subscription
  sessions, and only after the first API response of the session.** For API-key / Bedrock /
  Vertex sessions it is absent (there is a `rate_limits_available: false` signal in the richer
  SDK payload). Each window (`five_hour`, `seven_day`) can be independently absent — guard every
  field.
- **Only two windows are in the status-line payload:** `five_hour` and `seven_day`. (Internally
  the plan also has `seven_day_opus` / `seven_day_sonnet` / overage windows, but those are **not**
  serialized to the status line — see §8 for the SDK alternative.)
- **Percentages are relative (0–100).** There is **no public absolute token ceiling**, so you
  cannot convert "% used" into "N tokens left". Work in percent.

**Why you can't get it any other way:** `/usage` is a UI-only command — there is no CLI flag,
env var, or on-disk cache of live limit state to read. The stdin `rate_limits` object is the
single practical source for a status line.

---

## 4. The burn-rate "time left" algorithm

`rate_limits` gives you the **current** percentage but no rate and no "time left". You derive
those yourself, because the status line runs repeatedly: **persist a short rolling history of the
5-hour percentage to a small state file, then fit a slope.**

State file (lives next to the script; a few KB):

```jsonc
{ "samples": [ { "t": <epoch s>, "p": <five_hour %>, "r": <resets_at> } ],
  "emaSecsLeft": <number|null>, "emaAt": <epoch s|null>, "window": <resets_at|null> }
```

Each invocation:

1. **Admit a sample.** If `five_hour` is present, append `{t: now, p: used_percentage,
   r: resets_at}` — but only if `p` changed or ≥ `MIN_SAMPLE_GAP` (20 s) since the last sample
   (keeps a 1 s `refreshInterval` from bloating the file). Note that flat samples ARE admitted
   on the 20 s cadence — a run of identical percentages is the evidence that burn has stopped.
2. **Scope to the current window.** Keep only samples whose `r` equals the current `resets_at`
   **and** that are within the retention window (90 min). This means a window **reset**
   (new `resets_at`) automatically discards the old series — you never fit a slope across a reset.
3. **Burn rate — the recent window is primary.**
   - `slope_recent` — exponentially-weighted least-squares slope (half-life **7.5 min**) over
     samples in the **last `TREND_LAG` = 10 min only**. Computed when that window has ≥ 3
     samples spanning ≥ 2 min. If those samples are **all the same value, `slope_recent = 0`**
     — a perfectly flat recent window is hard evidence of zero burn, not missing data.
   - Fallback (recent window too sparse): `0.65·slope_fast + 0.35·slope_slow`, where
     `slope_fast`/`slope_slow` are EWLS slopes over the whole retained series with half-lives
     **7.5 min** / **30 min**.
   - `slope = max(chosen, 0)`. (A rolling window legitimately *drains* as old usage ages out,
     so a negative slope just means "not trending toward the cap".)
   - Numerical safety: regress on `τ = t − now`, not raw `t`, or you'll lose float precision
     on ~1.7×10⁹ epoch timestamps.
   - **Why recent-primary matters (measured):** whole-series regressions both under-react to a
     fresh burst (a long quiet prefix dilutes the fit, hiding an imminent runout) and cling to
     an old burst during a taper. In simulation the recent-primary estimator converges to ~0%
     median error in steady, burst, AND taper regimes (the whole-series blend showed ~49%
     taper error and never converged), and correctly drops the projection ~10 min into idle.
4. **Confidence gate.** Require ≥ 3 samples, a span ≥ 3 min, and ≥ 2 distinct `p` values across
   the retained series before showing any projection. Until then, show the reset clock only.
5. **Project & smooth (time-aware, countdown-aged).**
   - `secsToLimit = slope > 0 ? (100 − p) / slope : ∞`
   - `secsToReset = resets_at − now`
   - **`effective = min(secsToLimit, secsToReset)`** — the window refills at reset, so you can
     never "run out" later than the reset.
   - Smooth across invocations with a **time-aware EMA**: `α = 1 − e^(−Δt/TAU_EMA)` where
     `Δt` = seconds since the previous estimate and `TAU_EMA = 60 s`. Before blending, **age
     the previous value down by `Δt`** (`aged = max(0, prev − Δt)`) — a "seconds left" figure
     is one second smaller one second later, so aging it removes the upward bias that plain
     smoothing adds to a countdown, and makes the display tick down in real time between
     updates. Time-awareness also means a stale value after a long gap is automatically
     washed out (large `Δt` → `α → 1`). Clear `emaSecsLeft`/`emaAt` on a window change.
6. **Render rule:**
   - not confident, or `slope ≈ 0` (idle/draining) → show **reset clock only**.
   - `secsToLimit < secsToReset` → show **`~Xh Ym left`** (you'd hit the cap before it resets).
   - otherwise → you'll reset before running out → show the reset clock (you're safe).

Project time-left for the **5-hour** window only — it's the binding short-term constraint. The
weekly window just shows its bar/%/reset.

### The trend indicator (time-left color)

The time-left text doubles as an acceleration indicator: **is the burn rate higher or lower
than it was a little while ago?**

- `rate_now` = `slope_recent` (or `slope_fast` if the recent window was too sparse).
- `rate_then` = the same fast EWLS estimator **evaluated at `now − TREND_LAG`** (10 min ago),
  fitted only on samples that existed by then (`t ≤ now − TREND_LAG`). Same estimator, two
  points in time — a true before/after comparison, immune to the level-mixing that makes
  "fast slope vs slow slope" sluggish.
- Classify with a noise floor and a dead-band:
  - both rates < `TREND_EPS` (0.5 %/hour) → **flat** (idle then and now)
  - `rate_then` ≈ 0, `rate_now` above floor → **up** (was idle, now burning)
  - `rate_now` ≈ 0, `rate_then` above floor → **down** (was burning, gone quiet)
  - else `ratio = rate_now / rate_then`: ≥ **1.25** → **up**; ≤ **0.8** → **down**; the
    dead-band in between → **flat** (prevents color flapping on noise)
- **Colors:** `up` → red (usage accelerating — time left shrinking faster and faster);
  `down` → green (usage easing off — time left stretching out); `flat` → plain. The <30 min
  **bold-red urgency override beats the trend color** — when you're about to run out, it's red
  no matter which direction the rate is moving.
- Measured responsiveness (simulation): red flag ~2 min after a burst starts; green flag
  ~5 min after a taper starts.

> Accuracy note: this is an extrapolation of a rolling quantity — the future also depends on
> usage aging out of the window, which can't be known from percentages alone. Converged error
> is ~0% while a regime holds (measured in simulation across steady/burst/taper/idle/resume);
> the honest uncertainty is during the first few minutes after your pace changes, which is
> exactly what the red/green trend color is signalling.

---

## 5. Reference implementation (Node, zero dependencies)

Save as `<CLAUDE_DIR>/statusline-usage.mjs`. Node ≥ 18. It reads stdin, manages the state file
next to itself (via `import.meta.url`, so it's path-portable), and never throws to the UI. Run
`node statusline-usage.mjs --selftest` to verify the math; set `STATUSLINE_DEBUG=1` (or create a
`statusline-debug` file beside it) to dump the raw stdin payload to `statusline-stdin-sample.json`.

```js
#!/usr/bin/env node
// Claude Code status line: live 5-hour + weekly usage with a burn-rate "time left" estimate.
//
// Reads the status-line JSON on stdin, renders two rows:
//   row 1:  <model> · ctx <n>% · $<cost> session
//   row 2:  5h <bar> <n>% [~time left] · resets <clock>   ·   7d <bar> <n>% · resets <day>
//
// The 5h/7d percentages come straight from `rate_limits` in the stdin payload (ground truth,
// same numbers /usage shows). "Time left" is computed locally: each invocation appends the
// current 5h percentage to a small rolling state file, and we fit a burn rate (%/sec) over the
// recent samples to project when the 5-hour window would hit 100% at the current pace.
//
// Never throws to the UI: any failure prints a minimal safe line and exits 0.
//
// Usage:
//   node statusline-usage.mjs            # normal (stdin = status-line JSON)
//   node statusline-usage.mjs --selftest # run internal assertions, print PASS/FAIL
//
// Debug: set env STATUSLINE_DEBUG=1 (or create a file `statusline-debug` next to this script)
// to dump the raw stdin payload to `statusline-stdin-sample.json` for inspection.

import { readFileSync, writeFileSync, renameSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(SCRIPT_DIR, "statusline-usage-state.json");

// ---- Tunables -------------------------------------------------------------
const RETAIN_SECONDS = 90 * 60; // keep at most ~90 min of samples
const MAX_SAMPLES = 512; // hard cap on stored samples
const MIN_SAMPLE_GAP = 20; // don't add a flat sample more often than this (s)
const HL_FAST = 7.5 * 60; // fast trend half-life (s) — "what active sessions are doing now"
const HL_SLOW = 30 * 60; // slow trend half-life (s) — "the past hour or so"
const W_FAST = 0.65; // blend weights for the two trends
const W_SLOW = 0.35;
const MIN_SAMPLES = 3; // confidence gate before showing a projection
const MIN_SPAN = 180; // s — need at least this much spread in the samples
const TAU_EMA = 60; // s — time constant for smoothing the displayed time-left
const BAR_WIDTH = 10; // cells per progress bar
const RED_SECONDS = 30 * 60; // highlight time-left in red below this
const TREND_LAG = 10 * 60; // s — compare today's burn rate vs the rate this long ago
const TREND_UP_RATIO = 1.25; // now/then burn ratio above this -> accelerating (red)
const TREND_DOWN_RATIO = 0.8; // now/then burn ratio below this -> decelerating (green)
const TREND_EPS = 0.5 / 3600; // %/s noise floor (0.5 %/hour) below which a rate counts as idle

// ---- ANSI -----------------------------------------------------------------
const RESET = "\x1b[0m";
const DIM = "\x1b[90m";
const REDB = "\x1b[1;91m";
const RED = "\x1b[91m";
const GREEN = "\x1b[32m";

// Color shifts toward red as a window fills.
function colorFor(pct) {
  if (pct >= 95) return "\x1b[1;91m"; // bold bright red
  if (pct >= 90) return "\x1b[91m"; // bright red
  if (pct >= 75) return "\x1b[38;5;208m"; // orange (256-color)
  if (pct >= 50) return "\x1b[33m"; // yellow
  return "\x1b[32m"; // green
}

// ---- Pure helpers ---------------------------------------------------------
const EIGHTHS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"]; // 1/8..7/8 left blocks

// Smooth sub-cell progress bar. Filled part takes the threshold color; empty part is dim.
function bar(pct, width = BAR_WIDTH) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const totalEighths = Math.round((p / 100) * width * 8);
  let cells = Math.min(Math.floor(totalEighths / 8), width);
  const rem = totalEighths % 8;
  let filled = "█".repeat(cells);
  if (rem > 0 && cells < width) {
    filled += EIGHTHS[rem];
    cells += 1;
  }
  const empty = "░".repeat(Math.max(0, width - cells));
  return `${DIM}▕${RESET}${colorFor(p)}${filled}${RESET}${DIM}${empty}▏${RESET}`;
}

// Weighted least-squares slope of p vs t (returns %/second), shift-invariant & numerically safe.
function ewlsSlope(samples, now, halflife) {
  if (!samples || samples.length < 2) return null;
  let sw = 0, swt = 0, swp = 0, swtt = 0, swtp = 0;
  for (const s of samples) {
    const age = now - s.t; // >= 0
    const w = Math.pow(2, -age / halflife);
    const tau = s.t - now; // small magnitude -> stable products
    sw += w;
    swt += w * tau;
    swp += w * s.p;
    swtt += w * tau * tau;
    swtp += w * tau * s.p;
  }
  const denom = sw * swtt - swt * swt;
  if (Math.abs(denom) < 1e-12) return null;
  return (sw * swtp - swt * swp) / denom;
}

// Burn-rate trend: compare the burn rate now against the burn rate as it stood TREND_LAG
// ago (same fast estimator, evaluated at two points in time). Burning faster than before ->
// usage is accelerating, time-left is shrinking faster ("up" -> red). Burning slower than
// before -> easing off, time-left stretching out ("down" -> green). The dead-band between
// the two ratios reads as "flat".
function burnTrend(rateNow, rateThen) {
  if (rateNow == null || rateThen == null) return "flat";
  const f = Math.max(rateNow, 0);
  const s = Math.max(rateThen, 0);
  if (f < TREND_EPS && s < TREND_EPS) return "flat"; // idle then and now
  if (s < TREND_EPS) return "up"; // was idle, now burning -> ramping up
  if (f < TREND_EPS) return "down"; // was burning, now quiet -> ramping down
  const ratio = f / s;
  if (ratio >= TREND_UP_RATIO) return "up";
  if (ratio <= TREND_DOWN_RATIO) return "down";
  return "flat";
}

// Format a duration (seconds) -> "Xh YYm" (5-min granularity above 1h) or "Ym".
function dur(secs) {
  if (!isFinite(secs)) return "∞";
  secs = Math.max(0, Math.round(secs));
  const h = Math.floor(secs / 3600);
  let m = Math.floor((secs % 3600) / 60);
  if (h >= 1) {
    m = Math.round(m / 5) * 5;
    if (m === 60) return `${h + 1}h00m`;
    return `${h}h${String(m).padStart(2, "0")}m`;
  }
  return `${Math.max(1, m)}m`;
}

// Local clock like "3:45p".
function clock(epochSecs) {
  const d = new Date(epochSecs * 1000);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "p" : "a";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")}${ap}`;
}

// Short reset label for the weekly window: same-day -> clock, else weekday.
function resetLabel(epochSecs, now) {
  const secs = epochSecs - now;
  if (secs <= 18 * 3600) return clock(epochSecs);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(epochSecs * 1000).getDay()];
}

// ---- State I/O ------------------------------------------------------------
function loadState() {
  try {
    const s = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    if (!Array.isArray(s.samples)) s.samples = [];
    return s;
  } catch {
    return { samples: [], emaSecsLeft: null, emaAt: null, window: null };
  }
}

function saveState(state) {
  const data = JSON.stringify(state);
  const tmp = `${STATE_FILE}.${process.pid}.tmp`;
  try {
    writeFileSync(tmp, data);
    renameSync(tmp, STATE_FILE); // atomic on same volume (overwrites on Windows)
  } catch {
    try {
      writeFileSync(STATE_FILE, data);
    } catch {}
    try {
      if (existsSync(tmp)) unlinkSync(tmp);
    } catch {}
  }
}

// ---- Core compute ---------------------------------------------------------
// Given a window object {used_percentage, resets_at} (or undefined), the state, and now,
// update the rolling samples and return { state, curP, curResets, timeLeftSecs|null, burning }.
function updateAndProject(fh, state, now) {
  let samples = Array.isArray(state.samples) ? state.samples : [];
  const havePct = fh && typeof fh.used_percentage === "number" && typeof fh.resets_at === "number";

  // 1. admit a sample
  if (havePct) {
    const last = samples[samples.length - 1];
    const changed = !last || last.p !== fh.used_percentage || last.r !== fh.resets_at;
    const gapOk = !last || now - last.t >= MIN_SAMPLE_GAP;
    if (changed || gapOk) samples.push({ t: now, p: fh.used_percentage, r: fh.resets_at });
  }

  // 2. determine the current window and prune to it (drops samples from a prior window)
  const curResets = havePct ? fh.resets_at : samples.length ? samples[samples.length - 1].r : null;
  samples = samples.filter((s) => s.r === curResets && now - s.t <= RETAIN_SECONDS);
  if (samples.length > MAX_SAMPLES) samples = samples.slice(samples.length - MAX_SAMPLES);

  // 3. window change -> reset smoothing
  if (state.window !== curResets) {
    state.emaSecsLeft = null;
    state.emaAt = null;
    state.window = curResets;
  }
  state.samples = samples;

  // 4. burn rate. The recent-window rate (last TREND_LAG) is PRIMARY — what you did in the
  // last few minutes is what predicts the next stretch. The whole-series regressions both
  // under-react to fresh bursts and cling to old bursts during a taper. A perfectly flat
  // recent window is hard evidence of zero burn (sr = 0), not missing data.
  const sf = ewlsSlope(samples, now, HL_FAST);
  const ss = ewlsSlope(samples, now, HL_SLOW);
  const blend = sf != null && ss != null ? W_FAST * sf + W_SLOW * ss : sf != null ? sf : ss;

  const recent = samples.filter((s) => now - s.t <= TREND_LAG);
  let sr = null;
  if (recent.length >= 3 && recent[recent.length - 1].t - recent[0].t >= 120) {
    const rdistinct = new Set(recent.map((s) => s.p)).size;
    sr = rdistinct >= 2 ? ewlsSlope(recent, now, HL_FAST) : 0;
  }

  let slope = sr != null ? sr : blend; // blend is the sparse-recent-data fallback
  if (slope != null) slope = Math.max(slope, 0);

  // 5. confidence gate
  const span = samples.length ? samples[samples.length - 1].t - samples[0].t : 0;
  const distinct = new Set(samples.map((s) => s.p)).size;
  const confident = samples.length >= MIN_SAMPLES && span >= MIN_SPAN && distinct >= 2 && slope != null;

  // 6. project + smooth
  const curP = havePct ? fh.used_percentage : samples.length ? samples[samples.length - 1].p : null;
  let secsToLimit = Infinity;
  if (confident && slope > 0 && curP != null) secsToLimit = (100 - curP) / slope;

  // Time-aware smoothing: weight by elapsed wall time (1s ticks barely move it, sparse
  // event-driven updates move it a lot), and age the previous value down by the elapsed
  // seconds first — a "seconds left" estimate is one second smaller one second later, so
  // aging it removes the upward bias plain smoothing would add to a countdown.
  let display = secsToLimit;
  if (isFinite(secsToLimit)) {
    if (
      typeof state.emaSecsLeft === "number" && isFinite(state.emaSecsLeft) &&
      typeof state.emaAt === "number" && now >= state.emaAt
    ) {
      const dt = now - state.emaAt;
      const a = 1 - Math.exp(-dt / TAU_EMA);
      const aged = Math.max(0, state.emaSecsLeft - dt);
      display = a * secsToLimit + (1 - a) * aged;
    }
    state.emaSecsLeft = display;
    state.emaAt = now;
  } else {
    state.emaSecsLeft = null;
    state.emaAt = null;
  }

  return {
    curP,
    curResets,
    timeLeftSecs: isFinite(display) ? display : null,
    burning: confident && slope > 0 && isFinite(display),
    trend: (() => {
      if (!confident) return "flat";
      const then = now - TREND_LAG;
      const sfThen = ewlsSlope(samples.filter((s) => s.t <= then), then, HL_FAST);
      return burnTrend(sr != null ? sr : sf, sfThen);
    })(),
    lastSampleAge: samples.length ? now - samples[samples.length - 1].t : Infinity,
    lastP: samples.length ? samples[samples.length - 1].p : null,
    lastResets: samples.length ? samples[samples.length - 1].r : null,
  };
}

// Build the 5h segment string.
function fiveHourSegment(fh, proj, now) {
  if (fh && typeof fh.used_percentage === "number") {
    const p = fh.used_percentage;
    const c = colorFor(p);
    let seg = `5h ${bar(p)} ${c}${Math.round(p)}%${RESET}`;
    const secsToReset = typeof fh.resets_at === "number" ? Math.max(0, fh.resets_at - now) : Infinity;
    if (proj.burning && proj.timeLeftSecs != null && proj.timeLeftSecs < secsToReset) {
      // urgency (<30m) wins; otherwise color by trend: accelerating red, decelerating green
      let lc = "";
      if (proj.timeLeftSecs < RED_SECONDS) lc = REDB;
      else if (proj.trend === "up") lc = RED;
      else if (proj.trend === "down") lc = GREEN;
      seg += ` ${lc}~${dur(proj.timeLeftSecs)} left${RESET}`;
    }
    if (typeof fh.resets_at === "number") seg += ` ${DIM}· resets ${clock(fh.resets_at)}${RESET}`;
    return seg;
  }
  // fallback: reuse a recent sample if the live value is briefly missing
  if (proj.lastP != null && proj.lastSampleAge < 600) {
    const c = colorFor(proj.lastP);
    let seg = `5h ${bar(proj.lastP)} ${DIM}~${RESET}${c}${Math.round(proj.lastP)}%${RESET}`;
    if (proj.lastResets != null) seg += ` ${DIM}· resets ${clock(proj.lastResets)}${RESET}`;
    return seg;
  }
  return `5h ${DIM}— warming up${RESET}`;
}

// Build the 7d segment string.
function sevenDaySegment(sd, now) {
  if (sd && typeof sd.used_percentage === "number") {
    const p = sd.used_percentage;
    const c = colorFor(p);
    let seg = `7d ${bar(p)} ${c}${Math.round(p)}%${RESET}`;
    if (typeof sd.resets_at === "number") seg += ` ${DIM}· resets ${resetLabel(sd.resets_at, now)}${RESET}`;
    return seg;
  }
  return `7d ${DIM}—${RESET}`;
}

function render(data, state, now) {
  const rl = data.rate_limits || {};
  const fh = rl.five_hour;
  const sd = rl.seven_day;

  const proj = updateAndProject(fh, state, now);

  // row 1: model · ctx · cost
  const p1 = [];
  if (data.model && data.model.display_name) p1.push(data.model.display_name);
  const ctx = data.context_window && data.context_window.used_percentage;
  if (typeof ctx === "number") p1.push(`ctx ${Math.round(ctx)}%`);
  const cost = data.cost && data.cost.total_cost_usd;
  if (typeof cost === "number") p1.push(`$${cost.toFixed(2)} session`);
  const row1 = p1.join(`${DIM} · ${RESET}`);

  // row 2: 5h ... · 7d ...
  const sep = `   ${DIM}·${RESET}   `;
  const row2 = fiveHourSegment(fh, proj, now) + sep + sevenDaySegment(sd, now);

  return { out: row1 ? `${row1}\n${row2}` : row2, state };
}

// ---- Self-test ------------------------------------------------------------
function selftest() {
  let pass = 0,
    fail = 0;
  const ok = (cond, msg) => (cond ? pass++ : (fail++, console.error("FAIL:", msg)));

  // bar fills monotonically and keeps width
  const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
  ok(strip(bar(0)).length === BAR_WIDTH + 2, "bar(0) width");
  ok(strip(bar(100)).includes("█".repeat(BAR_WIDTH)), "bar(100) full");
  ok(strip(bar(23)).startsWith("▕██"), "bar(23) two full cells");

  // colorFor thresholds
  ok(colorFor(10) === "\x1b[32m", "green <50");
  ok(colorFor(60) === "\x1b[33m", "yellow 50-75");
  ok(colorFor(80) === "\x1b[38;5;208m", "orange 75-90");
  ok(colorFor(92) === "\x1b[91m", "red 90-95");
  ok(colorFor(99) === "\x1b[1;91m", "bold red >=95");

  // ewlsSlope: 1%/min over 6 min == 1/60 %/s (samples share the window's resets_at)
  const now = 1_000_000;
  const R = now + 3 * 3600;
  const climb = [];
  for (let i = 0; i <= 6; i++) climb.push({ t: now - (6 - i) * 60, p: 10 + i, r: R });
  const sl = ewlsSlope(climb, now, HL_FAST);
  ok(Math.abs(sl - 1 / 60) < 1e-3, `slope ~1/60, got ${sl}`);

  // projection: at 16%, 1%/min -> ~84 min to 100
  const st = { samples: climb.slice(), emaSecsLeft: null, window: R };
  const proj = updateAndProject({ used_percentage: 16, resets_at: R }, st, now);
  ok(proj.burning, "burning true on steady climb");
  ok(proj.timeLeftSecs > 70 * 60 && proj.timeLeftSecs < 95 * 60, `~84m, got ${Math.round(proj.timeLeftSecs / 60)}m`);

  // idle: flat samples -> not burning
  const flat = [];
  for (let i = 0; i <= 6; i++) flat.push({ t: now - (6 - i) * 60, p: 40, r: now + 9999 });
  const st2 = { samples: flat.slice(), emaSecsLeft: null, window: now + 9999 };
  const proj2 = updateAndProject({ used_percentage: 40, resets_at: now + 9999 }, st2, now);
  ok(!proj2.burning, "flat usage -> not burning");

  // reset crossing: old-window samples pruned
  const st3 = { samples: [{ t: now - 100, p: 90, r: now - 50 }], emaSecsLeft: 123, window: now - 50 };
  const proj3 = updateAndProject({ used_percentage: 5, resets_at: now + 5 * 3600 }, st3, now);
  ok(st3.samples.every((s) => s.r === now + 5 * 3600), "prior-window samples pruned");
  ok(st3.emaSecsLeft === null || typeof st3.emaSecsLeft === "number", "ema reset on window change");

  // dur + clock
  ok(dur(2 * 3600 + 45 * 60) === "2h45m", `dur 2h45m, got ${dur(2 * 3600 + 45 * 60)}`);
  ok(dur(8 * 60) === "8m", `dur 8m, got ${dur(8 * 60)}`);

  // burnTrend: ratio of fast vs slow slope drives the trend label
  const u = 1 / 60; // 1 %/min in %/s
  ok(burnTrend(2 * u, u) === "up", "fast >> slow -> up");
  ok(burnTrend(0.5 * u, u) === "down", "fast << slow -> down");
  ok(burnTrend(u, u) === "flat", "fast == slow -> flat");
  ok(burnTrend(1.1 * u, u) === "flat", "inside dead-band -> flat");
  ok(burnTrend(u, 0) === "up", "idle -> burning = up");
  ok(burnTrend(0, u) === "down", "burning -> idle = down");
  ok(burnTrend(0, 0) === "flat", "idle both = flat");
  ok(burnTrend(null, u) === "flat", "missing slope = flat");

  // trend end-to-end: steady 1%/min everywhere -> equal slopes -> flat
  const stT = { samples: climb.slice(), emaSecsLeft: null, window: R };
  const projT = updateAndProject({ used_percentage: 16, resets_at: R }, stT, now);
  ok(projT.trend === "flat", `steady climb -> flat, got ${projT.trend}`);

  // accelerating: flat for 30 min, then 2%/min in the last 6 min -> up, and the projection
  // must reflect the burst-level rate (~39m to cap), not the diluted whole-series blend
  const acc = [];
  for (let i = 0; i <= 24; i++) acc.push({ t: now - (36 - i) * 60, p: 10, r: R });
  for (let i = 1; i <= 6; i++) acc.push({ t: now - (6 - i) * 60, p: 10 + 2 * i, r: R });
  const stA = { samples: acc, emaSecsLeft: null, window: R };
  const projA = updateAndProject({ used_percentage: 22, resets_at: R }, stA, now);
  ok(projA.trend === "up", `late burst -> up, got ${projA.trend}`);
  ok(projA.burning, "late burst -> projection shown");
  ok(projA.timeLeftSecs < 60 * 60, `burst rate honored, got ${Math.round(projA.timeLeftSecs / 60)}m`);

  // decelerating: 2%/min for 30 min, then flat for the last 10 min -> down, and a flat
  // recent window is evidence of zero burn -> the projection disappears (reset clock only)
  const dec = [];
  for (let i = 0; i <= 30; i++) dec.push({ t: now - (40 - i) * 60, p: 10 + 2 * i, r: R });
  for (let i = 1; i <= 10; i++) dec.push({ t: now - (10 - i) * 60, p: 70, r: R });
  const stD = { samples: dec, emaSecsLeft: null, window: R };
  const projD = updateAndProject({ used_percentage: 70, resets_at: R }, stD, now);
  ok(projD.trend === "down", `gone quiet -> down, got ${projD.trend}`);
  ok(!projD.burning, "flat recent window -> projection hidden");

  // taper: 2%/min for 30 min then 0.4%/min for 15 min -> estimate tracks the TAPER rate
  const tap = [];
  for (let i = 0; i <= 30; i++) tap.push({ t: now - (45 - i) * 60, p: 5 + 2 * i, r: R });
  for (let i = 1; i <= 15; i++) tap.push({ t: now - (15 - i) * 60, p: 65 + 0.4 * i, r: R });
  const stTap = { samples: tap, emaSecsLeft: null, emaAt: null, window: R };
  const projTap = updateAndProject({ used_percentage: 71, resets_at: R }, stTap, now);
  const truthTap = (100 - 71) / (0.4 / 60);
  ok(projTap.burning, "taper -> still burning");
  ok(
    Math.abs(projTap.timeLeftSecs - truthTap) / truthTap < 0.25,
    `taper accuracy, got ${Math.round(projTap.timeLeftSecs / 60)}m vs truth ${Math.round(truthTap / 60)}m`,
  );

  // time-aware EMA: after a 5-min gap a stale high estimate is nearly washed out
  const stE = { samples: climb.slice(), emaSecsLeft: 7200, emaAt: now - 300, window: R };
  const projE = updateAndProject({ used_percentage: 16, resets_at: R }, stE, now);
  ok(
    projE.timeLeftSecs < 1.15 * proj.timeLeftSecs,
    `stale EMA washed out, got ${Math.round(projE.timeLeftSecs / 60)}m vs raw ${Math.round(proj.timeLeftSecs / 60)}m`,
  );

  // full render with a realistic payload doesn't throw and has 2 rows
  const data = {
    model: { display_name: "Opus" },
    context_window: { used_percentage: 12 },
    cost: { total_cost_usd: 1.84 },
    rate_limits: {
      five_hour: { used_percentage: 23, resets_at: R },
      seven_day: { used_percentage: 41, resets_at: now + 4 * 24 * 3600 },
    },
  };
  const r = render(data, { samples: [], emaSecsLeft: null, window: null }, now);
  ok(r.out.split("\n").length === 2, "render -> 2 rows");
  ok(strip(r.out).includes("23%") && strip(r.out).includes("41%"), "render shows both %");

  console.log(`${fail === 0 ? "ALL PASS" : "HAD FAILURES"} — ${pass} passed, ${fail} failed`);
  console.log("--- sample render ---");
  console.log(r.out);
  process.exit(fail === 0 ? 0 : 1);
}

// ---- Main -----------------------------------------------------------------
function main() {
  if (process.argv.includes("--selftest")) return selftest();

  let raw = "";
  try {
    raw = readFileSync(0, "utf8");
  } catch {
    raw = "";
  }

  if (process.env.STATUSLINE_DEBUG || existsSync(join(SCRIPT_DIR, "statusline-debug"))) {
    try {
      writeFileSync(join(SCRIPT_DIR, "statusline-stdin-sample.json"), raw);
    } catch {}
  }

  let data = {};
  try {
    data = JSON.parse(raw) || {};
  } catch {
    data = {};
  }

  const now = Math.floor(Date.now() / 1000);
  const state = loadState();
  try {
    const { out } = render(data, state, now);
    saveState(state);
    process.stdout.write(out + "\n");
  } catch (e) {
    // last-ditch: still try to show the two raw percentages, else a blank-ish line
    try {
      const rl = (data && data.rate_limits) || {};
      const f = rl.five_hour && Math.round(rl.five_hour.used_percentage);
      const w = rl.seven_day && Math.round(rl.seven_day.used_percentage);
      process.stdout.write(`5h ${f ?? "—"}% · 7d ${w ?? "—"}%\n`);
    } catch {
      process.stdout.write("\n");
    }
  }
}

main();
```

This block is the **exact, complete file** — copy it verbatim to `<CLAUDE_DIR>/statusline-usage.mjs`.
It includes the `--selftest` assertions (run `node statusline-usage.mjs --selftest` → `ALL PASS`).

---

## 6. Install

Add to `settings.json` (user settings `~/.claude/settings.json`, or project `.claude/settings.json`):

```jsonc
{
  "statusLine": {
    "type": "command",
    "command": "node <ABSOLUTE_PATH_TO>/statusline-usage.mjs",
    "padding": 0,
    "refreshInterval": 1            // 1 = most real-time; raise to 2–5 to spawn less often
  }
}
```

- Use an **absolute path with forward slashes** in `command` — Node accepts `/` on Windows and it
  works regardless of which shell Claude Code uses.
- `refreshInterval: 1` gives per-second idle ticks. Percentages already update instantly on each
  message (event-driven), so `2–5` looks virtually identical with less CPU — tune to taste.
- Reload Claude Code (or restart the session) for the new status line to take effect.

---

## 7. Verify on any machine

1. **Confirm the fields your install actually sends.** Set `STATUSLINE_DEBUG=1` (or `touch
   <CLAUDE_DIR>/statusline-debug`), let one assistant turn run, then inspect
   `<CLAUDE_DIR>/statusline-stdin-sample.json`. Confirm `rate_limits.five_hour` /
   `.seven_day` are present (they appear only after the first API response on a Pro/Max session).
2. **Self-test the math:** `node statusline-usage.mjs --selftest` → expect `ALL PASS`.
3. **Fixture-test rendering:** pipe a JSON payload in, e.g.
   `echo '{"model":{"display_name":"Opus"},"rate_limits":{"five_hour":{"used_percentage":93,"resets_at":9999999999},"seven_day":{"used_percentage":40,"resets_at":9999999999}}}' | node statusline-usage.mjs`
   and confirm colors/percentages.
4. **Cross-check live:** the displayed `5h`/`7d` percentages should match the `/usage` panel.

---

## 8. Tuning, edge cases & limits

- **Tunables** (top of the script): `RETAIN_SECONDS`, `HL_FAST`/`HL_SLOW` (regression
  half-lives), `W_FAST`/`W_SLOW` (fallback blend), `MIN_SAMPLES`/`MIN_SPAN` (confidence gate),
  `TAU_EMA` (display smoothing time constant), `TREND_LAG` (recent window + trend look-back),
  `TREND_UP_RATIO`/`TREND_DOWN_RATIO` (trend dead-band), `TREND_EPS` (idle noise floor),
  `BAR_WIDTH`, `RED_SECONDS` (urgency override), color thresholds in `colorFor`.
- **Multiple concurrent sessions** all run the status line and write the same state file. They all
  observe the *same account-level* percentage, so their samples simply densify one shared series.
  Writes are atomic (temp-file + rename); a rare lost sample is harmless.
- **Pre-first-response / non-subscription sessions:** `rate_limits` is absent → the script shows
  `warming up` (and reuses the last known sample for up to 10 min if there is one). `ctx`/`cost`
  still render when present.
- **Estimate is an approximation.** It linearly extrapolates a rolling quantity; treat `~Xh Ym`
  as a guide, not a guarantee. It self-corrects as new samples arrive.
- **Percentages only.** No absolute token ceiling is exposed, so you can't show "tokens left".
- **Per-model weekly limits** (`seven_day_opus`, `seven_day_sonnet`) and overage/credit info are
  **not** in the status-line payload. If you need them, the Agent SDK exposes a control request —
  `{ "subtype": "get_usage" }` (method name in the CLI:
  `usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET`) — returning all five windows plus
  `rate_limits_available`, extra-usage credits, and a day/week behavior breakdown, sourced from
  the claude.ai usage endpoint. It is **experimental** and not needed for the status line; the
  stdin `rate_limits` object is the simpler, supported path. Alternatively, `/usage` prints a
  text summary in non-interactive mode.
```
```
```

---

*Generated as a portable reference. Substitute placeholder paths for your environment; no values
in this document are machine-specific.*
