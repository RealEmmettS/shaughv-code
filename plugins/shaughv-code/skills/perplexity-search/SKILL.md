---
name: perplexity-search
description: |
  Search the web and get AI-grounded answers using the Perplexity API. Covers three APIs:
  Agent API (multi-provider models with web search and presets), Search API (raw ranked results),
  and Sonar API (web-grounded chat completions with citations).

  USE WHEN:
  - User asks to search with Perplexity, use Perplexity, or query Perplexity
  - Web research requiring real-time, cited results
  - Need raw search results for custom processing
  - Want AI answers grounded in current web data
  - Need to use specific LLM providers (OpenAI, Anthropic, Google, xAI) via unified API
  - Deep research or multi-step web analysis tasks
  - User mentions "perplexity", "sonar", "pro-search", "deep-research"
---

# Perplexity Search

Web search and AI-grounded answers via the Perplexity API.

## Choosing the Right API

### Search API — raw web results, no LLM

Returns ranked search results (title, URL, snippet, date) without any AI processing.

**Choose when:**
- You need raw URLs/snippets to feed into your own pipeline or model
- Building a custom RAG system or search integration
- Need precise control over what data you process (no AI interpretation)
- Data collection, indexing, or analysis tasks
- Want the cheapest option (flat per-request pricing, no token costs)

**Pros:** Fastest, cheapest, no hallucination risk, full control over result processing, multi-query support (up to 5 queries per request), domain/language/region filtering
**Cons:** No AI synthesis — you get raw results and must process them yourself. No citations, no summarization, no follow-up conversation.

### Sonar API — AI answer with web citations

Perplexity's own Sonar models generate answers grounded in live web search. Chat completions format.

**Choose when:**
- You want a researched AI answer with source citations (like asking perplexity.ai)
- Building a Q&A or research assistant
- Need multi-turn conversation with web-grounded context
- Want the simplest integration (just send a message, get a cited answer)
- OpenAI SDK compatibility matters (drop-in replacement)

**Pros:** Built-in citations array, simple chat completions format, multi-turn conversation, streaming support, OpenAI SDK compatible, Perplexity's own optimized models
**Cons:** Limited to Perplexity's Sonar models only (no choosing OpenAI/Anthropic/Google). Less control over search behavior. No presets or tool configuration.

### Agent API — multi-provider models + web search + presets

Access OpenAI, Anthropic, Google, xAI, and more through one API, with integrated web search tools and pre-configured presets.

**Choose when:**
- You need a specific model (e.g., Claude, GPT-5, Gemini) but also want web search
- Want preset configurations optimized for different research depths (fast-search through advanced-deep-research)
- Building agentic workflows with tool calling (web_search + fetch_url + custom functions)
- Need model fallback chains for high availability
- Want transparent per-token + per-search pricing with cost breakdown
- Deep research tasks requiring 10+ reasoning steps and 50-100+ sources

**Pros:** Multi-provider model access (no separate API keys needed), 4 optimized presets, granular control (tools, reasoning, token budgets, max steps), model fallback chains, detailed cost/usage in every response, domain filtering on web_search tool
**Cons:** Most expensive option (token costs + search costs). More complex request format. Slower for simple queries vs Search or Sonar. Preset system prompts can be verbose.

### Quick Decision Matrix

| Question | Answer | Use |
|----------|--------|-----|
| Do you need raw URLs/data, not AI text? | Yes | **Search** |
| Do you want a quick cited answer? | Yes | **Sonar** |
| Do you need a specific model (GPT, Claude, etc.)? | Yes | **Agent** |
| Is this a deep, multi-step research task? | Yes | **Agent** (deep-research preset) |
| Building a simple Q&A chatbot? | Yes | **Sonar** |
| Feeding results into another AI model? | Yes | **Search** |
| Need the cheapest option? | Yes | **Search** > **Sonar** > **Agent** |
| Need the simplest integration? | Yes | **Sonar** > **Agent** > **Search** |

## Prerequisites

Set `PERPLEXITY_API_KEY` in your environment before invoking this skill:

- macOS/Linux: `export PERPLEXITY_API_KEY=pplx-...` (or add to `~/.zshrc` / `~/.bashrc`)
- Windows PowerShell (persistent): `[Environment]::SetEnvironmentVariable('PERPLEXITY_API_KEY', 'pplx-...', 'User')` — then start a new shell
- Windows PowerShell (session-only): `$env:PERPLEXITY_API_KEY = 'pplx-...'`

### API Key Usage Rules

- **Claude searching while coding** (research, fact-checking, looking up docs): Read `PERPLEXITY_API_KEY` from the environment directly. If it isn't set, ask the user to set it rather than prompting for the key value in chat.
- **Baking Perplexity into a project as a tool** (building an app/service that calls Perplexity): Ask the user how the project should source the key (project-level env var, secrets manager, etc.). Do not embed any personal key into project code.

Optional SDK install:
```bash
pip install perplexityai                    # Python
npm install @perplexity-ai/perplexity_ai    # TypeScript
```

## Quick Start

### Search API — raw results

```bash
python scripts/perplexity.py search "latest AI news" --max-results 5
```

```bash
curl -X POST 'https://api.perplexity.ai/search' \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI news", "max_results": 5}'
```

### Sonar API — AI answer with citations

```bash
python scripts/perplexity.py sonar "What are the latest developments in quantum computing?"
```

```bash
curl https://api.perplexity.ai/v1/sonar \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "sonar-pro", "messages": [{"role": "user", "content": "your question"}]}'
```

### Agent API — presets with web search

```bash
# Quick factual lookup
python scripts/perplexity.py agent "Who won the Nobel Prize in Physics 2025?" --preset fast-search

# Standard research
python scripts/perplexity.py agent "Compare React vs Vue in 2026" --preset pro-search

# Deep analysis (many sources, multi-step reasoning)
python scripts/perplexity.py agent "Analyze AI regulation impact on startups" --preset deep-research

# Institutional-grade research
python scripts/perplexity.py agent "Competitive analysis of cloud providers" --preset advanced-deep-research
```

## Script Reference

`scripts/perplexity.py` — standalone CLI (stdlib only, no dependencies).

```
python scripts/perplexity.py search "query" [--max-results N] [--domain-filter d1,d2] [--language en] [--country US]
python scripts/perplexity.py sonar "prompt" [--model sonar-pro] [--system "instructions"] [--stream]
python scripts/perplexity.py agent "prompt" [--preset NAME] [--model provider/model] [--tools web_search,fetch_url] [--stream]
```

Common flags: `--json` (raw output), `--api-key KEY` (override)

## Agent API Presets

| Preset | Speed | Depth | Best For |
|--------|-------|-------|----------|
| `fast-search` | Fastest | 1 step | Simple factual questions |
| `pro-search` | Balanced | 3 steps | Most research queries |
| `deep-research` | Slow | 10 steps | Complex analysis |
| `advanced-deep-research` | Slowest | 10 steps | Premium institutional research |

Presets auto-configure model, tools, and system prompt. Override any parameter alongside preset.

## Domain & Language Filtering

```bash
# Only search specific domains
python scripts/perplexity.py search "AI research" --domain-filter arxiv.org,nature.com

# Exclude domains
python scripts/perplexity.py search "tech news" --domain-filter "-reddit.com,-pinterest.com"

# Filter by language
python scripts/perplexity.py search "renewable energy" --language en,de

# Regional search
python scripts/perplexity.py search "government policy" --country US
```

## Detailed API References

- **Agent API** (presets, models, tools, streaming, fallback): [references/agent-api.md](references/agent-api.md)
- **Search API** (filtering, multi-query, content extraction): [references/search-api.md](references/search-api.md)
- **Sonar API** (chat completions, citations, multi-turn): [references/sonar-api.md](references/sonar-api.md)
