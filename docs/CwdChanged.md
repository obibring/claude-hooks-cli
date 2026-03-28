# CwdChanged

Runs when the working directory changes during a session.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `old_cwd` — previous working directory
- `new_cwd` — new working directory

## Environment Variables

- `$CLAUDE_ENV_FILE` — path for persisting environment variables. Use
  append (`>>`) to preserve variables from other hooks.

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **No matcher**: Cannot filter by directory path — must filter in
  your script.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks. Useful for reactive environment management
  (e.g., direnv-like behavior).
