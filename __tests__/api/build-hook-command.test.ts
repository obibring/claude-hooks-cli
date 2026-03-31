import { describe, it, expect } from "vitest"

describe("buildHookCommand", () => {
  it("builds a tsx command for a relative path", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("tsx", "./hooks/check-bash.ts")
    expect(cmd).toBe('npx -y tsx "$CLAUDE_PROJECT_DIR/./hooks/check-bash.ts"')
  })

  it("builds a node command for a relative path", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("node", "./hooks/check-bash.mjs")
    expect(cmd).toBe('node "$CLAUDE_PROJECT_DIR/./hooks/check-bash.mjs"')
  })

  it("uses absolute path directly for tsx", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("tsx", "/absolute/path/hook.ts")
    expect(cmd).toBe('npx -y tsx "/absolute/path/hook.ts"')
  })

  it("uses absolute path directly for node", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("node", "/absolute/path/hook.mjs")
    expect(cmd).toBe('node "/absolute/path/hook.mjs"')
  })

  it("handles relative path without leading ./", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("tsx", "hooks/my-hook.ts")
    expect(cmd).toBe('npx -y tsx "$CLAUDE_PROJECT_DIR/hooks/my-hook.ts"')
  })

  it("trims whitespace from filePath", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("node", "  hooks/hook.mjs  ")
    expect(cmd).toBe('node "$CLAUDE_PROJECT_DIR/hooks/hook.mjs"')
  })

  it("throws on invalid runner", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    expect(() => buildHookCommand("python" as any, "hook.py")).toThrow(/invalid runner/i)
  })

  it("throws on empty filePath", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    expect(() => buildHookCommand("node", "")).toThrow(/filePath.*required/i)
  })

  it("throws on whitespace-only filePath", async () => {
    const { buildHookCommand } = await import("../../lib/api.mjs")
    expect(() => buildHookCommand("tsx", "   ")).toThrow(/filePath.*required/i)
  })

  it("is accessible on ClaudeHooks instances", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const { tmpdir } = await import("node:os")
    const hooks = new ClaudeHooks(tmpdir())
    expect(hooks.buildHookCommand).toBeTypeOf("function")
    const cmd = hooks.buildHookCommand("tsx", "hooks/check.ts")
    expect(cmd).toBe('npx -y tsx "$CLAUDE_PROJECT_DIR/hooks/check.ts"')
  })

  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.buildHookCommand).toBeTypeOf("function")
  })

  it("produces a command usable in addHookConfig", async () => {
    const { buildHookCommand, addHookConfig } = await import("../../lib/api.mjs")
    const cmd = buildHookCommand("tsx", "hooks/my-hook.ts")
    const { configEntry } = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: cmd,
    })
    // addHookConfig passes through compound commands (ones with spaces) as-is
    expect(configEntry.hooks[0].command).toBe(cmd)
  })
})
