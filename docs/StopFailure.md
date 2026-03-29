# StopFailure

Runs when the turn ends due to an API error (rate limit, auth failure,
etc.).

## Config

The settings.json configuration object for this hook:

| Property  | Type                                                                                                                                               | Description                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `matcher` | `"rate_limit" \| "authentication_failed" \| "billing_error" \| "invalid_request" \| "server_error" \| "max_output_tokens" \| "unknown"` (optional) | Enum matched against `error` |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher?: "rate_limit" | "authentication_failed" | "billing_error" | "invalid_request" | "server_error" | "max_output_tokens" | "unknown"  // matched against error
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

| Property                 | Type                                                                                                                                    | Description                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `error`                  | `"rate_limit" \| "authentication_failed" \| "billing_error" \| "invalid_request" \| "server_error" \| "max_output_tokens" \| "unknown"` | Error type that caused the stop                          |
| `error_details`          | `unknown`                                                                                                                               | Additional error information; shape varies by error type |
| `last_assistant_message` | `string`                                                                                                                                | Claude's last response before the error                  |

```ts
{
  hook_event_name: "StopFailure"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  error: "rate_limit" | "authentication_failed" | "billing_error" | "invalid_request" | "server_error" | "max_output_tokens" | "unknown"
  error_details: unknown
  last_assistant_message: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("StopFailure").exit("success", { ... })`):

No hook-specific output properties. Only common fields are present.

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

- **Different from Stop**: `StopFailure` fires on API errors. `Stop`
  fires on normal turn completion. They never both fire for the same
  turn.
- **`error_details`**: Shape varies by error type — may contain rate
  limit timing, auth error codes, etc.
