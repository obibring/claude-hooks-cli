# Setup

Runs when Claude Code executes the `/setup` command for project
initialization.

## Config

The settings.json configuration object for this hook:

No hook-specific config properties. No `matcher` or `once` support.
Default timeout is 30000ms (not 5000ms).

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command only.

```ts
{
  hooks: Array<{
    // command handler
    type: "command"
    command: string
    timeout?: number // default: 600s
    async?: boolean
    asyncRewake?: boolean
    statusMessage?: string
    if?: string
  }>
}
```

## Input

The JSON object received on stdin:

No hook-specific properties. Only common fields are present.

```ts
{
  hook_event_name: "Setup"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("Setup").emitOutput({ ... })`):

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

- **Not in official docs**: Listed in the changelog (v2.1.10) but not
  in the official hooks reference page.
- **Higher default timeout**: Default timeout is 30000ms (30s), unlike
  most hooks which default to 5000ms.
- **Triggered by CLI flags**: Fires via `--init`, `--init-only`, or
  `--maintenance` CLI flags.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
