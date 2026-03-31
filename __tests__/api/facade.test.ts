import { describe, it, expect } from "vitest"

describe("claudeHooks facade", () => {
  it("exposes all API methods", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")

    expect(claudeHooks.addHookConfig).toBeTypeOf("function")
    expect(claudeHooks.install).toBeTypeOf("function")
    expect(claudeHooks.uninstall).toBeTypeOf("function")
    expect(claudeHooks.list).toBeTypeOf("function")
    expect(claudeHooks.test).toBeTypeOf("function")
    expect(claudeHooks.buildSyntheticInput).toBeTypeOf("function")
    expect(claudeHooks.getDocs).toBeTypeOf("function")
    expect(claudeHooks.getAvailableDocs).toBeTypeOf("function")
    expect(claudeHooks.scaffold).toBeTypeOf("function")
    expect(claudeHooks.metadata).toBeDefined()
    expect(claudeHooks.metadata.events).toBeDefined()
    expect(claudeHooks.metadata.getEvent).toBeTypeOf("function")
    expect(claudeHooks.metadata.eventNames).toBeDefined()
    expect(claudeHooks.metadata.handlerTypes).toBeDefined()
    expect(claudeHooks.settings.getPath).toBeTypeOf("function")
    expect(claudeHooks.settings.read).toBeTypeOf("function")
    expect(claudeHooks.settings.write).toBeTypeOf("function")
  })

  it("metadata.getEvent returns hook metadata for PreToolUse", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")
    const meta = claudeHooks.metadata.getEvent("PreToolUse")

    expect(meta).toBeDefined()
    expect(meta!.name).toBe("PreToolUse")
    expect(Array.isArray(meta!.handlerTypes)).toBe(true)
    expect(typeof meta!.description).toBe("string")
  })

  it("metadata.eventNames has 26 entries", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")

    expect(claudeHooks.metadata.eventNames.length).toBe(26)
  })

  it("getDocs through facade works", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")
    const docs = claudeHooks.getDocs("PreToolUse")

    expect(docs).not.toBeNull()
    expect(typeof docs).toBe("string")
    expect(docs).toContain("PreToolUse")
  })

  it("buildSyntheticInput through facade works", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")
    const input = claudeHooks.buildSyntheticInput("Stop")

    expect(input.hook_event_name).toBe("Stop")
    expect(input.last_assistant_message).toBeDefined()
  })
})
