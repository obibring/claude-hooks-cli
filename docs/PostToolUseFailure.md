# PostToolUseFailure

Runs **after** a tool call fails.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

Matches `tool_name`. Same regex pattern support as PreToolUse.

## Conditional Execution (`if`)

Supports the `if` field for per-handler conditional execution.

## Input (stdin JSON)

Common fields plus:

- `tool_name` — name of the tool that failed
- `tool_input` — arguments that were passed to the tool
- `tool_use_id` — unique identifier for this tool call
- `error` — error message string
- `is_interrupt` — boolean indicating if the failure was due to an
  interrupt

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Counterpart to PostToolUse**: Only fires when a tool call fails.
  PostToolUse fires on success.
- **`is_interrupt` field**: Unique to this hook — indicates if the
  user interrupted the tool.
- **No decision control**: Unlike PostToolUse, this hook cannot block
  execution via `decision`.
