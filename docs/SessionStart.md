# SessionStart

Runs when Claude Code starts a new session or resumes an existing one.

## Config

The settings.json configuration object for this hook:

| Property  | Type                                                       | Description                   |
| --------- | ---------------------------------------------------------- | ----------------------------- |
| `matcher` | `"startup" \| "resume" \| "clear" \| "compact"` (optional) | Enum matched against `source` |
| `once`    | `boolean` (optional)                                       | Run only once per session     |

| Property | Type                | Description                                                                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `if`     | `string` (optional) | Condition expression; present on all handler types but only evaluated on tool events — a hook with `if` set never runs here |

Supported handler types: command only.

```ts
{
  matcher?: "startup" | "resume" | "clear" | "compact"  // matched against source
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number   // default: 600s
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        if?: string
        once?: boolean
      }
  >
}
```

## Input

The JSON object received on stdin:

| Property | Type                                            | Description                                   |
| -------- | ----------------------------------------------- | --------------------------------------------- |
| `model`  | `string`                                        | Claude model in use (e.g., "claude-opus-4-6") |
| `source` | `"startup" \| "resume" \| "clear" \| "compact"` | How the session started                       |

```ts
{
  hook_event_name: "SessionStart"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  model: string
  source: "startup" | "resume" | "clear" | "compact"
}
```

## Output

The JSON object to write to stdout (can be handled via
`HookHandler.for("SessionStart").exit("success", { ... })`):

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

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, NOT agent frontmatter.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks.
- **`source: "compact"`**: Fires when the session restarts after
  automatic compaction — not the same as PreCompact/PostCompact.
