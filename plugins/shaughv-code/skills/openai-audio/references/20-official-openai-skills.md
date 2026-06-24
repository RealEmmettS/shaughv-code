# 20 — Official OpenAI skills catalog

OpenAI maintains a public skills catalog at **https://github.com/openai/skills**. It's the catalog the Codex CLI uses (via `$skill-installer`). The README describes skills as "folders of instructions, scripts, and resources that AI agents can discover and use to perform at specific tasks."

The catalog is organized into three tiers:

- `.system/` — installed automatically with Codex.
- `.curated/` — installable by name via `$skill-installer`.
- `.experimental/` — installable by folder path.

## Audio / Realtime status

At the verification date in `SKILL.md`, the OpenAI skills catalog **does not include an audio or realtime skill.** Periodically check the repo — when an official audio skill lands, prefer it over this community one.

**This skill is currently the audio expert for Claude Code.** Don't try to bootstrap the OpenAI catalog at runtime — the install path there is `$skill-installer` under Codex, which isn't the same surface Claude Code uses (`~/.claude/skills/`).

## When to check the upstream catalog

- A user explicitly asks about "official OpenAI skills".
- You're updating this skill against newer docs and want to see if OpenAI shipped one in the meantime.
- You're building an integration that runs in Codex (not Claude Code) — there the catalog is the right starting point.

## How to mention the catalog to users

Acceptable patterns:

- "OpenAI publishes its own skills at https://github.com/openai/skills, but the catalog doesn't yet include an audio skill — this one (`openai-audio`) covers the same surface for Claude Code."
- "When OpenAI ships an official audio skill at https://github.com/openai/skills, prefer it for new builds."

Don't:

- Auto-install anything from the upstream repo.
- Recommend installing the upstream repo's installer command in Claude Code (it's for Codex).
- Suggest the upstream catalog has an audio skill when it doesn't.

## See also

- `README.md` (skill root) — installation flow for `~/.claude/skills/`.
- `SKILL.md` — `last_verified_against_openai_docs` date.
