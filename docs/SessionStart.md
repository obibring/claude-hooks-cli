# SessionStart

Runs when Claude Code starts a new session or resumes an existing one.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: "startup" | "resume" | "clear" | "compact"  // matched against source
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
        once?: boolean
      }
  >
}
```

## Input

The JSON object received on stdin:

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

- **`once` is for skills only**: Works in settings-based hooks and
  skill frontmatter, NOT agent frontmatter.
- **Command-only**: Cannot use `prompt`, `agent`, or `http` handlers.
- **`$CLAUDE_ENV_FILE`**: Only available in SessionStart, CwdChanged,
  and FileChanged hooks.
- **`source: "compact"`**: Fires when the session restarts after
  automatic compaction — not the same as PreCompact/PostCompact.
