# PostToolUse

Runs **after** a tool call completes successfully.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

Matches `tool_name`. Same regex pattern support as PreToolUse.

## Conditional Execution (`if`)

Supports the `if` field for per-handler conditional execution.

## Input (stdin JSON)

Common fields plus:

- `tool_name` — name of the tool that was called
- `tool_input` — arguments that were passed to the tool
- `tool_use_id` — unique identifier for this tool call
- `tool_response` — the tool's return value (shape varies by tool)

## Output (stdout JSON)

Universal fields plus:

- `decision`: `"block"` — can block further execution

## Gotchas

- **Only fires on success**: If the tool call fails,
  `PostToolUseFailure` fires instead — not `PostToolUse`.
- **`decision: "block"`**: Uses top-level `decision` field (not nested
  in `hookSpecificOutput`), unlike PreToolUse.
- **Agent frontmatter**: `hook_event_name` is correctly reported as
  `"PostToolUse"`.
