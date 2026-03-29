# ConfigChange

Runs when a configuration file changes during a session.

## Config

The settings.json configuration object for this hook:

| Property  | Type                                                                                                    | Description                   |
| --------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `matcher` | `"user_settings" \| "project_settings" \| "local_settings" \| "policy_settings" \| "skills"` (optional) | Enum matched against `source` |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher?: "user_settings" | "project_settings" | "local_settings" | "policy_settings" | "skills"  // matched against source
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number   // default: 600s
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
      }
    | {  // http handler
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

| Property    | Type                                                                                         | Description                            |
| ----------- | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| `file_path` | `string`                                                                                     | Path to the changed configuration file |
| `source`    | `"user_settings" \| "project_settings" \| "local_settings" \| "policy_settings" \| "skills"` | Which config source changed            |

```ts
{
  hook_event_name: "ConfigChange"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  file_path: string
  source: "user_settings" | "project_settings" | "local_settings" | "policy_settings" | "skills"
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("ConfigChange").exit("success", { ... })`):

| Property   | Type      | Description              |
| ---------- | --------- | ------------------------ |
| `decision` | `"block"` | Blocks the config change |

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
  decision?: "block"
}
```

## Gotchas

- **External change detection**: Claude Code warns when hooks are
  modified externally during an active session — this hook lets you
  respond to those changes programmatically.
