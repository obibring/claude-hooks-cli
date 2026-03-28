# TaskCreated

Runs when a task is being created via the TaskCreate tool. **Requires
experimental agent teams.**

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `task_id` — unique task identifier
- `task_subject` — task subject line
- `task_description` — full task description
- `teammate_name` — name of the teammate assigned
- `team_name` — name of the team

## Output (stdout JSON)

Universal fields. Also supports:

- `continue: false` with `stopReason` — JSON decision control (since
  v2.1.70)
- Exit code 2 — blocks task creation (stderr fed back to model)

## Gotchas

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **Exit code 2 blocks creation**: Unlike most hooks where exit code 2
  is just a blocking error, for TaskCreated it specifically prevents
  the task from being created, and stderr is fed back to the model.
- **Supports all handler types**: Unlike TeammateIdle which is
  command-only.
