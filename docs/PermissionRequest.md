# PermissionRequest

Runs when Claude Code requests permission from the user for a tool
call.

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

| Property                 | Type                      | Description                            |
| ------------------------ | ------------------------- | -------------------------------------- |
| `tool_name`              | `string`                  | Name of the tool requesting permission |
| `tool_input`             | `Record<string, unknown>` | Tool arguments                         |
| `permission_suggestions` | `unknown` (optional)      | Suggested permission actions           |

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

The JSON object to write to stdout (can be handled via
`new HookHandler("PermissionRequest").exit("success", { ... })`):

| Property                               | Type                | Description                                                                                                                  |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `hookSpecificOutput.decision.behavior` | `"allow" \| "deny"` | Controls whether permission is granted (note: nested under `decision` object, unlike PreToolUse's flat `permissionDecision`) |

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
