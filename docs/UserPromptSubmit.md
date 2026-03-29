# UserPromptSubmit

Runs when the user submits a prompt, **before** Claude processes it.

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
  hook_event_name: "UserPromptSubmit"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  prompt: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("UserPromptSubmit").emitOutput({ ... })`):

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
  prompt?: string
}
```

## Gotchas

- **Can modify the prompt**: The output `prompt` field replaces the
  user's original prompt before Claude sees it. This is unique — most
  hooks can only block or add context.
- **No matcher**: Cannot filter by prompt content via matcher. To
  conditionally process, inspect `prompt` in your hook script.
- **No `if` support**: The `if` field is only for tool event hooks
  (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest).
