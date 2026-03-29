# PreCompact

Runs **before** Claude Code performs a compact operation (context
compression).

## Config

The settings.json configuration object for this hook:

| Property  | Type                            | Description                                              |
| --------- | ------------------------------- | -------------------------------------------------------- |
| `matcher` | `"manual" \| "auto"` (optional) | Enum matched against `trigger`                           |
| `once`    | `boolean` (optional)            | Run only once per session (on command and http handlers) |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher?: "manual" | "auto"  // matched against trigger
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number   // default: 600s
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
        once?: boolean
      }
    | {  // http handler
        type: "http"
        url: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
        once?: boolean
        headers?: Record<string, string>
        allowedEnvVars?: string[]
      }
  >
}
```

## Input

The JSON object received on stdin:

| Property              | Type                 | Description                                |
| --------------------- | -------------------- | ------------------------------------------ |
| `trigger`             | `"manual" \| "auto"` | How the compact was triggered              |
| `custom_instructions` | `string` (optional)  | User-provided compact instructions, if any |

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
`new HookHandler("PreCompact").exit("success", { ... })`):

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

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, but NOT in agent frontmatter.
- **`custom_instructions`**: Optional — only present when the user
  provided custom compact instructions.
