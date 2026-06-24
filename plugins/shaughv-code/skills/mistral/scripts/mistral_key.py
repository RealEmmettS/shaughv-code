#!/usr/bin/env python3
"""
mistral_key.py — discover, check, and save the Mistral API key (MISTRAL_API_KEY).

This implements the key flow the skill promises:
  1. DISCOVER — look in the environment, then in a git-ignored .env walking up from cwd.
  2. PROMPT   — if it's missing, the *agent* asks the user for the key (a script can't
                reliably prompt inside a non-interactive tool shell), then calls this
                with --set-system and/or --set-repo, or just exports it for the session.
  3. SAVE     — persist to the Windows User environment and/or a git-ignored repo .env.

Commands
--------
  --check                 Report where (if anywhere) a key was found. Exit 0 if found, 2 if not.
                          Add --json for a machine-readable result. Never prints the full key.
  --set-system <key>      Persist to the per-user environment so new shells inherit it:
                          Windows → [Environment]::SetEnvironmentVariable('MISTRAL_API_KEY',…,'User')
                          POSIX   → appended as `export MISTRAL_API_KEY=…` to the user's shell rc.
  --set-repo <key>        Write MISTRAL_API_KEY into ./.env (path overridable with --env-file)
                          and ensure that file is in .gitignore. Never commit a key.

Examples
--------
    python mistral_key.py --check --json
    python mistral_key.py --set-repo sk-...           # save into ./.env (gitignored)
    python mistral_key.py --set-system sk-... && echo done
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _client import ENV_VAR, resolve_api_key, save_key_to_repo  # noqa: E402


def _mask(key: str) -> str:
    if len(key) <= 8:
        return "*" * len(key)
    return f"{key[:4]}…{key[-4:]} (len {len(key)})"


def _set_system(key: str) -> str:
    """Persist to the per-user environment. Returns a short human description of what happened."""
    if os.name == "nt":
        # Use .NET so it lands in the User scope (survives new shells); pwsh or powershell.
        ps = (
            "[Environment]::SetEnvironmentVariable("
            f"'{ENV_VAR}', $env:__MK_VAL, 'User')"
        )
        exe = "pwsh" if _which("pwsh") else "powershell"
        subprocess.run(
            [exe, "-NoProfile", "-NonInteractive", "-Command", ps],
            check=True, env={**os.environ, "__MK_VAL": key},
        )
        os.environ[ENV_VAR] = key  # hydrate the current process too
        return (f"Saved to the Windows User environment. New shells will inherit it; "
                f"hydrate the current one with:\n"
                f"  $env:{ENV_VAR} = [Environment]::GetEnvironmentVariable('{ENV_VAR}','User')")
    # POSIX: append an export to the user's shell rc (idempotent-ish).
    rc = Path.home() / (".zshrc" if os.environ.get("SHELL", "").endswith("zsh") else ".bashrc")
    line = f'export {ENV_VAR}="{key}"'
    prior = rc.read_text(encoding="utf-8") if rc.is_file() else ""
    if f"export {ENV_VAR}=" not in prior:
        with open(rc, "a", encoding="utf-8") as fh:
            fh.write(("\n" if prior and not prior.endswith("\n") else "") + line + "\n")
    os.environ[ENV_VAR] = key
    return f"Appended `export {ENV_VAR}=…` to {rc}. Run `source {rc}` or open a new shell."


def _which(name: str) -> bool:
    from shutil import which
    return which(name) is not None


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Discover/check/save the Mistral API key.")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--check", action="store_true", help="report where a key was found (exit 2 if none)")
    g.add_argument("--set-system", metavar="KEY", help="persist to the per-user environment")
    g.add_argument("--set-repo", metavar="KEY", help="write to a git-ignored .env in this repo")
    p.add_argument("--env-file", default=".env", help="dotenv path for --set-repo (default ./.env)")
    p.add_argument("--json", action="store_true", help="machine-readable output on stdout")
    args = p.parse_args(argv)

    if args.check:
        key, source = resolve_api_key()
        found = bool(key)
        if args.json:
            print(json.dumps({"found": found, "source": source,
                              "masked": _mask(key) if key else None, "env_var": ENV_VAR}))
        elif found:
            where = "environment" if source == "env" else source
            print(f"{ENV_VAR} found in {where}: {_mask(key)}")
        else:
            print(f"{ENV_VAR} not found (checked the environment and .env files up the tree).",
                  file=sys.stderr)
        return 0 if found else 2

    if args.set_system:
        try:
            note = _set_system(args.set_system)
        except Exception as e:  # noqa: BLE001
            print(f"ERROR: could not persist to the system environment: {e}", file=sys.stderr)
            return 1
        (print(json.dumps({"saved": "system", "env_var": ENV_VAR}))
         if args.json else print(note))
        return 0

    if args.set_repo:
        try:
            path = save_key_to_repo(args.set_repo, args.env_file)
        except Exception as e:  # noqa: BLE001
            print(f"ERROR: could not write {args.env_file}: {e}", file=sys.stderr)
            return 1
        msg = f"Saved {ENV_VAR} to {path} and ensured it's gitignored. Do not commit this file."
        (print(json.dumps({"saved": "repo", "path": str(path), "env_var": ENV_VAR}))
         if args.json else print(msg))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
