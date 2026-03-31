import { describe, expect, it } from "vitest"

describe("addHookConfig", () => {
  it("builds a command handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: 'echo "hello"',
    })
    expect(result.eventName).toBe("PreToolUse")
    expect(result.configEntry.hooks[0].type).toBe("command")
    expect(result.configEntry.hooks[0].command).toBe('echo "hello"')
  })

  it("builds a prompt handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "prompt",
      prompt: "Should Claude stop?",
      model: "claude-haiku-4-5-20251001",
    })
    expect(result.eventName).toBe("Stop")
    expect(result.configEntry.hooks[0].type).toBe("prompt")
    expect(result.configEntry.hooks[0].prompt).toContain("Should Claude stop?")
  })

  it("builds an http handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PostToolUse",
      type: "http",
      url: "https://example.com/webhook",
      headers: { Authorization: "Bearer $TOKEN" },
      allowedEnvVars: ["TOKEN"],
    })
    expect(result.configEntry.hooks[0].type).toBe("http")
    expect(result.configEntry.hooks[0].url).toBe("https://example.com/webhook")
    // @ts-expect-error - headers is optional
    expect(result.configEntry.hooks[0].headers?.Authorization).toBe("Bearer $TOKEN")
  })

  it("includes matcher when provided", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "my-script.sh",
      matcher: "Bash",
    })
    expect(result.configEntry.matcher).toBe("Bash")
  })

  it("includes optional fields", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "my-script.sh",
      timeout: 10000,
      async: true,
      statusMessage: "Checking...",
      if: "Bash(git *)",
    })
    const handler = result.configEntry.hooks[0]
    expect(handler.timeout).toBe(10000)
    expect(handler.async).toBe(true)
    expect(handler.statusMessage).toBe("Checking...")
    expect(handler.if).toBe("Bash(git *)")
  })

  it("throws on unknown event name", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({ event: "FakeEvent", type: "command", command: "echo" }),
    ).toThrow(/unknown hook event/i)
  })

  it("throws when command handler is missing command", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() => addHookConfig({ event: "PreToolUse", type: "command" })).toThrow(
      /command.*required/i,
    )
  })

  it("throws when FileChanged is missing required matcher", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({
        event: "FileChanged",
        type: "command",
        command: "echo",
      }),
    ).toThrow(/matcher.*required/i)
  })

  it("throws when handler type not supported for event", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({
        event: "SessionStart",
        type: "prompt",
        prompt: "test",
      }),
    ).toThrow(/not supported/i)
  })

  it("builds an agent handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "agent",
      prompt: "Check if done",
    })
    expect(result.configEntry.hooks[0].type).toBe("agent")
    expect(result.configEntry.hooks[0].prompt).toBe("Check if done")
  })

  it("autoPromptSuffix: false suppresses suffix", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "prompt",
      prompt: "Should stop?",
      autoPromptSuffix: false,
    })
    expect(result.configEntry.hooks[0].prompt).toBe("Should stop?")
  })

  it("autoPromptSuffix default appends suffix", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "prompt",
      prompt: "Should stop?",
    })
    expect(result.configEntry.hooks[0].prompt).toContain("Respond with JSON")
  })

  it("asyncRewake option", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "echo",
      asyncRewake: true,
    })
    expect(result.configEntry.hooks[0].asyncRewake).toBe(true)
  })

  it("once on supporting event", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "SessionStart",
      type: "command",
      command: "echo",
      once: true,
    })
    expect(result.configEntry.hooks[0].once).toBe(true)
  })

  it("once silently dropped on non-supporting event", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "echo",
      once: true,
    })
    expect(result.configEntry.hooks[0].once).toBeUndefined()
  })

  it("if silently dropped on non-supporting event", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "command",
      command: "echo",
      if: "Bash(git *)",
    })
    expect(result.configEntry.hooks[0].if).toBeUndefined()
  })

  it("model set on prompt handler", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "prompt",
      prompt: "test",
      model: "claude-haiku-4-5-20251001",
    })
    expect(result.configEntry.hooks[0].model).toBe("claude-haiku-4-5-20251001")
  })

  it("throws when prompt handler is missing prompt", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() => addHookConfig({ event: "Stop", type: "prompt" })).toThrow(
      /prompt.*required/i,
    )
  })

  it("throws when agent handler is missing prompt", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() => addHookConfig({ event: "Stop", type: "agent" })).toThrow(
      /prompt.*required/i,
    )
  })

  it("throws when http handler is missing url", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() => addHookConfig({ event: "PreToolUse", type: "http" })).toThrow(
      /url.*required/i,
    )
  })

  it("throws when command is empty string", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({ event: "PreToolUse", type: "command", command: "" }),
    ).toThrow(/command.*required/i)
  })

  it("configEntry.hooks has exactly one handler", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "echo hello",
    })
    expect(result.configEntry.hooks.length).toBe(1)
  })
})
