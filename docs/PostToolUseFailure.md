# PostToolUseFailure

Runs **after** a tool call fails.

## Config

The settings.json configuration object for this hook:

| Property  | Type                | Description                                          |
| --------- | ------------------- | ---------------------------------------------------- |
| `matcher` | `string` (optional) | Regex matched against `tool_name`                    |
| `if`      | `string` (optional) | Condition expression; supported on all handler types |

Supported handler types: command, prompt, agent, http (all 4).

```ts
{
  matcher?: string  // regex matched against tool_name
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
    | {  // prompt handler
        type: "prompt"
        prompt: string
        model?: "opus" | "sonnet" | "haiku" | "opus[4m]" | "sonnet[4m]"
        if?: string
        timeout?: number   // default: 30s
        statusMessage?: string
      }
    | {  // agent handler
        type: "agent"
        prompt: string
        timeout?: number   // default: 60s
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

| Property       | Type                      | Description                                                 |
| -------------- | ------------------------- | ----------------------------------------------------------- |
| `tool_name`    | `string`                  | Name of the tool that failed                                |
| `tool_input`   | `Record<string, unknown>` | Tool arguments                                              |
| `tool_use_id`  | `string`                  | Unique ID for this tool call                                |
| `error`        | `string`                  | Error message from the tool                                 |
| `is_interrupt` | `boolean`                 | `true` if the user interrupted, `false` if the tool errored |

```ts
{
  hook_event_name: "PostToolUseFailure"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  tool_name: string
  tool_input: Record<string, unknown>
  tool_use_id: string
  error: string
  is_interrupt: boolean
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("PostToolUseFailure").exit("success", { ... })`):

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

- **Counterpart to PostToolUse**: Only fires when a tool call fails.
  PostToolUse fires on success.
- **`is_interrupt` field**: Unique to this hook — indicates if the
  user interrupted the tool.
- **No decision control**: Unlike PostToolUse, this hook cannot block
  execution via `decision`.
