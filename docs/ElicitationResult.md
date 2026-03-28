# ElicitationResult

Runs after a user responds to an MCP elicitation, before the response
is sent back to the server.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `mcp_server_name` — the name of the MCP server.

## Input (stdin JSON)

Common fields plus:

- `mcp_server_name` — name of the MCP server
- `user_response` — the user's response (shape varies)
- `message` — the original prompt message
- `elicitation_id` — unique identifier matching the original
  Elicitation

## Output (stdout JSON)

Universal fields plus `hookSpecificOutput`:

- `action`: `"accept"`, `"decline"`, or `"cancel"` — can override the
  user's response
- `content` — replacement content (shape varies)

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Can override user response**: The hook can change or block the
  user's response before it reaches the MCP server.
- **Paired with Elicitation**: Use the same `elicitation_id` to
  correlate with the original request.
- **Different input from Elicitation**: Receives `user_response`
  instead of `mode`, `url`, `requested_schema`.
