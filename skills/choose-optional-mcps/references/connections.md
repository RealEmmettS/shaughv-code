# Optional MCP connection catalog

These entries are operator-selectable connections, not plugin dependencies. `shaughv-code` does
not bundle or register them. Never commit credentials, OAuth tokens, or private health data while
following these examples.

## Remotion documentation

- **Identifier:** `remotion-documentation`
- **Transport:** stdio
- **Command:** `npx @remotion/mcp@latest`
- **Use for:** questions that benefit from the current Remotion API and documentation rather than
  model memory.
- **Authentication:** no account OAuth is expected; `npx` still downloads/runs the package and the
  server uses the network.
- **Independence:** `/shaughv-code:create-video` does not depend on this MCP.

Inspect before adding:

```powershell
codex mcp get remotion-documentation --json
claude mcp get remotion-documentation
```

Codex user-level registration:

```powershell
codex mcp add remotion-documentation -- npx @remotion/mcp@latest
```

Codex project configuration:

```toml
[mcp_servers.remotion-documentation]
command = "npx"
args = ["@remotion/mcp@latest"]
```

Claude project registration:

```powershell
claude mcp add --scope project remotion-documentation -- npx @remotion/mcp@latest
```

Use `--scope user` instead only when the operator wants it across Claude projects.

## Shaughv Health

- **Identifier:** `shaughv-health`
- **Transport:** Streamable HTTP
- **URL:** `https://health.emmetts.dev/api/mcp`
- **Use for:** explicitly authorized personal health, nutrition, sleep, or exercise queries and
  logging.
- **Authentication:** Google sign-in restricted to an allowlisted account.
- **Privacy:** prefer an already-exposed Healthy/health connector when it supplies the needed
  capability. Retrieve or disclose only the minimum data required by the current task. Treat any
  logging or modification as a write requiring clear authorization.

Inspect before adding:

```powershell
codex mcp get shaughv-health --json
claude mcp get shaughv-health
```

Codex user-level registration:

```powershell
codex mcp add shaughv-health --url https://health.emmetts.dev/api/mcp
```

Codex project configuration:

```toml
[mcp_servers.shaughv-health]
url = "https://health.emmetts.dev/api/mcp"
```

Claude project registration:

```powershell
claude mcp add --transport http --scope project shaughv-health https://health.emmetts.dev/api/mcp
```

Use `--scope user` instead only when the operator wants it across Claude projects. Let the client
perform the sign-in flow; never request or store account credentials in project files.

## Pipedream

- **Identifier:** `pipedream`
- **Transport:** Streamable HTTP
- **URL:** `https://mcp.pipedream.net/v2`
- **Use for:** tools from apps the operator selects and authorizes through Pipedream.
- **Authentication:** OAuth on first connection; the operator chooses which apps to expose.
- **Authorization:** an OAuth grant makes selected tools available but does not authorize every
  consequential action. Preserve any working client-specific resource override instead of
  replacing the connection with a bare duplicate.

Inspect before adding:

```powershell
codex mcp get pipedream --json
claude mcp get pipedream
```

Codex user-level registration:

```powershell
codex mcp add pipedream --url https://mcp.pipedream.net/v2 --oauth-resource https://mcp.pipedream.net
```

Codex project configuration:

```toml
[mcp_servers.pipedream]
url = "https://mcp.pipedream.net/v2"
oauth_resource = "https://mcp.pipedream.net"
```

Claude project registration:

```powershell
claude mcp add --transport http --scope project pipedream https://mcp.pipedream.net/v2
```

Use `--scope user` instead only when the operator wants it across Claude projects. Pipedream's
protected-resource metadata currently declares `https://mcp.pipedream.net` while the MCP endpoint
is `/v2`, so the Codex examples preserve that resource explicitly. Reuse any working entry and
verify with `codex mcp get pipedream --json`; do not silently overwrite its OAuth settings.

## Before presenting a setup option

1. Inspect the current tool inventory as well as named MCP configuration; client-provided
   connectors may already cover the capability.
2. Compare both identifier and endpoint/command so aliases do not become duplicates.
3. Recommend project scope for a single repository and user scope only for repeated cross-project
   use.
4. Run the installed client's `mcp add --help` before relying on an example when syntax may have
   changed.
5. Explain any download, network, OAuth, privacy, or write-authorization boundary before asking the
   operator to proceed.
6. Start a fresh client session after a configuration change when the current session cannot
   reload its MCP inventory.
