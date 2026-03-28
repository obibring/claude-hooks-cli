# FileChanged

Runs when watched files change during a session. **Requires a
matcher.**

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**Required** — matches file basenames using pipe-separated values
(e.g., `.envrc|.env`). Unlike other matchers, this is not optional —
FileChanged hooks must specify which files to watch.

## Input (stdin JSON)

Common fields plus:

- `file_path` — full path to the changed file
- `event` — type of file system event

## Environment Variables

- `$CLAUDE_ENV_FILE` — path for persisting environment variables. Use
  append (`>>`) to preserve variables from other hooks.

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Matcher is required**: Unlike other hooks where the matcher is
  optional, FileChanged MUST have a matcher specifying which basenames
  to watch. Without it, the hook won't fire.
- **Pipe-separated basenames**: The matcher uses `|` as separator
  (e.g., `.envrc|.env`), NOT regex. This is unique to FileChanged.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks.
- **Basenames only**: The matcher matches file basenames, not full
  paths. `.envrc` matches any `.envrc` file regardless of directory.
