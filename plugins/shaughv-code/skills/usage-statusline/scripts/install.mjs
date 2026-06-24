#!/usr/bin/env node
// Cross-platform installer for the SHAUGHV usage status line.
//
// Dynamic by design — nothing here is machine-specific. On whatever machine it runs it:
//   • locates the bundled statusline-usage.mjs sitting next to it (via import.meta.url),
//   • resolves the Claude config dir from $CLAUDE_CONFIG_DIR, else ~/.claude,
//   • copies the script there, computes the absolute `node "<path>"` command for THIS host,
//   • merges that into <config>/settings.json WITHOUT touching any other setting (backs it up first),
//   • runs the script's --selftest with the same Node.
// So you can install the plugin and this status line on as many separate machines as you like;
// each install figures out its own home directory, config dir, and absolute path.
//
// Usage:
//   node install.mjs              install (copy + wire settings.json + selftest)
//   node install.mjs --dry-run    print what it would do; change nothing
//   node install.mjs --uninstall  remove the statusLine + delete the installed script/state
//
// Requires Node >=18. Exits 0 on success, non-zero on failure.

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "statusline-usage.mjs");

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const UNINSTALL = args.has("--uninstall");

// Resolve the Claude config dir dynamically: honor an explicit override, else ~/.claude.
const ENV_DIR = (process.env.CLAUDE_CONFIG_DIR || "").trim();
const DIR = ENV_DIR ? resolve(ENV_DIR) : join(homedir(), ".claude");
const FROM_ENV = Boolean(ENV_DIR);

const TARGET = join(DIR, "statusline-usage.mjs");
const STATE = join(DIR, "statusline-usage-state.json");
const SETTINGS = join(DIR, "settings.json");

// Forward slashes work in Node on Windows too; quote so paths with spaces survive the shell.
const CMD_PATH = TARGET.replace(/\\/g, "/");
const COMMAND = `node "${CMD_PATH}"`;
const STATUSLINE_BLOCK = { type: "command", command: COMMAND, padding: 0, refreshInterval: 1 };

const log = (...a) => console.log(...a);

function readSettings() {
  if (!existsSync(SETTINGS)) return {};
  const raw = readFileSync(SETTINGS, "utf8");
  if (!raw.trim()) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e) {
    console.error(`! ${SETTINGS} is not valid JSON (${e.message}).`);
    console.error(`  Refusing to overwrite it. Add this block by hand instead:`);
    console.error(`  "statusLine": ${JSON.stringify(STATUSLINE_BLOCK)}`);
    process.exit(1);
  }
}

function backup(path) {
  if (!existsSync(path)) return null;
  const b = `${path}.bak`;
  copyFileSync(path, b);
  return b;
}

if (UNINSTALL) {
  log(`Uninstall — config dir: ${DIR}`);
  const s = readSettings();
  const hadBlock = Boolean(s.statusLine);
  if (DRY) {
    log(`[dry-run] would ${hadBlock ? "remove statusLine from settings.json" : "leave settings.json (no statusLine)"} and delete the installed script/state. No changes made.`);
    process.exit(0);
  }
  if (hadBlock) {
    const b = backup(SETTINGS);
    delete s.statusLine;
    writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + "\n");
    log(`• removed statusLine from settings.json${b ? ` (backup: ${b})` : ""}`);
  }
  for (const f of [TARGET, STATE]) if (existsSync(f)) { rmSync(f); log(`• deleted ${f}`); }
  log("Done. Reload Claude Code.");
  process.exit(0);
}

// ---- install ----
if (!existsSync(SRC)) {
  console.error(`! bundled script not found next to the installer: ${SRC}`);
  process.exit(1);
}

log("Install — usage status line");
log(`• config dir : ${DIR}${FROM_ENV ? " (from CLAUDE_CONFIG_DIR)" : " (default ~/.claude)"}`);
log(`• script     : ${TARGET}`);
log(`• command    : ${COMMAND}`);

if (DRY) {
  const existing = readSettings();
  log(`[dry-run] would copy the script and ${existing.statusLine ? "replace the existing" : "add a"} settings.json statusLine, then run --selftest. No changes made.`);
  process.exit(0);
}

mkdirSync(DIR, { recursive: true });
copyFileSync(SRC, TARGET);
log("• copied script into config dir");

const settings = readSettings();
const bak = backup(SETTINGS);
settings.statusLine = STATUSLINE_BLOCK;
writeFileSync(SETTINGS, JSON.stringify(settings, null, 2) + "\n");
log(`• wired statusLine into settings.json${bak ? ` (backup: ${bak})` : " (new file)"}`);

const r = spawnSync(process.execPath, [TARGET, "--selftest"], { encoding: "utf8" });
const out = `${r.stdout || ""}${r.stderr || ""}`;
const ok = /ALL PASS/.test(out);
log(ok ? "• selftest   : ALL PASS" : `• selftest   : FAILED\n${out}`);
log(ok
  ? "\nDone. Reload Claude Code (restart the session) to see the status line."
  : "\nInstalled, but the selftest failed — confirm Node >=18 (`node --version`).");
process.exit(ok ? 0 : 1);
