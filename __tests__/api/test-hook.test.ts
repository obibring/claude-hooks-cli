import { describe, it, expect } from "vitest"

describe("testHook", () => {
  it("runs a command handler and returns result", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: {
        type: "command",
        command: 'echo \'{"additionalContext":"hi"}\'',
      },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("additionalContext")
  })

  it("pipes synthetic input to stdin", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "cat" },
    })
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.hook_event_name).toBe("PreToolUse")
    expect(parsed.tool_name).toBe("Bash")
  })

  it("uses custom input when provided", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "cat" },
      input: { hook_event_name: "PreToolUse", custom: true },
    })
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.custom).toBe(true)
  })

  it("skips non-command handlers", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "Stop",
      handler: { type: "prompt", prompt: "Should stop?" },
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toMatch(/command/)
  })

  it("forwards env option to the command", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "echo $MY_TOKEN" },
      env: { MY_TOKEN: "secret123" },
    })
    expect(result.stdout).toContain("secret123")
  })

  it("captures stderr", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "echo err >&2" },
    })
    expect(result.stderr).toContain("err")
  })

  it("reports non-zero exit code", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "exit 1" },
    })
    expect(result.exitCode).toBe(1)
  })

  it("skips agent handler", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "Stop",
      handler: { type: "agent", prompt: "test" },
    })
    expect(result.skipped).toBe(true)
  })

  it("skips http handler", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PostToolUse",
      handler: { type: "http", url: "http://example.com" },
    })
    expect(result.skipped).toBe(true)
  })
})
