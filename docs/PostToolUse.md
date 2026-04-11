# PostToolUse

Runs **after** a tool call completes successfully.

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

| Property        | Type                      | Description                                    |
| --------------- | ------------------------- | ---------------------------------------------- |
| `tool_name`     | `string`                  | Name of the tool that was called               |
| `tool_input`    | `Record<string, unknown>` | Tool arguments                                 |
| `tool_use_id`   | `string`                  | Unique ID for this tool call                   |
| `tool_response` | `unknown`                 | The tool's return value (shape varies by tool) |

```ts
{
  hook_event_name: "PostToolUse"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  tool_name: string
  tool_input: Record<string, unknown>
  tool_use_id: string
  tool_response: unknown
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("PostToolUse").exit("success", { ... })`):

| Property   | Type      | Description                                                     |
| ---------- | --------- | --------------------------------------------------------------- |
| `decision` | `"block"` | Prompts Claude with the `reason`; the tool has already executed |
| `reason`   | `string`  | Explanation shown to Claude when `decision` is `"block"`        |

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

- **Only fires on success**: If the tool call fails,
  `PostToolUseFailure` fires instead — not `PostToolUse`.
- **`decision: "block"` is reactive, not preventative**: The tool has
  already executed. Returning `{ decision: "block", reason: "..." }`
  prompts Claude with the reason as feedback — it does not undo the
  tool call or hard-stop Claude. This is different from
  Stop/SubagentStop where `block` prevents Claude from finishing.
- **Agent frontmatter**: `hook_event_name` is correctly reported as
  `"PostToolUse"`.
