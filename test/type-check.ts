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
