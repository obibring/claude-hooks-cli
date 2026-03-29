// This file is type-checked with tsc --noEmit to verify
// that HookHandler.for() provides correct types based on the event name.

import { HookHandler } from "../lib/handler.mjs"

// --- PreToolUse: has getToolInput, no CLAUDE_ENV_FILE ---
const preToolUse = HookHandler.for("PreToolUse")

async function testPreToolUse() {
  const input = preToolUse.parseInput()

  // ✓ PreToolUse-specific fields
  const toolName: string = input.tool_name
  const toolInput: Record<string, unknown> = input.tool_input
  const toolUseId: string = input.tool_use_id

  // ✓ Base fields
  const hookEvent: "PreToolUse" = input.hook_event_name
  const sessionId: string = input.session_id
  const cwd: string = input.cwd

  // ✓ Valid output
  preToolUse.exit("success", {
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: "blocked",
    },
  })

  // ✓ getToolInput works on tool events
  const bash = preToolUse.getToolInput("Bash", input)
  if (bash) {
    const cmd: string = bash.command
  }

  // ✓ getEnv works with base vars
  const projectDir: string | undefined = preToolUse.getEnv("CLAUDE_PROJECT_DIR")
}

// --- Stop: no getToolInput, no CLAUDE_ENV_FILE ---
const stop = HookHandler.for("Stop")

async function testStop() {
  const input = stop.parseInput()

  const lastMsg: string = input.last_assistant_message
  const active: boolean = input.stop_hook_active
  const hookEvent: "Stop" = input.hook_event_name

  stop.exit("success", { decision: "block" })
  stop.exit("success", {})
  stop.exit("error", "something went wrong")
}

// --- UserPromptSubmit: output can modify prompt ---
const ups = HookHandler.for("UserPromptSubmit")

async function testUserPromptSubmit() {
  const input = ups.parseInput()
  const prompt: string = input.prompt
  ups.exit("success", { prompt: "modified prompt" })
}

// --- SessionStart: has CLAUDE_ENV_FILE ---
const sessionStart = HookHandler.for("SessionStart")

async function testSessionStart() {
  const input = sessionStart.parseInput()
  const model: string = input.model
  const source: "startup" | "resume" | "clear" | "compact" = input.source

  // ✓ SessionStart can access CLAUDE_ENV_FILE
  const envFile: string | undefined = sessionStart.getEnv("CLAUDE_ENV_FILE")
  const projectDir: string | undefined = sessionStart.getEnv("CLAUDE_PROJECT_DIR")
}

// --- Elicitation: has hookSpecificOutput with action ---
const elicit = HookHandler.for("Elicitation")

async function testElicitation() {
  const input = elicit.parseInput()
  const serverName: string = input.mcp_server_name
  elicit.exit("success", { hookSpecificOutput: { action: "accept" } })
}

// =============================================================
// NEGATIVE TESTS — each line should produce a TS error
// =============================================================

// @ts-expect-error — "nonExistent" is not a property of PreToolUseInput
void preToolUse.parseInput().nonExistent

// @ts-expect-error — "invalidProp" is not a valid output property
preToolUse.exit("success", { invalidProp: true })

// @ts-expect-error — Stop input does not have "tool_name"
void stop.parseInput().tool_name

// @ts-expect-error — Stop output does not have "hookSpecificOutput"
stop.exit("success", { hookSpecificOutput: { permissionDecision: "allow" } })

// @ts-expect-error — "invalid_event" is not a valid hook event name
HookHandler.for("invalid_event")

// @ts-expect-error — Stop does not have getToolInput
stop.getToolInput("Bash", stop.parseInput())

// @ts-expect-error — Stop cannot access CLAUDE_ENV_FILE
stop.getEnv("CLAUDE_ENV_FILE")

// @ts-expect-error — PreToolUse cannot access CLAUDE_ENV_FILE
preToolUse.getEnv("CLAUDE_ENV_FILE")

// ✓ CwdChanged CAN access CLAUDE_ENV_FILE
const cwdChanged = HookHandler.for("CwdChanged")
const envFile2: string | undefined = cwdChanged.getEnv("CLAUDE_ENV_FILE")

// ✓ FileChanged CAN access CLAUDE_ENV_FILE
const fileChanged = HookHandler.for("FileChanged")
const envFile3: string | undefined = fileChanged.getEnv("CLAUDE_ENV_FILE")

// ✓ getEnvFileVars() works on env-file hooks
const envVars1: Record<string, string> = sessionStart.getEnvFileVars()
const envVars2: Record<string, string> = cwdChanged.getEnvFileVars({ force: true })
const envVars3: Record<string, string> = fileChanged.getEnvFileVars()

// @ts-expect-error — Stop does not have getEnvFileVars
stop.getEnvFileVars()

// @ts-expect-error — PreToolUse does not have getEnvFileVars
preToolUse.getEnvFileVars()

// ✓ writeEnvFile and appendToEnvFile work on env-file hooks
sessionStart.writeEnvFile({ MY_VAR: "hello" })
sessionStart.appendToEnvFile("MY_VAR", "hello")
cwdChanged.writeEnvFile({ FOO: "bar" })
fileChanged.appendToEnvFile("BAZ", "qux")

// @ts-expect-error — Stop does not have writeEnvFile
stop.writeEnvFile({ MY_VAR: "hello" })

// @ts-expect-error — PreToolUse does not have appendToEnvFile
preToolUse.appendToEnvFile("MY_VAR", "hello")

// ✓ Env-file hooks accept options in HookHandler.for()
const ssWithOpts = HookHandler.for("SessionStart", {
  readFile: (path: string) => "FOO=bar",
})
const cwdWithOpts = HookHandler.for("CwdChanged", {
  readFile: (path: string) => "FOO=bar",
  writeFile: (path: string, contents: string, opts: { encoding: "utf-8" }) => {},
})

// @ts-expect-error — PreToolUse does not accept options
HookHandler.for("PreToolUse", { readFile: (p: string) => "" })

// @ts-expect-error — Stop does not accept options
HookHandler.for("Stop", { readFile: (p: string) => "" })
