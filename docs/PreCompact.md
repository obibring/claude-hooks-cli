# PreCompact

Runs **before** Claude Code performs a compact operation (context
compression).

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `trigger`. Valid values: `manual`, `auto`.

## Supports `once: true`

When set, only fires once per session. Useful since compaction may
happen multiple times.

## Input (stdin JSON)

Common fields plus:

- `trigger` — `"manual"` or `"auto"`
- `custom_instructions` — optional string with custom compaction
  instructions

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, but NOT in agent frontmatter.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`custom_instructions`**: Optional — only present when the user
  provided custom compact instructions.
