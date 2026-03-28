# TeammateIdle

Runs when a teammate agent becomes idle. **Requires experimental agent
teams.**

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `teammate_name` — name of the idle teammate
- `team_name` — name of the team

## Output (stdout JSON)

Universal fields. Also supports JSON decision control:

- `continue: false` with `stopReason` — stops execution
- Exit code 2 with JSON output — blocking error (since v2.1.70)

## Gotchas

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **No matcher**: Cannot filter by teammate or team name via matcher —
  must filter in script.
