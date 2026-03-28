# PermissionRequest

Runs when Claude Code requests permission from the user for a tool
call.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

Matches `tool_name`. Same regex pattern support as PreToolUse —
built-in tools and MCP tools (`mcp__<server>__<tool>`).

## Conditional Execution (`if`)

Supports the `if` field for per-handler conditional execution.

## Input (stdin JSON)

Common fields plus:

- `tool_name` — name of the tool requesting permission
- `tool_input` — arguments passed to the tool
- `permission_suggestions` — optional suggestions (shape varies)

## Output (stdout JSON)

Universal fields plus `hookSpecificOutput`:

- `decision.behavior`: `"allow"` or `"deny"`

## Gotchas

- **Different output shape from PreToolUse**: PermissionRequest uses
  `hookSpecificOutput.decision.behavior` (nested object), while
  PreToolUse uses `hookSpecificOutput.permissionDecision` (flat
  string). Do not confuse the two.
- **No `autoAllow`**: Unlike PreToolUse, PermissionRequest does not
  support `autoAllow`.
- **Agent frontmatter**: Fires correctly in agent sessions — one of
  the 6 supported agent hooks.
