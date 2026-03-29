// This file is type-checked with tsc --noEmit to verify
// that HookHandler provides correct types based on the event name.

import { HookHandler } from "../lib/handler.mjs"

// --- PreToolUse: should accept tool-specific fields and hookSpecificOutput ---
const preToolUse = new HookHandler("PreToolUse")

async function testPreToolUse() {
  const input = await preToolUse.parseInput()

  // ✓ PreToolUse-specific fields
  const toolName: string = input.tool_name
  const toolInput: Record<string, unknown> = input.tool_input
  const toolUseId: string = input.tool_use_id

  // ✓ Base fields
  const hookEvent: "PreToolUse" = input.hook_event_name
  const sessionId: string = input.session_id
  const cwd: string = input.cwd

  // ✓ Valid outputs
  preToolUse.emitOutput({
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: "blocked",
    },
  })
}

// --- Stop: should accept last_assistant_message and decision ---
const stop = new HookHandler("Stop")

async function testStop() {
  const input = await stop.parseInput()

  const lastMsg: string = input.last_assistant_message
  const active: boolean = input.stop_hook_active
  const hookEvent: "Stop" = input.hook_event_name

  stop.emitOutput({ decision: "block" })
  stop.emitOutput({})
}

// --- UserPromptSubmit: output can modify prompt ---
const ups = new HookHandler("UserPromptSubmit")

async function testUserPromptSubmit() {
  const input = await ups.parseInput()
  const prompt: string = input.prompt
  ups.emitOutput({ prompt: "modified prompt" })
}

// --- SessionStart: has model and source ---
const ss = new HookHandler("SessionStart")

async function testSessionStart() {
  const input = await ss.parseInput()
  const model: string = input.model
  const source: "startup" | "resume" | "clear" | "compact" = input.source
}

// --- Elicitation: has hookSpecificOutput with action ---
const elicit = new HookHandler("Elicitation")

async function testElicitation() {
  const input = await elicit.parseInput()
  const serverName: string = input.mcp_server_name
  elicit.emitOutput({ hookSpecificOutput: { action: "accept" } })
}

// =============================================================
// NEGATIVE TESTS — each line should produce a TS error
// =============================================================

// @ts-expect-error — "nonExistent" is not a property of PreToolUseInput
void preToolUse.parseInput().then((i) => i.nonExistent)

// @ts-expect-error — "invalidProp" is not a valid output property
preToolUse.emitOutput({ invalidProp: true })

// @ts-expect-error — Stop input does not have "tool_name"
void stop.parseInput().then((i) => i.tool_name)

// @ts-expect-error — Stop output does not have "hookSpecificOutput"
stop.emitOutput({ hookSpecificOutput: { permissionDecision: "allow" } })

// @ts-expect-error — "invalid_event" is not a valid hook event name
new HookHandler("invalid_event")

// =============================================================
// getEnv() CLAUDE_ENV_FILE availability tests
// =============================================================

// SessionStart, CwdChanged, FileChanged CAN have CLAUDE_ENV_FILE
const sessionStart = new HookHandler("SessionStart")
const envFile1: string | undefined = sessionStart.getEnv("CLAUDE_ENV_FILE") // ✓

const cwdChanged = new HookHandler("CwdChanged")
const envFile2: string | undefined = cwdChanged.getEnv("CLAUDE_ENV_FILE") // ✓

const fileChanged = new HookHandler("FileChanged")
const envFile3: string | undefined = fileChanged.getEnv("CLAUDE_ENV_FILE") // ✓

// Stop does NOT have CLAUDE_ENV_FILE — return type includes error message
const envFile4:
  | undefined
  | 'CLAUDE_ENV_FILE is not available in "Stop" hooks. It is only available in: SessionStart, CwdChanged, FileChanged.' =
  stop.getEnv("CLAUDE_ENV_FILE") // ✓

// PreToolUse does NOT have CLAUDE_ENV_FILE — return type includes error message
const envFile5:
  | undefined
  | 'CLAUDE_ENV_FILE is not available in "PreToolUse" hooks. It is only available in: SessionStart, CwdChanged, FileChanged.' =
  preToolUse.getEnv("CLAUDE_ENV_FILE") // ✓

// All hooks can read CLAUDE_PROJECT_DIR
const projectDir: string | undefined = stop.getEnv("CLAUDE_PROJECT_DIR") // ✓

// =============================================================
// getToolInput() tests
// =============================================================

async function testGetToolInput() {
  const preHandler = new HookHandler("PreToolUse")
  const preInput = preHandler.parseInput()

  // ✓ Return type is BashToolInput | null — must null-check before accessing
  const bashInput = preHandler.getToolInput("Bash", preInput)
  if (bashInput) {
    const cmd: string = bashInput.command
    const desc: string | undefined = bashInput.description
    const timeout: number | undefined = bashInput.timeout
    const bg: boolean | undefined = bashInput.run_in_background
  }

  // ✓ Edit returns EditToolInput | null
  const editInput = preHandler.getToolInput("Edit", preInput)
  if (editInput) {
    const filePath: string = editInput.file_path
    const oldStr: string = editInput.old_string
    const newStr: string = editInput.new_string
    const replaceAll: boolean | undefined = editInput.replace_all
  }

  // ✓ Read returns ReadToolInput | null
  const readInput = preHandler.getToolInput("Read", preInput)
  if (readInput) {
    const readPath: string = readInput.file_path
    const offset: number | undefined = readInput.offset
    const limit: number | undefined = readInput.limit
  }

  // ✓ Grep returns GrepToolInput | null
  const grepInput = preHandler.getToolInput("Grep", preInput)
  if (grepInput) {
    const grepPattern: string = grepInput.pattern
    const grepMode: "content" | "files_with_matches" | "count" | undefined =
      grepInput.output_mode
  }

  // ✓ AskUserQuestion returns AskUserQuestionToolInput | null
  const askInput = preHandler.getToolInput("AskUserQuestion", preInput)
  if (askInput) {
    const questions: Array<{ question: string }> = askInput.questions
  }

  // ✓ PostToolUse also works
  const postHandler = new HookHandler("PostToolUse")
  const postInput = postHandler.parseInput()
  const writeInput = postHandler.getToolInput("Write", postInput)
  if (writeInput) {
    const writePath: string = writeInput.file_path
    const writeContent: string = writeInput.content
  }
}

// ✗ Stop is not a tool-event hook — getToolInput returns error string type
async function testGetToolInputOnNonToolEvent() {
  const stopHandler = new HookHandler("Stop")
  const stopInput = stopHandler.parseInput()

  // @ts-expect-error — Stop is not a tool-event hook, return type is an error string
  const bashInput: { command: string } = stopHandler.getToolInput(
    "Bash",
    stopInput,
  )
}
