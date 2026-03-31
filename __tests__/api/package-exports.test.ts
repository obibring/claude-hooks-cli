import { describe, it, expect } from "vitest"

describe("package root exports", () => {
  it("exports claudeHooks from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.claudeHooks).toBeDefined()
    expect(mod.claudeHooks.install).toBeTypeOf("function")
  })

  it("exports all API functions individually from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.addHookConfig).toBeTypeOf("function")
    expect(mod.installHook).toBeTypeOf("function")
    expect(mod.uninstallHook).toBeTypeOf("function")
    expect(mod.listHookEntries).toBeTypeOf("function")
    expect(mod.testHook).toBeTypeOf("function")
    expect(mod.getDocs).toBeTypeOf("function")
    expect(mod.getAvailableDocs).toBeTypeOf("function")
    expect(mod.scaffoldHookFile).toBeTypeOf("function")
    expect(mod.buildSyntheticInput).toBeTypeOf("function")
  })
})
