# claude-hooks-cli

A CLI tool for managing
[Claude Code hooks](https://code.claude.com/docs/en/hooks) — the
lifecycle events that let you run custom scripts before/after tool
calls, on session start/end, when files change, and more.

Instead of hand-editing `settings.json`, use this tool to
interactively create, list, remove, and test hook configurations with
full validation and smart defaults.

## Install

```bash
bun add -g @obibring/claude-hooks-cli
```

Or run directly:

```bash
npx @obibring/claude-hooks-cli
```

Or from the repo:

```bash
bun run start
```

## Quick Start

### Interactive Mode

Just run the CLI with no arguments to get an interactive menu:

```bash
claude-hooks
```

```
┌  Claude Code Hooks Manager
│
◆  What would you like to do?
│  ● Add a hook         - Create a new hook configuration
│  ○ List hooks         - Show all configured hooks
│  ○ Remove a hook      - Delete a hook configuration
│  ○ Test a hook        - Run a hook with synthetic input
└
```

### Non-Interactive Mode (for scripts and agents)

Every option can be passed as a CLI flag for fully automated use:

```bash
claude-hooks add \
  --event PreToolUse \
  --type command \
  --command "./my-hook.sh" \
  --matcher "Bash" \
  --async \
  --scope project \
  --non-interactive
```

## Commands

### `claude-hooks add`

Create a new hook configuration. Walks you through each required field
one at a time, then presents an optional fields menu.

```bash
claude-hooks add [options]
```

**Options:**

| Flag                      | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| `-e, --event <event>`     | Hook event name (e.g. `PreToolUse`, `Stop`, `SessionStart`)            |
| `-t, --type <type>`       | Handler type: `command`, `prompt`, `agent`, `http`                     |
| `-c, --command <value>`   | Command string, prompt text, or URL (depending on handler type)        |
| `-m, --matcher <pattern>` | Matcher pattern (regex for tool names, enum for others)                |
| `--timeout <ms>`          | Timeout in milliseconds                                                |
| `--async`                 | Run hook asynchronously (non-blocking)                                 |
| `--once`                  | Only fire once per session (SessionStart, SessionEnd, PreCompact only) |
| `--status-message <msg>`  | Custom spinner message shown while hook runs                           |
| `--if <condition>`        | Conditional execution using permission rule syntax                     |
| `-s, --scope <scope>`     | Settings file: `user`, `project`, or `local` (default: `project`)      |
| `--non-interactive`       | Skip all prompts — use only provided flag values                       |

#### Example: Add a command hook

```bash
claude-hooks add \
  --event PostToolUse \
  --type command \
  --command "python3 ./hooks/log-tool-use.py" \
  --matcher "Bash|Edit|Write" \
  --async \
  --status-message "Logging tool use..." \
  --scope project \
  --non-interactive
```

**Result in `.claude/settings.json`:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ./hooks/log-tool-use.py",
            "async": true,
            "statusMessage": "Logging tool use..."
          }
        ]
      }
    ]
  }
}
```

#### Example: Add an HTTP hook

```bash
claude-hooks add \
  --event Stop \
  --type http \
  --command "https://my-webhook.example.com/claude-stop" \
  --timeout 30000 \
  --scope user \
  --non-interactive
```

**Result in `~/.claude/settings.json`:**

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://my-webhook.example.com/claude-stop",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

#### Example: Add a prompt hook for code review

```bash
claude-hooks add \
  --event PreToolUse \
  --type prompt \
  --command "Check if this tool call is safe. \$ARGUMENTS" \
  --matcher "Bash" \
  --scope project \
  --non-interactive
```

#### Example: Smart file path resolution

When you pass a bare file path as the command, the CLI automatically
wraps it in the correct runner:

```bash
# TypeScript file → npx tsx "/path/to/hook.ts"
claude-hooks add -e Stop -t command -c "./hooks/on-stop.ts" --non-interactive

# JavaScript file → node "/path/to/hook.mjs"
claude-hooks add -e Stop -t command -c "./hooks/on-stop.mjs" --non-interactive

# Python file → python3 "/path/to/hook.py"
claude-hooks add -e Stop -t command -c "./hooks/on-stop.py" --non-interactive

# Shell script → bash "/path/to/hook.sh"
claude-hooks add -e Stop -t command -c "./hooks/on-stop.sh" --non-interactive

# Compound commands are left as-is
claude-hooks add -e Stop -t command -c "echo done | tee /tmp/log" --non-interactive
```

#### Interactive Add Walkthrough

When run without `--non-interactive`, the add flow guides you step by
step:

```
┌  Add a Claude Code hook
│
◆  Select a hook event:
│  ● PreToolUse          - Runs before tool calls (can block them)
│  ○ PermissionRequest   - Runs when Claude Code requests permission from the user
│  ○ PostToolUse         - Runs after tool calls complete successfully
│  ○ ...26 total events
│
◆  Select handler type:
│  ● Command  - Runs a shell command. Receives JSON on stdin, returns JSON on stdout.
│  ○ Prompt   - Sends a prompt to a Claude model for single-turn evaluation.
│  ○ Agent    - Spawns a subagent with multi-turn tool access.
│  ○ HTTP     - POSTs JSON to a URL and receives a JSON response.
│
◆  Enter the command to run (or path to a .ts/.js/.py/.sh file):
│  ./hooks/validate-bash.ts
│
◆  Configure optional fields (or Done to finish):
│  ● Done — save this hook
│  ○ Matcher             - Filter which tool_name events trigger this hook
│  ○ Timeout             - Max execution time in ms (default: 5000)
│  ○ Async               - Run in background without blocking Claude Code
│  ○ Status Message      - Custom spinner message shown while hook runs
│  ○ If Condition        - Only spawn hook when this permission rule matches
│
│  (selecting "Matcher" shows matcher-specific guidance)
│
│  ℹ  Matcher for PreToolUse:
│     Matches on: tool_name
│     Regex pattern matching tool names. Built-in tools: Bash, Read, Edit,
│     Write, Glob, Grep, Agent, WebFetch, WebSearch, AskUserQuestion,
│     ExitPlanMode. MCP tools: mcp__<server>__<tool>
│
◆  Enter matcher pattern (matches tool_name):
│  Bash
│
◆  Added PreToolUse hook to project settings
└  Done
```

For hooks with enum matchers (Notification, SessionStart, etc.), you
get a select menu instead of free text:

```
◆  Select notification_type to match:
│  ● permission_prompt
│  ○ idle_prompt
│  ○ auth_success
│  ○ elicitation_dialog
```

For command-only hooks (Notification, SessionStart, SubagentStart,
etc.), the handler type step is skipped automatically:

```
ℹ  Handler type: command (only supported type for Notification)
```

### `claude-hooks list`

Show all configured hooks in a settings file.

```bash
claude-hooks list [options]
claude-hooks ls [options]    # alias
```

**Options:**

| Flag                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `-s, --scope <scope>` | Settings file: `user`, `project`, or `local` (default: `project`) |

#### Example

```bash
claude-hooks list --scope user
```

```
●  Hooks in user settings (/Users/you/.claude/settings.json):

   PreToolUse#0 [matcher: Grep|Glob|Bash]
     [command] → node "/Users/you/.claude/hooks/gitnexus-hook.cjs" (async)

   PostToolUse#0 [matcher: Bash]
     [command] → node "/Users/you/.claude/hooks/gitnexus-hook.cjs"

   Stop#0
     [http] → https://my-webhook.example.com/stop
```

### `claude-hooks remove`

Remove a hook from settings. Interactive by default — shows a
selection list.

```bash
claude-hooks remove [options]
claude-hooks rm [options]    # alias
```

**Options:**

| Flag                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `-e, --event <event>` | Filter by event name                                              |
| `-i, --index <index>` | Hook index to remove (for non-interactive)                        |
| `-s, --scope <scope>` | Settings file: `user`, `project`, or `local` (default: `project`) |
| `--non-interactive`   | Skip prompts — requires `--event` and `--index`                   |

#### Example: Interactive removal

```bash
claude-hooks remove --scope project
```

```
┌  Remove a Claude Code hook
│
◆  Select a hook to remove:
│  ● PreToolUse#0 [Bash]       - handlers: command
│  ○ PostToolUse#0 [Bash]      - handlers: command
│
◆  Remove PreToolUse#0? (Y/n)
│
◆  Removed PreToolUse#0 from project settings
└  Done
```

#### Example: Non-interactive removal

```bash
claude-hooks remove \
  --event PreToolUse \
  --index 0 \
  --scope project \
  --non-interactive
```

### `claude-hooks test`

Test a hook by running its command handlers with synthetic input.
Builds a realistic JSON object matching the hook's expected stdin
format and pipes it to the command.

```bash
claude-hooks test [options]
```

**Options:**

| Flag                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `-s, --scope <scope>` | Settings file: `user`, `project`, or `local` (default: `project`) |

#### Example

```bash
claude-hooks test --scope user
```

```
┌  Test a Claude Code hook
│
◆  Select a hook to test:
│  ● PreToolUse#0 [Bash]
│
ℹ  Testing PreToolUse#0 with synthetic input...
│  {
│    "hook_event_name": "PreToolUse",
│    "session_id": "test-session-1711648000000",
│    "transcript_path": "/tmp/test-transcript.json",
│    "cwd": "/Users/you/my-project",
│    "permission_mode": "default",
│    "tool_name": "Bash",
│    "tool_input": { "command": "echo test" },
│    "tool_use_id": "test-tu-1"
│  }
│
▲  Running handler 0: node "/Users/you/.claude/hooks/my-hook.cjs"
◇  Done
│
◆  Exit code: 0
│  stdout:
│  {"additionalContext": "all clear"}
│
└  Done
```

Non-command handlers (`prompt`, `agent`, `http`) are skipped during
testing since they require the Claude Code runtime.

## Settings Scopes

Hooks can be stored in three locations:

| Scope     | File                          | Description                     |
| --------- | ----------------------------- | ------------------------------- |
| `project` | `.claude/settings.json`       | Shared with team via git        |
| `local`   | `.claude/settings.local.json` | Personal overrides, git-ignored |
| `user`    | `~/.claude/settings.json`     | Global, applies to all projects |

Use `--scope` (or `-s`) to target any of these. Default is `project`.

## Hook Events Reference

All 26 supported hook events:

| Event                | Handler Types | Matcher                             | Description                          |
| -------------------- | ------------- | ----------------------------------- | ------------------------------------ |
| `PreToolUse`         | all           | `tool_name` (regex)                 | Before tool calls — can block/modify |
| `PermissionRequest`  | all           | `tool_name` (regex)                 | When permission is requested         |
| `PostToolUse`        | all           | `tool_name` (regex)                 | After successful tool calls          |
| `PostToolUseFailure` | all           | `tool_name` (regex)                 | After failed tool calls              |
| `UserPromptSubmit`   | all           | none                                | When user submits a prompt           |
| `Notification`       | command       | `notification_type` (enum)          | When notifications are sent          |
| `Stop`               | all           | none                                | When Claude finishes responding      |
| `SubagentStart`      | command       | `agent_type`                        | When subagents start                 |
| `SubagentStop`       | all           | `agent_type`                        | When subagents complete              |
| `PreCompact`         | command       | `trigger` (enum)                    | Before context compression           |
| `PostCompact`        | command       | `trigger` (enum)                    | After context compression            |
| `SessionStart`       | command       | `source` (enum)                     | When session starts/resumes          |
| `SessionEnd`         | command       | `reason` (enum)                     | When session ends                    |
| `Setup`              | command       | none                                | On `/setup` command                  |
| `TeammateIdle`       | command       | none                                | When teammate agent idles\*          |
| `TaskCreated`        | all           | none                                | When task is created\*               |
| `TaskCompleted`      | all           | none                                | When task completes\*                |
| `ConfigChange`       | command       | `source` (enum)                     | When config files change             |
| `WorktreeCreate`     | command       | none                                | When worktrees are created           |
| `WorktreeRemove`     | command       | none                                | When worktrees are removed           |
| `InstructionsLoaded` | command       | `load_reason` (enum)                | When CLAUDE.md files load            |
| `Elicitation`        | command       | `mcp_server_name`                   | MCP server requests input            |
| `ElicitationResult`  | command       | `mcp_server_name`                   | After user responds to MCP           |
| `StopFailure`        | command       | `error` (enum)                      | Turn ends due to API error           |
| `CwdChanged`         | command       | none                                | Working directory changes            |
| `FileChanged`        | command       | `filename` (pipe-sep, **required**) | Watched files change                 |

\* Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

**Handler types:**

- `all` = `command`, `prompt`, `agent`, `http`
- `command` = command only

## Handler Types

| Type      | Required Field | Description                                          |
| --------- | -------------- | ---------------------------------------------------- |
| `command` | `command`      | Runs a shell command. Receives JSON on stdin.        |
| `prompt`  | `prompt`       | Single-turn Claude model evaluation. Returns yes/no. |
| `agent`   | `prompt`       | Multi-turn subagent with Read/Grep/Glob access.      |
| `http`    | `url`          | POSTs JSON to a URL. Supports header interpolation.  |

## Advanced Examples

### CI/CD: Block dangerous git operations

```bash
claude-hooks add \
  --event PreToolUse \
  --type command \
  --command 'bash -c '\''read -r input; echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); cmd=d.get(\"tool_input\",{}).get(\"command\",\"\"); exit(2 if any(x in cmd for x in [\"push --force\",\"reset --hard\",\"clean -fd\"]) else 0)"'\''' \
  --matcher "Bash" \
  --if "Bash(git *)" \
  --scope project \
  --non-interactive
```

### Sound notification on session start

```bash
claude-hooks add \
  --event SessionStart \
  --type command \
  --command "afplay /System/Library/Sounds/Glass.aiff" \
  --matcher "startup" \
  --async \
  --once \
  --scope user \
  --non-interactive
```

### Webhook on task completion (agent teams)

```bash
claude-hooks add \
  --event TaskCompleted \
  --type http \
  --command "https://hooks.slack.com/services/T.../B.../xxx" \
  --timeout 10000 \
  --async \
  --scope project \
  --non-interactive
```

### Watch .env files for changes

```bash
claude-hooks add \
  --event FileChanged \
  --type command \
  --command "bash -c 'echo \"env file changed\" >> /tmp/claude-env-changes.log'" \
  --matcher ".env|.env.local|.envrc" \
  --async \
  --scope project \
  --non-interactive
```

### Prompt-based code review gate

```bash
claude-hooks add \
  --event PreToolUse \
  --type prompt \
  --command "Review this Edit for security issues. Block if it introduces SQL injection, XSS, or command injection. \$ARGUMENTS" \
  --matcher "Edit" \
  --timeout 30 \
  --scope project \
  --non-interactive
```

## Zod Schemas

This package also exports Zod v4 schemas for all 26 hook events. Each
hook has its own file in `hooks/` exporting:

- `<EventName>ConfigSchema` — validates the settings.json config
  object
- `<EventName>InputSchema` — validates the stdin JSON input
- `<EventName>OutputSchema` — validates the stdout JSON output
- `<EventName>MatcherSchema` — validates the matcher field (or
  `undefined` if no matcher)

```js
import { PreToolUseInputSchema } from "@obibring/claude-hooks-cli/hooks/PreToolUse.mjs"

const input = PreToolUseInputSchema.parse(JSON.parse(stdinData))
// input.hook_event_name is narrowed to "PreToolUse"
// input.tool_name, input.tool_input, input.tool_use_id are typed
```

Shared base schemas are in `schemas/`:

```js
import { BaseHookInputSchema } from "@obibring/claude-hooks-cli/schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "@obibring/claude-hooks-cli/schemas/output-schemas.mjs"
import { HookEventNameSchema } from "@obibring/claude-hooks-cli/schemas/enums.mjs"
```

## License

UNLICENSED
