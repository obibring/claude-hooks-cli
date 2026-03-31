# claude-hooks-cli (`cch`)

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

The CLI is available as both `claude-hooks` and `cch` (short alias).
All examples below use `cch`.

## Quick Start

### Interactive Mode

Just run the CLI with no arguments to get an interactive menu:

```bash
cch
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
cch add \
  --event PreToolUse \
  --type command \
  --command "./my-hook.sh" \
  --matcher "Bash" \
  --async \
  --scope project \
  --non-interactive
```

## Commands

### `cch add`

Create a new hook configuration. Walks you through each required field
one at a time, then presents an optional fields menu.

```bash
cch add [options]
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
| `--create`                | Create the command file with a starter template if it doesn't exist    |
| `--auto-prompt-suffix`    | Auto-append JSON response format instructions to prompt hooks          |
| `--no-auto-prompt-suffix` | Do not append JSON response format instructions to prompt hooks        |
| `-s, --scope <scope>`     | Settings file: `user`, `project`, or `local` (default: `project`)      |
| `--non-interactive`       | Skip all prompts — use only provided flag values                       |

#### Example: Add a command hook

```bash
cch add \
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
cch add \
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
cch add \
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
cch add -e Stop -t command -c "./hooks/on-stop.ts" --non-interactive

# JavaScript file → node "/path/to/hook.mjs"
cch add -e Stop -t command -c "./hooks/on-stop.mjs" --non-interactive

# Python file → python3 "/path/to/hook.py"
cch add -e Stop -t command -c "./hooks/on-stop.py" --non-interactive

# Shell script → bash "/path/to/hook.sh"
cch add -e Stop -t command -c "./hooks/on-stop.sh" --non-interactive

# Compound commands are left as-is
cch add -e Stop -t command -c "echo done | tee /tmp/log" --non-interactive
```

#### Example: Create a new hook file with `--create`

Use `--create` to scaffold a new hook script file with a starter
template. The CLI resolves the path, creates parent directories if
needed, writes a language-appropriate template, and wires up the
command with the correct runner.

```bash
cch add \
  --event PreToolUse \
  --type command \
  --command "./hooks/validate-bash.ts" \
  --matcher "Bash" \
  --create \
  --scope project \
  --non-interactive
```

```
┌  Add a Claude Code hook
│
●  Will create: hooks/validate-bash.ts
│
◆  Created hooks/validate-bash.ts
│
◆  Added PreToolUse hook to project settings
└  Done
```

The created `hooks/validate-bash.ts` contains:

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("PreToolUse")

/**
 * Parse the hook input from stdin (synchronous, strongly typed):
 *   const input = handler.parseInput()
 *
 * Exit with output (code 0):
 *   handler.exit("success", { additionalContext: "extra info for Claude" })
 *
 * Exit with a blocking error (code 2, message fed to model):
 *   handler.exit("error", "Something went wrong")
 *
 * Read Claude Code environment variables:
 *   const projectDir = handler.getEnv("CLAUDE_PROJECT_DIR")
 *
 * Get typed tool input (only for tool-event hooks):
 *   const bash = handler.getToolInput("Bash", input)
 *   if (bash) {
 *     console.log(bash.command) // strongly typed
 *   }
 *
 * Pass through (exit 0, no output):
 *   handler.exit("success")
 */

const input = handler.parseInput()

// TODO: Add your hook logic here, then call one of:
//   handler.exit("success", { ... })  — send output to Claude and exit (code 0)
//   handler.exit("error", "...")      — block with error message (code 2)
//   handler.exit("success")           — pass through, no output (code 0)
```

And the settings entry uses `npx -y tsx` to run it:

```json
{
  "type": "command",
  "command": "npx -y tsx \"$CLAUDE_PROJECT_DIR/hooks/validate-bash.ts\""
}
```

Templates are provided for `.ts`, `.js`, `.mjs`, `.cjs`, `.py`, `.sh`,
`.bash`, and `.zsh`. If the file already exists, `--create` skips
creation and proceeds normally. If the path has no file extension, the
CLI errors:

```
■  File path must have an extension (e.g. .ts, .js, .py, .sh)
```

In interactive mode (without `--non-interactive`), you'll be asked to
confirm before the file is created.

#### Interactive Add Walkthrough

When run without `--non-interactive`, the add flow guides you step by
step. The event selector supports type-to-filter:

```
┌  Add a Claude Code hook
│
◆  Select a hook event (type to filter):
│  ● PreToolUse          (Runs before tool calls — can block/modify)
│  ○ PostToolUse         (Runs after tool calls complete successfully)
│  ○ ...26 total events, sorted alphabetically
│
◆  Select handler type:
│  ● Command  - Runs a shell command
│  ○ Prompt   - Single-turn Claude model evaluation
│  ○ Agent    - Multi-turn subagent with tool access
│  ○ HTTP     - POSTs JSON to a URL
│
◆  What kind of command do you want to run?
│  ● TypeScript file      (Runs with npx -y tsx)
│  ○ JavaScript file      (Runs with node)
│  ○ Custom command        (Enter a shell command directly)
│
◆  Enter the path to your TypeScript file:
│  ./hooks/validate-bash.ts
│
◆  Created PreToolUse hook file at ./hooks/validate-bash.ts
│
◆  Configure optional fields (or Done to finish):
│  ● Done — save this hook
│  ○ Matcher             - Filter which tool_name events trigger this hook
│  ○ Timeout             - Max execution time in ms (default: 5000)
│  ○ Async               - Run in background without blocking Claude Code
│  ○ Status Message      - Custom spinner message shown while hook runs
│  ○ If Condition        - Only spawn hook when this permission rule matches
│
◆  Added PreToolUse hook to project settings
└  Done
```

When choosing a TS or JS file, the CLI:

- Creates the file with a `HookHandler` template if it doesn't exist
- Warns and asks to overwrite/change path/keep if the file already
  exists
- Prefixes relative paths with `$CLAUDE_PROJECT_DIR` for correct
  resolution
- Uses `npx -y tsx` for TypeScript, `node` for JavaScript
- Generates the correct import style based on file extension:
  `.ts`/`.mjs` use ESM `import`, `.cjs` uses `require()`, `.js` checks
  the nearest `package.json` `"type"` field

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

### `cch list`

Show all configured hooks in a settings file.

```bash
cch list [options]
cch ls [options]    # alias
```

**Options:**

| Flag                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `-s, --scope <scope>` | Settings file: `user`, `project`, or `local` (default: `project`) |

#### Example

```bash
cch list --scope user
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

### `cch remove`

Remove a hook from settings. Interactive by default — shows a
selection list.

```bash
cch remove [options]
cch rm [options]    # alias
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
cch remove --scope project
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
cch remove \
  --event PreToolUse \
  --index 0 \
  --scope project \
  --non-interactive
```

### `cch test`

Test a hook by running its command handlers with synthetic input.
Builds a realistic JSON object matching the hook's expected stdin
format and pipes it to the command.

```bash
cch test [options]
```

**Options:**

| Flag                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `-s, --scope <scope>` | Settings file: `user`, `project`, or `local` (default: `project`) |

#### Example

```bash
cch test --scope user
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

### `cch docs`

View documentation for any hook event, rendered with colors and
formatting in the terminal. Interactive mode lets you search by
typing.

```bash
cch docs [options]
```

**Options:**

| Flag            | Description                                        |
| --------------- | -------------------------------------------------- |
| `--hook <hook>` | Hook event name (required in non-interactive mode) |

#### Example: Interactive

```bash
cch docs
```

```
┌  Hook Documentation
│
◆  Select a hook event (type to filter):
│  ● PreToolUse  (Runs before tool calls — can block/modify)
│  ○ ...
└
```

#### Example: Non-interactive

```bash
cch docs --hook PreToolUse
```

Prints the full documentation for PreToolUse with colored headings,
formatted tables, and syntax-highlighted code blocks.

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
cch add \
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
cch add \
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
cch add \
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
cch add \
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
cch add \
  --event PreToolUse \
  --type prompt \
  --command "Review this Edit for security issues. Block if it introduces SQL injection, XSS, or command injection. \$ARGUMENTS" \
  --matcher "Edit" \
  --timeout 30 \
  --scope project \
  --non-interactive
```

## Writing Custom Hooks in TypeScript

This package exports a `HookHandler` class that gives you
strongly-typed input parsing and a unified `exit()` method for hook
scripts. The class is parameterized by the hook event name, so
TypeScript knows exactly which input fields are available and which
output fields are valid.

### Step 1: Create and register the hook file

Use `--create` to scaffold a new TypeScript hook and register it in
one command:

```bash
cch add \
  --event PreToolUse \
  --type command \
  --command "./hooks/block-dangerous-commands.ts" \
  --matcher "Bash" \
  --create \
  --scope project \
  --non-interactive
```

This creates `hooks/block-dangerous-commands.ts` with a starter
template and adds the hook to `.claude/settings.json` with `npx tsx`
as the runner.

### Step 2: Write your hook using `HookHandler`

Replace the generated template with typed handler code:

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("PreToolUse")
const input = handler.parseInput()

// input is strongly typed — IDE autocomplete works for all fields:
//   input.tool_name      ✓ string
//   input.tool_input     ✓ Record<string, unknown>
//   input.tool_use_id    ✓ string
//   input.session_id     ✓ string
//   input.nonExistent    ✗ TS error

const command = input.tool_input.command as string | undefined

if (command?.includes("rm -rf /")) {
  // exit("success", output) is also strongly typed — only valid fields accepted:
  handler.exit("success", {
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: "Blocked dangerous rm -rf / command",
    },
  })
  // Code after exit is unreachable (it calls process.exit)
}

// Pass through — let the tool call proceed
handler.exit("success")
```

### API Reference

#### `HookHandler.for(eventName, options?)`

Creates a handler bound to a specific hook event. Returns a handler
interface specific to the event — with only the methods and env vars
that apply to that hook type. For example, tool-event hooks have
`getToolInput()`, env-file hooks accept `"CLAUDE_ENV_FILE"` in
`getEnv()` and have `getEnvFileVars()`.

SessionStart, CwdChanged, and FileChanged hooks accept an optional
second argument with custom `readFile` and `writeFile` functions.
Other hook events reject the second argument at the type level.

```ts
const handler = HookHandler.for("PreToolUse")
// handler has getToolInput(), no CLAUDE_ENV_FILE, no getEnvFileVars()

const handler2 = HookHandler.for("SessionStart")
// handler2 has getEnv("CLAUDE_ENV_FILE"), getEnvFileVars(), no getToolInput()

const handler3 = HookHandler.for("CwdChanged", {
  readFile: (path) => myCustomRead(path),
})
// handler3.getEnvFileVars() uses custom readFile
```

#### `handler.parseInput(): Input`

Reads stdin synchronously, parses JSON, and validates it against the
hook's zod input schema. Returns the strongly-typed input object.
Results are cached — can be called multiple times without performance
penalty (stdin is only read once). Exits with code 2 if stdin is
empty, not valid JSON, or fails validation.

```ts
const input = handler.parseInput()
// For "Stop": input.last_assistant_message, input.stop_hook_active
// For "PreToolUse": input.tool_name, input.tool_input, input.tool_use_id
```

#### `handler.exit(status, data?): never`

Exits the hook script. Code after this call is unreachable.

- `exit("success")` — pass through, no output (exit code 0)
- `exit("success", output)` — write typed JSON output to stdout (exit
  code 0)
- `exit("error", message)` — write error to stderr, fed back to Claude
  model (exit code 2)

```ts
// Pass through — no output:
handler.exit("success")

// PreToolUse — set permission decision:
handler.exit("success", {
  hookSpecificOutput: { permissionDecision: "allow" },
})

// Stop — block to re-engage Claude:
handler.exit("success", { decision: "block" })

// Any hook — universal output fields:
handler.exit("success", {
  additionalContext: "Extra info for Claude",
  systemMessage: "Warning shown to user",
})

// Block with error (exit code 2):
handler.exit("error", "Operation not allowed in this directory")
```

#### `handler.getEnv(name): string | undefined`

Reads a Claude Code environment variable. The `name` parameter is
strongly typed to the 7 valid env var names. Returns
`string | undefined` for most variables, but `CLAUDE_ENV_FILE` returns
`undefined` (with a descriptive error type) when called on hooks that
don't receive it.

```ts
const projectDir = handler.getEnv("CLAUDE_PROJECT_DIR") // string | undefined — all hooks
const envFile = handler.getEnv("CLAUDE_ENV_FILE") // string | undefined — only SessionStart, CwdChanged, FileChanged
```

Available variables:

| Variable                                  | Availability                           |
| ----------------------------------------- | -------------------------------------- |
| `CLAUDE_PROJECT_DIR`                      | All hooks                              |
| `CLAUDE_ENV_FILE`                         | SessionStart, CwdChanged, FileChanged  |
| `CLAUDE_PLUGIN_ROOT`                      | Plugin hooks only                      |
| `CLAUDE_CODE_REMOTE`                      | All hooks (set in remote environments) |
| `CLAUDE_SKILL_DIR`                        | Skill hooks only (since v2.1.69)       |
| `CLAUDE_PLUGIN_DATA`                      | Plugin hooks only (since v2.1.78)      |
| `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` | All hooks                              |

#### `handler.getEnvFileVars(options?): Record<string, string>`

Reads and parses the `CLAUDE_ENV_FILE` into a key-value object. Only
available on SessionStart, CwdChanged, and FileChanged handlers.

Parses the file by splitting lines, stripping `#` comments, extracting
`KEY=value` pairs, and unwrapping matched quotes. Later lines override
earlier ones. Results are cached — call multiple times without
penalty. Pass `{ force: true }` to re-read from disk.

```ts
const handler = HookHandler.for("SessionStart")
handler.parseInput()

const vars = handler.getEnvFileVars()
console.log(vars.MY_VAR) // string or undefined

// Force re-read:
const fresh = handler.getEnvFileVars({ force: true })
```

You can inject a custom `readFile` function via the options parameter
of `HookHandler.for()`:

```ts
const handler = HookHandler.for("SessionStart", {
  readFile: (path) => myCustomRead(path),
})
const vars = handler.getEnvFileVars() // uses your readFile
```

#### `handler.writeEnvFile(vars): void`

Writes all environment variables to the `CLAUDE_ENV_FILE`, replacing
its contents. Only available on SessionStart, CwdChanged, and
FileChanged handlers. Uses custom `writeFile` from constructor options
if provided, otherwise uses `node:fs`. Invalidates the cached env file
vars.

```ts
const handler = HookHandler.for("SessionStart")
handler.writeEnvFile({ MY_VAR: "hello", OTHER: "world" })
// CLAUDE_ENV_FILE now contains:
// MY_VAR=hello
// OTHER=world
```

#### `handler.appendToEnvFile(variableName, value): void`

Appends a single environment variable to the `CLAUDE_ENV_FILE`. Only
available on SessionStart, CwdChanged, and FileChanged handlers. Uses
custom `writeFile` from constructor options if provided, otherwise
uses `node:fs`. Invalidates the cached env file vars.

```ts
const handler = HookHandler.for("SessionStart")
handler.appendToEnvFile("MY_VAR", "hello")
handler.appendToEnvFile("OTHER", "world")
```

#### `handler.getToolInput(toolName, input): ToolInput | null`

Returns the strongly-typed `tool_input` for the given tool name if
`input.tool_name` matches, or `null` if it doesn't. Only available on
tool-event hooks (PreToolUse, PostToolUse, PostToolUseFailure,
PermissionRequest).

```ts
const handler = HookHandler.for("PreToolUse")
const input = handler.parseInput()

const bash = handler.getToolInput("Bash", input)
if (bash) {
  // bash.command: string
  // bash.description?: string
  // bash.timeout?: number
  // bash.run_in_background?: boolean
}

const edit = handler.getToolInput("Edit", input)
if (edit) {
  // edit.file_path: string
  // edit.old_string: string
  // edit.new_string: string
  // edit.replace_all?: boolean
}
```

Supported tools: `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`,
`WebFetch`, `WebSearch`, `Agent`, `AskUserQuestion`.

### Full Examples

#### Block `git push --force`

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("PreToolUse")
const input = handler.parseInput()

const bash = handler.getToolInput("Bash", input)
if (bash) {
  if (
    bash.command.includes("push --force") ||
    bash.command.includes("push -f")
  ) {
    handler.exit("success", {
      hookSpecificOutput: {
        permissionDecision: "deny",
        permissionDecisionReason: "Force push is not allowed",
      },
    })
  }
}

handler.exit("success")
```

Register it:

```bash
cch add \
  --event PreToolUse \
  --type command \
  --command "./hooks/no-force-push.ts" \
  --matcher "Bash" \
  --if "Bash(git *)" \
  --create \
  --scope project \
  --non-interactive
```

#### Log all completed tool calls

```ts
#!/usr/bin/env npx tsx
import { appendFileSync } from "node:fs"
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("PostToolUse")
const input = handler.parseInput()

appendFileSync(
  "/tmp/claude-tool-log.jsonl",
  JSON.stringify({
    timestamp: new Date().toISOString(),
    tool: input.tool_name,
    input: input.tool_input,
  }) + "\n",
)

handler.exit("success")
```

Register it:

```bash
cch add \
  --event PostToolUse \
  --type command \
  --command "./hooks/log-tools.ts" \
  --async \
  --status-message "Logging..." \
  --create \
  --scope project \
  --non-interactive
```

#### Inject context when session starts

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("SessionStart")
const input = handler.parseInput()

if (input.source === "startup") {
  handler.exit("success", {
    additionalContext: `Project uses bun as package manager. Node ${process.version}.`,
  })
}

handler.exit("success")
```

Register it:

```bash
cch add \
  --event SessionStart \
  --type command \
  --command "./hooks/inject-context.ts" \
  --matcher "startup" \
  --once \
  --create \
  --scope project \
  --non-interactive
```

#### Modify user prompts

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("UserPromptSubmit")
const input = handler.parseInput()

// Prefix all prompts with a reminder
handler.exit("success", {
  prompt: `[Remember: always use TypeScript, never JavaScript]\n\n${input.prompt}`,
})
```

Register it:

```bash
cch add \
  --event UserPromptSubmit \
  --type command \
  --command "./hooks/prompt-prefix.ts" \
  --create \
  --scope local \
  --non-interactive
```

#### Auto-respond to MCP elicitations

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("Elicitation")
const input = handler.parseInput()

if (input.mcp_server_name === "my-auth-server") {
  handler.exit("success", {
    hookSpecificOutput: {
      action: "accept",
      content: { token: process.env.MY_AUTH_TOKEN },
    },
  })
}

handler.exit("success")
```

Register it:

```bash
cch add \
  --event Elicitation \
  --type command \
  --command "./hooks/auto-auth.ts" \
  --matcher "my-auth-server" \
  --create \
  --scope user \
  --non-interactive
```

#### Prompt hook for code review

Prompt hooks send a prompt to a Claude model and get a yes/no
decision. The CLI auto-appends JSON response format instructions
unless you use `--no-auto-prompt-suffix`.

```bash
cch add \
  --event PreToolUse \
  --type prompt \
  --command "Review this tool call for security issues. Block if it could delete files, expose secrets, or run untrusted code. \$ARGUMENTS" \
  --matcher "Bash|Edit|Write" \
  --scope project \
  --non-interactive
```

The stored prompt will include the auto-appended response format:

```
Review this tool call for security issues. Block if it could delete
files, expose secrets, or run untrusted code. $ARGUMENTS

Respond with JSON: {"ok": true} to allow stopping, or {"ok": false,
"reason": "your explanation"} to continue working.
```

To write your own response instructions instead:

```bash
cch add \
  --event PreToolUse \
  --type prompt \
  --command "Is this safe? Reply {\"ok\": true} or {\"ok\": false, \"reason\": \"why\"}. \$ARGUMENTS" \
  --matcher "Bash" \
  --no-auto-prompt-suffix \
  --scope project \
  --non-interactive
```

#### Use `getEnv` to read project directory

```ts
#!/usr/bin/env npx tsx
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("PreToolUse")
const input = handler.parseInput()
const projectDir = handler.getEnv("CLAUDE_PROJECT_DIR")

const edit = handler.getToolInput("Edit", input)
if (edit && projectDir && !edit.file_path.startsWith(projectDir)) {
  handler.exit("success", {
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: `Cannot edit files outside project: ${projectDir}`,
    },
  })
}

handler.exit("success")
```

## Zod Schemas

All 26 hook events' Zod schemas are accessible via the `HookSchemas`
object, which maps hook names to
`{ Config, Input, Output, Matcher, HookSpecificOutput? }`:

```ts
import { HookSchemas } from "@obibring/claude-hooks-cli"

// Validate PreToolUse input
const input = HookSchemas.PreToolUse.Input.parse(
  JSON.parse(stdinData),
)
// input.hook_event_name is narrowed to "PreToolUse"
// input.tool_name, input.tool_input, input.tool_use_id are typed

// Access any hook's schemas
HookSchemas.Stop.Config // settings.json config schema
HookSchemas.Stop.Input // stdin JSON schema
HookSchemas.Stop.Output // stdout JSON schema
HookSchemas.Stop.Matcher // undefined (Stop has no matcher)
HookSchemas.PreToolUse.Matcher // Zod schema for tool_name regex

// Hooks with hook-specific output
HookSchemas.PreToolUse.HookSpecificOutput // permissionDecision, etc.
HookSchemas.Elicitation.HookSpecificOutput // action, content
```

Individual hook schemas are also available via direct imports:

```ts
import { PreToolUseInputSchema } from "@obibring/claude-hooks-cli/hooks/PreToolUse.mjs"
```

Shared base schemas are in `schemas/`:

```ts
import { BaseHookInputSchema } from "@obibring/claude-hooks-cli/schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "@obibring/claude-hooks-cli/schemas/output-schemas.mjs"
import { HookEventNameSchema } from "@obibring/claude-hooks-cli/schemas/enums.mjs"
```

## Hook Form Builder

This package exports a `hookFormBuilder` singleton that describes
every hook event's settings, input, and output fields for each handler
type. Each field includes a Zod schema for runtime validation. Useful
for building UIs, form generators, and validators.

```ts
import { hookFormBuilder } from "@obibring/claude-hooks-cli"
// Import hooks to trigger registrations (side effects)
import "@obibring/claude-hooks-cli/hooks"
```

### Querying

```ts
hookFormBuilder.getHookNames() // ["PreToolUse", "Stop", ..., "FileChanged"]

const def = hookFormBuilder.getHookDefinition("PreToolUse")
// def.command.settings / def.command.input / def.command.output
// def.prompt.settings / ...
```

### FieldDefinition

```ts
interface FieldDefinition {
  type: "string" | "number" | "boolean" | "object" | "array" | "enum"
  description: string
  required?: boolean
  schema?: z.ZodType // Zod schema for runtime validation
  fields?: Record<string, FieldDefinition> // nested (type: "object")
  items?: FieldDefinition // array items (type: "array")
  values?: string[] // allowed values (type: "enum")
  strict?: boolean // true = enum only; false = enum + free-form
}
```

### Example

```ts
const def = hookFormBuilder.getHookDefinition("PreToolUse")

Object.keys(def) // ["command", "prompt", "agent", "http"]
Object.keys(def.command.settings)
// ["matcher", "command", "timeout", "async", "asyncRewake", "statusMessage", "if"]

// Enum field with embedded Zod schema
def.command.input.permission_mode.schema.parse("default") // ok
def.command.input.permission_mode.schema.parse("invalid") // throws ZodError
```

### Extending

```ts
import { z } from "zod/v4"
import {
  hookFormBuilder,
  COMMAND_SETTINGS_FIELDS,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
} from "@obibring/claude-hooks-cli"

hookFormBuilder.addHookType("MyCustomHook", "command", {
  settings: { ...COMMAND_SETTINGS_FIELDS },
  input: {
    ...BASE_INPUT_FIELDS,
    myField: {
      type: "string",
      description: "Custom",
      schema: z.string(),
      required: true,
    },
  },
  output: { ...BASE_OUTPUT_FIELDS },
})
```

## Programmatic API

This package exports a `ClaudeProject` class for managing hooks and
discovering skills programmatically — no CLI or interactive prompts
needed.

### `ClaudeProject` class

```ts
import { ClaudeProject } from "@obibring/claude-hooks-cli"

const project = new ClaudeProject("/path/to/my-project")
```

The constructor validates that the path exists and is a directory,
throwing if not. All instance methods operate on the bound directory.

#### Hook management

```ts
// Install a hook (auto-creates .claude/ directory if needed)
await project.install({
  event: "PreToolUse",
  type: "command",
  command: "node ./hooks/check-bash.mjs",
  matcher: "Bash",
  timeout: 10000,
})

// List all hooks
const { filePath, hooks } = await project.getHooks()
for (const { eventName, index, entry } of hooks) {
  console.log(`${eventName}#${index}`, entry)
}

// Remove a hook by event name and index
const { removed } = await project.uninstall("PreToolUse", 0)

// Check if .claude/ directory exists
project.hasClaudeDirectory() // boolean
```

#### Building hook configs without saving

```ts
// Build a validated config entry (does not write to disk)
const { eventName, configEntry } = project.addHookConfig({
  event: "Stop",
  type: "prompt",
  prompt: "Should Claude stop?",
  model: "claude-haiku-4-5-20251001",
})

// Build a command string for a script file
const cmd = project.buildHookCommand("tsx", "./hooks/my-hook.ts")
// → 'npx -y tsx "$CLAUDE_PROJECT_DIR/./hooks/my-hook.ts"'
```

#### Testing hooks

```ts
// Test a command handler with synthetic input
const result = await project.test({
  event: "PreToolUse",
  handler: { type: "command", command: "node ./hooks/my-hook.mjs" },
})
console.log(result.exitCode, result.stdout, result.stderr)

// Build synthetic input for manual testing
const input = project.buildSyntheticInput("PreToolUse", {
  tool_name: "Write", // override defaults
})
```

#### Documentation

```ts
const docs = project.getDocs("PreToolUse") // markdown string or null
const events = project.getAvailableDocs() // all 26 event names
```

#### Scaffolding hook files

```ts
const { created, runnerCommand } = await project.scaffold({
  event: "PreToolUse",
  filePath: "./hooks/check-bash.ts",
  // overwrite: true,  // replace existing file
})
```

#### Skill discovery

```ts
// Discover all skills for this project
const skills = project.discoverSkills({
  recursive: true, // walk up parent directories
  includePlugins: true, // include installed Claude Code plugins
})

for (const [path, skill] of Object.entries(skills)) {
  console.log(skill.name, skill.pluginName ?? "(local)")
  console.log(skill.frontmatter.description)
  console.log(Object.keys(skill.references).length, "reference files")
}
```

#### Skill frontmatter validation

```ts
const result = project.validateSkillFrontmatter({
  name: "my-skill",
  description: "Does things",
  model: "opus",
  "custom-field": "value",
})
// result.success === true
// result.errors === {}
// result.warnings === { "custom-field": '"custom-field" is not recognized...' }

// Suppress warnings for known custom fields:
project.validateSkillFrontmatter(fm, {
  extraProperties: ["custom-field"],
})
```

#### Static properties

```ts
// Hook metadata (no instance needed)
ClaudeProject.metadata.eventNames // all 26 event names
ClaudeProject.metadata.events // full metadata for each event
ClaudeProject.metadata.getEvent("PreToolUse") // single event lookup
ClaudeProject.metadata.handlerTypes // command, prompt, agent, http

// Zod schema for skill frontmatter
ClaudeProject.SkillFrontmatterSchema.parse({
  name: "x",
  description: "y",
})
```

### Standalone function exports

All functions are also available as standalone exports for consumers
who don't need the class:

```ts
import {
  addHookConfig,
  buildHookCommand,
  installHook,
  uninstallHook,
  listHookEntries,
  getHooksForProjectDir,
  saveHookToProjectDir,
  removeHookFromProjectDir,
  testHook,
  buildSyntheticInput,
  getDocs,
  getAvailableDocs,
  scaffoldHookFile,
  discoverSkills,
  parseFrontmatter,
  validateSkillFrontmatter,
  SkillFrontmatterSchema,
  HOOK_METADATA,
  HOOK_EVENT_NAMES,
  getHookMeta,
  HANDLER_TYPE_INFO,
  HOOK_DOCS_MAP,
  HookSchemas,
  hookFormBuilder,
  resolveCommand,
  parseCommandAsFile,
  createCommandFile,
} from "@obibring/claude-hooks-cli"
```

### Sub-path exports

| Import Path                            | What It Provides                                            |
| -------------------------------------- | ----------------------------------------------------------- |
| `@obibring/claude-hooks-cli`           | Everything (ClaudeProject, schemas, functions, handler)     |
| `@obibring/claude-hooks-cli/api`       | ClaudeProject class + all API functions                     |
| `@obibring/claude-hooks-cli/handler`   | HookHandler class (for hook script authors)                 |
| `@obibring/claude-hooks-cli/schemas`   | Zod enum/base schemas                                       |
| `@obibring/claude-hooks-cli/schemas/*` | Individual schema files                                     |
| `@obibring/claude-hooks-cli/hooks`     | `HookSchemas` object (hook name → schemas)                  |
| `@obibring/claude-hooks-cli/hooks/*`   | Individual hook schema files                                |
| `@obibring/claude-hooks-cli/settings`  | `getSettingsPath`, `readSettings`, `writeSettings`          |
| `@obibring/claude-hooks-cli/store`     | `getHooksObject`, `addHook`, `removeHook`, `listHooks`      |
| `@obibring/claude-hooks-cli/manager`   | `getHooks`, `saveHook`, `deleteHook`                        |
| `@obibring/claude-hooks-cli/metadata`  | `HOOK_METADATA`, `getHookMeta`, `HOOK_EVENT_NAMES`          |
| `@obibring/claude-hooks-cli/commands`  | `resolveCommand`, `parseCommandAsFile`, `createCommandFile` |
| `@obibring/claude-hooks-cli/docs`      | `HOOK_DOCS_MAP`                                             |

## CJS Support

The handler module works with both ESM `import` and CJS `require()`.
TypeScript types resolve correctly in both module systems:

```ts
// ESM
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

// CJS
const { HookHandler } = require("@obibring/claude-hooks-cli/handler")
```

Both provide full autocomplete and type checking for
`HookHandler.for()`, `parseInput()`, `exit()`, `getEnv()`,
`getToolInput()`, etc.

## Contributing

### Setup

```bash
git clone https://github.com/obibring/claude-hooks-cli.git
cd claude-hooks-cli
bun install
```

### Development

```bash
bun run start         # Run the CLI
bun run build         # Generate docs map, .d.mts declarations
bun run dev           # Build then watch for changes (tsc --watch)
bun run test          # Run all vitest tests
bun run lint          # Format with prettier
```

### Project Structure

```
bin/cli.mjs              CLI entry point (Commander + @clack/prompts)
lib/
  handler.mjs            HookHandler class (runtime)
  handler.d.mts          ESM type declarations (re-exports from handler-types.d.mts)
  handler.d.cts          CJS type declarations (for require() consumers)
  handler-types.d.mts    Hand-authored type declarations (HookIOMap, output interfaces,
                         ToolInputMap, conditional types, class signature)
  handlers/index.d.mts   Per-hook handler interfaces (26 subtypes with correct methods)
  get-fs.cjs             Lazy node:fs loader for runtime compatibility
  schema-map.mjs         Runtime event→schema registry
  hook-metadata.mjs      Hook metadata for CLI interactive UI
  settings-io.mjs        Settings file I/O (read/write JSON)
  hooks-store.mjs        In-memory hook CRUD operations
  hooks-manager.mjs      High-level hook management (I/O + store)
  add-hook.mjs           Interactive add flow
  remove-hook.mjs        Interactive remove flow
  list-hooks.mjs         List display
  test-hook.mjs          Synthetic input testing
  command-resolver.mjs   Smart file path → runner resolution
  docs-map.mjs           Auto-generated hook name → docs string mapping
  hook-form-builder.mjs   Builder class + shared field fragments for hook forms
  hook-form-builder.d.mts Hand-authored TS declarations for the builder
  api.mjs                Programmatic API (ClaudeProject class + standalone functions)
  api.d.mts              API type declarations (re-exports)
  api-types.d.mts        API type definitions (ClaudeProject, SkillFrontmatter, etc.)
  skills.mjs             Skill discovery + frontmatter parsing + validation
  synthetic-input.mjs    Synthetic hook input builder for testing
  run-command.mjs        Shell command runner (stdin piping, timeout)
scripts/
  build-docs-map.mjs     Generates lib/docs-map.mjs from docs/*.md
schemas/
  enums.mjs              Enum schemas (event names, permission modes, etc.)
  config-schemas.mjs     Shared handler property schemas
  input-schemas.mjs      Base input schema + tool fields
  output-schemas.mjs     Base output schema
  matcher-schemas.mjs    Per-hook matcher schemas
hooks/
  <EventName>.mjs        Per-hook schemas + form builder registrations (26 files)
  index.mjs              HookSchemas object (hook name → { Config, Input, Output, Matcher? })
docs/
  <EventName>.md         Per-hook documentation (26 files)
__tests__/api/
  *.test.ts              Programmatic API tests (14 files, ~370 tests)
__tests__/handler/
  <EventName>.test.ts    Per-hook handler tests (26 files)
  getEnv.test.ts         getEnv() tests for all 7 env vars
  getEnvFileVars.test.ts  getEnvFileVars/writeEnvFile/appendToEnvFile tests
  getToolInput.test.ts   getToolInput() tests for all 10 tools
  test-utils.ts          Shared test utilities
dist/                    Generated .d.mts declaration files
```

### Adding a New Hook Event

When Claude Code adds a new hook event:

1. Create `hooks/<EventName>.mjs` following the existing pattern
2. In the same file, add `hookFormBuilder.addHookType(...)` calls at
   the bottom to register the hook's field definitions for each
   handler type it supports. Use `type: "enum"` with `values` and
   `strict` for any field that has a fixed set of valid values.
3. Create `docs/<EventName>.md` with handler types, matcher,
   input/output, and gotchas
4. Add the event to `schemas/enums.mjs` `HookEventNameSchema`
5. Add matcher schema to `schemas/matcher-schemas.mjs` if applicable
6. Add the event to `lib/hook-metadata.mjs` `HOOK_METADATA` array
7. Add the event to `lib/hook-form-builder.mjs`
   `BASE_INPUT_FIELDS.hook_event_name.values`
8. Add input/output schemas to `lib/schema-map.mjs` `HOOK_SCHEMA_MAP`
9. Add an output interface to `lib/handler-types.d.mts` (with JSDoc on
   each property), add it to `HookIOMap`, and re-export from
   `lib/handler.d.mts`
10. Add synthetic input to `lib/synthetic-input.mjs`
11. Re-export from `hooks/index.mjs` and `index.mjs`
12. Add test fixture to `__tests__/handler/test-utils.ts` and create
    `__tests__/handler/<EventName>.test.ts`
13. Run `bun run build` and `bun run test`

### Pre-commit

Prettier runs automatically via husky + lint-staged on every commit.

## License

UNLICENSED
