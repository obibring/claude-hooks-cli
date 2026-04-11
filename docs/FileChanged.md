# FileChanged

Watch file(s) and execute hook(s) when they change. **Requires a
matcher.**

## Config

The settings.json configuration object for this hook:

| Property  | Type                    | Description                                                                                    |
| --------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `matcher` | `string` (**required**) | Pipe-separated basenames to watch (e.g., `".envrc\|.env"`). NOT regex -- unique to FileChanged |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
  matcher: string // REQUIRED — pipe-separated basenames (e.g., ".envrc|.env")
  hooks: Array<
    | {
        // command handler
        type: "command"
        command: string
        timeout?: number // default: 600s
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
      }
    | {
        // http handler
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

| Property    | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `file_path` | `string` | Full path to the changed file |
| `event`     | `string` | Filesystem event type         |

```ts
{
  hook_event_name: "FileChanged"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  file_path: string
  event: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("FileChanged").exit("success", { ... })`):

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

- **Matcher is required**: Unlike other hooks where the matcher is
  optional, FileChanged MUST have a matcher specifying which basenames
  to watch. Without it, the hook won't fire.
- **Pipe-separated basenames**: The matcher uses `|` as separator
  (e.g., `.envrc|.env`), NOT regex. This is unique to FileChanged.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks.
- **Basenames only**: The matcher matches file basenames, not full
  paths. `.envrc` matches any `.envrc` file regardless of directory.
