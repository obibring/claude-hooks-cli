# ElicitationResult

Runs after a user responds to an MCP elicitation, before the response
is sent back to the server.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: string  // matched against mcp_server_name
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
  hook_event_name: "ElicitationResult"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  mcp_server_name: string
  user_response: unknown
  message: string
  elicitation_id: string
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
    action?: "accept" | "decline" | "cancel"
    content?: unknown
  }
}
```

## Gotchas

- **Can override user response**: The hook can change or block the
  user's response before it reaches the MCP server.
- **Paired with Elicitation**: Use the same `elicitation_id` to
  correlate with the original request.
- **Different input from Elicitation**: Receives `user_response`
  instead of `mode`, `url`, `requested_schema`.
