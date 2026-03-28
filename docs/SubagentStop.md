# SubagentStop

Runs when a subagent task completes.

## Handler Types

Supports all 4: `command`, `prompt`, `agent`, `http`.

## Matcher

Matches `agent_type`. Values include built-in types (`Bash`,
`Explore`, `Plan`) and custom agent names.

## Input (stdin JSON)

Common fields plus:

- `agent_id` — unique subagent identifier (required)
- `agent_type` — agent type name (required)
- `last_assistant_message` — the subagent's final response text
- `agent_transcript_path` — path to the subagent's transcript file
- `stop_hook_active` — boolean indicating if a stop hook is already
  running

## Output (stdout JSON)

Universal fields plus:

- `decision`: `"block"` — can block execution

## Gotchas

- **Receives agent `Stop` hooks**: When `Stop:` is defined in agent
  frontmatter, the hook actually fires as `SubagentStop` with
  `hook_event_name: "SubagentStop"`. This is by design.
- **`agent_transcript_path`**: Unique to SubagentStop — not present in
  SubagentStart. Useful for post-processing agent output.
- **Agent frontmatter**: One of the 6 hooks that fire in agent
  sessions.
