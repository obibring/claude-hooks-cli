# PreToolUse

Runs **before** a tool call is executed. Can block, allow, or modify
the tool call.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

Matches `tool_name`. Accepts regex patterns. Supports built-in tools
(`Bash`, `Read`, `Edit`, `Write`, `Glob`, `Grep`, `Agent`, `WebFetch`,
`WebSearch`, `AskUserQuestion`, `ExitPlanMode`) and MCP tools
(`mcp__<server>__<tool>`).

## Conditional Execution (`if`)

Supports the `if` field for per-handler conditional execution using
permission rule syntax (e.g., `Bash(git *)`). When set, the hook
process only spawns if the condition matches — not on every matcher
match.

## Input (stdin JSON)

Common fields plus:

- `tool_name` — name of the tool about to be called
- `tool_input` — object of arguments passed to the tool
- `tool_use_id` — unique identifier for this tool call

## Output (stdout JSON)

Universal fields plus `hookSpecificOutput`:

- `permissionDecision`: `"allow"`, `"deny"`, or `"ask"`
- `permissionDecisionReason`: explanation string
- `autoAllow`: if `true`, auto-approve future uses of this tool (since
  v2.0.76)
- `updatedInput`: modified tool input object (since v2.1.85, can
  auto-respond to `AskUserQuestion`)

## Gotchas

- **Deprecated fields**: Do NOT use top-level `decision`/`reason`. Use
  `hookSpecificOutput.permissionDecision` and
  `hookSpecificOutput.permissionDecisionReason` instead.
- **Agent frontmatter**: When defined in agent frontmatter,
  `hook_event_name` is correctly reported as `"PreToolUse"` (unlike
  `Stop` which becomes `"SubagentStop"`).
- **`if` reduces spawning**: Without `if`, the hook process spawns on
  every matcher match. With `if`, it only spawns when both matcher AND
  condition match.
- **`updatedInput` for AskUserQuestion**: Can auto-respond to user
  questions in headless/CI contexts.
