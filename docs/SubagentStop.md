# SubagentStop

Runs when a subagent task completes.

## Config

The settings.json configuration object for this hook:

| Property  | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| `matcher` | `string` (optional) | Matched against `agent_type` |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, prompt, agent, http (all 4).

```ts
{
  matcher?: string  // matched against agent_type
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

| Property                 | Type      | Description                                                     |
| ------------------------ | --------- | --------------------------------------------------------------- |
| `agent_id`               | `string`  | Unique subagent ID                                              |
| `agent_type`             | `string`  | Subagent type                                                   |
| `last_assistant_message` | `string`  | The subagent's final response                                   |
| `agent_transcript_path`  | `string`  | Path to the full transcript JSON                                |
| `stop_hook_active`       | `boolean` | `true` if a stop hook is configured and active for this session |

```ts
{
  hook_event_name: "SubagentStop"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  last_assistant_message: string
  agent_transcript_path: string
  stop_hook_active: boolean
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("SubagentStop").exit("success", { ... })`):

| Property   | Type      | Description                              |
| ---------- | --------- | ---------------------------------------- |
| `decision` | `"block"` | Re-engages the subagent for another turn |

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

- **Receives agent `Stop` hooks**: When `Stop:` is defined in agent
  frontmatter, the hook actually fires as `SubagentStop` with
  `hook_event_name: "SubagentStop"`. This is by design.
- **`agent_transcript_path`**: Unique to SubagentStop — not present in
  SubagentStart. Useful for post-processing agent output.
- **`stop_hook_active`**: Indicates a stop hook is configured and
  active for this session. Use this to coordinate between multiple
  stop hooks or to guard against recursion.
- **Re-invocation after blocking**: When a stop hook returns
  `{ decision: "block" }`, the subagent continues working instead of
  stopping. When it tries to stop again, SubagentStop fires **again**.
  The hook is re-evaluated on every subsequent stop attempt — there is
  no automatic bypass. Guard against infinite loops by checking
  conditions or external state before blocking.
- **Agent frontmatter**: One of the 6 hooks that fire in agent
  sessions.
