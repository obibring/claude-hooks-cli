# UserPromptSubmit

Runs when the user submits a prompt, **before** Claude processes it.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

**No matcher support** — always fires on every user prompt.

## Input (stdin JSON)

Common fields plus:

- `prompt` — the user's submitted prompt text

## Output (stdout JSON)

Universal fields plus:

- `prompt` — modified prompt text (replaces the original)

## Gotchas

- **Can modify the prompt**: The output `prompt` field replaces the
  user's original prompt before Claude sees it. This is unique — most
  hooks can only block or add context.
- **No matcher**: Cannot filter by prompt content via matcher. To
  conditionally process, inspect `prompt` in your hook script.
- **No `if` support**: The `if` field is only for tool event hooks
  (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest).
