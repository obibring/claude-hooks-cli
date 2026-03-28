# WorktreeRemove

Runs when agent worktree isolation removes worktrees for custom VCS
teardown.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

**No matcher support** — always fires.

## Input (stdin JSON)

Common fields plus:

- `worktree_path` — path to the worktree being removed

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Cleanup hook**: Use for custom VCS teardown (e.g., cleaning up
  branches associated with the worktree).
