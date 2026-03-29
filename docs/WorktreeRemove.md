# WorktreeRemove

Runs when agent worktree isolation removes worktrees for custom VCS
teardown.

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` support.

Supported handler types: command, http only.

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

| Property        | Type     | Description                        |
| --------------- | -------- | ---------------------------------- |
| `worktree_path` | `string` | Path to the worktree being removed |

```ts
{
  hook_event_name: "WorktreeRemove"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  worktree_path: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("WorktreeRemove").emitOutput({ ... })`):

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

- **Cleanup hook**: Use for custom VCS teardown (e.g., cleaning up
  branches associated with the worktree).
