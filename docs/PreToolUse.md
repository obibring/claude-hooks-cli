# PreToolUse

Runs **before** a tool call is executed. Can block, allow, or modify
the tool call.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: string  // regex matched against tool_name
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
      }
    | {  // prompt handler
        type: "prompt"
        prompt: string
        model?: "opus" | "sonnet" | "haiku" | "opus[4m]" | "sonnet[4m]"
        timeout?: number
      }
    | {  // agent handler
        type: "agent"
        prompt: string
        timeout?: number
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
