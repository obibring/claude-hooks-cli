# Notification

Runs when Claude Code sends a notification to the user.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "permission_prompt" | "idle_prompt" | "auth_success" | "elicitation_dialog"  // matched against notification_type
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

- **Fixed enum for matcher**: Unlike tool name matchers which support
  regex, notification type matcher must be an exact enum value.
