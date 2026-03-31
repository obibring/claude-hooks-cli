import { describe, it, expect } from "vitest"

describe("programmatic API exports from index.mjs", () => {
  it("exports HOOK_METADATA as a non-empty array", async () => {
    const mod = await import("../../index.mjs")
    expect(Array.isArray(mod.HOOK_METADATA)).toBe(true)
    expect(mod.HOOK_METADATA.length).toBeGreaterThan(0)
  })

  it("exports getHookMeta as a function", async () => {
    const mod = await import("../../index.mjs")
    expect(typeof mod.getHookMeta).toBe("function")
    // Smoke-test: known hook should resolve
    const meta = mod.getHookMeta("PreToolUse")
    expect(meta).toBeDefined()
    expect(meta.name).toBe("PreToolUse")
  })

  it("exports HOOK_EVENT_NAMES as a non-empty array of strings", async () => {
    const mod = await import("../../index.mjs")
    expect(Array.isArray(mod.HOOK_EVENT_NAMES)).toBe(true)
    expect(mod.HOOK_EVENT_NAMES.length).toBeGreaterThan(0)
    expect(typeof mod.HOOK_EVENT_NAMES[0]).toBe("string")
  })

  it("exports HANDLER_TYPE_INFO with expected keys", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HANDLER_TYPE_INFO).toBeDefined()
    expect(mod.HANDLER_TYPE_INFO).toHaveProperty("command")
    expect(mod.HANDLER_TYPE_INFO).toHaveProperty("prompt")
    expect(mod.HANDLER_TYPE_INFO).toHaveProperty("agent")
    expect(mod.HANDLER_TYPE_INFO).toHaveProperty("http")
  })

  it("exports resolveCommand as a function", async () => {
    const mod = await import("../../index.mjs")
    expect(typeof mod.resolveCommand).toBe("function")
  })

  it("exports parseCommandAsFile as a function", async () => {
    const mod = await import("../../index.mjs")
    expect(typeof mod.parseCommandAsFile).toBe("function")
  })

  it("exports createCommandFile as a function", async () => {
    const mod = await import("../../index.mjs")
    expect(typeof mod.createCommandFile).toBe("function")
  })

  it("exports HOOK_DOCS_MAP as a non-empty object", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HOOK_DOCS_MAP).toBeDefined()
    expect(typeof mod.HOOK_DOCS_MAP).toBe("object")
    expect(Object.keys(mod.HOOK_DOCS_MAP).length).toBeGreaterThan(0)
  })
})
