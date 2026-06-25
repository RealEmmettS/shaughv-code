# Human Changelog

A plain-English companion to [CHANGELOG.md](./CHANGELOG.md). Every change in the technical changelog has a layman's-terms version here. No version numbers, no code references — just what changed and why.

For the technical version with versions, file paths, and PR links, see CHANGELOG.md.

---

## Most recent release — late June 2026

**Added**
- A full task + memory system you can drop into any project. One command sets it up, another keeps it in sync with your other tools, and a third tears it back down — folding everything it learned about your people, projects, and shorthand into the project itself so nothing is lost.
  - It keeps everything tidy inside a single dedicated folder in the project, so it never clutters things up — and when you're done, one command flattens its memory back into the project's own notes and removes itself.
  - It comes with a visual board — your tasks on one side, everything Claude knows about your work on the other — restyled head-to-toe in the SHAUGHV look, with a switch to flip between a warm cream theme and a dark "mission-control" theme. It's adapted and expanded from Anthropic's own productivity add-on.

**Behind the scenes**
- Listed the new pieces in the read-me, kept all the bundle's version numbers in step, and refreshed the Codex copy of the bundle.

## A little before that — late June 2026

**Fixed**
- Four skills had activation blurbs long enough that the assistant could silently skip them (a hidden length limit). Shortened those blurbs to a safe length and moved the extra detail — the full list of trigger phrases, and the Google-Cloud-Storage "always confirm the project and bucket before changing anything" safety rule — into the body of each skill. Nothing was lost; it just moved somewhere it still reads well, and those skills will now reliably switch on when they should.

**Behind the scenes**
- Nudged the version up a notch.

---

## Just before that — late June 2026

**Fixed**
- Tightened the automated check added in the previous release so it passes reliably. A line-ending quirk was making it flag a false mismatch in the Codex copy of the bundle on the Windows test machine; that's now pinned so the check behaves the same everywhere.

**Behind the scenes**
- Wrote down two easy-to-trip-on rules for whoever maintains the bundle next (so the same snags don't recur), and nudged the version up a notch.

---

## Earlier that day — late June 2026

**Added**
- Emmett pulled the newest versions of several thinking-and-working skills over from his work bundle and **scrubbed out everything work-specific** — every mention of his employer's tools, systems, projects, and teammates was removed or swapped for a neutral example, so the personal bundle stays clean and general.
- The **critical-thinking** skill grew from four thinking frameworks to six. The two new ones: a way to handle being **buried in information** — a pile of documents, or one dense message with a decision hidden inside it — that sorts everything down to "what do you actually need to decide, and what can wait until tomorrow"; and a **scientific-inquiry** approach for "why is this happening?" questions, which gathers evidence, lays out competing guesses, and runs the cheapest test that tells them apart. It also gained a set of ready-to-use interactive mini-web-pages — sliders and tables you can poke at — for the moments a long session has too many moving parts to hold in your head at once.
- Four brand-new skills joined the bundle: one that **maps and improves any process** (it draws the workflow out, reviews it through several well-known improvement lenses, and hands back a ranked list of fixes); one for **planning a piece of work into small, demoable steps** with a clear "are we actually done?" test; one that writes a thorough **hand-off note** so a future session can pick up exactly where you left off without re-asking anything; and one for **security-checking** a codebase — a full audit, a review of just the changed code, a "how risky is this change" read, and an on-request "try to break it" pass.

**Improved**
- The **productivity** skill now points you toward a sibling skill when a different one fits better. A small inconsistency in the **learning** skill was fixed, and a stale install note in the **audio** skill was corrected.

**Behind the scenes**
- Most of the shared skills didn't need changing at all — Emmett's personal copies were already ahead of the work versions (cleaner, and tuned to his own machine and projects), so those were left alone. A few had tiny leftover work references that got cleaned up. The work bundle's purely-work files (an employer-specific bug catalog and naming/infrastructure guides) were deliberately left out. Bumped the version everywhere, extended the bundle's descriptions and search keywords for the four new skills, added their rows to the README, and regenerated the Codex copy of the bundle so the two stay in lockstep.
- Added an automated check (matching the one Emmett's work bundle uses) that runs whenever changes land on the main branch: it confirms the Codex copy of the bundle is always in step with the originals and that every version number matches, so a forgotten rebuild can't slip through. To be clear, it **checks and flags** problems — it doesn't rebuild the copy by itself; that's still done before each change is saved.

---

## A day earlier — late June 2026

**Added**
- A small new **TT;DR** skill joined the bundle. "TT;DR" stands for "Too Tired; Didn't Read" — a playful flip of the familiar "TL;DR". The idea: when a reply is long or detailed, open it with a one-glance, plain-English summary of what's going on and where things stand, written for someone who's sharp but busy or tired. Unlike a TL;DR, it doesn't assume the reader is lazy, and it never replaces the detail — the full answer still follows right underneath the short lead. The skill teaches the assistant when to add one (status updates, change descriptions, incident notes, long write-ups, hand-offs), how to keep it short and jargon-free, where to place it, and how it's different from a full technical write-up. It comes with a bank of good-and-bad before/after examples to copy from. Why it matters: long answers become far easier to skim — you can read three sentences and stop if that's all you need, or read on for the specifics.

**Improved**
- **The Codex version of this bundle now works like Emmett's work bundle.** Codex (another AI coding tool) installs add-ons a bit differently from Claude, and ours wasn't quite set up right — it only handed Codex the skills, not the extras. Now Codex installs the bundle the same proven way the work bundle does, and it also gets the same built-in helper connections the Claude version already had: one that searches the Remotion video-framework documentation, and one that reaches a Craft notes document. Why it matters: anyone using the bundle in Codex now gets the full experience, installed the reliable way, instead of a partial one.

**Behind the scenes**
- The TT;DR skill was copied in exactly as-is (it's plain text, with no code, keys, or moving parts to break). Bumped the version, extended the bundle's descriptions and search keywords so the skill surfaces for "TT;DR", "TTDR", and "summary", and added a row to the README's list of bundled skills.
- To keep the Codex version honest, a small generator now builds Codex's own self-contained copy of the bundle straight from the main files, so the two can't drift apart, plus a one-command check that flags if that copy ever falls out of date. The maintainer notes were updated to describe this new step, replacing an old "there's nothing to build here" note now that the Codex copy has a tiny build step (the Claude version still has none).

---

## A few days earlier — late June 2026

**Added**
- A big new **Mistral AI** skill joined the bundle. It teaches the assistant to use Mistral's entire online service, with three headline jobs: pulling the text out of documents and PDFs (OCR), turning recorded speech into written text, and turning written text into spoken audio. It also covers everything else Mistral offers — chat, tool use, structured answers, embeddings, code completion, content moderation, file handling, bulk jobs, custom-model training, and Mistral's agents/conversations. It knows how to find your Mistral access key automatically, and if it can't, it asks you for one and offers to save it — either to your computer (so every future session has it) or just to the current project. It comes with ready-to-run helpers for the three main jobs, and it carries a complete offline copy of Mistral's own API guide so its instructions stay accurate, with a built-in way to check the live version for any changes. It also cleans up after itself: whenever it has to upload a file to Mistral to get a job done, it deletes that file the moment the result comes back, so you're never charged to store leftovers. Why it matters: any machine with the bundle can now read documents, transcribe audio, generate speech, and use the rest of Mistral on request — without hunting for setup steps.

**Behind the scenes**
- Confirmed the skill works end to end by saving a key to the machine and running a real Mistral request through the skill itself. Set up a private, never-shared folder inside the project that keeps zipped, ready-to-install copies of every skill (so they're easy to hand off), and made sure those zips and any saved key files stay out of version control. Bumped the version, extended the plugin's descriptions and search keywords so it surfaces for "Mistral", "OCR", "transcription", and "text-to-speech", and added a row to the README's list of bundled skills.

---

## Most recent release — mid-June 2026

**Improved**
- The status-line skill now installs itself with a single command that adapts to whatever computer it's run on. Since you'll be setting this up on more than one machine, this is the part that matters: the installer figures out that machine's own home folder, drops the program in the right spot, and writes the setting that points at it using that machine's own full path — so it's never tied to one specific computer. It also leaves the rest of your settings untouched (making a backup first), checks that it works, and can cleanly undo the whole thing later. Why it matters: set up the bundle and the status line on a second or third machine and each one just works on its own, with no leftover path from the first.

**Behind the scenes**
- To confirm this, the installer was test-run against a stand-in "other machine" — it correctly used that machine's paths and left the existing settings alone. Bumped the version and updated the README's note about this skill.

---

## Earlier the same day — mid-June 2026

**Changed**
- The SHAUGHV CDN skill — the helper that knows how to pull Emmett's logos, fonts, favicons, figurines, and brand widgets into a web page — was rebuilt to be self-updating. Instead of carrying a baked-in list of file locations that slowly goes stale, it now reads a live "table of contents" the CDN publishes about itself and uses whatever addresses that hands back. So when assets are added, renamed, or moved, the skill just keeps working with no one editing it. All the genuinely useful guidance a bare file list can't capture was kept: the licensing and redistribution rules, the rule that the animated logo needs a minimum size, the font-loading performance tips, and a cheat-sheet for matching a vague request to the right asset. A pending note about a new "Unbounded" headline font — which had been waiting on a side branch — was folded in at the same time, and that now-unnecessary branch was deleted, since the live table of contents already lists that font on its own.

**Behind the scenes**
- The download that kicked this off turned out to be the CDN's own published guide (not a lost project file), which is what suggested switching to the self-updating approach. Bumped the version and refreshed the README's one-line description of this skill.

---

## Also that day — mid-June 2026

**Added**
- A skill for installing Emmett's custom Claude Code status line now ships with the bundle. The status line is the always-visible strip at the bottom of the session; this one shows, in real time, how much of your 5-hour and weekly usage limits you've used up (as color-coded bars that shift green → yellow → orange → red as they fill), your running session cost, and — the clever part — an estimate of how much time you have left before you'd hit the 5-hour limit at your current pace, colored red when you're speeding up and green when you're easing off. The skill carries the exact, ready-made program for it, so any machine with the bundle can set up the identical status line on request: it drops the program into place, wires it into your settings, checks that it works, and tells you to restart. Why it matters: it's the same status line on every computer now, instead of something you'd rebuild by hand each time. (The live usage numbers only show on Pro/Max plans, and it needs Node installed.)

**Behind the scenes**
- Worth knowing why this is a skill rather than something the bundle flips on for you automatically: Claude Code only reads the status-line setting from your own personal settings file, so a plugin isn't allowed to set it silently — the skill does the setup on request instead. Also bumped the version, extended the descriptions and search keywords, and added a row to the README's list of bundled skills.

---

## Earlier still — mid-June 2026

**Added**
- A new image-upscaling skill joined the bundle. When you ask to make a picture bigger, sharper, or higher-resolution — or to rescue a blurry, low-res, or over-compressed photo, or get an image ready for print or a high-DPI screen — the agent now knows to run it through an online service that's specially tuned for faces, portraits, and profile pictures. It can enlarge anywhere from a gentle 2× polish up to a dramatic 200× restoration, with a dial that trades off "stay perfectly faithful to the original" against "reinvent missing detail" (kept faithful by default so real faces don't get invented). It handles the whole job end to end: hands the image to the service, waits for the result, saves it, and tells you exactly what it cost. If a photo is too big for the service's size limit, it automatically shrinks a copy to fit first — gently, and double-checking that the shrunk copy is still the same picture — without ever touching your original. Why it matters: it travels with the bundle now, so any machine it's installed on can upscale and restore images on request. (Using it needs an access key for the service, which charges a small amount per megapixel of the finished image.)

**Behind the scenes**
- Bumped the plugin's version, extended its descriptions and search keywords so the marketplace surfaces it for upscaling and image-enhancement searches, and added a row to the README's list of bundled skills.

---

## A few days earlier — mid-June 2026

**Added**
- A new "branch control tower" skill joined the bundle. When you ask things like "what am I working on across all my projects", "which branches are finished and ready to review", "what's still a work in progress", "what's safe to clean up", or "will these two lines of work clash when I combine them", the agent now knows to lean on a dedicated tool that reads your project's history and shows a live picture of every branch, every working copy on disk, and every coding assistant currently running — for one project or your whole machine at once. The skill also tells the agent to leave the full-screen live dashboard for you to open yourself (it would otherwise take over the screen) and how to install or update the tool. Why it matters: it travels with the bundle now, so any machine it's installed on can answer "what's the state of all my work?" without you piecing it together by hand.

**Behind the scenes**
- Bumped the plugin's version, extended its descriptions and search keywords so the marketplace surfaces it for branch- and worktree-related searches, and added a row to the README's list of bundled skills.

---

## A few days earlier — early June 2026

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
