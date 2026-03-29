# StopFailure

Runs when the turn ends due to an API error (rate limit, auth failure,
etc.).

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "rate_limit" | "authentication_failed" | "billing_error" | "invalid_request" | "server_error" | "max_output_tokens" | "unknown"  // matched against error
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

The JSON object to write to stdout:

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
