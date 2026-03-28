# WorktreeCreate

Runs when agent worktree isolation creates worktrees for custom VCS
setup.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `name` — worktree name

## Output (stdout JSON)

Universal fields only. Special exit behavior:

- Non-zero exit code fails worktree creation
- stdout provides the worktree path on success

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Exit code matters**: Non-zero exit prevents the worktree from
  being created — different from most hooks where non-zero exit is
  just an error.
- **stdout is the path**: On success, stdout should contain the
  worktree path — not JSON.
