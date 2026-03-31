import { describe, it, expect } from "vitest"
import { buildSyntheticInput } from "../../lib/synthetic-input.mjs"

describe("buildSyntheticInput", () => {
  it("builds base input with hook_event_name for SessionStart", () => {
    const result = buildSyntheticInput("SessionStart")

    expect(result.hook_event_name).toBe("SessionStart")
    expect(result.session_id).toMatch(/^test-session-/)
    expect(result.transcript_path).toBe("/tmp/test-transcript.json")
    expect(result.cwd).toBe(process.cwd())
    expect(result.permission_mode).toBe("default")
    // SessionStart-specific fields
    expect(result.model).toBe("claude-opus-4-6")
    expect(result.source).toBe("startup")
  })

  it("includes tool fields for PreToolUse", () => {
    const result = buildSyntheticInput("PreToolUse")

    expect(result.hook_event_name).toBe("PreToolUse")
    expect(result.tool_name).toBe("Bash")
    expect(result.tool_input).toEqual({ command: "echo test" })
    expect(result.tool_use_id).toBe("test-tu-1")
  })

  it("includes prompt field for UserPromptSubmit", () => {
    const result = buildSyntheticInput("UserPromptSubmit")

    expect(result.hook_event_name).toBe("UserPromptSubmit")
    expect(result.prompt).toBe("test prompt")
  })

  it("allows overriding fields via a second overrides parameter", () => {
    const result = buildSyntheticInput("PreToolUse", {
      tool_name: "Read",
      tool_input: { file_path: "/etc/hosts" },
      custom_field: 42,
    })

    // Overrides should win over extras
    expect(result.tool_name).toBe("Read")
    expect(result.tool_input).toEqual({ file_path: "/etc/hosts" })
    // Custom fields should be included
    expect(result.custom_field).toBe(42)
    // Base fields still present
    expect(result.hook_event_name).toBe("PreToolUse")
    expect(result.session_id).toMatch(/^test-session-/)
  })

  it("overrides base fields when provided", () => {
    const result = buildSyntheticInput("SessionStart", {
      session_id: "custom-session",
      cwd: "/custom/path",
    })

    expect(result.session_id).toBe("custom-session")
    expect(result.cwd).toBe("/custom/path")
    // Non-overridden base fields still present
    expect(result.permission_mode).toBe("default")
  })

  it("returns base fields for unknown event names", () => {
    const result = buildSyntheticInput("UnknownEvent")

    expect(result.hook_event_name).toBe("UnknownEvent")
    expect(result.session_id).toMatch(/^test-session-/)
    expect(result.permission_mode).toBe("default")
  })

  it.each([
    "PreToolUse",
    "PermissionRequest",
    "PostToolUse",
    "PostToolUseFailure",
    "UserPromptSubmit",
    "Notification",
    "Stop",
    "SubagentStart",
    "SubagentStop",
    "PreCompact",
    "PostCompact",
    "SessionStart",
    "SessionEnd",
    "Setup",
    "TeammateIdle",
    "TaskCreated",
    "TaskCompleted",
    "ConfigChange",
    "WorktreeCreate",
    "WorktreeRemove",
    "InstructionsLoaded",
    "Elicitation",
    "ElicitationResult",
    "StopFailure",
    "CwdChanged",
    "FileChanged",
  ])("produces valid input for %s", (eventName) => {
    const input = buildSyntheticInput(eventName)

    expect(input.hook_event_name).toBe(eventName)
    expect(typeof input.session_id).toBe("string")
    expect(typeof input.cwd).toBe("string")
    expect(input.permission_mode).toBe("default")
  })

  it.each(["PreToolUse", "PostToolUse", "PostToolUseFailure", "PermissionRequest"])(
    "includes tool_name for tool event %s",
    (eventName) => {
      const input = buildSyntheticInput(eventName)

      expect(input.tool_name).toBeDefined()
    },
  )

  it("allows overriding hook_event_name itself", () => {
    const input = buildSyntheticInput("PreToolUse", {
      hook_event_name: "CustomOverride",
    })

    expect(input.hook_event_name).toBe("CustomOverride")
  })
})
