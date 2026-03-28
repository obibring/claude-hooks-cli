# SessionStart

Runs when Claude Code starts a new session or resumes an existing one.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `source`. Valid values: `startup`, `resume`, `clear`,
`compact`.

## Supports `once: true`

When set, only fires once per session — useful to avoid re-triggering
on resume.

## Input (stdin JSON)

Common fields plus:

- `model` — the Claude model being used
- `source` — how the session started: `"startup"`, `"resume"`,
  `"clear"`, or `"compact"`

## Environment Variables

- `$CLAUDE_ENV_FILE` — path for persisting environment variables for
  subsequent Bash commands. Use append (`>>`) to preserve variables
  from other hooks.

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, NOT agent frontmatter.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks.
- **`source: "compact"`**: Fires when the session restarts after
  automatic compaction — not the same as PreCompact/PostCompact.
