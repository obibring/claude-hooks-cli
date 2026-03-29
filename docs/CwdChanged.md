# CwdChanged

Runs when the working directory changes during a session.

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` support.

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  hooks: Array<
    | {
        // command handler
        type: "command"
        command: string
        timeout?: number // default: 600s
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
      }
    | {
        // http handler
        type: "http"
        url: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
        headers?: Record<string, string>
        allowedEnvVars?: string[]
      }
  >
}
```

## Input

The JSON object received on stdin:

| Property  | Type     | Description                |
| --------- | -------- | -------------------------- |
| `old_cwd` | `string` | Previous working directory |
| `new_cwd` | `string` | New working directory      |

```ts
{
  hook_event_name: "CwdChanged"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  old_cwd: string
  new_cwd: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("CwdChanged").emitOutput({ ... })`):

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

- **No matcher**: Cannot filter by directory path — must filter in
  your script.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks. Useful for reactive environment management
  (e.g., direnv-like behavior).
