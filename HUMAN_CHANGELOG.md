# Human Changelog

A plain-English companion to [CHANGELOG.md](./CHANGELOG.md). Every change in the technical changelog has a layman's-terms version here. No version numbers, no code references — just what changed and why.

For the technical version with versions, file paths, and PR links, see CHANGELOG.md.

---

## Most recent release — mid-June 2026

**Changed**
- The guide that teaches AI assistants how to use Emmett's asset CDN now covers a third typeface, **Unbounded** — the chunky "brutalist" headline font from the dark version of the personal site. It explains that the font lives on the CDN, how to switch it on for a page (it's deliberately kept separate from the usual two-font set, so it only loads when a page asks for it), that it comes in five thicknesses plus one special stylistic version, and when to reach for it versus the standard fonts. Why it matters: any assistant building or reusing the brutalist look now knows the headline font is available from the shared CDN and how to wire it up, instead of shipping its own copy.

**Behind the scenes**
- The plugin's version number was bumped and a couple of search keywords were added so the CDN guide is easier to find.

---

## An earlier release — early June 2026

**Changed**
- Several of the recently imported skills still name-dropped Emmett's day-job setup — internal work systems, a work-only task tracker, and a few teammates and work AI assistants by name. Because this bundle is personal and public, all of that was stripped out or swapped for neutral, generic wording. The skills do exactly the same jobs as before (debugging, writing fail-safe code, bug triage, software design patterns, the git workflow, critical thinking, learning, strategy, and the helper-agent playbook) — they just no longer mention anything work-specific, so they read as general-purpose tools anyone could use.
- Where these skills used to point at companion skills that only exist in the work setup, they now point at the matching skill that's actually in this bundle — or, for the ones with no match here, drop the mention so nothing links to something that isn't included. The work-only task tracker was removed rather than replaced with a stand-in, and the git workflow's multi-person coordination now relies on plain git instead.

**Behind the scenes**
- One supporting file was renamed to drop a work-specific word from its name, and the bundle's version number was bumped.

---

## A day earlier — early June 2026

**Added**
- Eleven new skills joined the bundle, imported from an exported skill collection: a bug-investigation helper that actually digs into problems instead of just asking questions, a catalog of classic software design patterns, a structured debugging guide, advice on writing code that fails safely instead of silently, the team's official way of working with git, an image generation and editing helper, a coach for learning new topics deliberately, a toolkit for rigorous logical reasoning, a personal-productivity toolbox drawn from five well-known books, a carefully fenced playbook for running helper agents, and a facilitator for thinking through strategic situations. Why it matters: all of these now travel with the bundle, so they're available on every machine it's installed on instead of living only where they were first created.

**Fixed**
- Cleaned up an invisible formatting quirk (Windows-style line endings) in the newly imported skills and in one older skill, where it could have caused the skill's name to be read with a stray hidden character. Everything now uses the same convention as the rest of the project.

**Behind the scenes**
- The exported collection also contained a work-specific variant of the naming-rules guide. It was deliberately left out so the personal naming rules already in the bundle stay exactly as they are. The plugin's version, descriptions, search keywords, and the README's skill list were all updated to match the new contents.

---

## Late May 2026

**Added**
- Codex can now install this repo as a plugin too. In Codex, it brings in the same custom skills — brand design, OpenAI audio, naming conventions, changelog help, storage guidance, and the rest — without changing how the Claude Code version works.

**Behind the scenes**
- Added Codex-specific plugin metadata and a marketplace entry, updated the maintainer notes, bumped the plugin version, and documented the Codex install/update commands. The Codex version is intentionally skills-only for now; the existing Claude Code connector servers and shortcut command were left alone.

---

## Same week, earlier — late May 2026

**Added**
- The plugin now bundles a second small connector for the agent — this one links into a specific Craft note (Craft is a notes/documents app). When the agent works on something that touches the linked note, it can read from and write to that note directly instead of asking you to copy-paste content back and forth. The first time anyone uses it, Craft pops up its own sign-in window, so even though the link is committed to the public plugin repo, only people Craft itself authorizes can actually access the document. The link by itself is not a password.

**Behind the scenes**
- Plugin version bumped; the plugin's description and search keywords were extended so it shows up for "Craft" searches in the marketplace; the README's bundled-connectors table now lists both connectors (the existing Remotion-docs one and the new Craft one).

---

## Same day, earlier — late May 2026

**Added**
- Two new skills that teach Claude (and any other agent using this plugin) how to use Google Cloud's file-storage service end-to-end. The first one is generic — it can work with anyone's storage bucket once you tell it which project and bucket to use. The second is pre-set for Emmett's personal storage bucket, so the agent already knows the name, the URL pattern for sharing files, and the bucket's safety settings (deleted files are recoverable for a week, the bucket is public-read for sharing). Practical upshot: the agent can now upload screenshots, assets, or any other file and hand back a real shareable URL, instead of just describing the steps.
- Both new skills include comprehensive setup help for Mac, Linux, and Windows — including the awkward gotchas like corporate firewalls that block secure connections, the difference between "the command-line tool is logged in" and "your script is logged in" (which trip people up constantly), and what to do when the install seems to work but the command isn't found in the terminal.

**Behind the scenes**
- Bumped the plugin's version, refreshed the keyword list so the marketplace can find it better, and updated the README so the bundled-skills table lists the two new skills.

**Verified**
- Before publishing, the storage workflow was tested live against Emmett's actual bucket: uploaded a test file, fetched it from the public URL, deleted it, confirmed the public URL returned a "not found" page after delete, and confirmed the deleted file could be recovered from the bucket's safety-net for a week.

---

## Earlier this week

**Improved**
- The README now has clearer install instructions for two different audiences: people installing the plugin in Claude Code for the first time, and people who already have it and just want the latest version. Two copy-paste blocks at the top of the README, no hunting around for the right command.
- Documented an alternative install path: if you're using a different AI coding agent (not Claude Code), you can still pull just the skills via a separate tool. Helpful for anyone using Cursor, Codex, OpenCode, Gemini's CLI, and similar tools.

**Behind the scenes**
- Bumped the version number on the plugin, told git to ignore some auto-generated session snapshot files that were cluttering working directories, and clarified how a couple of the skills expect their API keys to be set up.

---

## Mid-week — late May 2026

**Added**
- A new naming-conventions skill. Gives agents (and Emmett) a single source of truth for how to name almost anything in a project — variable names, file names, folders, git branches, commit messages, pull-request titles, database columns, feature-flag keys. Borrows from a couple of well-known software-engineering books and adds Emmett's own SHAUGHV-specific conventions on top.

**Behind the scenes**
- Plugin version bumped; the plugin's description and search keywords were updated to mention the new naming guide.

---

## Earlier — late May 2026

**Added**
- A new SHAUGHV CDN consumer skill. When the agent is building something SHAUGHV-branded — a webpage, an email, an app — this skill tells it the exact URLs to use for the SHAUGHV logo, favicons, mascot illustrations, the two SHAUGHV fonts, and the animated brand-mark element. Includes ready-to-paste HTML snippets, the rules around caching the assets, and which assets are okay to use vs. licensed-only-for-SHAUGHV. The agent doesn't have to guess the URL or copy a logo file into the project — it links to the live CDN instead.

**Behind the scenes**
- Plugin version bumped.

---

## A few days earlier

**Added**
- The plugin now bundles a small server that lets the agent search the live Remotion documentation (Remotion is the React-based video-creation framework Emmett uses). Whenever the agent is working on a video project and needs to look up Remotion's API, it can search the official docs directly instead of guessing from memory.
- A new shortcut command — `/shaughv-code:create-video` — that scaffolds a fresh Remotion "Recorder" project from scratch and then adds the web-renderer plugin to it. Two steps, one shortcut, no need to remember the exact npm command order.

**Behind the scenes**
- Plugin version bumped.

---

## A week earlier — late May 2026

**Added**
- A new skill for keeping a changelog like this one in sync with a more technical changelog automatically. (The very skill that produced this file. The plugin now eats its own dog food.)

**Behind the scenes**
- Renamed a directory inside the new skill to match the naming convention used by the rest of the plugin (small consistency fix; not visible to anyone using the skill).
- Removed a redundant configuration setting from one of the existing brand-design skills — it was set to a value that was already the default, so deleting it changed nothing but tidied things up. Also dropped a now-outdated "leave this alone" warning from the developer notes.
- Plugin version bumped.

---

## Initial release — mid-May 2026

**Added**
- First release of the plugin. Bundles seven skills into a single installable package, so every Claude Code instance Emmett uses picks them up from one source of truth:
  - **Critical-thinking** — four frameworks for thinking through hard problems (contemplating, problem-solving, decision-making, design), plus tools for steelmanning the other side of an argument.
  - **OpenAI audio** — comprehensive guide for using OpenAI's audio products (realtime conversations, transcription, translation, text-to-speech) over the web. Includes runnable examples in three languages.
  - **Perplexity search** — lets the agent search the web and get cited answers via Perplexity's AI search APIs.
  - **PreText** — a niche layout library for measuring and laying out text without rendering it to a browser.
  - **Quiver AI** — Emmett's own tool for generating SVG vector graphics and converting raster images to vectors, via the Arrow model.
  - **SHAUGHV animated brandmark** — instructions for building the SHAUGHV brand mark that draws itself in path by path, then loops between the wordmark and the icon-only version.
  - **SHAUGHV design** — generates well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color palettes, type rules, sample components, and two complete UI kits.

**Removed**
- The old delivery mechanism for these skills was a set of binary "skill bundle" files. Replaced with a normal folder-per-skill layout that's easier to read, easier to edit, and shows up cleanly in version control. Users don't see this change; maintainers (mostly Emmett) get a much nicer editing experience.
