# Elicitation

Runs when an MCP server requests user input during a tool call.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `mcp_server_name` — the name of the MCP server requesting
input.

## Input (stdin JSON)

Common fields plus:

- `mcp_server_name` — name of the MCP server
- `message` — the prompt message to the user
- `mode` — elicitation mode
- `url` — URL associated with the elicitation
- `elicitation_id` — unique identifier for this elicitation
- `requested_schema` — JSON schema for the expected response (shape
  varies)

## Output (stdout JSON)

Universal fields plus `hookSpecificOutput`:

- `action`: `"accept"`, `"decline"`, or `"cancel"` — controls the
  elicitation response
- `content` — response content (shape varies based on
  `requested_schema`)

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Paired with ElicitationResult**: Elicitation fires before user
  input; ElicitationResult fires after.
- **Same output shape as ElicitationResult**: Both use `action` +
  `content` in `hookSpecificOutput`.
- **`requested_schema`**: Variable shape — check the MCP server's
  documentation for expected format.
