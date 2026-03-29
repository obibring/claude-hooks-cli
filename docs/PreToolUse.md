# PreToolUse

Runs **before** a tool call is executed. Can block, allow, or modify
the tool call.

## Config

The settings.json configuration object for this hook:

| Property  | Type                | Description                                                                                                                  |
| --------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `matcher` | `string` (optional) | Regex matched against `tool_name`                                                                                            |
| `if`      | `string` (optional) | Condition expression; supported on all handler types. Reduces spawning by only running when both matcher AND condition match |

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

| Property      | Type                      | Description                   |
| ------------- | ------------------------- | ----------------------------- |
| `tool_name`   | `string`                  | Name of the tool being called |
| `tool_input`  | `Record<string, unknown>` | Tool arguments                |
| `tool_use_id` | `string`                  | Unique ID for this tool call  |

```ts
{
  hook_event_name: "PreToolUse"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  tool_name: string
  tool_input: Record<string, unknown>
  tool_use_id: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("PreToolUse").emitOutput({ ... })`):

| Property                                      | Type                         | Description                                           |
| --------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| `hookSpecificOutput.permissionDecision`       | `"allow" \| "deny" \| "ask"` | Controls whether the tool call proceeds               |
| `hookSpecificOutput.permissionDecisionReason` | `string`                     | Shown to the model when denied                        |
| `hookSpecificOutput.autoAllow`                | `boolean`                    | Auto-approve future uses of this tool (since v2.0.76) |
| `hookSpecificOutput.updatedInput`             | `Record<string, unknown>`    | Replaces the original tool input (since v2.1.85)      |

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
  hookSpecificOutput?: {
    permissionDecision?: "allow" | "deny" | "ask"
    permissionDecisionReason?: string
    autoAllow?: boolean
    updatedInput?: Record<string, unknown>
  }
}
```

## Gotchas

- **Deprecated fields**: Do NOT use top-level `decision`/`reason`. Use
  `hookSpecificOutput.permissionDecision` and
  `hookSpecificOutput.permissionDecisionReason` instead.
- **Agent frontmatter**: When defined in agent frontmatter,
  `hook_event_name` is correctly reported as `"PreToolUse"` (unlike
  `Stop` which becomes `"SubagentStop"`).
- **`if` reduces spawning**: Without `if`, the hook process spawns on
  every matcher match. With `if`, it only spawns when both matcher AND
  condition match.
- **`updatedInput` for AskUserQuestion**: Can auto-respond to user
  questions in headless/CI contexts.
