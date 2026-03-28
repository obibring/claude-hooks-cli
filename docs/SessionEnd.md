# SessionEnd

Runs when a Claude Code session ends.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `reason`. Valid values: `clear`, `resume`, `logout`,
`prompt_input_exit`, `bypass_permissions_disabled`, `other`.

## Supports `once: true`

When set, only fires once per session.

## Input (stdin JSON)

Common fields plus:

- `reason` — why the session ended

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Timeout history**: Prior to v2.1.74, SessionEnd hooks were killed
  after 1.5s regardless of configured `timeout`. Now respects the
  hook's `timeout` value, or `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS`
  env var.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Short-lived**: Keep SessionEnd hooks fast — the process is
  exiting.
