# Stop

Runs when Claude Code finishes responding (the turn ends normally).

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

| Property                 | Type      | Description                                                              |
| ------------------------ | --------- | ------------------------------------------------------------------------ |
| `last_assistant_message` | `string`  | Claude's final response text                                             |
| `stop_hook_active`       | `boolean` | `true` if another stop hook is already running; check to avoid recursion |

```ts
{
  hook_event_name: "Stop"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  last_assistant_message: string
  stop_hook_active: boolean
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("Stop").exit("success", { ... })`):

| Property   | Type      | Description                        |
| ---------- | --------- | ---------------------------------- |
| `decision` | `"block"` | Re-engages Claude for another turn |

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

- **Agent frontmatter bug**: When defined as `Stop:` in agent
  frontmatter, the `hook_event_name` received by the script is
  `"SubagentStop"`, NOT `"Stop"`. This is now documented as expected
  behavior: "For subagents, Stop hooks are automatically converted to
  SubagentStop since that is the event that fires when a subagent
  completes."
- **`stop_hook_active`**: If `true`, a stop hook is already running —
  be careful about recursion.
- **Different from StopFailure**: `Stop` fires on normal turn
  completion. `StopFailure` fires on API errors (rate limit, auth
  failure, etc.).
