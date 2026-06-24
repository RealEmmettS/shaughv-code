# openai-audio — a Claude Code skill for OpenAI's audio stack

This folder packages a Claude Code skill that turns Claude into an expert on OpenAI's audio APIs: the Realtime API (`gpt-realtime-2` and friends), realtime transcription (`gpt-realtime-whisper`), realtime translation (`gpt-realtime-translate`), text-to-speech (`gpt-4o-mini-tts`), file-based transcription/diarization (`gpt-4o-transcribe` and `whisper-1`), and audio inside Chat Completions (`gpt-audio`). It covers WebRTC, WebSocket, and SIP transports, plus the production rules — prompting, tool calling, MCP, cost management, and beta-to-GA migration.

This README is for **humans**. The skill's entry point for Claude is `SKILL.md`.

## What's inside

```
.
├── README.md                # this file — installation, maintenance, source-of-truth notes
├── SKILL.md                 # entry point Claude loads when the skill fires
├── references/              # 20 progressive-disclosure reference files Claude opens as needed
└── examples/                # runnable code in Python, JS, and TypeScript
    ├── README.md            # verification log + run instructions for each example
    ├── ephemeral-token-server/
    ├── webrtc-browser-voice-agent/
    ├── agents-sdk-browser/
    ├── audio_samples/       # short test fixtures
    └── prompt-templates/    # production-grade system prompts
```

## Installing into Claude Code

Claude Code looks for skills in `~/.claude/skills/<skill-name>/`. To install this skill:

### macOS / Linux

```bash
cp -r /path/to/openai-audio ~/.claude/skills/openai-audio
```

### Windows (PowerShell)

```powershell
Copy-Item -Recurse ".\openai-audio" "$env:USERPROFILE\.claude\skills\openai-audio"
```

After copying, restart `claude` (or start a new session). The skill should fire automatically on prompts that mention OpenAI's audio models, voice agents, transcription, translation, TTS, or any of the trigger phrases in `SKILL.md`'s frontmatter description.

## Verifying it fires

Start a new Claude Code session and try one of these prompts:

- "Build me a browser voice agent with the OpenAI Realtime API."
- "I need to transcribe a one-hour podcast with speaker labels."
- "Generate spoken audio from this text and stream it to my speakers."
- "Set up real-time Spanish-to-English translation for a livestream."
- "Wire up `gpt-realtime-2` with a `lookup_order` function tool."

Claude should announce it's using the `openai-audio` skill, then open the relevant references and examples.

## Required environment

Examples in this skill read **`OPENAI_API_KEY`** from the environment. Set it however your platform prefers:

- macOS/Linux: `export OPENAI_API_KEY=sk-...` (or add to `~/.zshrc` / `~/.bashrc`).
- Windows PowerShell (persistent): `[Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-...', 'User')` — then start a new shell.
- Windows PowerShell (session-only): `$env:OPENAI_API_KEY = 'sk-...'`.

No example file contains a hardcoded key. If you find one, it's a bug — please file an issue or fix it.

If your account or organization uses **safety identifiers** for per-user tracking, every example also looks at `OPENAI_SAFETY_IDENTIFIER` and forwards it as the `OpenAI-Safety-Identifier` header. See `references/02-voice-agents.md` for the binding rules with ephemeral tokens.

## Maintenance — when to update this skill

OpenAI ships updates to the Realtime stack frequently. This skill is stamped with a `last_verified_against_openai_docs` date in `SKILL.md`. When new models, new events, or new endpoints land, update:

1. The reference file(s) that mention the changed surface.
2. The relevant example file(s).
3. The verification log in `examples/README.md`.
4. The `last_verified_against_openai_docs` date in `SKILL.md`.

Anchor each change to an authoritative OpenAI doc URL in a comment or commit message — that makes future updates auditable.

### Watch for an official OpenAI audio skill

OpenAI's public skills catalog lives at https://github.com/openai/skills (it's the catalog Codex uses). At the time this skill was written, that repo did **not** include an audio or realtime skill. If one appears later, prefer the official skill and either retire this one or have it defer to the official surface. See `references/20-official-openai-skills.md` for details.

## Source of truth

Every reference file and code snippet was written against the OpenAI docs at:

- https://developers.openai.com/api/docs/guides/audio
- https://developers.openai.com/api/docs/guides/realtime
- https://developers.openai.com/api/docs/guides/voice-agents
- https://developers.openai.com/api/docs/guides/realtime-models-prompting
- https://developers.openai.com/api/docs/guides/realtime-conversations
- https://developers.openai.com/api/docs/guides/realtime-translation
- https://developers.openai.com/api/docs/guides/realtime-transcription
- https://developers.openai.com/api/docs/guides/realtime-webrtc
- https://developers.openai.com/api/docs/guides/realtime-websocket
- https://developers.openai.com/api/docs/guides/realtime-sip
- https://developers.openai.com/api/docs/guides/realtime-mcp
- https://developers.openai.com/api/docs/guides/realtime-server-controls
- https://developers.openai.com/api/docs/guides/realtime-costs
- https://developers.openai.com/api/docs/guides/text-to-speech
- https://developers.openai.com/api/docs/guides/speech-to-text

When in doubt, defer to the live docs. This skill captures patterns that were stable at the verification date.

## Testing examples

`examples/README.md` keeps a verification log: which examples have been run end-to-end against the real OpenAI API, which were code-reviewed only (because they need a browser, a SIP trunk, or an OAuth flow), and what the pass criteria were. Re-run the tests when:

- You update an example.
- You bump the `last_verified_against_openai_docs` date in `SKILL.md`.
- OpenAI changes an event name, endpoint, or session field.

## License + contributions

This skill is not affiliated with OpenAI. It's a community wrapper around OpenAI's public documentation. Re-use freely. If you improve it, contribute the change back so other users benefit.
