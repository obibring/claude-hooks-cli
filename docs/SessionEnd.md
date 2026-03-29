# SessionEnd

Runs when a Claude Code session ends.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "clear" | "resume" | "logout" | "prompt_input_exit" | "bypass_permissions_disabled" | "other"  // matched against reason
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        once?: boolean
      }
    | {  // http handler
        type: "http"
        url: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        once?: boolean
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
  hook_event_name: "SessionEnd"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  reason: "clear" | "resume" | "logout" | "prompt_input_exit" | "bypass_permissions_disabled" | "other"
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("SessionEnd").emitOutput({ ... })`):

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

- **Timeout history**: Prior to v2.1.74, SessionEnd hooks were killed
  after 1.5s regardless of configured `timeout`. Now respects the
  hook's `timeout` value, or `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS`
  env var.
- **Short-lived**: Keep SessionEnd hooks fast — the process is
  exiting.
