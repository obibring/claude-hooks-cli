# TaskCompleted

Runs when a background task completes. **Requires experimental agent
teams.**

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `task_id` — unique task identifier
- `task_subject` — task subject line
- `task_description` — full task description
- `teammate_name` — name of the teammate that completed the task
- `team_name` — name of the team

## Output (stdout JSON)

Universal fields. Also supports:

- `continue: false` with `stopReason` — JSON decision control (since
  v2.1.70)

## Gotchas

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **Same input shape as TaskCreated**: Both hooks receive identical
  fields. Differentiate by `hook_event_name`.
