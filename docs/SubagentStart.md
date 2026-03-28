# SubagentStart

Runs when a subagent task starts.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `agent_type`. Values include built-in types (`Bash`,
`Explore`, `Plan`) and custom agent names.

## Input (stdin JSON)

Common fields plus:

- `agent_id` — unique subagent identifier (required, not optional like
  in base fields)
- `agent_type` — agent type name (required, not optional like in base
  fields)

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`agent_id`/`agent_type` override base optionals**: The base common
  fields include optional `agent_id`/`agent_type`. In SubagentStart
  input, these are required strings.
