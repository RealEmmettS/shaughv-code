#!/usr/bin/env node
// board-server.mjs — zero-dependency live server for the SHAUGHV task board.
//
// Ships inside `.tasks/` (copied there by /tasks-start). Uses ONLY Node built-ins —
// no npm install, no build step. Serves dashboard.html on localhost, reads/writes
// TASKS.md and memory files server-side, and live-syncs the browser via SSE.
//
// Subcommands:
//   node .tasks/board-server.mjs serve [--open] [--port N]   start in foreground
//   node .tasks/board-server.mjs ensure [--open]             start detached if not already running
//   node .tasks/board-server.mjs hook <EVENT>                ensure + print a board-maintenance nudge
//   node .tasks/board-server.mjs stop                        stop a running server
//   node .tasks/board-server.mjs status                      print running state (json)
//
// Paths resolve from THIS file's directory (the `.tasks/` folder), so it works no
// matter what cwd node is invoked from (e.g. a hook fired from the repo root).

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TASKS_DIR = path.dirname(fileURLToPath(import.meta.url));
const TASKS_MD = path.join(TASKS_DIR, 'TASKS.md');
const CLAUDE_MD = path.join(TASKS_DIR, 'CLAUDE.md');
const MEMORY_DIR = path.join(TASKS_DIR, 'memory');
const DASHBOARD = path.join(TASKS_DIR, 'dashboard.html');
const STATE_FILE = path.join(TASKS_DIR, '.board-server.json');     // {port, pid, startedAt} — written by the server
const NUDGE_FILE = path.join(TASKS_DIR, '.board-nudge.json');      // {<event>: epochMs} — written by hook, separate to avoid contention
const LOG_FILE = path.join(TASKS_DIR, '.board-server.log');

const DEFAULT_PORT = 4317;
const PING_TOKEN = 'shaughv-task-board';
const NUDGE_COOLDOWN_MS = 30_000; // de-dupe bursty events (e.g. parallel subagent fan-out)

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function writeJsonSafe(file, obj) {
  try { fs.writeFileSync(file, JSON.stringify(obj, null, 2)); } catch { /* ignore */ }
}

async function fileMtimeMs(file) {
  try { return Math.floor((await fsp.stat(file)).mtimeMs); } catch { return 0; }
}

function pidAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

async function findFreePort(start) {
  for (let p = start; p < start + 50; p++) {
    if (await portFree(p)) return p;
  }
  return start; // give up gracefully; bind will surface the error
}

// Resolve "is our server already up?" — returns {port} if a live board responds, else null.
function probeRunning() {
  const state = readJsonSafe(STATE_FILE);
  if (!state || !state.port) return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port: state.port, path: '/api/ping', timeout: 800 },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(body.trim() === PING_TOKEN ? state : null));
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function openInBrowser(url) {
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      // `start` is a cmd builtin; the empty "" is the window title arg.
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
    return true;
  } catch {
    return false;
  }
}

// Path guard for the memory API: only allow CLAUDE.md or *.md files under memory/.
// Rejects traversal (`../`), absolute / Windows-drive paths, null bytes, non-.md files,
// and symlinks whose real parent escapes the .tasks/ tree.
function resolveMemoryPath(relPath) {
  if (!relPath || relPath.includes('\0')) return null;
  const resolved = path.resolve(TASKS_DIR, relPath);
  if (!resolved.toLowerCase().endsWith('.md')) return null;
  const isClaude = resolved === CLAUDE_MD;
  const inMemory = resolved === MEMORY_DIR || resolved.startsWith(MEMORY_DIR + path.sep);
  if (!isClaude && !inMemory) return null;
  try {
    const realRoot = fs.realpathSync(TASKS_DIR);
    const realParent = fs.realpathSync(path.dirname(resolved)); // throws if parent missing — fine on first write
    if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) return null;
  } catch { /* parent doesn't exist yet — path is already lexically constrained above */ }
  return resolved;
}

// ---------------------------------------------------------------------------
// serve
// ---------------------------------------------------------------------------

async function serve({ open = false, port: requested } = {}) {
  const port = await findFreePort(requested || DEFAULT_PORT);
  const sseClients = new Set();
  let lastSelfWrite = 0; // suppress echo of our own writes

  function broadcast(kind) {
    const payload = `event: change\ndata: ${JSON.stringify({ kind, at: Date.now() })}\n\n`;
    for (const res of sseClients) { try { res.write(payload); } catch { /* dropped */ } }
  }

  function send(res, status, type, body, extra = {}) {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
    res.end(body);
  }

  async function readBody(req) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    return Buffer.concat(chunks).toString('utf8');
  }

  async function listMemory() {
    const out = { claudeMd: fs.existsSync(CLAUDE_MD), files: [], dirs: {} };
    if (fs.existsSync(MEMORY_DIR)) {
      for (const entry of await fsp.readdir(MEMORY_DIR, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          out.files.push(entry.name);
        } else if (entry.isDirectory()) {
          const sub = (await fsp.readdir(path.join(MEMORY_DIR, entry.name)))
            .filter((n) => n.endsWith('.md'));
          out.dirs[entry.name] = sub;
        }
      }
    }
    return out;
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      const pathname = url.pathname;

      if (pathname === '/api/ping') return send(res, 200, 'text/plain', PING_TOKEN);

      if (pathname === '/' || pathname === '/index.html' || pathname === '/dashboard.html') {
        const html = await fsp.readFile(DASHBOARD, 'utf8').catch(() => '<h1>dashboard.html missing</h1>');
        return send(res, 200, 'text/html; charset=utf-8', html);
      }

      if (pathname === '/api/tasks') {
        if (req.method === 'GET') {
          const md = await fsp.readFile(TASKS_MD, 'utf8').catch(() => '# Tasks\n');
          const mtime = await fileMtimeMs(TASKS_MD);
          return send(res, 200, 'text/markdown; charset=utf-8', md, { 'X-Board-Mtime': String(mtime) });
        }
        if (req.method === 'POST') {
          const body = await readBody(req);
          // Optimistic concurrency: when the client tells us which version it edited
          // (X-Base-Mtime), reject with 409 if the file changed underneath it — so an
          // agent's write is never silently stomped by a stale browser save. The 409
          // body carries the latest content + mtime so the client can reconcile.
          const base = req.headers['x-base-mtime'];
          if (base !== undefined && base !== '') {
            const current = await fileMtimeMs(TASKS_MD);
            if (String(current) !== String(base)) {
              const latest = await fsp.readFile(TASKS_MD, 'utf8').catch(() => '# Tasks\n');
              return send(res, 409, 'text/markdown; charset=utf-8', latest, { 'X-Board-Mtime': String(current) });
            }
          }
          const tmp = TASKS_MD + '.tmp';
          await fsp.writeFile(tmp, body, 'utf8');
          await fsp.rename(tmp, TASKS_MD);
          lastSelfWrite = Date.now();
          const mtime = await fileMtimeMs(TASKS_MD);
          return send(res, 200, 'application/json', JSON.stringify({ ok: true, mtime }), { 'X-Board-Mtime': String(mtime) });
        }
      }

      if (pathname === '/api/memory/tree' && req.method === 'GET') {
        return send(res, 200, 'application/json', JSON.stringify(await listMemory()));
      }

      if (pathname === '/api/memory/file') {
        const rel = url.searchParams.get('path') || '';
        const target = resolveMemoryPath(rel);
        if (!target) return send(res, 400, 'application/json', JSON.stringify({ error: 'bad path' }));
        if (req.method === 'GET') {
          const content = await fsp.readFile(target, 'utf8').catch(() => '');
          return send(res, 200, 'text/markdown; charset=utf-8', content);
        }
        if (req.method === 'POST') {
          const body = await readBody(req);
          await fsp.mkdir(path.dirname(target), { recursive: true });
          await fsp.writeFile(target, body, 'utf8');
          lastSelfWrite = Date.now();
          return send(res, 200, 'application/json', JSON.stringify({ ok: true }));
        }
      }

      if (pathname === '/api/events' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        res.write('retry: 2000\n\n');
        sseClients.add(res);
        const keepalive = setInterval(() => { try { res.write(': ping\n\n'); } catch { /* */ } }, 25_000);
        req.on('close', () => { clearInterval(keepalive); sseClients.delete(res); });
        return;
      }

      return send(res, 404, 'text/plain', 'not found');
    } catch (err) {
      try { send(res, 500, 'text/plain', String(err && err.message || err)); } catch { /* */ }
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  writeJsonSafe(STATE_FILE, { port, pid: process.pid, startedAt: new Date().toISOString() });

  // Watch for external edits (e.g. an agent editing TASKS.md) and push to the browser.
  // Debounced; suppress the echo of our own POST writes.
  let debounce = null;
  const onChange = (kind) => {
    if (Date.now() - lastSelfWrite < 800) return; // our own write — browser already has it
    clearTimeout(debounce);
    debounce = setTimeout(() => broadcast(kind), 150);
  };
  try { fs.watchFile(TASKS_MD, { interval: 600 }, () => onChange('tasks')); } catch { /* */ }
  try { fs.watch(TASKS_DIR, { recursive: true }, (_e, name) => {
    if (!name) return onChange('memory');
    const n = String(name);
    if (n.startsWith('.board-')) return;              // ignore our own state files
    onChange(n === 'TASKS.md' ? 'tasks' : 'memory');
  }); } catch { /* recursive watch unsupported on some Linux — watchFile above still covers TASKS.md */ }

  const url = `http://127.0.0.1:${port}/`;
  process.stdout.write(`SHAUGHV task board live at ${url}\n`);
  if (open) openInBrowser(url);

  const shutdown = () => { try { fs.unlinkSync(STATE_FILE); } catch { /* */ } process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  return url;
}

// ---------------------------------------------------------------------------
// ensure — start a detached server if one isn't already running
// ---------------------------------------------------------------------------

async function ensure({ open = false } = {}) {
  const running = await probeRunning();
  if (running) {
    const url = `http://127.0.0.1:${running.port}/`;
    if (open) openInBrowser(url);
    return url;
  }
  const port = await findFreePort(DEFAULT_PORT);
  let out = 'ignore', err = 'ignore';
  try { const fd = fs.openSync(LOG_FILE, 'a'); out = fd; err = fd; } catch { /* */ }
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'serve', '--port', String(port)], {
    detached: true,
    stdio: ['ignore', out, err],
  });
  child.unref();
  // Wait briefly for it to come up so callers learn the real port and can open it.
  const url = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 30; i++) {
    const r = await probeRunning();
    if (r) { if (open) openInBrowser(`http://127.0.0.1:${r.port}/`); return `http://127.0.0.1:${r.port}/`; }
    await new Promise((r) => setTimeout(r, 100));
  }
  if (open) openInBrowser(url);
  return url;
}

// ---------------------------------------------------------------------------
// hook — board-maintenance nudges (see references/board-server.md for the wiring)
// ---------------------------------------------------------------------------

// Returns { key, text } for an event (key is the SEMANTIC nudge type used for
// per-type cooldown — so a `git commit` nudge never suppresses a later `git push`),
// or null when this event shouldn't nudge (e.g. a Bash command that isn't commit/push).
function reminderFor(event, hookInput, url) {
  const tail = ` — the live board at ${url} (.tasks/TASKS.md).`;
  switch (event) {
    case 'SessionStart':
      return { key: 'session', text: `[task board] This repo uses a live SHAUGHV task board${tail} Keep it current so the operator has full visibility: as you start, finish, or discover work — and around commits, pushes, and subagents — update .tasks/TASKS.md (move items between sections, check off completed work, add new ones). The board auto-syncs; you just edit the file.` };
    case 'PostToolUse': {
      const cmd = (hookInput?.tool_input?.command || '').toString();
      if (/\bgit\s+push\b/.test(cmd)) return { key: 'push', text: `[task board] You just pushed. Make sure .tasks/TASKS.md reflects what landed — check off completed items and add any follow-ups — so the operator's board stays accurate.` };
      if (/\bgit\s+commit\b/.test(cmd)) return { key: 'commit', text: `[task board] You just committed. Update .tasks/TASKS.md to match (mark finished work done, add newly-surfaced tasks) so the operator can see progress.` };
      return null;
    }
    case 'ExitPlanMode':
      return { key: 'plan', text: `[task board] A plan was just approved. Mirror its steps into .tasks/TASKS.md as Active items so the operator can track execution against the board.` };
    case 'SubagentStart':
      return { key: 'subagent-start', text: `[task board] A subagent is starting. If it changes the plan or completes work, make sure .tasks/TASKS.md reflects it so the operator keeps visibility.` };
    case 'SubagentStop':
      return { key: 'subagent-stop', text: `[task board] A subagent just finished. Reflect any completed or newly-discovered work in .tasks/TASKS.md.` };
    default:
      return { key: 'generic', text: `[task board] Keep .tasks/TASKS.md current so the operator has full visibility.` };
  }
}

async function readStdin() {
  if (process.stdin.isTTY) return null;
  try {
    const chunks = [];
    const timer = setTimeout(() => process.stdin.destroy(), 500);
    for await (const c of process.stdin) chunks.push(c);
    clearTimeout(timer);
    const txt = Buffer.concat(chunks).toString('utf8').trim();
    return txt ? JSON.parse(txt) : null;
  } catch { return null; }
}

function nudgeAllowed(key) {
  // Session start always nudges; other nudge types are cooled down PER TYPE so a
  // commit nudge can't swallow a later push nudge, and a subagent fan-out can't spam.
  if (key === 'session') return true;
  const state = readJsonSafe(NUDGE_FILE) || {};
  const last = state[key] || 0;
  if (Date.now() - last < NUDGE_COOLDOWN_MS) return false;
  state[key] = Date.now();
  writeJsonSafe(NUDGE_FILE, state);
  return true;
}

async function hook(event) {
  // Gate: only act when this is really a task-board repo (defensive — the relative
  // path in the hook command already scopes us, but a subagent could run elsewhere).
  if (!fs.existsSync(DASHBOARD)) { process.exit(0); }

  const input = await readStdin();

  // A PostToolUse on the ExitPlanMode tool is the "plan approved" moment.
  let ev = event;
  if (event === 'PostToolUse' && input?.tool_name === 'ExitPlanMode') ev = 'ExitPlanMode';

  // Decide the reminder FIRST (using a placeholder URL) — a non-commit/push Bash
  // command returns null and we exit without even touching the server or cooldown.
  const placeholder = `http://127.0.0.1:${DEFAULT_PORT}/`;
  const reminder = reminderFor(ev, input, placeholder);
  if (!reminder) process.exit(0);

  // We have a nudge: make sure the live board is up (silently — hooks never --open),
  // then point the reminder at the real URL (the port may differ from the default).
  let url = placeholder;
  try { url = await ensure({ open: false }); } catch { /* board optional; still nudge */ }
  const text = reminder.text.split(placeholder).join(url);

  if (!nudgeAllowed(reminder.key)) process.exit(0);

  if (event === 'SessionStart') {
    // SessionStart: plain stdout is injected as context.
    process.stdout.write(text + '\n');
  } else {
    // PostToolUse / SubagentStart / SubagentStop: agent-visible additionalContext.
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: event, additionalContext: text },
    }));
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// stop / status
// ---------------------------------------------------------------------------

function stop() {
  const state = readJsonSafe(STATE_FILE);
  if (state?.pid && pidAlive(state.pid)) {
    try { process.kill(state.pid); } catch { /* */ }
  }
  try { fs.unlinkSync(STATE_FILE); } catch { /* */ }
  try { fs.unlinkSync(NUDGE_FILE); } catch { /* */ }
  process.stdout.write('stopped\n');
}

async function status() {
  const running = await probeRunning();
  process.stdout.write(JSON.stringify(running || { running: false }) + '\n');
}

// ---------------------------------------------------------------------------
// cli
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const cmd = argv[0] || 'serve';
const open = argv.includes('--open');
const portArg = argv.includes('--port') ? Number(argv[argv.indexOf('--port') + 1]) : undefined;

switch (cmd) {
  case 'serve':
    serve({ open, port: portArg }).catch((e) => { console.error(e); process.exit(1); });
    break;
  case 'ensure':
    ensure({ open }).then((u) => { process.stdout.write(u + '\n'); process.exit(0); })
      .catch((e) => { console.error(e); process.exit(1); });
    break;
  case 'hook':
    hook(argv[1] || 'SessionStart');
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    status();
    break;
  default:
    process.stderr.write(`unknown command: ${cmd}\n`);
    process.exit(2);
}
