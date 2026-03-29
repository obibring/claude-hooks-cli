# Notification

Runs when Claude Code sends a notification to the user.

## Config

The settings.json configuration object for this hook:

| Property  | Type                                                                                        | Description                              |
| --------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `matcher` | `"permission_prompt" \| "idle_prompt" \| "auth_success" \| "elicitation_dialog"` (optional) | Enum matched against `notification_type` |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher?: "permission_prompt" | "idle_prompt" | "auth_success" | "elicitation_dialog"  // matched against notification_type
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

| Property            | Type                                                                             | Description            |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| `notification_type` | `"permission_prompt" \| "idle_prompt" \| "auth_success" \| "elicitation_dialog"` | Type of notification   |
| `message`           | `string`                                                                         | Notification body text |
| `title`             | `string`                                                                         | Notification title     |

```ts
{
  hook_event_name: "Notification"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  notification_type: "permission_prompt" | "idle_prompt" | "auth_success" | "elicitation_dialog"
  message: string
  title: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("Notification").exit("success", { ... })`):

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

- **Fixed enum for matcher**: Unlike tool name matchers which support
  regex, notification type matcher must be an exact enum value.
