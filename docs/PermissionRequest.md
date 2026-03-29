# PermissionRequest

Runs when Claude Code requests permission from the user for a tool
call.

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
  hook_event_name: "PermissionRequest"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  tool_name: string
  tool_input: Record<string, unknown>
  permission_suggestions?: unknown
}
```

## Output

The JSON object to write to stdout:

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
  hookSpecificOutput?: {
    decision?: {
      behavior: "allow" | "deny"
    }
  }
}
```

## Gotchas

- **Different output shape from PreToolUse**: PermissionRequest uses
  `hookSpecificOutput.decision.behavior` (nested object), while
  PreToolUse uses `hookSpecificOutput.permissionDecision` (flat
  string). Do not confuse the two.
- **No `autoAllow`**: Unlike PreToolUse, PermissionRequest does not
  support `autoAllow`.
- **Agent frontmatter**: Fires correctly in agent sessions — one of
  the 6 supported agent hooks.
