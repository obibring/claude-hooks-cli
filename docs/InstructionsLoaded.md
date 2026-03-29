# InstructionsLoaded

Runs when CLAUDE.md or `.claude/rules/*.md` files are loaded into
context.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "session_start" | "nested_traversal" | "path_glob_match" | "include" | "compact"  // matched against load_reason
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
      }
    | {  // http handler
        type: "http"
        url: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        headers?: Record<string, string>
        allowedEnvVars?: string[]
      }
  >
}
```

## Input

The JSON object received on stdin:

```ts
{
  hook_event_name: "InstructionsLoaded"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  file_path: string
  memory_type: string
  load_reason: "session_start" | "nested_traversal" | "path_glob_match" | "include" | "compact"
  globs?: unknown
  trigger_file_path?: string
  parent_file_path?: string
}
```

## Output

The JSON object to write to stdout:

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
}
```

## Gotchas

- **Multiple load reasons**: The same file can be loaded for different
  reasons — `session_start` on initial load, `compact` on re-load
  after compaction, `include` when referenced by another file.
- **Optional fields**: `globs`, `trigger_file_path`, and
  `parent_file_path` are only present for certain load reasons (e.g.,
  `path_glob_match` includes `globs`).
