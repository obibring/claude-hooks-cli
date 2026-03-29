# TaskCompleted

Runs when a background task completes. **Requires experimental agent
teams.**

## Config

The settings.json configuration object for this hook:

```ts
{
  hooks: Array<
    | {
        // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
      }
    | {
        // prompt handler
        type: "prompt"
        prompt: string
        model?:
          | "opus"
          | "sonnet"
          | "haiku"
          | "opus[4m]"
          | "sonnet[4m]"
        timeout?: number
      }
    | {
        // agent handler
        type: "agent"
        prompt: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
      }
    | {
        // http handler
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
  hook_event_name: "TaskCompleted"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  task_id: string
  task_subject: string
  task_description: string
  teammate_name: string
  team_name: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("TaskCompleted").emitOutput({ ... })`):

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

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **Same input shape as TaskCreated**: Both hooks receive identical
  fields. Differentiate by `hook_event_name`.
