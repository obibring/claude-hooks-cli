# TaskCreated

Runs when a task is being created via the TaskCreate tool. **Requires
experimental agent teams.**

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` or `if` support.
Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

Supported handler types: command, prompt, agent, http (all 4).

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

| Property           | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| `task_id`          | `string` | Unique task identifier                       |
| `task_subject`     | `string` | Subject/title of the task                    |
| `task_description` | `string` | Full task description                        |
| `teammate_name`    | `string` | Name of the teammate the task is assigned to |
| `team_name`        | `string` | Name of the team                             |

```ts
{
  hook_event_name: "TaskCreated"
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
`new HookHandler("TaskCreated").emitOutput({ ... })`):

No hook-specific output properties. Only common fields are present.
Exit code 2 blocks task creation (stderr is fed to the model).

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
- **Exit code 2 blocks creation**: Unlike most hooks where exit code 2
  is just a blocking error, for TaskCreated it specifically prevents
  the task from being created, and stderr is fed back to the model.
- **Supports all handler types**: Unlike TeammateIdle which is
  command-only.
