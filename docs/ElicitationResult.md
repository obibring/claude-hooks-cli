# ElicitationResult

Runs after a user responds to an MCP elicitation, before the response
is sent back to the server.

## Config

The settings.json configuration object for this hook:

| Property  | Type                | Description                       |
| --------- | ------------------- | --------------------------------- |
| `matcher` | `string` (optional) | Matched against `mcp_server_name` |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher?: string  // matched against mcp_server_name
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

| Property          | Type      | Description                                    |
| ----------------- | --------- | ---------------------------------------------- |
| `mcp_server_name` | `string`  | Name of the MCP server                         |
| `user_response`   | `unknown` | What the user replied                          |
| `message`         | `string`  | The original prompt message                    |
| `elicitation_id`  | `string`  | Correlates with the original Elicitation event |

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

The JSON object to write to stdout (can be handled via
`HookHandler.for("ElicitationResult").exit("success", { ... })`):

| Property                     | Type                                | Description                      |
| ---------------------------- | ----------------------------------- | -------------------------------- |
| `hookSpecificOutput.action`  | `"accept" \| "decline" \| "cancel"` | Can override the user's response |
| `hookSpecificOutput.content` | `unknown`                           | Replacement content              |

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
