# UserPromptSubmit

Runs when the user submits a prompt, **before** Claude processes it.

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` support.

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

| Property | Type     | Description                                          |
| -------- | -------- | ---------------------------------------------------- |
| `prompt` | `string` | The user's submitted text before Claude processes it |

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
`HookHandler.for("UserPromptSubmit").exit("success", { ... })`):

| Property | Type     | Description                                                       |
| -------- | -------- | ----------------------------------------------------------------- |
| `prompt` | `string` | Replacement text; Claude sees this instead of what the user typed |

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
- **`if` present but not evaluated here**: The `if` field is available
  on all handler types on all hooks, but it is only evaluated on tool
  events (PreToolUse, PostToolUse, PostToolUseFailure,
  PermissionRequest). A hook with `if` set never runs on this event.
