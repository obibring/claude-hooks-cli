# PostCompact

Runs **after** Claude Code completes a compact operation.

## Config

The settings.json configuration object for this hook:

| Property  | Type                            | Description                    |
| --------- | ------------------------------- | ------------------------------ |
| `matcher` | `"manual" \| "auto"` (optional) | Enum matched against `trigger` |

Supported handler types: command, http only.

```ts
{
  matcher?: "manual" | "auto"  // matched against trigger
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

| Property          | Type                 | Description                             |
| ----------------- | -------------------- | --------------------------------------- |
| `trigger`         | `"manual" \| "auto"` | How the compact was triggered           |
| `compact_summary` | `string`             | The summary text produced by compaction |

```ts
{
  hook_event_name: "PostCompact"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  trigger: "manual" | "auto"
  compact_summary: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("PostCompact").emitOutput({ ... })`):

No hook-specific output properties. Only common fields are present.

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

- **No `once` support**: Unlike PreCompact, PostCompact does NOT
  support `once: true`.
- **`compact_summary`**: Contains the compacted conversation summary —
  useful for logging or analysis.
