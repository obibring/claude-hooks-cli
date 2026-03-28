# StopFailure

Runs when the turn ends due to an API error (rate limit, auth failure,
etc.).

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `error`. Valid values: `rate_limit`, `authentication_failed`,
`billing_error`, `invalid_request`, `server_error`,
`max_output_tokens`, `unknown`.

## Input (stdin JSON)

Common fields plus:

- `error` — error type enum value
- `error_details` — additional error information (shape varies)
- `last_assistant_message` — Claude's last response before the error

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Different from Stop**: `StopFailure` fires on API errors. `Stop`
  fires on normal turn completion. They never both fire for the same
  turn.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`error_details`**: Shape varies by error type — may contain rate
  limit timing, auth error codes, etc.
