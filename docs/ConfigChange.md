# ConfigChange

Runs when a configuration file changes during a session.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `source`. Valid values: `user_settings`, `project_settings`,
`local_settings`, `policy_settings`, `skills`.

## Input (stdin JSON)

Common fields plus:

- `file_path` — path to the changed configuration file
- `source` — which configuration source changed

## Output (stdout JSON)

Universal fields plus:

- `decision`: `"block"` — can block execution

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **External change detection**: Claude Code warns when hooks are
  modified externally during an active session — this hook lets you
  respond to those changes programmatically.
