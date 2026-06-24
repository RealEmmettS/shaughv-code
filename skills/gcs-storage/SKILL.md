---
name: gcs-storage
description: >
  How to use Google Cloud Storage (GCS) buckets end-to-end from the CLI and from
  code — upload, download, list, delete, "folders", public objects, signed URLs,
  CORS, lifecycle, and the URL formats you return to users. Use whenever the user
  mentions Google Cloud Storage, GCS, a GCS bucket, `gcloud storage`, `gsutil`,
  `gs://`, storage.googleapis.com, signed URLs for GCS, service-account JSON keys,
  `GOOGLE_APPLICATION_CREDENTIALS`, Application Default Credentials (ADC), uniform
  bucket-level access, making a bucket public, versioning, soft delete, or
  hierarchical-namespace (HNS) folders — or wants to upload an asset to a Google
  Cloud bucket and get back a shareable URL. Also use when diagnosing GCS 403 /
  SignatureDoesNotMatch / CORS / credentials / `gcloud` install errors. For the
  personal `shaughv` bucket, defer to the `shaughv-gcs-storage` skill instead. See
  the body's "When this skill fires" for the full trigger list and the safety rule.
---

# Google Cloud Storage

GCS is Google's object store. **It is flat** — there are no real directories
in a standard bucket; every object is just a name like `path/to/file.png`,
and "folders" are emulated by the leading prefix. (The newer Hierarchical
Namespace feature changes that, but only for buckets that opt into it at
creation time — see the Folders section.)

The canonical CLI today is **`gcloud storage`**. The older `gsutil` still
works, but the gsutil project itself now recommends migrating off it
(gsutil 5.36, March 2026). `gcloud storage` is roughly 94% faster on
downloads and 57% faster on uploads versus gsutil, and it has parity
with every gsutil subcommand you're likely to need. **Default to
`gcloud storage` in every example unless the user explicitly asks for
gsutil.**

There are three URL surfaces you'll deal with, and they are not
interchangeable:

| URL | Used by | Notes |
|---|---|---|
| `gs://BUCKET/OBJECT` | CLI, SDKs | Not browser-fetchable. CLI/SDK-only. |
| `https://storage.googleapis.com/BUCKET/OBJECT` | Browsers, `<img>`, `<video>`, `fetch()`, `curl` | The "direct" URL. Works for public objects with no auth UI. Respects bucket CORS config. **This is the URL you return to users.** |
| `https://storage.cloud.google.com/BUCKET/OBJECT` | Humans clicking a link | Triggers a Google sign-in flow for private objects. **Never allows CORS**, regardless of bucket config. Avoid for embeds and programmatic access. |

## Before any mutating command — confirm project + bucket

**Before running any mutating command (`cp`, `rm`, `mb`, IAM edits, CORS edits,
lifecycle edits) the agent MUST ask the user for the GCP project ID and the target
bucket name.** If the user is operating on the personal `shaughv` bucket, defer to the
`shaughv-gcs-storage` skill instead — that one has the bucket facts pre-wired.

## When this skill fires

Trigger on any mention of **Google Cloud Storage, GCS, a GCS bucket, `gcloud storage`,
`gsutil`, `gs://`, `storage.googleapis.com`, `storage.cloud.google.com`**, signed URLs
for GCS, service-account JSON keys, `GOOGLE_APPLICATION_CREDENTIALS`, Application Default
Credentials (ADC), `gcloud auth application-default login`, uniform bucket-level access
(UBLA), making a bucket public to `allUsers`, object versioning, soft delete, or
hierarchical namespace (HNS) folders — or when the user wants to upload an asset to a
Google Cloud bucket and get back a shareable URL. Also when diagnosing 403 errors against
a bucket, `SignatureDoesNotMatch` on a signed URL, CORS failures from `fetch()` against a
GCS URL, "Could not automatically determine credentials", Python `google-cloud-storage`
SDK errors, Node `@google-cloud/storage` errors, `gcloud` install/SSL problems on
Windows/macOS/Linux, or "exec: python: not found" after a gcloud update.

## Installing and verifying the `gcloud` CLI

If `gcloud` doesn't resolve in the user's shell, install it before doing
anything else. The current official installer is **gcloud CLI 569.0.0**
(May 2026). Every install path requires **Python 3.10–3.14** at runtime;
the Windows and tarball installers bundle Python 3.13 by default, the
Debian/RHEL/snap packages do not.

The canonical install source is
`https://docs.cloud.google.com/sdk/docs/install-sdk` — defer to it if a
command below conflicts with what's there. Architecture matters: pick
the right tarball with `uname -a` (Linux) or `uname -m` (macOS).

### macOS

```bash
# Tarball installer (official, works on Apple Silicon and Intel)
# Pick darwin-arm.tar.gz for Apple Silicon, darwin-x86_64.tar.gz for Intel
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz
tar -xf google-cloud-cli-darwin-arm.tar.gz
./google-cloud-sdk/install.sh   # answer Y to add to PATH + enable completion

# Or Homebrew (community-maintained, easier updates)
brew install --cask gcloud-cli
```

Verify: open a **new terminal** so PATH refreshes, then `gcloud --version`.
The tarball install drops the SDK at wherever you ran the extract from
(commonly `~/google-cloud-sdk/`). The Homebrew cask wires PATH via
`/opt/homebrew/share/google-cloud-sdk` (Apple Silicon) or
`/usr/local/share/google-cloud-sdk` (Intel).

### Linux — Debian / Ubuntu (apt, recommended)

```bash
sudo apt-get update
sudo apt-get install ca-certificates gnupg curl
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-cli
```

The apt package does NOT bundle Python — your system Python must be
3.10–3.14. Verify: `gcloud --version`. Binary lands at
`/usr/lib/google-cloud-sdk/bin/gcloud` and is auto-on-PATH.

### Linux — Snap (Ubuntu, easiest)

```bash
sudo snap install google-cloud-cli --classic
```

The snap bundles its own Python — works on Ubuntu releases without a
suitable system Python. Binary at `/snap/bin/gcloud`. If a legacy
`google-cloud-sdk` snap is installed, remove it first
(`sudo snap remove google-cloud-sdk`) — both packages claim the same
`gcloud` symlink and collide.

### Linux — RHEL / Fedora / CentOS (dnf)

```bash
# For RHEL 7/8/9 and Fedora 41/42 — adjust baseurl for RHEL 10 or ARM64
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

The `libxcrypt-compat.x86_64` dependency is required on RHEL 9+ and
is easy to miss — gcloud fails at startup without it. For RHEL 10 use
the `cloud-sdk-el10-x86_64` repo and the `rpm-package-key-v10.gpg`
key; for ARM64 use the `aarch64` repos.

### Linux — generic tarball (Arch, Alpine, anything else)

```bash
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh   # answer Y to add to PATH + enable completion
exec -l $SHELL                  # re-source so the new PATH takes effect
```

### Windows

```powershell
# Official installer (signed by Google LLC)
(New-Object Net.WebClient).DownloadFile(
  "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe",
  "$env:Temp\GoogleCloudSDKInstaller.exe"
)
& $env:Temp\GoogleCloudSDKInstaller.exe
```

Requires Windows 8.1+ or Windows Server 2012+. The installer bundles
Python 3.13 by default — uncheck "Install Bundled Python" only if you
want to point at a system Python you trust. Drop locations vary by
install mode:

- `C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\` (system, common)
- `C:\Program Files\Google\Cloud SDK\google-cloud-sdk\` (system, newer)
- `%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\` (user-local)

Verify: open a **new** terminal (Windows Terminal, PowerShell, or
cmd — not one that was running before install) and run
`gcloud --version`. Running shells inherit PATH from when they
started; a PATH change made by the installer is invisible until you
open a fresh shell.

Community-maintained alternatives also work:

```powershell
choco install gcloudsdk     # Chocolatey
scoop bucket add extras; scoop install gcloud   # Scoop
```

### Windows install-time gotchas (from the official troubleshooting tips)

- **"`find` not recognized" during install** — `C:\WINDOWS\system32;`
  must be in PATH. Some heavily-customized PATH setups drop it. Fix
  by adding it back, then re-run the installer.
- **Reboot before reinstalling.** If you uninstalled gcloud previously,
  reboot Windows before reinstalling. The uninstaller leaves
  registry / scheduled-task state that the new install will trip on.
- **Unzip fails partway through install** — run the installer as
  Administrator. Some folder permissions block the embedded zip
  extraction.

### "gcloud isn't on PATH but the installer said it was"

Two causes, in order of likelihood:

1. **Stale shell.** PATH lives in the registry on Windows and in shell
   rc files on POSIX. Any terminal that was open at install time will
   keep its old PATH. **Open a fresh terminal** and try again. (This
   is the answer 90% of the time.)
2. **Installer didn't add it.** Confirm the binary exists at one of
   the paths above. Windows: `Test-Path "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"`.
   If it does, add the `bin/` directory to PATH manually:

   ```powershell
   # Windows — append to USER PATH (no admin needed, persists for new shells)
   $bin = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
   $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
   if ($userPath -notlike "*google-cloud-sdk\bin*") {
     [Environment]::SetEnvironmentVariable("Path", "$userPath;$bin", "User")
   }
   ```

   ```bash
   # macOS / Linux — append to your shell rc (~/.zshrc, ~/.bashrc)
   echo 'export PATH="$HOME/google-cloud-sdk/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

If `gcloud` works in a fresh terminal but fails in your scripting
environment (an IDE terminal, a CI runner, a long-running agent shell),
that environment's parent process probably forked before PATH was
updated. Pass the absolute path to `gcloud.cmd` (Windows) or
`/usr/lib/google-cloud-sdk/bin/gcloud` (Linux apt) /
`/snap/bin/gcloud` (Linux snap) /
`/opt/homebrew/share/google-cloud-sdk/bin/gcloud` (macOS Homebrew)
explicitly, or restart the parent process.

### Proxy / corporate-MITM SSL

If `gcloud --version` fails with SSL errors after install — common
behind Zscaler, Netskope, BlueCoat, Cisco Umbrella — gcloud is using
its bundled `cacert.pem` and ignoring the OS trust store:

```bash
# POSIX
gcloud config set core/custom_ca_certs_file /etc/ssl/corp-ca-bundle.pem
```

```powershell
# Windows
gcloud config set core/custom_ca_certs_file "C:\corp\corp-ca-bundle.pem"
```

The corp CA bundle file must include both the intermediate AND the
root CA the proxy injects. See also the proxy guide at
`docs.cloud.google.com/sdk/docs/proxy-settings`.

### One-shot post-install setup

```bash
gcloud init                            # interactive: login + pick project + default region
```

`gcloud init` is the canonical one-stop bootstrap. It walks through
sign-in, project selection, and default region — equivalent to running
`gcloud auth login`, `gcloud config set project ...`, and
`gcloud config set compute/region ...` by hand. After it finishes,
also run:

```bash
gcloud auth application-default login  # ADC for SDKs — SEPARATE from gcloud auth login
gcloud components install gsutil       # only if you need legacy gsutil specifically
```

The ADC step is critical and is NOT done by `gcloud init`. Python /
Node / Go code reading credentials from Application Default
Credentials will fail until you run it.

Verify the install end-to-end:

```bash
gcloud auth list                  # shows the active credentialed account
gcloud config list                # shows current project, account, region
gcloud storage ls                 # lists buckets in the current project
```

## Before you run anything mutating

The agent MUST collect these inputs from the user before running any
command that writes, deletes, or modifies bucket state:

1. **GCP project ID** (`gcloud config set project PROJECT_ID`).
2. **Bucket name** — without the `gs://` prefix when talking to the user,
   but include `gs://` in commands.
3. **Whether the bucket uses uniform bucket-level access** — run
   `gcloud storage buckets describe gs://BUCKET --format='value(iamConfiguration.uniformBucketLevelAccess.enabled)'`
   if you don't know. It changes how you make objects public.
4. **Whether the user wants new uploads to be public**, and on what
   URL form.
5. **Local OS** — affects auth, certificate, and PATH troubleshooting.

If the user is operating on `gs://shaughv`, stop and switch to the
`shaughv-gcs-storage` skill — all of these answers are baked in there.

## Authentication

GCS has two auth paths worth knowing. Pick deliberately.

### Interactive (gcloud / Application Default Credentials)

Two commands that look similar but do different things:

```bash
# Auths the gcloud CLI itself. After this, `gcloud storage cp` works.
gcloud auth login

# Writes Application Default Credentials to disk. SDKs read these.
# Without this, your Python/Node/Go code can't auth — even if the CLI can.
gcloud auth application-default login
```

**This is the #1 cause of "the CLI works but my script doesn't" — run both.**
The ADC file lands at:

- Linux/macOS: `~/.config/gcloud/application_default_credentials.json`
- Windows: `%APPDATA%\gcloud\application_default_credentials.json`

ADC credentials look like a refresh-token / authorized-user JSON. They do
**not** contain a `private_key` field, which means they **cannot sign URLs**.
For signed URLs you need a service-account JSON or impersonation.

### Service account impersonation (preferred over keys)

For CI, signed URLs, and any context where you want elevated permissions
without a long-lived key, **impersonation is the modern recommended path**.
Your own user account holds `roles/iam.serviceAccountTokenCreator` on
the SA; gcloud and the SDKs mint short-lived tokens on demand:

```bash
# One-time setup — grant your user the impersonation role on the SA
gcloud iam service-accounts add-iam-policy-binding \
  my-sa@PROJECT_ID.iam.gserviceaccount.com \
  --member="user:you@example.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Persistent impersonation for the CLI
gcloud config set auth/impersonate_service_account my-sa@PROJECT_ID.iam.gserviceaccount.com

# Or per-invocation
gcloud storage cp ./file gs://BUCKET/ --impersonate-service-account=my-sa@PROJECT_ID.iam.gserviceaccount.com

# Stop impersonating
gcloud config unset auth/impersonate_service_account
```

Impersonation grants signed-URL capability without ever holding a
service-account JSON on disk. Prefer this over keys whenever possible.

### Headless (service-account JSON key)

For CI runners that can't impersonate, scripts that must run unattended,
or anywhere an interactive browser flow is impossible:

```bash
gcloud iam service-accounts create my-sa --project=PROJECT_ID
gcloud iam service-accounts keys create ./sa.json \
  --iam-account=my-sa@PROJECT_ID.iam.gserviceaccount.com
```

Activate the key for gcloud itself — cleaner than the env-var route:

```bash
gcloud auth login --cred-file=./sa.json
```

Or set the env var for SDKs (Python, Node, etc.):

```bash
# bash/zsh
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/secrets/sa.json"

# PowerShell — note the $env: prefix; `set` doesn't persist across child procs
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\me\secrets\sa.json"
```

The path must be **absolute**, the file **readable by the running user**,
and shaped like a service-account JSON (has `private_key`, `client_email`,
`type: service_account`). If it instead has `type: authorized_user`, it's
an ADC file masquerading and won't work for libraries that expect a
service account.

### Managing multiple credentialed accounts

```bash
gcloud auth list                                   # see all stored creds + active
gcloud config set account other-user@example.com   # switch active account
gcloud storage cp ./x gs://B/ --account=other-user@example.com   # per-call override
gcloud auth revoke other-user@example.com          # remove stored creds for an account
gcloud info                                        # print credential file locations
```

Use **configurations** (named property bundles) to switch between
projects or accounts without retyping:

```bash
gcloud config configurations create work
gcloud config configurations activate work
gcloud config set project work-project
gcloud config set account you@work.com
# Switch back: gcloud config configurations activate default
```

### ADC trumping itself — the silent override

`gcloud auth application-default login` writes ADC, but other env
configuration can **outrank** that file at lookup time. Order of
precedence (highest first) for SDKs:

1. `GOOGLE_APPLICATION_CREDENTIALS` env var
2. `gcloud config set auth/impersonate_service_account` (impersonation
   layered on top of any other credential)
3. The ADC file written by `gcloud auth application-default login`
4. Metadata-server credentials (only on GCE/Cloud Run/GKE)

If the SDK is picking up unexpected credentials, the offender is
usually a lingering `GOOGLE_APPLICATION_CREDENTIALS` from a previous
shell, or a `auth/impersonate_service_account` set in a different
configuration. Reset cleanly:

```bash
unset GOOGLE_APPLICATION_CREDENTIALS
gcloud config unset auth/impersonate_service_account
gcloud auth application-default login
```

Org policies frequently disable service-account key creation
(`iam.disableServiceAccountKeyCreation`). When `keys create` fails with a
constraint error, that's why. The modern replacement is Workload Identity
Federation; mention it as a path forward but don't try to set it up
without an explicit ask.

### What doesn't work for GCS auth

- **API keys.** Cloud Storage does NOT accept API keys for
  authorization. They work for a subset of Google APIs (Maps,
  Translate, Natural Language, etc.) but never for GCS. If a user
  asks "can I just use an API key for the bucket", the answer is no
  — they need ADC, a service-account JSON, or impersonation.
- **OAuth bearer tokens from arbitrary scopes.** GCS needs scopes
  that include `devstorage.read_only` / `devstorage.read_write` /
  `devstorage.full_control` / `cloud-platform`. Tokens minted with
  only profile / email scopes will return 401.

### Workforce Identity Federation (enterprise IdP users)

If the user signs into Google Cloud through an external IdP (Okta,
Microsoft Entra, etc. via Workforce Identity Federation), the
`gcloud auth login` flow is different:

```bash
gcloud iam workforce-pools sign-in    # opens the IdP login, not Google's
gcloud auth application-default login --no-launch-browser
```

Symptom of forgetting the workforce-pools step: `gcloud auth login`
appears to succeed but every subsequent API call returns 401 with
"this resource is not accessible to the identity". Re-run
`gcloud iam workforce-pools sign-in` and try again.

## Upload

### CLI

```bash
# Single file
gcloud storage cp ./logo.svg gs://BUCKET/brand/logo.svg

# A whole directory, recursively
gcloud storage cp --recursive ./build/ gs://BUCKET/site/

# Set Content-Type + Cache-Control at upload time (almost always wanted
# for assets served to browsers)
gcloud storage cp ./logo.svg gs://BUCKET/brand/logo.svg \
  --content-type=image/svg+xml \
  --cache-control="public, max-age=31536000, immutable"

# Make a single new object public at upload (only works if the bucket
# uses fine-grained ACLs, NOT uniform bucket-level access — see the
# "Make objects public" section)
gcloud storage cp ./poster.jpg gs://BUCKET/posters/poster.jpg \
  --predefined-acl=publicRead
```

`gcloud storage cp` automatically uses resumable uploads for files above
~8 MiB. If a transfer fails partway through, re-run the same command —
it picks up where it left off. For directory uploads, add `--no-clobber`
on the retry to skip files that already finished.

### Cloud Client Libraries — language matrix

Cloud Client Libraries are the recommended way to talk to GCS from
application code (idiomatic to each language, less boilerplate than
raw REST). The examples below are Python and Node — the patterns
translate cleanly to the others.

| Language | Package / Library | Repo |
|---|---|---|
| Python | `google-cloud-storage` (pip) | github.com/GoogleCloudPlatform/google-cloud-python |
| Node.js | `@google-cloud/storage` (npm) | github.com/GoogleCloudPlatform/google-cloud-node |
| Go | `cloud.google.com/go/storage` | github.com/GoogleCloudPlatform/google-cloud-go |
| Java | `google-cloud-storage` (Maven) | github.com/googleapis/google-cloud-java |
| Ruby | `google-cloud-storage` (gem) | github.com/GoogleCloudPlatform/google-cloud-ruby |
| PHP | `google/cloud-storage` (Composer) | github.com/GoogleCloudPlatform/google-cloud-php |
| C# / .NET | `Google.Cloud.Storage.V1` (NuGet) | github.com/GoogleCloudPlatform/google-cloud-dotnet |
| C++ | `google-cloud-cpp/storage` | github.com/googleapis/google-cloud-cpp |
| Rust | `google-cloud-storage` (crates.io) | github.com/yoshidan/google-cloud-rust |

If a language you need isn't in the Cloud Client Libraries list,
fall back to the Google API Client Libraries (older, more boilerplate)
or call the JSON / XML REST API directly with a token from
`gcloud auth print-access-token`.

IDE integrations (VS Code + IntelliJ) provide Cloud Code extensions
that browse APIs, enable services, and scaffold client-library
installs — `docs.cloud.google.com/code` if the user wants that
ergonomic.


### Python (`google-cloud-storage`)

```python
from google.cloud import storage

client = storage.Client(project="PROJECT_ID")  # uses ADC by default
bucket = client.bucket("BUCKET")
blob = bucket.blob("brand/logo.svg")

# upload_from_filename detects MIME from extension; pass content_type
# explicitly for anything you'll serve to a browser
blob.content_type = "image/svg+xml"
blob.cache_control = "public, max-age=31536000, immutable"
blob.upload_from_filename("./logo.svg")

# For very large files: enable resumable explicitly, tune chunk size
blob.chunk_size = 8 * 1024 * 1024  # 8 MiB — kinder to flaky networks
blob.upload_from_filename("./large.bin", timeout=600)
```

### Node (`@google-cloud/storage`)

```js
import { Storage } from "@google-cloud/storage";
const storage = new Storage({ projectId: "PROJECT_ID" });
const bucket = storage.bucket("BUCKET");

await bucket.upload("./logo.svg", {
  destination: "brand/logo.svg",
  metadata: {
    contentType: "image/svg+xml",
    cacheControl: "public, max-age=31536000, immutable",
  },
  resumable: true, // default true for >5 MiB; explicit is clearer
});
```

## Download

```bash
# Single object
gcloud storage cp gs://BUCKET/brand/logo.svg ./logo.svg

# Whole prefix
gcloud storage cp --recursive gs://BUCKET/brand/ ./brand/

# Stream to stdout (useful in pipelines)
gcloud storage cat gs://BUCKET/notes/today.txt
```

```python
blob = bucket.blob("brand/logo.svg")
blob.download_to_filename("./logo.svg")
# Or to bytes:
data = blob.download_as_bytes()
```

## List

```bash
gcloud storage ls gs://BUCKET                       # top-level
gcloud storage ls --recursive gs://BUCKET           # everything
gcloud storage ls gs://BUCKET/brand/                # one prefix
gcloud storage ls -l gs://BUCKET/**.png             # glob, long format
```

```python
for blob in client.list_blobs("BUCKET", prefix="brand/"):
    print(blob.name, blob.size, blob.updated)
```

SDK `list_blobs` returns an iterator that pages automatically. For very
large buckets, set `max_results` per page and stop when you have what
you need — don't accidentally enumerate the whole thing.

## Delete

```bash
# Single object
gcloud storage rm gs://BUCKET/old/file.png

# Whole prefix
gcloud storage rm --recursive gs://BUCKET/old/

# All versions of a versioned object (force-purge, ignores soft delete
# in some configs)
gcloud storage rm --all-versions gs://BUCKET/path/file.png
```

If the bucket has soft delete enabled (default 7 days as of late 2024),
`rm` only soft-deletes. Recovery:

```bash
gcloud storage ls --soft-deleted gs://BUCKET
gcloud storage objects restore gs://BUCKET/path/file.png#GENERATION
```

## Folders — flat vs HNS

Two completely different mental models depending on the bucket type.

### Flat (the default)

Standard buckets have no folder objects. `path/to/file.png` is one object
whose name happens to contain slashes. Uploading to `gs://B/path/to/file.png`
implicitly "creates" the prefix; deleting the last object at that prefix
also "deletes the folder", because the folder never really existed.

```bash
# This works — uploads under a prefix
gcloud storage cp ./file.png gs://BUCKET/path/to/file.png

# This does NOT work on flat buckets
gcloud storage folders create gs://BUCKET/path/   # ❌ requires HNS
```

If a script needs a folder to "exist" before objects do, upload a
zero-byte object named `prefix/` (note the trailing slash). The Cloud
Console renders these as empty folders.

### Hierarchical Namespace (HNS) — GA March 17, 2025

HNS introduces real folder resources with their own APIs:
`CreateFolder`, `DeleteFolder`, `RenameFolder` (atomic), `ListFolders`.
The `RenameFolder` API is the killer feature — flat buckets can't rename
a prefix atomically; HNS can. HNS buckets deliver ~20× faster checkpoint
writes and ~8× higher initial read/write QPS, which is why ML workloads
target them.

**Must be enabled at bucket creation. Cannot be flipped on later.**

```bash
gcloud storage buckets create gs://BUCKET \
  --location=us-central1 \
  --enable-hierarchical-namespace \
  --uniform-bucket-level-access

# Once HNS is on, real folder ops:
gcloud storage folders create gs://BUCKET/datasets/
gcloud storage folders rename gs://BUCKET/datasets/ gs://BUCKET/data/
```

HNS buckets do NOT support: **object versioning, bucket lock, object
retention lock, object ACLs**. If you need any of those, HNS is wrong
for the bucket — pick flat.

## Make objects public + URL formats

Two access models. UBLA is strongly recommended and is the default for
new buckets.

### Uniform bucket-level access (UBLA) — preferred

The whole bucket is governed by IAM. To make every object readable by
the world:

```bash
gcloud storage buckets add-iam-policy-binding gs://BUCKET \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

After this, every object in the bucket is reachable at:

```
https://storage.googleapis.com/BUCKET/OBJECT
```

…with no auth UI. **Return this URL form to users.** New objects added
later are automatically public — the binding is bucket-wide.

### Fine-grained (legacy ACLs)

Per-object permissions. Less safe, easier to mis-target:

```bash
# At upload
gcloud storage cp ./file.png gs://BUCKET/file.png --predefined-acl=publicRead

# After the fact
gcloud storage objects update gs://BUCKET/file.png --predefined-acl=publicRead
```

This only works on buckets where UBLA is **not** enabled. Once UBLA is
on, `--predefined-acl` is rejected.

### When public-grant fails

The **Public Access Prevention** org policy will refuse any IAM binding
that grants `allUsers` or `allAuthenticatedUsers`. Check it before
debugging the IAM binding:

```bash
gcloud storage buckets describe gs://BUCKET \
  --format='value(iamConfiguration.publicAccessPrevention)'
```

If it returns `enforced`, the bucket can't be made public by anyone in
the project until that constraint is lifted at the org/folder level.

## Signed URLs

For time-limited access to a private (or public) object — typically
used to give a third party a download link that expires.

```bash
gcloud storage sign-url gs://BUCKET/secret/report.pdf \
  --duration=1h \
  --impersonate-service-account=my-sa@PROJECT_ID.iam.gserviceaccount.com
```

```python
from datetime import timedelta
url = blob.generate_signed_url(version="v4", expiration=timedelta(hours=1))
```

**Hard ceiling: 7 days (604800 seconds).** Asking for `--duration=30d`
succeeds at creation time but the URL returns `SignatureDoesNotMatch`
after day 7 — the underlying signing key has rotated. The error message
implies clock skew or a bad signature; **it isn't**. It's the 7-day cap.
Document this prominently when the user asks for long expirations.

Signing requires a credential with a `private_key`. ADC credentials from
`application-default login` don't have one. Either use a real
service-account JSON (`GOOGLE_APPLICATION_CREDENTIALS`) or impersonate a
service account with the `--impersonate-service-account` flag (the
caller needs `roles/iam.serviceAccountTokenCreator` on the SA).

## CORS

GCS buckets have **CORS disabled by default**. A public object served from
`<img src>` works fine, but a `fetch()` or XHR from a different origin
fails with the usual `No 'Access-Control-Allow-Origin' header` error.

Configure CORS per-bucket via a JSON file:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control", "ETag"],
    "maxAgeSeconds": 3600
  }
]
```

```bash
gcloud storage buckets update gs://BUCKET --cors-file=./cors.json

# Inspect current config
gcloud storage buckets describe gs://BUCKET --format=json | jq .cors
```

For a private app pulling its own assets, narrow `origin` to your
domain(s) — `["https://app.example.com"]` — and add `Authorization` to
`responseHeader` if you fetch with credentials.

`storage.cloud.google.com` **never** returns CORS headers, regardless of
bucket config. Use `storage.googleapis.com` for any JS-fetched asset.

## Metadata at upload time

`Content-Type`, `Cache-Control`, and `Content-Disposition` are sent as
HTTP response headers when an object is fetched. Set them when you
upload — re-setting them later is a separate API call and is easy to
forget.

```bash
gcloud storage cp ./poster.webp gs://BUCKET/posters/2026.webp \
  --content-type=image/webp \
  --cache-control="public, max-age=31536000, immutable"

gcloud storage cp ./report.pdf gs://BUCKET/reports/q1.pdf \
  --content-type=application/pdf \
  --content-disposition='attachment; filename="Q1-Report.pdf"'
```

gcloud's MIME auto-detection from file extension is fine for common
types but **lags behind reality for newer formats** — `.webp`, `.avif`,
`.mjs`, `.wasm` have all been mis-detected as `application/octet-stream`
or `text/plain` over the years. Always pass `--content-type` explicitly
for anything destined for a browser.

## Lifecycle rules

Lifecycle rules apply server-side actions to objects based on age, version
count, or storage class. Common patterns: auto-delete old versions,
transition cold data to cheaper storage classes.

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": { "age": 365, "isLive": false }
      },
      {
        "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
        "condition": { "age": 30 }
      }
    ]
  }
}
```

```bash
gcloud storage buckets update gs://BUCKET --lifecycle-file=./lifecycle.json
gcloud storage buckets describe gs://BUCKET --format=json | jq .lifecycle
```

Storage class progression: Standard → Nearline (30-day min) → Coldline
(90-day min) → Archive (365-day min). Early deletion from Nearline/
Coldline/Archive incurs early-deletion charges.

## gcloud command structure primer

Every gcloud command follows the same shape — knowing this lets you
guess the command for something you haven't seen before:

```
gcloud + [release level] + component + entity + operation + [positional args] + [flags]
```

| Slot | Example | What it is |
|---|---|---|
| Release level | (none), `alpha`, `beta`, `preview` | GA commands have no level. `alpha`/`beta`/`preview` components must be installed separately (`gcloud components install alpha`). |
| Component | `storage`, `compute`, `iam`, `auth`, `config`, `projects`, `app` | The Google Cloud service or feature area. |
| Entity | `buckets`, `objects`, `service-accounts`, `instances` | The resource type (usually plural). |
| Operation | `cp`, `ls`, `rm`, `create`, `describe`, `update`, `delete`, `list`, `add-iam-policy-binding` | The verb. |
| Positional args | `gs://BUCKET/OBJECT`, `INSTANCE_NAME` | Required, order matters. |
| Flags | `--content-type=`, `--quiet`, `--format=` | Optional unless marked, order doesn't. |

Example: `gcloud storage cp ./file gs://BUCKET/path/file --content-type=image/png`
breaks down as `gcloud` + (GA) + `storage` + (no entity, `cp` is at the
component level) + `cp` + `./file gs://BUCKET/path/file` (positional) +
`--content-type=...` (flag).

### High-value cheat-sheet commands beyond GCS

These come up adjacent to GCS work — projects, IAM, components, auth
account management:

```bash
# Diagnostics
gcloud version                          # gcloud version + installed components
gcloud info                             # credential file paths, Python interpreter, config dir
gcloud components list                  # what's installed vs available
gcloud components install COMPONENT     # add a component (e.g. gsutil, gke-gcloud-auth-plugin)
gcloud components update                # upgrade to latest gcloud version

# Help (deep + shallow)
gcloud help storage cp                  # man-page-style help for one command
gcloud storage cp --help                # same thing, shorter form
gcloud topic filters                    # supplementary topics (filters, formats, escaping)

# Project context
gcloud projects describe PROJECT_ID
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:x@y.com --role=roles/storage.admin

# IAM helpers
gcloud iam list-grantable-roles //storage.googleapis.com/projects/_/buckets/BUCKET
gcloud iam service-accounts keys list --iam-account=SA_EMAIL
gcloud auth print-access-token          # useful for direct REST calls / debugging
```

### Filtering and formatting query output

GCS describe / list calls return rich data. Reach for the standard
filter + format flags:

```bash
# Filter projects created after a date
gcloud projects list \
  --filter="createTime>=2025-01-01" \
  --format="table(projectNumber,projectId,createTime.date(tz=LOCAL))" \
  --sort-by=createTime

# Bucket IAM policy as JSON
gcloud storage buckets get-iam-policy gs://BUCKET --format=json

# Only the public-access prevention value
gcloud storage buckets describe gs://BUCKET \
  --format='value(iamConfiguration.publicAccessPrevention)'
```

## Scripting and automation tips

When the agent is running `gcloud storage` non-interactively (from a script,
a CI runner, or a long-running session), a few flags matter:

- **`--quiet` / `-q`** — disables all interactive confirmation prompts.
  `gcloud storage rm` and a few other commands prompt before destructive
  actions; without `--quiet`, a script hangs waiting for stdin. Always
  pair `--quiet` with extra care, since you're opting out of the safety
  net. The same flag works on every gcloud command.
- **`--format=value(...)`** / **`--format=json`** — produces
  machine-readable output. `value(name,size)` returns tab-separated
  fields; `json` returns the full resource as JSON. Don't grep the
  default pretty-printed output — it's not stable. Example:
  `gcloud storage buckets describe gs://BUCKET --format=json | jq .iamConfiguration`.
- **stdout vs stderr** — successful command output goes to stdout;
  prompts, warnings, and errors go to stderr. Script against stdout
  only; the wording of stderr messages can change between releases.
- **Line continuation** — gcloud docs show long commands wrapped with
  backslashes (`\`). Linux/macOS shells honor that. **Windows cmd uses
  caret (`^`) instead of backslash**; PowerShell uses backtick
  (`` ` ``). When pasting multi-line gcloud examples on Windows, either
  convert the continuation char or join the command onto one line.
- **`--no-user-output-enabled`** — suppresses normal command output
  (useful in CI when you only care about the exit code).
- **`--verbosity=debug`** — bumps log verbosity if you need to see what
  gcloud is doing under the hood. Verbosity levels: `debug`, `info`,
  `warning`, `error`, `critical`, `none`.
- **Cloud Shell** — `gcloud` is pre-installed and pre-authenticated.
  If the user is in Cloud Shell, skip the install steps entirely and
  go straight to `gcloud config set project ...`.

## Comprehensive gotchas

These are the things that bite people. Skim before you write any
non-trivial GCS code.

### A. Auth gotchas (every platform)

- `gcloud auth login` ≠ `gcloud auth application-default login`. The
  first authorizes the gcloud CLI; the second writes ADC to disk for
  SDKs. **You almost always want both.** "CLI works but my Python script
  can't auth" is this 90% of the time.
- ADC credentials (`authorized_user` shape) have no `private_key`. They
  **cannot generate signed URLs**. Use a service-account JSON or
  `--impersonate-service-account`.
- `GOOGLE_APPLICATION_CREDENTIALS` must point to an **absolute path** to
  a **readable** JSON file. Relative paths bite in containers, in
  Windows services, and in cron jobs that don't inherit your shell's
  working directory.
- Service-account key creation is often blocked by org policy
  (`iam.disableServiceAccountKeyCreation`). When `keys create` returns
  a constraint error, that's why. Workload Identity Federation is the
  modern replacement; mention it but don't set it up without an ask.
- "Could not automatically determine credentials" =
  `GOOGLE_APPLICATION_CREDENTIALS` isn't set AND no ADC file was written
  by `application-default login`. Run one of them.
- ADC and gcloud login store credentials in DIFFERENT files. Logging in
  to the CLI does not write ADC, and vice versa. Both files live under
  `~/.config/gcloud/` on POSIX, `%APPDATA%\gcloud\` on Windows.

### B. Windows-specific setup

- **SSL cert failures behind a corporate proxy** (Zscaler, Netskope,
  Cisco Umbrella, BlueCoat). gcloud bundles its own `cacert.pem` and
  ignores the Windows trust store, so any MITM root CA the company
  installs is invisible to gcloud. Two fixes:
  ```powershell
  # Option 1 — env var that the Python requests library inside gcloud reads
  $env:REQUESTS_CA_BUNDLE = "C:\corp\corp-ca-bundle.pem"

  # Option 2 — gcloud config knob that survives across sessions
  gcloud config set core/custom_ca_certs_file "C:\corp\corp-ca-bundle.pem"
  ```
  The corp CA bundle usually has to include both the intermediate and
  the root the proxy injects.
- **PATH not picked up after install.** Confirm
  `%USERPROFILE%\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin`
  is on PATH. The installer offers to add it; if you unchecked that,
  add it manually. After PATH changes, close and re-open every
  terminal — running shells don't inherit PATH changes from the
  registry.
- **Python DLL load errors** ("DLL load failed while importing ...") on
  the gcloud-bundled Python usually mean the install is corrupted —
  often after a self-update. Either reinstall gcloud cleanly, or set
  `CLOUDSDK_PYTHON` to a system Python 3.10–3.14 you trust.
- **PowerShell env-var setting.** Prefer
  `$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\..."` to `set` — `set`
  doesn't persist to child processes that PowerShell spawns via
  `Start-Process` or `Invoke-Command`.
- **WSL ≠ Windows.** A gcloud installed inside WSL is a separate
  installation with its own ADC file and config. `gcloud auth login`
  in PowerShell does not authenticate the WSL gcloud, and the WSL
  gcloud can't read `%APPDATA%\gcloud\` directly. Pick one side and
  do auth there.

### C. macOS-specific setup

- Homebrew install: `brew install --cask gcloud-cli`. The tarball
  install also works. Don't install both at once — they fight over
  `$PATH` ordering.
- **Corporate MITM SSL proxy** — same problem as Windows. Fix:
  `gcloud config set core/custom_ca_certs_file /path/to/corp-ca.pem`.
- `gcloud auth application-default login` opens a browser. On a
  headless mac (Mac Mini, CI runner) or inside `ssh`/`tmux`, the
  browser flow can't complete. Use `--no-browser` and copy/paste the
  resulting URL into a browser on another machine. The `--no-browser`
  flag has had a handful of UX bugs over the years; if the paste-back
  flow refuses, try `--no-launch-browser` (older alias) or run
  `gcloud auth login --update-adc` instead.
- **Cert corruption after a gcloud self-update** has been reported
  enough times that it's worth knowing the fix: `gcloud components
  reinstall` (or a full uninstall/reinstall) resolves it.
- macOS Keychain doesn't store gcloud ADC — it's a plain JSON file at
  `~/.config/gcloud/application_default_credentials.json`. Protect the
  containing directory if you care about the laptop being shared.

### D. Linux-specific setup

- **Python version requirement: 3.10–3.14.** gcloud uses this Python
  for almost everything. Older system Pythons fail with cryptic
  syntax errors during import.
- **Snap install** (`sudo snap install google-cloud-cli --classic`)
  bundles its own Python — usually the easiest install on Ubuntu.
  The **apt install** does NOT bundle Python; you need a system
  Python in range.
- The legendary **"exec: python: not found"** after a gcloud update
  happens when `python3` exists but no `python` alias. Two fixes:
  ```bash
  sudo apt install python-is-python3            # Debian/Ubuntu
  # …or, surgically:
  export CLOUDSDK_PYTHON="$(command -v python3)"
  ```
- **Two snap packages collide.** The legacy snap is
  `google-cloud-sdk`; the current one is `google-cloud-cli`. Both
  install a `gcloud` symlink; only one can win. Remove the old one
  first: `sudo snap remove google-cloud-sdk`.
- **SELinux on RHEL/Fedora** can block reads of a service-account JSON
  stored outside `~/.config` or a labeled location. Symptoms:
  permission-denied errors that go away when you `cp` the file to
  your home directory. Fix with `chcon -t user_home_t sa.json` or
  just keep the key under `~/.config/gcloud/`.

### E. Bucket-naming gotchas

- **Globally unique across all of GCS.** Picking `assets` will fail —
  someone took it years ago.
- **3–63 characters**, lowercase letters / numbers / dashes /
  underscores / dots. No leading or trailing dash/dot/underscore.
- **No "google" substring** (or close misspellings). You will get a
  rejection at create time.
- **Dots make the name DNS-style** and require domain verification —
  avoid dots unless you actually own the domain and want a
  domain-named bucket. Use dashes for separation.
- **Soft-deleted bucket names are reclaimed after the soft-delete
  window**, so re-creating a same-named bucket may fail for up to 7
  days after deletion.

### F. Permissions / 403 gotchas

- **Role granularity matters.** "Storage Object Viewer" is read-only;
  uploads require **Storage Object Creator** or **Storage Object
  Admin**. The error "permission denied" on upload despite the user
  swearing they have access is almost always this.
- **Project-level grants propagate to all buckets in the project;
  folder-level or object-level grants do NOT propagate upward.** A
  binding on one prefix doesn't grant bucket-wide list permission.
- **UBLA + leftover ACLs.** When you enable UBLA, ACLs are *disabled*
  but legacy ACL entries don't auto-migrate. Anything that relied on
  the old per-object ACL stops working. Run
  `gcloud storage buckets describe --format='value(iamConfiguration)'`
  to confirm UBLA state, and re-grant via IAM.
- **Public Access Prevention** at the org level overrides everything.
  If `allUsers` IAM bindings refuse to attach, check the
  `publicAccessPrevention` field first — `enforced` means no public
  access is possible from inside the project.
- **Requester Pays buckets** require the caller to set a billing
  project (`--billing-project=PROJECT_ID`). Without it, 400 errors
  with "Requester pays" in the message.

### G. Cost gotchas

- **Egress is the silent budget killer.** Downloads from a multi-region
  GCS bucket out to the public internet run roughly USD $0.12/GB in
  North America and more in other regions. If you're serving lots of
  bytes to consumers, front the bucket with Cloud CDN, or use a
  regional bucket near your customers and accept the geographic
  trade-off.
- **Multi-region storage is more expensive than regional.** Use
  multi-region only when geographic redundancy is genuinely required.
- **Class A vs Class B operations.** Uploads, lists, and metadata
  edits are Class A — roughly $0.05 per 10,000 ops on Standard. A
  script that lists a 100,000-object bucket once costs ~$0.50; a
  cron job that does it every minute costs ~$22,000/year. Class B
  (reads) is ~10× cheaper but the same logic applies.
- **Versioning + no lifecycle rule = unbounded cost.** Every overwrite
  or delete on a versioned bucket creates a noncurrent version that
  bills at the same per-GB rate as a live object — forever. Always
  pair object versioning with a lifecycle rule that deletes
  noncurrent versions after N days (30, 60, 90 are common).
- **Soft delete bills now.** As of September 1, 2024, soft-deleted
  objects accrue normal storage charges for the entire soft-delete
  retention period. (Before that, the lifecycle billing exception
  made them free. That exception is gone.) Default soft delete is
  7 days on every new bucket since late 2024.
- **Minimum storage durations.** Nearline = 30 days, Coldline = 90
  days, Archive = 365 days. Deleting earlier triggers an
  early-deletion charge equal to the remaining minimum-duration
  storage cost.

### H. Signed-URL gotchas

- **7-day cap.** This is a hard ceiling. `--duration=30d` is silently
  accepted but the URL stops working at day 7 with
  `SignatureDoesNotMatch`. The misleading error name has wasted
  hundreds of engineering hours; document this for the user.
- **ADC credentials can't sign.** You need a real service-account
  JSON or `--impersonate-service-account`. Error: "you need a private
  key to sign credentials".
- **V4 vs V2 signing.** Default to V4 (`version="v4"` in Python). V2
  still works but is older; V4 is the recommended algorithm and is
  what `gcloud storage sign-url` produces.
- **Clock skew on the client matters for V4.** The signature includes
  a timestamp; if the signer's clock is off by more than 15 minutes,
  the signed URL fails validation. Rare on laptops, common on cheap
  VMs that don't sync NTP.

### I. Resumable-upload gotchas

- `gcloud storage cp` uses resumable uploads automatically for files
  >~8 MiB. If the transfer fails, re-run the same command — it
  resumes. Add `--no-clobber` on retries so files that already
  finished aren't re-uploaded.
- **SDKs require explicit chunking for huge files.** Python:
  `blob.chunk_size = 8 * 1024 * 1024` before
  `upload_from_filename`. Default chunk size is 100 MiB, which is
  brutal on flaky networks — drop it to 8 MiB.
- **Resumable session URLs expire after 7 days** of inactivity. If
  your code persists the session URL and tries to resume after a
  long pause, expect a 410 Gone.

### J. MIME-type gotchas

- gcloud and SDK MIME auto-detection from file extension lags reality.
  Historical misses: `.webp`, `.avif`, `.mjs`, `.wasm`, `.ico` (sometimes
  served as `text/plain`), `.svg` (sometimes served as `text/xml`).
- **Always pass `--content-type` explicitly** for assets that browsers
  will load. The cost of getting it wrong is silent — the file
  uploads, but the browser refuses to render it (the classic "SVG
  served as text/plain" problem).

### K. CORS / browser-fetch gotchas

- **Public ≠ CORS-enabled.** A public object loads fine in `<img>` but
  fails from `fetch()` cross-origin until the bucket has a CORS
  config. Setting the IAM binding to `allUsers` does NOT enable CORS.
- **`storage.cloud.google.com` never sends CORS headers.** Even with a
  full CORS config on the bucket, requests to that domain will fail
  preflight. Always use `storage.googleapis.com` for `fetch()`.
- **Preflight cache.** `maxAgeSeconds` in your CORS JSON controls how
  long browsers cache the preflight result. Setting it to 0 (the
  default if omitted) makes every cross-origin request a double
  round-trip.

## Quick decision matrix

| User wants to… | Reach for |
|---|---|
| Upload one file | `gcloud storage cp ./file gs://BUCKET/path/file` |
| Upload a folder | `gcloud storage cp --recursive ./dir gs://BUCKET/path/` |
| Set Content-Type + Cache-Control at upload | Add `--content-type=...` `--cache-control=...` to `cp` |
| Get a public, embeddable URL | Make bucket public via IAM → `https://storage.googleapis.com/BUCKET/OBJECT` |
| Get a private, expiring URL | `gcloud storage sign-url ... --duration=Xh` (max 7d) |
| List a prefix | `gcloud storage ls gs://BUCKET/prefix/` |
| Delete one object | `gcloud storage rm gs://BUCKET/path/file` |
| Recover a deleted object | `gcloud storage objects restore gs://BUCKET/path/file#GEN` |
| Make a bucket public | `gcloud storage buckets add-iam-policy-binding ... --member=allUsers --role=roles/storage.objectViewer` |
| Enable CORS for a browser app | Write `cors.json`, `gcloud storage buckets update --cors-file=...` |
| Auto-delete old data | Write lifecycle JSON, `gcloud storage buckets update --lifecycle-file=...` |
| Real renameable folders | New HNS bucket with `--enable-hierarchical-namespace` |

## What this skill is *not* for

- **The personal `gs://shaughv` bucket.** Use `shaughv-gcs-storage` —
  bucket name, project, public-access status, and operational defaults
  are pre-wired there. Treat that skill as the layer of "what to type
  for Emmett's bucket"; this skill is the layer of "what these commands
  actually do".
- **The `cdn.shaughv.com` CDN.** That's Cloudflare R2, not GCS — use
  the `shaughv-cdn` skill.
- **Project / billing-account / org provisioning.** Out of scope.
  Point at `gcloud projects create` and the Google Cloud console.
- **Cloud Storage FUSE mounting** (`gcsfuse`). Different tool, separate
  install, separate quirks — out of scope here.
- **BigQuery / Firestore / Spanner / any non-GCS storage product.**
  Different APIs entirely.
