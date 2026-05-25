---
name: shaughv-gcs-storage
description: >
  How to upload to, download from, and manage Emmett's personal public Google Cloud
  Storage bucket at `gs://shaughv`, and return shareable URLs of the form
  `https://storage.googleapis.com/shaughv/<path>`. Use this skill whenever the user
  mentions the `shaughv` bucket, `gs://shaughv`, `storage.googleapis.com/shaughv`,
  Emmett's personal GCS bucket, "upload to shaughv", "the shaughv bucket", or asks
  to share / publish / stage an asset for Emmett that needs a real URL (and is NOT
  a SHAUGHV brand asset — those live on `cdn.shaughv.com` and are covered by the
  `shaughv-cdn` skill). Also use when the user says "put this on my bucket" / "put
  this on GCS" / "put this on Cloud Storage" / "stage this for me" in any SHAUGHV
  or Emmett-personal context. Bucket name, project, public-read access, soft delete,
  versioning, and CORS state are pre-wired so the agent never has to ask. For
  general GCS concepts (auth deep-dive, signed URLs, IAM, lifecycle, HNS folders,
  any bucket OTHER than `shaughv`) defer to the `gcs-storage` skill.
---

# SHAUGHV GCS Bucket — `gs://shaughv`

`gs://shaughv` is Emmett's personal, public-read Google Cloud Storage
bucket. Anything uploaded becomes publicly readable at
`https://storage.googleapis.com/shaughv/<exact-object-path>` with no
auth UI, no Google sign-in prompt, no token. Use it for sharing assets
with users, embedding in personal projects, staging screenshots,
ad-hoc file sharing — anything that needs a real URL.

**This skill is the layer of "what to type for Emmett's bucket".** For
the layer of "what these commands actually do" or anything involving a
different bucket, defer to the `gcs-storage` skill.

## Bucket facts (pre-wired — don't ask the user)

| Property | Value |
|---|---|
| Bucket name | `shaughv` |
| gsutil URI | `gs://shaughv` |
| Cloud Console | `https://console.cloud.google.com/storage/browser/shaughv` |
| Location | `us` (multi-region in United States) |
| Storage class | Standard |
| Access control | Uniform bucket-level (UBLA) |
| Public access | Granted to `allUsers` (`roles/storage.objectViewer`) — every object is publicly readable |
| Public URL pattern | `https://storage.googleapis.com/shaughv/<path>` |
| Soft delete | 7 days (604800 s) — `rm` is recoverable for a week |
| Object versioning | ON — overwrites and deletes keep a noncurrent version |
| CORS | NOT enabled — `<img>` / `<video>` / `<link>` work cross-origin; `fetch()` / XHR do NOT |
| Encryption | Google-managed keys |
| Hierarchical namespace | Not enabled — treat as flat (slash-prefixed object names) |
| Lifecycle rules | 2 rules (Rapid Cache, Cache) — operationally meaningful, leave alone |
| Encryption enforcement | Customer-supplied keys restricted as of May 2026 |

## Prerequisites — one-time on this machine

```bash
# 1) CLI auth (lets gcloud + gcloud storage operate)
gcloud auth login

# 2) SDK auth — required if Python / Node / Go code will hit the bucket
gcloud auth application-default login

# 3) Project context (any project Emmett owns works for bucket access since
#    he has owner on `shaughv` directly)
gcloud config set project gen-lang-client-0346225705
```

Two separate logins is intentional — `auth login` is for the CLI,
`auth application-default login` is for SDKs reading Application
Default Credentials. Skipping the second is the #1 cause of "the CLI
works but my script can't auth".

### If `gcloud` doesn't resolve

Quick triage before doing anything else. Every install needs Python
3.10–3.14 at runtime; the Windows installer and the macOS/Linux
tarballs bundle Python 3.13, the package-manager installs do not.
(Deep coverage — proxy/MITM SSL fixes, RHEL/Fedora dnf install, snap
vs apt collision, the Windows `find` PATH gotcha — lives in the
`gcs-storage` skill's "Installing and verifying" section.)

- **macOS** — `brew install --cask gcloud-cli` (Homebrew) or the
  official tarball at
  `https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz`
  (Apple Silicon) / `-darwin-x86_64.tar.gz` (Intel). Extract, run
  `./google-cloud-sdk/install.sh`, answer Y to the PATH prompt, open
  a new terminal.
- **Linux** — `sudo snap install google-cloud-cli --classic` (easiest;
  bundles Python). On Debian/Ubuntu with system Python 3.10–3.14 the
  apt repo at `https://packages.cloud.google.com/apt cloud-sdk main`
  also works. RHEL/Fedora/CentOS use the dnf repo (also requires
  `libxcrypt-compat.x86_64`). After any install, open a new terminal.
- **Windows** — installer at
  `https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe`.
  Requires Windows 8.1+ or Server 2012+. Drops the SDK at one of
  `C:\Program Files (x86)\Google\Cloud SDK\`,
  `C:\Program Files\Google\Cloud SDK\`, or
  `%LOCALAPPDATA%\Google\Cloud SDK\`. The installer adds the
  `bin/` directory to PATH; **running shells must be restarted** to
  pick that up.

After install, the one-stop bootstrap is `gcloud init` — it walks
through sign-in, project selection, and region in one go. Then
**separately** run `gcloud auth application-default login` to write
ADC for SDKs (Python, Node, etc. — `gcloud init` does NOT do this).

**If `gcloud` exists on disk but the current shell says "command not
found", that shell was started before PATH was updated.** Open a new
terminal. If a long-running agent shell can't see it, call the full
path directly:

```powershell
# Windows fallback when PATH is stale
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" storage cp ...
```

```bash
# Linux fallback
/usr/lib/google-cloud-sdk/bin/gcloud storage cp ...
# macOS Homebrew fallback
/opt/homebrew/share/google-cloud-sdk/bin/gcloud storage cp ...
```

Other common setup hiccups, by OS — for full coverage including SSL
proxy issues, Python alias problems, and WSL/Homebrew traps, see the
`gcs-storage` skill's gotchas section.

- **Windows behind a corporate SSL proxy** (Zscaler, Netskope, etc.):
  `gcloud config set core/custom_ca_certs_file C:\path\to\corp-ca.pem`.
- **macOS headless / SSH session**: `gcloud auth application-default
  login --no-browser` and copy/paste the URL into a browser on
  another machine.
- **Linux `exec: python: not found` after a gcloud update**:
  `sudo apt install python-is-python3`, or
  `export CLOUDSDK_PYTHON="$(command -v python3)"`.

## Upload a single file

```bash
gcloud storage cp ./screenshot.png gs://shaughv/screenshots/screenshot.png \
  --content-type=image/png \
  --cache-control="public, max-age=31536000, immutable"
```

Resulting public URL:

```
https://storage.googleapis.com/shaughv/screenshots/screenshot.png
```

Return this URL form to the user. **Do not** return
`gs://shaughv/screenshots/screenshot.png` (CLI-only, not browser-loadable)
or `https://storage.cloud.google.com/shaughv/screenshots/screenshot.png`
(triggers a Google sign-in flow for some users and never sends CORS
headers).

### Python

```python
from google.cloud import storage

client = storage.Client()
bucket = client.bucket("shaughv")
blob = bucket.blob("screenshots/screenshot.png")
blob.content_type = "image/png"
blob.cache_control = "public, max-age=31536000, immutable"
blob.upload_from_filename("./screenshot.png")

print(f"https://storage.googleapis.com/shaughv/{blob.name}")
```

### Node

```js
import { Storage } from "@google-cloud/storage";
const bucket = new Storage().bucket("shaughv");
await bucket.upload("./screenshot.png", {
  destination: "screenshots/screenshot.png",
  metadata: {
    contentType: "image/png",
    cacheControl: "public, max-age=31536000, immutable",
  },
});
console.log("https://storage.googleapis.com/shaughv/screenshots/screenshot.png");
```

## Upload a folder of assets under a prefix

```bash
gcloud storage cp --recursive ./build/ gs://shaughv/projects/my-project/
```

This creates objects named
`projects/my-project/index.html`, `projects/my-project/static/app.js`,
etc. The "folder" is just the shared prefix — there's no folder object
to manage. Public URLs:

```
https://storage.googleapis.com/shaughv/projects/my-project/index.html
https://storage.googleapis.com/shaughv/projects/my-project/static/app.js
```

For directory uploads of mixed asset types, MIME auto-detection from
file extension generally works, but **always pass `--content-type`
explicitly for `.webp`, `.avif`, `.mjs`, `.wasm`, or anything else
unusual** — gcloud's MIME map lags those formats and silently uploads
them as `application/octet-stream`, which browsers refuse to render.

## List what's already there

```bash
gcloud storage ls gs://shaughv                       # top-level prefixes + objects
gcloud storage ls -l gs://shaughv/screenshots/       # one prefix, long format (size + mtime)
gcloud storage ls --recursive gs://shaughv           # everything (be careful with large prefixes)
```

```python
for blob in storage.Client().list_blobs("shaughv", prefix="screenshots/"):
    print(blob.name, blob.size, blob.updated)
```

## Delete an object

```bash
gcloud storage rm gs://shaughv/screenshots/screenshot.png
```

**Important caveats specific to this bucket:**

- The bucket has **soft delete = 7 days**, so `rm` is recoverable for
  a week. The object disappears from normal `ls` and the public URL
  starts returning 404, but the bytes are retained.
- The bucket has **object versioning = ON**, so a normal `rm` also
  creates a noncurrent version that persists until a lifecycle rule
  (or a hard delete) removes it.

To force a hard delete (skip soft delete + remove all versions):

```bash
# First, find the generation IDs of every version
gcloud storage ls --all-versions gs://shaughv/screenshots/screenshot.png

# Then delete each by generation
gcloud storage rm "gs://shaughv/screenshots/screenshot.png#GENERATION_ID"
```

To recover a soft-deleted or noncurrent object:

```bash
gcloud storage ls --all-versions gs://shaughv/screenshots/screenshot.png
gcloud storage objects restore "gs://shaughv/screenshots/screenshot.png#GENERATION_ID"
```

## URL conventions — what to return to the user

```
https://storage.googleapis.com/shaughv/<exact-object-name>
```

- Object names with spaces or non-ASCII characters need URL encoding
  (`%20`, `%C3%A9`, etc.). SDKs do this automatically when you construct
  a URL from `blob.public_url`; manual construction needs `encodeURIComponent`
  (JS) or `urllib.parse.quote` (Python, with `safe="/"` so slashes
  survive).
- The two slashes in `https://` matter — don't accidentally double-slash
  after `shaughv/`.
- **Don't return `storage.cloud.google.com`** — that endpoint forces a
  Google sign-in screen for some users and never sends CORS headers.
- **Don't return `gs://shaughv/...`** unless the user is going to paste
  it into a CLI or SDK call.

## Setting Content-Type and Cache-Control

The bucket sends whatever Content-Type and Cache-Control you set on
the object — those become real HTTP response headers when the public
URL is fetched. Defaults if you don't set them: auto-detected MIME
(usually right for common types, wrong for newer ones), no
Cache-Control.

Recommended defaults for content-addressed binaries (images, fonts,
compiled assets that won't change at the same URL):

```bash
--content-type=<correct mime>
--cache-control="public, max-age=31536000, immutable"
```

For HTML, CSS, or JS that you'll update in place at the same URL,
shorter cache + revalidation:

```bash
--content-type=text/html; charset=utf-8
--cache-control="public, max-age=300, stale-while-revalidate=86400"
```

If you upload with the wrong Content-Type, fix it without re-uploading:

```bash
gcloud storage objects update gs://shaughv/path/file.svg \
  --content-type=image/svg+xml
```

## Enabling CORS (the bucket has it OFF today)

CORS is OFF on `gs://shaughv` as of May 2026. Direct `<img>`, `<video>`,
`<audio>`, `<link>`, and `<script>` loads work fine cross-origin
because they don't require CORS. But a browser app that does
`fetch("https://storage.googleapis.com/shaughv/foo.json")` from a
different origin **will fail** with the usual missing
`Access-Control-Allow-Origin` error.

To turn CORS on (only do this if the user explicitly asks):

```bash
# Write a CORS config — open GET/HEAD from any origin, 1-hour preflight cache
cat > cors.json <<'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control", "ETag", "Last-Modified"],
    "maxAgeSeconds": 3600
  }
]
EOF

gcloud storage buckets update gs://shaughv --cors-file=./cors.json

# Confirm
gcloud storage buckets describe gs://shaughv --format=json | jq .cors
```

Note that `storage.cloud.google.com` will NEVER return CORS headers
regardless of bucket config — always use `storage.googleapis.com` for
any JS-fetched asset.

To turn CORS back off:

```bash
gcloud storage buckets update gs://shaughv --clear-cors
```

## Quick decision matrix

| User wants to… | Run |
|---|---|
| Share a file as a URL | `gcloud storage cp ./file gs://shaughv/<prefix>/file [--content-type=...]` → return `https://storage.googleapis.com/shaughv/<prefix>/file` |
| Upload a directory | `gcloud storage cp --recursive ./dir gs://shaughv/<prefix>/` |
| List what's there | `gcloud storage ls gs://shaughv/<prefix>/` |
| Delete a file | `gcloud storage rm gs://shaughv/<prefix>/file` (recoverable for 7d) |
| Hard-delete (all versions) | `gcloud storage ls --all-versions gs://shaughv/<prefix>/file`, then `rm` each `#GENERATION` |
| Recover a deleted file | `gcloud storage objects restore "gs://shaughv/<prefix>/file#GENERATION"` |
| Fix wrong Content-Type after upload | `gcloud storage objects update gs://shaughv/<prefix>/file --content-type=<mime>` |
| Enable CORS (only when asked) | Write `cors.json`, `gcloud storage buckets update gs://shaughv --cors-file=cors.json` |

## Full cross-platform reference (everything you might need)

The sections above cover the SHAUGHV bucket specifically. The
sections below mirror the generic `gcs-storage` skill so this skill
stands alone — an agent loaded with only `shaughv-gcs-storage` has
complete context for install, auth, scripting, troubleshooting, and
SDK choice.

### URL surfaces (recap of the three forms)

| URL | Used by | Notes |
|---|---|---|
| `gs://BUCKET/OBJECT` | CLI, SDKs | Not browser-fetchable. CLI/SDK-only. |
| `https://storage.googleapis.com/BUCKET/OBJECT` | Browsers, `<img>`, `<video>`, `fetch()`, `curl` | The "direct" URL. Works for public objects with no auth UI. Respects bucket CORS config. **Return this form for `shaughv`.** |
| `https://storage.cloud.google.com/BUCKET/OBJECT` | Humans clicking a link | Triggers a Google sign-in flow for private objects. **Never allows CORS**, regardless of bucket config. Avoid. |

### Installing the gcloud CLI (full per-OS)

The current official version is **gcloud CLI 569.0.0** (May 2026).
Every install path requires **Python 3.10–3.14** at runtime; the
Windows and tarball installers bundle Python 3.13, the package-manager
installs do not. Canonical source is
`https://docs.cloud.google.com/sdk/docs/install-sdk` — defer to it if
anything below conflicts. Architecture matters: pick the right tarball
with `uname -a` (Linux) or `uname -m` (macOS).

**macOS**

```bash
# Tarball installer (official). Pick darwin-arm.tar.gz for Apple Silicon,
# darwin-x86_64.tar.gz for Intel.
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz
tar -xf google-cloud-cli-darwin-arm.tar.gz
./google-cloud-sdk/install.sh   # answer Y to add to PATH + enable completion

# Or Homebrew (community-maintained, easier updates)
brew install --cask gcloud-cli
```

Open a new terminal so PATH refreshes, then `gcloud --version`.

**Linux — Debian / Ubuntu (apt, recommended)**

```bash
sudo apt-get update
sudo apt-get install ca-certificates gnupg curl
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-cli
```

Apt does NOT bundle Python; system Python must be 3.10–3.14. Binary at
`/usr/lib/google-cloud-sdk/bin/gcloud`, auto-on-PATH.

**Linux — Snap (Ubuntu, easiest)**

```bash
sudo snap install google-cloud-cli --classic
```

Bundles its own Python. Binary at `/snap/bin/gcloud`. Remove the
legacy `google-cloud-sdk` snap first if present — they collide on the
`gcloud` symlink.

**Linux — RHEL / Fedora / CentOS (dnf)**

```bash
sudo tee -a /etc/yum.repos.d/google-cloud-sdk.repo << 'EOM'
[google-cloud-cli]
name=Google Cloud CLI
baseurl=https://packages.cloud.google.com/yum/repos/cloud-sdk-el9-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOM

sudo dnf install libxcrypt-compat.x86_64
sudo dnf install google-cloud-cli
```

`libxcrypt-compat.x86_64` is required on RHEL 9+ — easy to miss; gcloud
fails at startup without it. For RHEL 10 use the `cloud-sdk-el10-x86_64`
repo; for ARM64 use the `aarch64` repos.

**Linux — generic tarball (Arch, Alpine, anything else)**

```bash
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
exec -l $SHELL
```

**Windows**

```powershell
(New-Object Net.WebClient).DownloadFile(
  "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe",
  "$env:Temp\GoogleCloudSDKInstaller.exe"
)
& $env:Temp\GoogleCloudSDKInstaller.exe
```

Requires Windows 8.1+ or Windows Server 2012+. Installer bundles
Python 3.13. Drop locations:

- `C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\` (system, common)
- `C:\Program Files\Google\Cloud SDK\google-cloud-sdk\` (system, newer)
- `%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\` (user-local)

Open a **new** terminal — running shells inherit the old PATH.

Community options also work:

```powershell
choco install gcloudsdk
scoop bucket add extras; scoop install gcloud
```

Windows install-time gotchas:

- "`find` not recognized" during install — add `C:\WINDOWS\system32;` back to PATH and re-run.
- Reboot before reinstalling if a previous gcloud was uninstalled.
- Unzip fails partway → run installer as Administrator.

**Cloud Shell**

If the user is in Cloud Shell, gcloud is pre-installed and
pre-authenticated. Skip install + auth steps entirely; go straight
to `gcloud config set project ...` and start running commands.

**Adding to PATH manually if the installer didn't**

```powershell
# Windows — append to USER PATH (no admin needed)
$bin = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*google-cloud-sdk\bin*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$bin", "User")
}
```

```bash
# macOS / Linux — append to your shell rc
echo 'export PATH="$HOME/google-cloud-sdk/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Proxy / corporate-MITM SSL**

```bash
# POSIX
gcloud config set core/custom_ca_certs_file /etc/ssl/corp-ca-bundle.pem

# Windows
gcloud config set core/custom_ca_certs_file "C:\corp\corp-ca-bundle.pem"
```

The corp CA bundle must include both the intermediate AND the root the
proxy injects.

**Post-install bootstrap**

```bash
gcloud init                            # interactive: login + project + region
gcloud auth application-default login  # SEPARATE — ADC for SDKs
gcloud components install gsutil       # optional, legacy gsutil only
```

Verify:

```bash
gcloud auth list                       # active credentialed account
gcloud config list                     # project, account, region
gcloud storage ls                      # lists buckets in current project
gcloud info                            # credential file paths, Python interpreter
```

### Authentication deep dive

**Two paths, neither is a superset of the other.**

Interactive (gcloud / ADC):

```bash
gcloud auth login                          # authorizes the CLI
gcloud auth application-default login      # writes ADC to disk for SDKs
```

ADC file path:

- Linux/macOS: `~/.config/gcloud/application_default_credentials.json`
- Windows: `%APPDATA%\gcloud\application_default_credentials.json`

ADC creds are `authorized_user` shape — they have no `private_key` and
**cannot sign URLs**. Use a service account JSON or impersonation for
signing.

Service account impersonation (preferred over keys):

```bash
gcloud iam service-accounts add-iam-policy-binding \
  my-sa@PROJECT_ID.iam.gserviceaccount.com \
  --member="user:you@example.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Persistent — every gcloud call uses the SA
gcloud config set auth/impersonate_service_account my-sa@PROJECT_ID.iam.gserviceaccount.com

# Per-invocation
gcloud storage cp ./file gs://shaughv/ \
  --impersonate-service-account=my-sa@PROJECT_ID.iam.gserviceaccount.com
```

Service account JSON key (for CI, headless):

```bash
gcloud iam service-accounts create my-sa --project=PROJECT_ID
gcloud iam service-accounts keys create ./sa.json \
  --iam-account=my-sa@PROJECT_ID.iam.gserviceaccount.com

# Activate for gcloud (cleaner than env var)
gcloud auth login --cred-file=./sa.json

# Or set the env var for SDKs
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/secrets/sa.json"    # bash/zsh
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\me\secrets\sa.json"  # PowerShell
```

Headless remote auth — two patterns:

```bash
# Pattern A — you can install gcloud on a second machine with a browser
gcloud auth login --no-browser   # prints a command, run it on the browser machine

# Pattern B — you can't install gcloud anywhere else; copy/paste an OAuth URL
gcloud auth login --no-launch-browser
gcloud auth application-default login --no-launch-browser
```

Multiple credentialed accounts:

```bash
gcloud auth list                                          # all stored creds + active
gcloud config set account other@example.com               # switch active
gcloud storage cp ./x gs://shaughv/ --account=other@example.com   # per-call
gcloud auth revoke other@example.com                      # remove stored creds
```

Configurations (named property bundles for multi-project workflows):

```bash
gcloud config configurations create work
gcloud config configurations activate work
gcloud config set project work-project
gcloud config configurations activate default            # switch back
```

ADC precedence (highest first) when an SDK looks up credentials:

1. `GOOGLE_APPLICATION_CREDENTIALS` env var
2. `gcloud config set auth/impersonate_service_account` (layered)
3. The ADC file from `gcloud auth application-default login`
4. Metadata-server creds (only on GCE / Cloud Run / GKE)

Unexpected creds → reset cleanly:

```bash
unset GOOGLE_APPLICATION_CREDENTIALS
gcloud config unset auth/impersonate_service_account
gcloud auth application-default login
```

**What doesn't work for GCS auth:** API keys never authorize GCS
(they work for a subset of Google APIs but not Storage). OAuth tokens
must include a `devstorage.*` or `cloud-platform` scope.

**Workforce Identity Federation (Okta / Entra users):** call
`gcloud iam workforce-pools sign-in` before `gcloud auth login`. Symptom
of skipping that step: auth appears to succeed but every API returns
401 with "resource is not accessible".

### gcloud command structure + cheat sheet

```
gcloud + [release level] + component + entity + operation + [positional args] + [flags]
```

Common GCS-adjacent commands:

```bash
# Diagnostics
gcloud version
gcloud info                              # credential paths, Python interpreter
gcloud components list
gcloud components install COMPONENT
gcloud components update

# Project context
gcloud projects describe PROJECT_ID
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:x@y.com --role=roles/storage.admin

# IAM
gcloud iam list-grantable-roles //storage.googleapis.com/projects/_/buckets/shaughv
gcloud iam service-accounts keys list --iam-account=SA_EMAIL
gcloud auth print-access-token            # for raw REST calls / debugging

# Help
gcloud help storage cp
gcloud storage cp --help
gcloud topic filters
```

Global flags worth knowing:

- `--quiet` / `-q` — disable interactive prompts (essential for scripts)
- `--format=value(...)` / `--format=json` — machine-readable output
- `--filter='expr'` — filter list output server-side
- `--sort-by=FIELD` — sort list output
- `--limit=N` — cap returned rows
- `--project=PROJECT_ID` — per-call project override
- `--account=ACCOUNT` — per-call account override
- `--verbosity=debug|info|warning|error|critical|none`
- `--no-user-output-enabled` — suppress stdout (useful in CI)
- `--help` — detailed per-command help

Line continuation: Linux/macOS use `\`, Windows cmd uses `^`, PowerShell
uses backtick (`` ` ``). When pasting multi-line gcloud examples on
Windows, convert or join to one line.

stdout vs stderr: successful command output → stdout; prompts, warnings,
errors → stderr. Script against stdout only; stderr wording is unstable.

### Cloud Client Libraries — language matrix

| Language | Package / library | Auth source |
|---|---|---|
| Python | `google-cloud-storage` (pip) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| Node.js | `@google-cloud/storage` (npm) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| Go | `cloud.google.com/go/storage` | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| Java | `google-cloud-storage` (Maven) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| Ruby | `google-cloud-storage` (gem) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| PHP | `google/cloud-storage` (Composer) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| C# / .NET | `Google.Cloud.Storage.V1` (NuGet) | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| C++ | `google-cloud-cpp/storage` | ADC or `GOOGLE_APPLICATION_CREDENTIALS` |
| Rust | `google-cloud-storage` (crates.io) | ADC or env var |

If a language isn't listed, fall back to the Google API Client Libraries
or call the JSON REST API directly with `gcloud auth print-access-token`.

### Comprehensive gotchas catalog

The full version lives in `gcs-storage` — quick condensed catalog
here so this skill is self-sufficient:

**Auth (all platforms)**

- `gcloud auth login` ≠ `gcloud auth application-default login`. Run
  both. "CLI works but my script doesn't" is this 90% of the time.
- ADC has no `private_key` — can't sign URLs.
- `GOOGLE_APPLICATION_CREDENTIALS` must be an absolute path to a
  readable JSON file.
- Service-account key creation often blocked by org policy
  (`iam.disableServiceAccountKeyCreation`).
- API keys do NOT work for GCS auth.

**Windows-specific**

- SSL cert failures behind corp proxy (Zscaler, Netskope, BlueCoat,
  Cisco Umbrella) → `gcloud config set core/custom_ca_certs_file` to
  a bundle containing intermediate + root.
- "gcloud not on PATH" → open a new terminal (running shells are stale).
- Python DLL load errors → reinstall or `CLOUDSDK_PYTHON` to known-good
  Python 3.10–3.14.
- PowerShell env vars: `$env:VAR = "..."`, NOT `set VAR=...`.
- WSL has its own gcloud + ADC files separate from host Windows.

**macOS-specific**

- Homebrew cask install path: `/opt/homebrew/share/google-cloud-sdk`
  (Apple Silicon) or `/usr/local/share/google-cloud-sdk` (Intel).
- Corp MITM SSL → `custom_ca_certs_file` (same as Windows).
- Headless / SSH → `--no-browser` or `--no-launch-browser`.
- Cert corruption after self-update → `gcloud components reinstall`
  or full uninstall/reinstall.

**Linux-specific**

- Python 3.10–3.14 required. Snap bundles its own; apt does not.
- "exec: python: not found" → `sudo apt install python-is-python3` or
  `export CLOUDSDK_PYTHON="$(command -v python3)"`.
- Snap collision: legacy `google-cloud-sdk` and current `google-cloud-cli`
  fight over the `gcloud` symlink; remove the old one.
- SELinux on RHEL/Fedora can block reads of an SA JSON outside `~/.config`.

**Bucket naming**

- Globally unique across all of GCS.
- 3–63 chars; lowercase letters / numbers / dashes / underscores / dots.
- No "google" substring.
- Dots → DNS-style, require domain verification.
- Recently-deleted names hold for up to 7 days (soft delete reclaim).

**Permissions / 403**

- "Object Viewer" is read-only; uploads need "Object Creator" or
  "Object Admin".
- Project-level grants propagate; folder/object-level don't.
- UBLA disables ACLs but doesn't migrate them — re-grant via IAM.
- Public Access Prevention org policy overrides bucket settings.
- Requester Pays buckets need `--billing-project=PROJECT_ID`.

**Cost**

- Egress to internet is the silent killer (~$0.12/GB North America
  multi-region Standard).
- Class A ops (uploads, lists) cost ~$0.05 per 10,000 — cron jobs that
  list large buckets add up fast.
- Versioning without a lifecycle rule = unbounded cost. Every
  noncurrent version bills at live-object rate.
- **As of Sept 1, 2024, soft-deleted objects bill at normal storage
  rates for the retention period** — the old free-window exception is
  gone. This applies to `gs://shaughv` (7-day soft delete → 7 days of
  storage cost for any deleted object).
- Coldline / Archive have minimum durations (90 / 365 days).

**Signed URLs**

- 7-day hard cap. Longer durations silently fail with
  `SignatureDoesNotMatch` after day 7 (key rotation, NOT clock skew).
- ADC can't sign — needs a service-account JSON or impersonation.
- V4 is the recommended signing version (`version="v4"` in Python).
- Client clock skew > 15 min breaks V4 signatures.

**Resumable uploads**

- `gcloud storage cp` does resumable automatically for files >8 MiB.
- Re-run same command + `--no-clobber` to resume directory uploads.
- SDKs: set `chunk_size = 8 * 1024 * 1024` for flaky networks
  (default 100 MiB is brutal).
- Resumable session URLs expire after 7 days of inactivity (410 Gone).

**MIME types**

- gcloud auto-detection lags. `.webp`, `.avif`, `.mjs`, `.wasm`, `.svg`,
  `.ico` have all been mis-detected.
- Always pass `--content-type` explicitly for browser-served assets.

**CORS / browser fetch**

- Public ≠ CORS-enabled. The `shaughv` bucket is public-read but
  `fetch()` cross-origin still fails — CORS is OFF.
- `storage.cloud.google.com` never sends CORS headers regardless of
  bucket config. Always use `storage.googleapis.com` for JS-fetched assets.

### Scripting and automation

```bash
# Non-interactive — never wait for stdin
gcloud storage rm gs://shaughv/old/ --recursive --quiet

# Machine-readable
gcloud storage buckets describe gs://shaughv --format=json | jq .iamConfiguration

# Just one value
gcloud storage buckets describe gs://shaughv \
  --format='value(softDeletePolicy.retentionDurationSeconds)'

# Filter list output
gcloud storage ls gs://shaughv --format='value(name)' \
  | grep '\.png$'
```

## What NOT to do on this bucket

- **Do not upload anything sensitive.** The bucket is publicly readable
  by `allUsers`. Treat it as a CDN, not a personal Drive. Anything
  here is one URL guess away from being public.
- **Do not bulk-delete or rewrite the existing lifecycle rules** ("Rapid
  Cache" and "Cache"). They're intentional. Leave them alone unless
  Emmett explicitly asks you to change them.
- **Do not disable versioning or soft delete** — both exist as
  protection against accidental loss. The 7-day soft-delete window
  has saved files that would have been gone forever otherwise.
- **Do not change the access-control model** (uniform UBLA, public
  reads) without explicit ask. Switching to fine-grained ACLs or
  flipping public reads off breaks every existing URL out there.
- **Do not put files at the bucket root** if they belong under a
  logical prefix (`brand/`, `screenshots/`, `projects/<name>/`,
  `assets/`, `staging/`, etc.). Keep the root clean.
- **Do not use `storage.cloud.google.com/shaughv/...`** as the URL
  form returned to users — always use `storage.googleapis.com`.
- **Do not run `gcloud storage rm --recursive gs://shaughv` or any
  variant that targets the whole bucket** without an explicit user
  ask. Soft delete protects for 7 days, but the wasted effort to
  restore thousands of objects is real.

## When to defer to a different skill

- **`shaughv-cdn`** — anything about `cdn.shaughv.com`, SHAUGHV brand
  assets (logos, favicons, figurines), Makira / IBM Plex Mono fonts,
  the animated brand mark (`<shaughv-mark>`), or the SHAUGHV loader.
  That's a separate read-only Cloudflare R2 CDN; the source repo is
  `github.com/RealEmmettS/shaughv-cdn`. It is NOT in this GCS bucket.
- **`gcs-storage`** — any question about a bucket other than
  `shaughv`. Bucket creation, project setup, IAM design, signed URLs,
  HNS folders, deep auth troubleshooting, cost gotchas, full
  install/cert/proxy guidance.
