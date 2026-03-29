# ConfigChange

Runs when a configuration file changes during a session.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "user_settings" | "project_settings" | "local_settings" | "policy_settings" | "skills"  // matched against source
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
      }
    | {  // http handler
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
  hook_event_name: "ConfigChange"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  file_path: string
  source: "user_settings" | "project_settings" | "local_settings" | "policy_settings" | "skills"
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("ConfigChange").emitOutput({ ... })`):

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

- **External change detection**: Claude Code warns when hooks are
  modified externally during an active session — this hook lets you
  respond to those changes programmatically.
