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

  it("exports HookSchemas with all 26 hooks", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HookSchemas).toBeDefined()
    expect(Object.keys(mod.HookSchemas)).toHaveLength(26)
  })

  it("HookSchemas entries have Config, Input, Output schemas", async () => {
    const { HookSchemas } = await import("../../index.mjs")
    for (const [name, schemas] of Object.entries(HookSchemas) as any) {
      expect(schemas.Config).toBeDefined()
      expect(schemas.Input).toBeDefined()
      expect(schemas.Output).toBeDefined()
      expect(schemas.Config.parse).toBeTypeOf("function")
      expect(schemas.Input.parse).toBeTypeOf("function")
      expect(schemas.Output.parse).toBeTypeOf("function")
    }
  })

  it("HookSchemas.PreToolUse has HookSpecificOutput", async () => {
    const { HookSchemas } = await import("../../index.mjs")
    expect(HookSchemas.PreToolUse.HookSpecificOutput).toBeDefined()
    expect(HookSchemas.PreToolUse.HookSpecificOutput.parse).toBeTypeOf("function")
  })

  it("HookSchemas.PreToolUse.Matcher is defined", async () => {
    const { HookSchemas } = await import("../../index.mjs")
    expect(HookSchemas.PreToolUse.Matcher).toBeDefined()
  })

  it("HookSchemas.Stop.Matcher is undefined (no matcher)", async () => {
    const { HookSchemas } = await import("../../index.mjs")
    expect(HookSchemas.Stop.Matcher).toBeUndefined()
  })
})
