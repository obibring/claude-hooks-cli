# Stop

Runs when Claude Code finishes responding (the turn ends normally).

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

**No matcher support** — always fires when Claude finishes responding.

## Input (stdin JSON)

Common fields plus:

- `last_assistant_message` — Claude's final response text
- `stop_hook_active` — boolean indicating if this hook is currently
  running

## Output (stdout JSON)

Universal fields plus:

- `decision`: `"block"` — can block and re-engage Claude

## Gotchas

- **Agent frontmatter bug**: When defined as `Stop:` in agent
  frontmatter, the `hook_event_name` received by the script is
  `"SubagentStop"`, NOT `"Stop"`. This is now documented as expected
  behavior: "For subagents, Stop hooks are automatically converted to
  SubagentStop since that is the event that fires when a subagent
  completes."
- **`stop_hook_active`**: If `true`, a stop hook is already running —
  be careful about recursion.
- **Different from StopFailure**: `Stop` fires on normal turn
  completion. `StopFailure` fires on API errors (rate limit, auth
  failure, etc.).
