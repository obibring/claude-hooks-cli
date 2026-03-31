import { describe, it, expect } from "vitest"

describe("getDocs", () => {
  it("returns markdown docs for a valid event", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("PreToolUse")
    expect(docs).toContain("# PreToolUse")
    expect(docs).toContain("tool_name")
  })

  it("returns null for unknown event", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("FakeEvent")
    expect(docs).toBeNull()
  })

  it("lists all available event names", async () => {
    const { getAvailableDocs } = await import("../../lib/api.mjs")
    const names = getAvailableDocs()
    expect(names).toContain("PreToolUse")
    expect(names).toContain("Stop")
    expect(names.length).toBe(26)
  })
})

describe("getDocs — extended", () => {
  it("all events have docs", async () => {
    const { getAvailableDocs, getDocs } = await import("../../lib/api.mjs")
    const names = getAvailableDocs()

    for (const name of names) {
      const doc = getDocs(name)
      expect(doc).toBeTypeOf("string")
      expect(doc!.length).toBeGreaterThan(0)
    }
  })

  it("is case-sensitive — lowercase returns null", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("pretooluse")
    expect(docs).toBeNull()
  })

  it("returns null for empty string", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("")
    expect(docs).toBeNull()
  })
})

describe("getAvailableDocs — extended", () => {
  it("has no duplicates", async () => {
    const { getAvailableDocs } = await import("../../lib/api.mjs")
    const names = getAvailableDocs()
    expect(new Set(names).size).toBe(names.length)
  })

  it("matches HOOK_EVENT_NAMES", async () => {
    const { getAvailableDocs } = await import("../../lib/api.mjs")
    const { HOOK_EVENT_NAMES } = await import("../../lib/hook-metadata.mjs")
    const names = getAvailableDocs()

    for (const eventName of HOOK_EVENT_NAMES) {
      expect(names).toContain(eventName)
    }
  })
})

describe("listHookEntries", () => {
  it("returns structured hook entries for a scope", async () => {
    const { listHookEntries } = await import("../../lib/api.mjs")
    // This reads from disk - uses whatever is in project settings.
    // We test the shape, not specific content.
    const result = await listHookEntries("project")
    expect(result).toHaveProperty("filePath")
    expect(Array.isArray(result.hooks)).toBe(true)
    for (const hook of result.hooks) {
      expect(hook).toHaveProperty("eventName")
      expect(hook).toHaveProperty("index")
      expect(hook).toHaveProperty("entry")
    }
  })
})
