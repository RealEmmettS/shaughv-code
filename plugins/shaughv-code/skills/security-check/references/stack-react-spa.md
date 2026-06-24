# Stack Surface — React SPA (React 19 + Vite)

Applies when the stack includes a React SPA — React 18/19, Vite, common
routing/query libraries, react-markdown in places, and often MSAL or another
auth library in the browser. React escapes by default: most "XSS in React"
reports are false positives. The real findings live at the escape hatches and
in what the bundle ships.

## Surface map

| Where | What can go wrong |
|---|---|
| Escape hatches | `dangerouslySetInnerHTML`, direct DOM writes, `ref.innerHTML` |
| URL-valued props | `href`/`src` built from user/api data → `javascript:`/`data:` schemes |
| react-markdown / sanitizers | raw HTML enabled, `rehype-raw`, custom `urlTransform` |
| Build output | secrets inlined via `VITE_*` env vars, source maps in prod |
| Token handling | MSAL cache location, tokens copied into localStorage by hand |
| postMessage | listeners without origin checks |
| Client trust | "the UI hides it" treated as authorization |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| R1 | innerHTML escape hatch | `rg -n "dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML" --type-add 'web:*.{ts,tsx,js,jsx}' -tweb` |
| R2 | raw HTML in markdown | `rg -n "rehype-raw|rehypeRaw|allowDangerousHtml|skipHtml:\s*false" -tweb` |
| R3 | dynamic URLs into href/src | `rg -n "(href|src)=\{[^}\"']*(\+|\$\{|props\.|data\.)" -tweb` |
| R4 | postMessage listeners | `rg -n "addEventListener\(['\"]message" -tweb` then check each for `event.origin` validation |
| R5 | env vars into bundle | `rg -n "import\.meta\.env\.VITE_" -tweb` — every hit ships to the browser; look for KEY/SECRET/TOKEN names |
| R6 | hand-rolled token storage | `rg -n "(localStorage|sessionStorage)\.(set|get)Item\(['\"][^'\"]*(token|jwt|secret|key)" -i -tweb` |
| R7 | eval family | `rg -n "\beval\(|new Function\(|setTimeout\(['\"]" -tweb` |
| R8 | window.open / redirects from data | `rg -n "window\.(open|location)(\.href)?\s*=?\s*\(" -tweb` |
| R9 | prod source maps | check `vite.config.*` for `build.sourcemap: true` |

## Checklist

1. **Every R1/R2 hit**: trace the HTML's origin. Server-generated, LLM-generated,
   or user-influenced content through an unsanitized path = stored/DOM XSS
   (HIGH). Sanitized with DOMPurify at render = note the sanitizer config
   (`ALLOWED_URI_REGEXP`, `FORBID_TAGS`) and pass.
2. **R3/R8 hits**: can the value start with `javascript:` or `data:`? React
   does NOT block scheme-based injection in `href`. If the value originates
   from API data a user can influence (names, descriptions, links), finding.
3. **R5 hits**: `VITE_`-prefixed vars are baked into the public bundle by
   design. Any credential there is `secret_exposure` — severity by what the
   key unlocks (an Anthropic key = HIGH; a public telemetry key = INFO).
4. **R6 hits + MSAL config**: MSAL's own cache (`localStorage` vs
   `sessionStorage`) is configuration, not a finding (precedent: framework
   default). Hand-copying `accessToken` into storage, logging it, or putting it
   in the URL IS a finding (`data_exposure`).
5. **R4 hits**: a message listener that mutates state/DOM or forwards data
   without an allow-listed `event.origin` check is `xss`/`data_exposure`
   (MEDIUM+ depending on what the handler does).
6. **Authorization theater**: UI-only gating (hiding admin buttons by role) is
   fine ON ITS OWN (precedent 3) — but pair-check that the API the button
   calls enforces the same rule server-side; the finding belongs to the API.

## Example

```tsx
// BAD — markdown from the backend (LLM-assembled narrative!) rendered raw
<ReactMarkdown rehypePlugins={[rehypeRaw]}>{report.narrative}</ReactMarkdown>
// LLM output is attacker-influenceable via prompt injection in source data
// (user-authored or third-party text). rehypeRaw turns that into DOM XSS.

// GOOD — no raw HTML; URLs constrained; LLM output treated as untrusted
<ReactMarkdown
  urlTransform={(url) => (/^https?:/i.test(url) ? url : "")}
>{report.narrative}</ReactMarkdown>
```

## False-positive notes

- JSX text interpolation (`<div>{userInput}</div>`) is safe — never report.
- `dangerouslySetInnerHTML` with compile-time-constant content (icon SVGs,
  static legal text) — not a finding.
- CSS-in-JS with user data is not XSS in React; skip unless it builds `<style>` tags raw.
- Missing CSP/headers on the SPA: hardening appendix, not a finding (SWA
  config-level CSP belongs to `stack-azure-platform.md`).
