# PreCompact

Runs **before** Claude Code performs a compact operation (context
compression).

## Config

The settings.json configuration object for this hook:

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
        once?: boolean
      }
    | {  // http handler
        type: "http"
        url: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        once?: boolean
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
  hook_event_name: "PreCompact"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  trigger: "manual" | "auto"
  custom_instructions?: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("PreCompact").emitOutput({ ... })`):

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

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, but NOT in agent frontmatter.
- **`custom_instructions`**: Optional — only present when the user
  provided custom compact instructions.
