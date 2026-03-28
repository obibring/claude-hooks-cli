# InstructionsLoaded

Runs when CLAUDE.md or `.claude/rules/*.md` files are loaded into
context.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `load_reason`. Valid values: `session_start`,
`nested_traversal`, `path_glob_match`, `include`, `compact`.

## Input (stdin JSON)

Common fields plus:

- `file_path` — path to the loaded instruction file
- `memory_type` — type of memory/instruction
- `load_reason` — why the file was loaded
- `globs` — optional glob patterns that triggered the load
- `trigger_file_path` — optional path to the file that triggered
  loading
- `parent_file_path` — optional path to the parent instruction file

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **Multiple load reasons**: The same file can be loaded for different
  reasons — `session_start` on initial load, `compact` on re-load
  after compaction, `include` when referenced by another file.
- **Optional fields**: `globs`, `trigger_file_path`, and
  `parent_file_path` are only present for certain load reasons (e.g.,
  `path_glob_match` includes `globs`).
