import { describe, it, expect } from "vitest"
import { tmpdir } from "node:os"

describe("package root exports", () => {
  it("exports ClaudeHooks class from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.ClaudeHooks).toBeDefined()
    expect(mod.ClaudeHooks).toBeTypeOf("function")
    const hooks = new mod.ClaudeHooks(tmpdir())
    expect(hooks.install).toBeTypeOf("function")
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
