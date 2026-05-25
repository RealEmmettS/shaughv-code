---
allowed-tools: Bash(npx create-video:*), Bash(npx remotion:*), Bash(ls:*), Bash(cd:*)
description: Scaffold a Remotion Recorder project (npx create-video --recorder) and add @remotion/web-renderer
---

## Your task

Scaffold a new Remotion Recorder project for the user, then add the
`@remotion/web-renderer` package inside it.

Steps:

1. Use `AskUserQuestion` to ask the user what directory name to scaffold into.
   Suggest a default like `my-recorder-video`. Also ask where the directory
   should live (default: current working directory).
2. **Scaffold the project.** Run `npx create-video@latest <dir-name> --recorder`
   via the Bash tool. The positional directory argument lets `create-video` skip
   most of its interactive prompts.
3. **Add the web renderer.** Only if step 2 succeeded, run
   `cd <dir-name> && npx remotion add @remotion/web-renderer` via Bash. This
   package has to be added from inside the scaffolded project, which is why the
   order is fixed (scaffold first, then add).
4. If either step fails, stalls, or tries to prompt interactively (the Bash
   tool has no TTY), stop and tell the user to run the steps themselves in
   their terminal by pasting these into their prompt:

   ```
   ! npx create-video@latest --recorder
   ! cd <dir-name> && npx remotion add @remotion/web-renderer
   ```

   The `!` prefix runs commands in their real terminal, so any interactive
   prompts work properly.
5. On success, `ls` the new directory to show the scaffolded layout and remind
   the user how to start it (typically `cd <dir-name> && npm install && npm run dev`).

Keep the output terse. This is a one-shot scaffolder, not a tutorial.
