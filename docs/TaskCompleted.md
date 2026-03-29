# TaskCompleted

Runs when a background task completes. **Requires experimental agent
teams.**

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` support. Requires
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, prompt, agent, http (all 4).

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
        // prompt handler
        type: "prompt"
        prompt: string
        model?:
          | "opus"
          | "sonnet"
          | "haiku"
          | "opus[4m]"
          | "sonnet[4m]"
        if?: string
        timeout?: number // default: 30s
        statusMessage?: string
      }
    | {
        // agent handler
        type: "agent"
        prompt: string
        timeout?: number // default: 60s
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

| Property           | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| `task_id`          | `string` | Unique task identifier                       |
| `task_subject`     | `string` | Subject/title of the task                    |
| `task_description` | `string` | Full task description                        |
| `teammate_name`    | `string` | Name of the teammate that completed the task |
| `team_name`        | `string` | Name of the team                             |

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
`new HookHandler("TaskCompleted").exit("success", { ... })`):

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

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **Same input shape as TaskCreated**: Both hooks receive identical
  fields. Differentiate by `hook_event_name`.
