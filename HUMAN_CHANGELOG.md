# Human Changelog

A plain-English companion to [CHANGELOG.md](./CHANGELOG.md). Every change in the technical changelog has a layman's-terms version here. No version numbers, no code references — just what changed and why.

For the technical version with versions, file paths, and PR links, see CHANGELOG.md.

---

## Most recent release — late May 2026

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
