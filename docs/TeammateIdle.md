# TeammateIdle

Runs when a teammate agent becomes idle. **Requires experimental agent
teams.**

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` support. Requires
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command, http only.

```ts
{
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

| Property        | Type     | Description               |
| --------------- | -------- | ------------------------- |
| `teammate_name` | `string` | Name of the idle teammate |
| `team_name`     | `string` | Name of the team          |

```ts
{
  hook_event_name: "TeammateIdle"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  teammate_name: string
  team_name: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("TeammateIdle").exit("success", { ... })`):

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

- **Experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
  environment variable.
- **No matcher**: Cannot filter by teammate or team name via matcher —
  must filter in script.
