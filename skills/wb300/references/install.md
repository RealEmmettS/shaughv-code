# wb300 — install, update, uninstall

wb300 is a single Rust + Ratatui binary with native builds for Windows, macOS,
and Linux on both Intel (x64) and ARM (arm64). It **drives the installed `git`
CLI directly**, so the only runtime requirement is `git` on `PATH` — no Rust
toolchain is needed to run a prebuilt binary. The crates.io package name is
`wb300`. License: PolyForm Noncommercial 1.0.0 (© 2026 Emmett S., part of the
QubeTX line). Source & docs:

- GitHub: https://github.com/QubeTX/qube-workbranch-view
- README: https://github.com/QubeTX/qube-workbranch-view/blob/main/README.md
- Landing / human reference: https://reports.qubetx.com/wb300

## Install

> **Already have wb300? Don't reinstall — run `wb300 update`.** The binary
> self-updates in place (registry-aware on Windows), so the download/install
> commands below are **only for a fresh system where wb300 is not yet
> installed**. Check first: `wb300 --version` or `wb300 help` works, or the
> binary exists (on this machine, `C:\Program Files\wb300\bin\wb300.exe`).

### macOS / Linux (prebuilt, recommended)
Canonical (GitHub releases, cargo-dist installer):
```sh
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/QubeTX/qube-workbranch-view/releases/latest/download/wb300-installer.sh | sh
```
Convenience wrapper hosted on the reports site (calls the same official
cargo-dist installer):
```sh
curl -LsSf https://reports.qubetx.com/install-wb300.sh | sh
```
Both download the prebuilt binary into `~/.cargo/bin` and update your shell
config so future terminals find it. Runs entirely in user scope — no `sudo`.

### Windows (prebuilt PowerShell, recommended)
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/QubeTX/qube-workbranch-view/releases/latest/download/wb300-installer.ps1 | iex"
```
Installs into `%USERPROFILE%\.cargo\bin`.

### Windows MSI / EXE installers
Download from the latest GitHub release — four variants (Global vs Corporate ×
MSI vs EXE):

| File | Use |
|---|---|
| `wb300-x86_64-pc-windows-msvc.msi` | Global MSI |
| `wb300-x86_64-pc-windows-msvc-corporate.msi` | Corporate (no-admin) MSI |
| `wb300-x86_64-pc-windows-msvc-setup.exe` | Global EXE |
| `wb300-x86_64-pc-windows-msvc-corporate-setup.exe` | Corporate (no-admin) EXE |

> On **this machine**, wb300 is the **Global MSI** install, located at
> `C:\Program Files\wb300\bin\wb300.exe`.

### From cargo (builds from source — needs the Rust toolchain)
```sh
cargo install wb300
```

### From source
```sh
git clone https://github.com/QubeTX/qube-workbranch-view.git
cd qube-workbranch-view
cargo build --release
```

> The offline "all tools" bundle at https://reports.qubetx.com/executables does
> **not** include wb300 (only TR-300 / ND-300 / SD-300). Use the methods above.

## Update

```sh
wb300 update            # self-update in place to the latest release
wb300 update --json     # machine-readable result, for orchestrating agents
```
On Windows, `wb300 update` is **registry-aware**: it remembers how you
installed it, fetches the matching installer, verifies the checksum, and
confirms the new version — including no-admin corporate installs.

> **Quirk on this machine:** because it's an **MSI-global** install, `wb300
> update` needs an interactive **UAC** approval. A non-interactive run fails
> with `msiexec` exit code **1602** (user cancelled / no consent). Don't retry
> in a loop — ask Emmett to run `wb300 update` himself in a normal terminal.

## Uninstall

```sh
wb300 uninstall          # detects the install method and removes wb300 cleanly
wb300 uninstall --purge  # also removes state, config, and registry entries
```
Uninstall never touches your repositories.

## Related Windows quirk — removing worktrees

This isn't a wb300 command, but it's the same problem space. `git worktree
remove` fails with `error: failed to delete '...': Invalid argument` while a
Next.js dev server (even one stopped seconds ago) still holds the directory.
Kill the port listeners first, wait, then remove:

```powershell
Get-NetTCPConnection -LocalPort 3000,3001 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Start-Sleep 3
git worktree remove <dir>
# if git already pruned its tracking:
Remove-Item -Recurse -Force <dir>
```
