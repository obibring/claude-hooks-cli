# PostCompact

Runs **after** Claude Code completes a compact operation.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `trigger`. Valid values: `manual`, `auto`.

## Input (stdin JSON)

Common fields plus:

- `trigger` — `"manual"` or `"auto"`
- `compact_summary` — the summary produced by compaction

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **No `once` support**: Unlike PreCompact, PostCompact does NOT
  support `once: true`.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`compact_summary`**: Contains the compacted conversation summary —
  useful for logging or analysis.
