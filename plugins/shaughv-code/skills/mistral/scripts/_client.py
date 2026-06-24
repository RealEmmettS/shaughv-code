#!/usr/bin/env python3
"""
_client.py — shared helpers for the Mistral skill's runner scripts.

Everything here is pure standard library — no third-party packages required — so the
runner scripts work on any machine with Python 3.8+ even when the `mistralai` SDK is
not installed. The SDK is only needed if you want to copy the SDK code samples from
the reference docs; the scripts themselves talk to the REST API directly.

What this module provides
-------------------------
* resolve_api_key()  — the discover step of the key flow: env var → repo .env file.
* require_api_key()  — resolve, or exit(2) with an agent-readable "ask the user" message.
* save_key_to_repo() — write MISTRAL_API_KEY to a .env and make sure .env is gitignored.
* http_json()        — JSON request with retry/backoff on transient (429/5xx) errors.
* http_multipart()   — multipart/form-data POST (used for audio file uploads).
* http_sse()         — yield Server-Sent-Event `data:` payloads from a streaming POST.
* http_raw()         — POST returning raw bytes + content-type (used by speech).
* download()         — stream a URL to a file.

Conventions shared by every runner
-----------------------------------
* JSON contract on **stdout** (`--json`); all human/progress logs on **stderr**.
* Exit codes: 0 ok, 2 missing/!resolvable API key, 1 any other error.

Auth: MISTRAL_API_KEY (Bearer token). Base URL: https://api.mistral.ai
Get a key at https://console.mistral.ai. The OpenAPI spec lives at
https://docs.mistral.ai/openapi.yaml (a copy is bundled at ../references/openapi.yaml).
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = os.environ.get("MISTRAL_BASE_URL", "https://api.mistral.ai").rstrip("/")
ENV_VAR = "MISTRAL_API_KEY"
_RETRYABLE = (429, 500, 502, 503, 504)


def log(msg: str, quiet: bool = False) -> None:
    """Progress/diagnostic line on stderr (never stdout — stdout is the JSON contract)."""
    if not quiet:
        print(msg, file=sys.stderr, flush=True)


# --------------------------------------------------------------------------- key flow
def _parse_env_file(path: Path) -> str | None:
    """Pull MISTRAL_API_KEY out of a dotenv-style file (KEY=value, optional quotes)."""
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            if k.strip() == ENV_VAR:
                return v.strip().strip('"').strip("'") or None
    except OSError:
        return None
    return None


def _candidate_env_files(start: Path) -> list[Path]:
    """`.env` / `.mistral.env` in the start dir and each parent up to the filesystem root."""
    names = (".env", ".mistral.env", ".env.local")
    out: list[Path] = []
    d = start.resolve()
    while True:
        for n in names:
            out.append(d / n)
        if d.parent == d:
            break
        d = d.parent
    return out


def resolve_api_key(start_dir: str | os.PathLike | None = None) -> tuple[str | None, str]:
    """
    Discover the key. Returns (key_or_None, source) where source is one of
    "env", "<path to .env>", or "" when nothing was found.

    Order: process/User environment first, then a git-ignored .env walking up from
    the current working directory. This is the "discover" half of discover→prompt→save;
    prompting the user and saving are handled by mistral_key.py / the agent.
    """
    env = os.environ.get(ENV_VAR)
    if env:
        return env.strip(), "env"
    start = Path(start_dir) if start_dir else Path.cwd()
    for f in _candidate_env_files(start):
        if f.is_file():
            v = _parse_env_file(f)
            if v:
                return v, str(f)
    return None, ""


def require_api_key(start_dir: str | os.PathLike | None = None) -> str:
    """resolve_api_key() or exit(2) with a message the agent can act on."""
    key, _ = resolve_api_key(start_dir)
    if key:
        return key
    print(
        "ERROR: MISTRAL_API_KEY is not set and no .env in this tree contains it.\n"
        "Ask the user for their Mistral API key (from https://console.mistral.ai), then either:\n"
        "  • set it for this session:        $env:MISTRAL_API_KEY = '<key>'   (PowerShell)\n"
        "  • persist it for this machine:    python mistral_key.py --set-system <key>\n"
        "  • save it into this repo (.env):  python mistral_key.py --set-repo <key>",
        file=sys.stderr,
    )
    raise SystemExit(2)


def ensure_gitignored(env_path: Path) -> None:
    """Append the env filename to .gitignore (creating it) so a saved key can't be committed."""
    name = env_path.name
    gi = env_path.parent / ".gitignore"
    existing = gi.read_text(encoding="utf-8").splitlines() if gi.is_file() else []
    if name in (l.strip() for l in existing):
        return
    with open(gi, "a", encoding="utf-8") as fh:
        if existing and existing[-1].strip():
            fh.write("\n")
        fh.write(f"{name}\n")


def save_key_to_repo(key: str, env_path: str | os.PathLike = ".env") -> Path:
    """Write/replace MISTRAL_API_KEY in a dotenv file and make sure it's gitignored."""
    p = Path(env_path)
    lines = p.read_text(encoding="utf-8").splitlines() if p.is_file() else []
    out, replaced = [], False
    for line in lines:
        if line.strip().startswith(f"{ENV_VAR}="):
            out.append(f"{ENV_VAR}={key}")
            replaced = True
        else:
            out.append(line)
    if not replaced:
        out.append(f"{ENV_VAR}={key}")
    p.write_text("\n".join(out) + "\n", encoding="utf-8")
    ensure_gitignored(p)
    return p.resolve()


# --------------------------------------------------------------------------- HTTP
def _request(path: str, key: str, *, method: str, data: bytes | None,
             headers: dict, timeout: int, retries: int):
    url = path if path.startswith("http") else f"{BASE_URL}{path}"
    last = None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Bearer {key}")
        for h, v in headers.items():
            req.add_header(h, v)
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if e.code in _RETRYABLE and attempt < retries - 1:
                last = e
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code} from {url}: {body[:800]}") from e
        except (urllib.error.URLError, TimeoutError) as e:
            last = e
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"network error calling {url}: {e}") from e
    raise RuntimeError(f"request to {url} failed after {retries} attempts: {last}")


def http_json(path: str, key: str, *, method: str = "GET", payload=None,
              timeout: int = 300, retries: int = 3) -> dict:
    """JSON in / JSON out. payload=None sends no body (GET/DELETE)."""
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    with _request(path, key, method=method, data=data, headers=headers,
                  timeout=timeout, retries=retries) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body) if body else {}


def _multipart_body(fields: dict, files: dict) -> tuple[bytes, str]:
    """Encode fields (str) + files ({name: (filename, bytes, mimetype)}) as multipart."""
    boundary = f"----mistral{uuid.uuid4().hex}"
    out = bytearray()
    for name, value in fields.items():
        if value is None:
            continue
        for v in (value if isinstance(value, (list, tuple)) else [value]):
            out += f"--{boundary}\r\n".encode()
            out += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
            out += f"{v}\r\n".encode()
    for name, (filename, content, mime) in files.items():
        out += f"--{boundary}\r\n".encode()
        out += (f'Content-Disposition: form-data; name="{name}"; '
                f'filename="{filename}"\r\n').encode()
        out += f"Content-Type: {mime}\r\n\r\n".encode()
        out += content
        out += b"\r\n"
    out += f"--{boundary}--\r\n".encode()
    return bytes(out), boundary


def http_multipart(path: str, key: str, fields: dict, files: dict | None = None,
                   *, timeout: int = 600, retries: int = 2) -> dict:
    """POST multipart/form-data (audio uploads). Returns parsed JSON."""
    body, boundary = _multipart_body(fields, files or {})
    headers = {"Accept": "application/json",
               "Content-Type": f"multipart/form-data; boundary={boundary}"}
    with _request(path, key, method="POST", data=body, headers=headers,
                  timeout=timeout, retries=retries) as resp:
        text = resp.read().decode("utf-8")
        return json.loads(text) if text else {}


def http_sse(path: str, key: str, *, payload=None, fields=None, files=None,
             timeout: int = 600):
    """
    POST and yield each SSE `data:` payload string (excluding the `[DONE]` sentinel).
    Pass either payload (JSON) or fields/files (multipart).
    """
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers = {"Accept": "text/event-stream", "Content-Type": "application/json"}
    else:
        data, boundary = _multipart_body(fields or {}, files or {})
        headers = {"Accept": "text/event-stream",
                   "Content-Type": f"multipart/form-data; boundary={boundary}"}
    with _request(path, key, method="POST", data=data, headers=headers,
                  timeout=timeout, retries=1) as resp:
        for raw in resp:
            line = raw.decode("utf-8", "replace").rstrip("\n").rstrip("\r")
            if not line or line.startswith(":"):
                continue
            if line.startswith("data:"):
                chunk = line[5:].strip()
                if chunk and chunk != "[DONE]":
                    yield chunk


def http_raw(path: str, key: str, *, payload, timeout: int = 600,
             retries: int = 2) -> tuple[bytes, str]:
    """POST JSON, return (raw_bytes, content_type). Used when a response may be binary."""
    data = json.dumps(payload).encode("utf-8")
    headers = {"Accept": "*/*", "Content-Type": "application/json"}
    with _request(path, key, method="POST", data=data, headers=headers,
                  timeout=timeout, retries=retries) as resp:
        return resp.read(), (resp.headers.get("Content-Type") or "").lower()


def download(url: str, dest: Path, timeout: int = 300) -> int:
    """Stream a (possibly signed) URL to a local file. Returns bytes written."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp, open(dest, "wb") as fh:
        n = 0
        while True:
            chunk = resp.read(1 << 16)
            if not chunk:
                break
            fh.write(chunk)
            n += len(chunk)
    return n


def upload_file(local_path: Path, key: str, purpose: str = "ocr") -> str:
    """Upload a local file to /v1/files and return its file_id (used by OCR for local docs)."""
    import mimetypes
    mime = mimetypes.guess_type(str(local_path))[0] or "application/octet-stream"
    res = http_multipart(
        "/v1/files", key,
        fields={"purpose": purpose},
        files={"file": (local_path.name, local_path.read_bytes(), mime)},
    )
    fid = res.get("id")
    if not fid:
        raise RuntimeError(f"upload did not return a file id: {json.dumps(res)[:400]}")
    return fid


def delete_file(file_id: str, key: str) -> bool:
    """
    Delete an uploaded file (DELETE /v1/files/{id}). Best-effort and never fatal:
    callers run this after they have their result so a temporary upload doesn't sit
    in storage racking up cost. Returns True on a confirmed delete, False otherwise.
    """
    try:
        res = http_json(f"/v1/files/{file_id}", key, method="DELETE", retries=2)
        return bool(res.get("deleted", True))
    except Exception:  # noqa: BLE001 — cleanup must not mask the real result/error
        return False
