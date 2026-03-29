# Elicitation

Runs when an MCP server requests user input during a tool call.

## Config

The settings.json configuration object for this hook:

| Property  | Type                | Description                       |
| --------- | ------------------- | --------------------------------- |
| `matcher` | `string` (optional) | Matched against `mcp_server_name` |

Supported handler types: command, http only.

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

| Property           | Type      | Description                                   |
| ------------------ | --------- | --------------------------------------------- |
| `mcp_server_name`  | `string`  | Name of the MCP server requesting input       |
| `message`          | `string`  | Prompt message to the user                    |
| `mode`             | `string`  | Elicitation mode                              |
| `url`              | `string`  | Associated URL                                |
| `elicitation_id`   | `string`  | Unique ID to correlate with ElicitationResult |
| `requested_schema` | `unknown` | JSON schema for the expected response         |

```ts
{
  hook_event_name: "Elicitation"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  mcp_server_name: string
  message: string
  mode: string
  url: string
  elicitation_id: string
  requested_schema: unknown
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("Elicitation").emitOutput({ ... })`):

| Property                     | Type                                | Description                                 |
| ---------------------------- | ----------------------------------- | ------------------------------------------- |
| `hookSpecificOutput.action`  | `"accept" \| "decline" \| "cancel"` | How to respond to the elicitation           |
| `hookSpecificOutput.content` | `unknown`                           | Response data; shape per `requested_schema` |

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

- **Paired with ElicitationResult**: Elicitation fires before user
  input; ElicitationResult fires after.
- **Same output shape as ElicitationResult**: Both use `action` +
  `content` in `hookSpecificOutput`.
- **`requested_schema`**: Variable shape — check the MCP server's
  documentation for expected format.
