---
name: choose-optional-mcps
description: Advisory catalog for deciding whether to reuse or suggest the optional Remotion documentation, Shaughv Health, or Pipedream MCP connections without bundling or auto-installing them. Use when a task may benefit from live Remotion docs, private health-data tools, or Pipedream integrations; when an MCP appears missing, duplicated, or client-provided; or when the user asks how to connect, activate, install, scope, or reuse one of these services in Codex or Claude Code.
---

# Choose Optional MCPs

Provide connection context without treating any MCP as a dependency. This skill does not install,
load, authenticate, or configure a server by itself.

## Operating posture

1. Inspect the tools exposed by the current client and any relevant MCP configuration before
   suggesting setup. A connector, app, or already-registered MCP with the needed capability counts
   as available even when its display name differs.
2. Reuse a healthy existing connection. Do not register a second copy of the same named server or
   endpoint merely because this skill mentions it.
3. If the capability is absent and materially useful, explain the benefit and surface the smallest
   appropriate connection option. Request explicit operator approval before changing configuration
   or starting an authentication flow.
4. Prefer project scope for one-project needs. Use user/global scope only when the operator asks for
   recurring availability across projects. Never replace a working user-level entry with a
   project-level duplicate.
5. Treat authentication as connection approval, not blanket authorization for subsequent actions.
   Keep Shaughv Health access within the user's explicit health-data task and expose only the
   minimum necessary data. With Pipedream, use only the apps and actions the operator authorized,
   and obtain any additional approval required for consequential writes or messages.
6. Verify current client command syntax with local help before presenting a command when the
   installed CLI may differ from the examples.

## Connection catalog

Read [references/connections.md](references/connections.md) only when evaluating or presenting one
of the three optional services. It contains identifiers, transports, endpoints, authentication
expectations, useful task shapes, and current Codex/Claude registration examples.

Keep the operator-facing result proportional:

- If the connection already exists, use it within the task's authorization and do not discuss
  installation unless there is an actual problem.
- If it is missing, state what it would add, the recommended scope, and the approval or sign-in the
  operator would need to provide.
- If it is duplicated or unhealthy, identify the active source before proposing changes. Preserve
  working credentials and client-specific OAuth/resource settings.
