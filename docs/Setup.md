# Setup

Runs when Claude Code executes the `/setup` command for project
initialization.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields only. No hook-specific fields.

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Not in official docs**: Listed in the changelog (v2.1.10) but not
  in the official hooks reference page.
- **Higher default timeout**: Default timeout is 30000ms (30s), unlike
  most hooks which default to 5000ms.
- **Triggered by CLI flags**: Fires via `--init`, `--init-only`, or
  `--maintenance` CLI flags.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
