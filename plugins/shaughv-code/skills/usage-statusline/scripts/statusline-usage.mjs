#!/usr/bin/env node
// Claude Code status line: live 5-hour + weekly usage with a burn-rate "time left" estimate.
//
// Reads the status-line JSON on stdin, renders two rows:
//   row 1:  <model> · ctx <n>% · $<cost> session · ⎇ <git branch>
//   row 2:  5h <bar▓> <n>% [~time left ↗/↘] · resets <clock>   ·   7d <bar▓> <n>% · resets <day>
//
// Each bar carries a silver ▓ pace tick at the elapsed-time position of its window (start =
// resets_at − window length): fill past the tick = consuming faster than time is passing.
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

import { readFileSync, writeFileSync, renameSync, existsSync, unlinkSync, statSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(SCRIPT_DIR, "statusline-usage-state.json");

// ---- Tunables -------------------------------------------------------------
const RETAIN_SECONDS = 90 * 60; // keep at most ~90 min of samples
const MAX_SAMPLES = 4096; // hard backstop on stored samples (thinning keeps real counts far below)
const MIN_SAMPLE_GAP = 20; // don't add a flat sample more often than this (s)
const THIN_AFTER = 15 * 60; // keep full density this recent (s); decimate older samples to
//                             MIN_SAMPLE_GAP spacing so heavy burst traffic can never crowd the
//                             10-min trend look-back or the slow slope out of the retained series
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
const PCT_DECIMAL_AT = 90; // show one decimal on usage % at/above this (integer below)
const FIVE_HOUR_SECS = 5 * 3600; // window lengths, for the pace ticks
const SEVEN_DAY_SECS = 7 * 24 * 3600;

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
// Pace tick: a FULL-CELL glyph on purpose — a thin glyph (┃) leaves the rest of its cell as
// bare background, which reads as black bars flanking the tick. ▓ fills the cell while staying
// distinct from the solid █ fill and the dim ░ empties, even in monochrome.
const TICK = "▓";
const TICK_COLOR = "\x1b[97m"; // bright white ("silver") — never collides with a fill color
// Subtle dark track painted under every inner bar cell. This is what lets the bar keep its
// eighth-block sub-cell precision WITHOUT a black hole: a partial cell's unpainted remainder
// shows as tinted track instead of terminal-black. Set to "" to disable (e.g. light themes).
const TRACK_BG = "\x1b[48;5;236m";

// Sub-cell progress bar on a tinted track. Filled part takes the threshold color at
// eighth-block precision; empty part is dim ░ dots; every inner cell carries TRACK_BG so the
// track reads continuous from fill edge to bar end. tickFrac (0..1, optional) overlays a pace
// tick at that fraction of the bar — where "now" sits inside the window. Fill past the tick =
// consuming faster than the window is elapsing (running hot); short of it = running cool.
function bar(pct, width = BAR_WIDTH, tickFrac = null) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const totalEighths = Math.round((p / 100) * width * 8);
  const cells = Math.min(Math.floor(totalEighths / 8), width);
  const rem = totalEighths % 8;
  const chars = [];
  for (let i = 0; i < cells; i++) chars.push("█");
  if (rem > 0 && chars.length < width) chars.push(EIGHTHS[rem]);
  while (chars.length < width) chars.push("░");
  let tickIdx = -1;
  if (typeof tickFrac === "number" && isFinite(tickFrac)) {
    tickIdx = Math.min(width - 1, Math.max(0, Math.floor(tickFrac * width)));
  }
  const c = colorFor(p);
  let out = `${DIM}▕${RESET}`;
  for (let i = 0; i < width; i++) {
    if (i === tickIdx) out += `${TRACK_BG}${TICK_COLOR}${TICK}${RESET}`; // silver — visible anywhere
    else if (chars[i] === "░") out += `${TRACK_BG}${DIM}░${RESET}`;
    else out += `${TRACK_BG}${c}${chars[i]}${RESET}`;
  }
  return `${out}${DIM}▏${RESET}`;
}

// Usage % for display: integer normally, one decimal at/above PCT_DECIMAL_AT (trailing .0
// trimmed) — near the cap the integer rounding would hide real movement between refreshes.
function fmtPct(p) {
  if (p >= PCT_DECIMAL_AT) {
    const s = (Math.round(p * 10) / 10).toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  }
  return String(Math.round(p));
}

// Fraction of a window already elapsed (0..1), from its reset time and fixed length.
function elapsedFrac(resetsAt, winSecs, now) {
  if (typeof resetsAt !== "number") return null;
  const f = 1 - (resetsAt - now) / winSecs;
  if (!isFinite(f)) return null;
  return Math.max(0, Math.min(1, f));
}

// Parse the content of a git HEAD file -> branch name, short SHA (detached), or null.
function parseGitHead(s) {
  const m = /^ref:\s*refs\/heads\/(.+)$/m.exec(s.trim());
  if (m) return m[1].trim();
  const sha = s.trim();
  return /^[0-9a-f]{40}$/i.test(sha) ? sha.slice(0, 7) : null;
}

// Current git branch for a directory — pure file reads (never spawns a process, so it's safe
// at a 1 s refresh). Walks up to the repo root; handles worktrees, where `.git` is a FILE
// containing `gitdir: <path>` and HEAD lives at that path.
function gitBranch(startDir) {
  try {
    let dir = resolve(startDir);
    for (let i = 0; i < 24; i++) {
      const dotGit = join(dir, ".git");
      if (existsSync(dotGit)) {
        let headPath;
        if (statSync(dotGit).isDirectory()) {
          headPath = join(dotGit, "HEAD");
        } else {
          const m = /^gitdir:\s*(.+)$/m.exec(readFileSync(dotGit, "utf8"));
          if (!m) return null;
          const gd = m[1].trim();
          headPath = join(isAbsolute(gd) ? gd : join(dir, gd), "HEAD");
        }
        return parseGitHead(readFileSync(headPath, "utf8"));
      }
      const up = dirname(dir);
      if (up === dir) return null;
      dir = up;
    }
  } catch {}
  return null;
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

  // 2b. age-based thinning: keep everything from the last THIN_AFTER at full density (the
  // recent-primary estimator feeds on it), decimate older samples to MIN_SAMPLE_GAP spacing.
  // This guarantees a heavy burst (many changed samples/sec, e.g. several concurrent agent
  // sessions) can never crowd the TREND_LAG look-back or the slow slope out of the series —
  // which is what keeps the trend color/arrow meaningful during exactly those bursts.
  const thinCut = now - THIN_AFTER;
  const thinned = [];
  let lastKept = -Infinity;
  for (const s of samples) {
    if (s.t > thinCut) {
      thinned.push(s);
    } else if (s.t - lastKept >= MIN_SAMPLE_GAP) {
      thinned.push(s);
      lastKept = s.t;
    }
  }
  samples = thinned;
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
    let seg = `5h ${bar(p, BAR_WIDTH, elapsedFrac(fh.resets_at, FIVE_HOUR_SECS, now))} ${c}${fmtPct(p)}%${RESET}`;
    const secsToReset = typeof fh.resets_at === "number" ? Math.max(0, fh.resets_at - now) : Infinity;
    if (proj.burning && proj.timeLeftSecs != null && proj.timeLeftSecs < secsToReset) {
      // urgency (<30m) wins the color; the trend keeps its arrow either way (color is also
      // dual-encoded as ↗/↘ so the direction survives theme quirks and color-blindness)
      let lc = "";
      let arrow = "";
      if (proj.trend === "up") arrow = " ↗";
      else if (proj.trend === "down") arrow = " ↘";
      if (proj.timeLeftSecs < RED_SECONDS) lc = REDB;
      else if (proj.trend === "up") lc = RED;
      else if (proj.trend === "down") lc = GREEN;
      seg += ` ${lc}~${dur(proj.timeLeftSecs)} left${arrow}${RESET}`;
    }
    if (typeof fh.resets_at === "number") seg += ` ${DIM}· resets ${clock(fh.resets_at)}${RESET}`;
    return seg;
  }
  // fallback: reuse a recent sample if the live value is briefly missing
  if (proj.lastP != null && proj.lastSampleAge < 600) {
    const c = colorFor(proj.lastP);
    let seg = `5h ${bar(proj.lastP, BAR_WIDTH, elapsedFrac(proj.lastResets, FIVE_HOUR_SECS, now))} ${DIM}~${RESET}${c}${fmtPct(proj.lastP)}%${RESET}`;
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
    let seg = `7d ${bar(p, BAR_WIDTH, elapsedFrac(sd.resets_at, SEVEN_DAY_SECS, now))} ${c}${fmtPct(p)}%${RESET}`;
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

  // row 1: model · ctx · cost · git branch
  const p1 = [];
  if (data.model && data.model.display_name) p1.push(data.model.display_name);
  const ctx = data.context_window && data.context_window.used_percentage;
  // ctx takes the same thresholds as the bars — context exhaustion (auto-compact) is the
  // mid-session constraint, so it should escalate visually the same way
  if (typeof ctx === "number") p1.push(`ctx ${colorFor(ctx)}${Math.round(ctx)}%${RESET}`);
  const cost = data.cost && data.cost.total_cost_usd;
  if (typeof cost === "number") p1.push(`$${cost.toFixed(2)} session`);
  const wsDir = (data.workspace && data.workspace.current_dir) || data.cwd;
  if (wsDir) {
    const branch = gitBranch(wsDir);
    if (branch) p1.push(`${DIM}⎇ ${RESET}${branch}`);
  }
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
  ok(strip(bar(44)) === "▕████▍░░░░░▏", "44% -> 4 cells + a 3/8 sliver (eighth precision)");
  ok(strip(bar(23)) === "▕██▎░░░░░░░▏", "23% -> 2 cells + a 2/8 sliver");
  ok(bar(44).includes(TRACK_BG), "tinted track under the bar (no black remainder)");

  // pace tick: overlaid at the elapsed fraction, width preserved, absent by default
  ok(strip(bar(50, BAR_WIDTH, 0.25))[3] === TICK, "tick at cell 2 for 25% elapsed");
  ok(strip(bar(50, BAR_WIDTH, 0)).indexOf(TICK) === 1, "tick clamps to first cell");
  ok(strip(bar(50, BAR_WIDTH, 1)).indexOf(TICK) === BAR_WIDTH, "tick clamps to last cell");
  ok(strip(bar(50, BAR_WIDTH, 0.25)).length === BAR_WIDTH + 2, "tick keeps bar width");
  ok(!strip(bar(50)).includes(TICK), "no tick without a fraction");
  ok(bar(50, BAR_WIDTH, 0.25).includes(`${TICK_COLOR}${TICK}`), "tick painted silver");

  // fmtPct: integer below the threshold, one decimal above (trailing .0 trimmed)
  ok(fmtPct(23.4) === "23", `fmtPct(23.4), got ${fmtPct(23.4)}`);
  ok(fmtPct(89.6) === "90", `fmtPct(89.6), got ${fmtPct(89.6)}`);
  ok(fmtPct(97.46) === "97.5", `fmtPct(97.46), got ${fmtPct(97.46)}`);
  ok(fmtPct(97.04) === "97", `fmtPct(97.04), got ${fmtPct(97.04)}`);
  ok(fmtPct(100) === "100", `fmtPct(100), got ${fmtPct(100)}`);

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

  // elapsedFrac: halfway through a 5h window; clamps; null-safe
  ok(Math.abs(elapsedFrac(now + 2.5 * 3600, FIVE_HOUR_SECS, now) - 0.5) < 1e-9, "elapsedFrac halfway");
  ok(elapsedFrac(now + 10 * 3600, FIVE_HOUR_SECS, now) === 0, "elapsedFrac clamps at 0");
  ok(elapsedFrac(now - 10, FIVE_HOUR_SECS, now) === 1, "elapsedFrac clamps at 1");
  ok(elapsedFrac(null, FIVE_HOUR_SECS, now) === null, "elapsedFrac null resets");

  // parseGitHead: branch ref, nested branch, detached SHA, junk
  ok(parseGitHead("ref: refs/heads/main\n") === "main", "HEAD branch ref");
  ok(parseGitHead("ref: refs/heads/emmett/wb-2026-07-06\n") === "emmett/wb-2026-07-06", "HEAD nested branch");
  ok(parseGitHead("a94a8fe5ccb19ba61c4c0873d391e987982fbbd3\n") === "a94a8fe", "HEAD detached sha7");
  ok(parseGitHead("garbage") === null, "HEAD junk -> null");

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

  // trend arrows: dual-encode the time-left color; urgency keeps the arrow
  const mkProj = (trend, secs) => ({ burning: true, timeLeftSecs: secs, trend, lastSampleAge: 0, lastP: null, lastResets: null });
  const farReset = { used_percentage: 50, resets_at: now + 4 * 3600 };
  ok(fiveHourSegment(farReset, mkProj("up", 3600), now).includes("↗"), "accelerating shows ↗");
  ok(fiveHourSegment(farReset, mkProj("down", 3600), now).includes("↘"), "decelerating shows ↘");
  const segFlat = fiveHourSegment(farReset, mkProj("flat", 3600), now);
  ok(!segFlat.includes("↗") && !segFlat.includes("↘"), "steady shows no arrow");
  const segUrgent = fiveHourSegment(farReset, mkProj("up", 10 * 60), now);
  ok(segUrgent.includes(REDB) && segUrgent.includes("↗"), "urgency bold-red keeps the arrow");

  // thinning: dense 1/s history -> recent THIN_AFTER kept whole, older decimated to the
  // MIN_SAMPLE_GAP cadence, and the TREND_LAG look-back stays populated
  const dense = [];
  for (let i = 0; i < 2000; i++) dense.push({ t: now - 1999 + i, p: 10 + i * 0.01, r: R });
  const stTh = { samples: dense, emaSecsLeft: null, emaAt: null, window: R };
  updateAndProject({ used_percentage: 30, resets_at: R }, stTh, now);
  const oldOnes = stTh.samples.filter((s) => s.t <= now - THIN_AFTER);
  let spaced = oldOnes.length > 0;
  for (let i = 1; i < oldOnes.length; i++) if (oldOnes[i].t - oldOnes[i - 1].t < MIN_SAMPLE_GAP) spaced = false;
  ok(spaced, "old samples decimated to >=MIN_SAMPLE_GAP spacing");
  ok(stTh.samples.filter((s) => s.t > now - THIN_AFTER).length >= 890, "recent samples kept at full density");
  ok(stTh.samples.filter((s) => s.t <= now - TREND_LAG).length >= 2, "trend look-back still populated");

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
  ok(r.out.includes(`ctx \x1b[32m12%`), "ctx % colored by threshold");
  ok(strip(r.out).includes(TICK), "render carries pace ticks");

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
