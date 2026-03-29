# SubagentStop

Runs when a subagent task completes.

## Config

The settings.json configuration object for this hook:

```ts
{
  matcher?: string  // matched against agent_type
  hooks: Array<
    | {  // command handler
        type: "command"
        command: string
        timeout?: number
        async?: boolean
        asyncRewake?: boolean
        statusMessage?: string
      }
    | {  // prompt handler
        type: "prompt"
        prompt: string
        model?: "opus" | "sonnet" | "haiku" | "opus[4m]" | "sonnet[4m]"
        timeout?: number
      }
    | {  // agent handler
        type: "agent"
        prompt: string
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
  hook_event_name: "SubagentStop"
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: "default" | "plan" | "acceptEdits" | "dontAsk" | "bypassPermissions"
  agent_id?: string
  agent_type?: string
  last_assistant_message: string
  agent_transcript_path: string
  stop_hook_active: boolean
}
```

## Output

The JSON object to write to stdout (can be handled via
`new HookHandler("SubagentStop").emitOutput({ ... })`):

```ts
{
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  additionalContext?: string
  decision?: "block"
}
```

## Gotchas

- **Receives agent `Stop` hooks**: When `Stop:` is defined in agent
  frontmatter, the hook actually fires as `SubagentStop` with
  `hook_event_name: "SubagentStop"`. This is by design.
- **`agent_transcript_path`**: Unique to SubagentStop — not present in
  SubagentStart. Useful for post-processing agent output.
- **Agent frontmatter**: One of the 6 hooks that fire in agent
  sessions.
