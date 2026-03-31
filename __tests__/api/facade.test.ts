import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("ClaudeHooks class", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cch-facade-${Date.now()}`)
    mkdirSync(join(tempDir, ".claude"), { recursive: true })
    writeFileSync(join(tempDir, ".claude", "settings.json"), JSON.stringify({}, null, 2))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  // --- Constructor validation ---

  it("constructor accepts an existing directory", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    expect(hooks.dir).toBe(tempDir)
  })

  it("constructor throws for non-existent path", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    expect(() => new ClaudeHooks("/non/existent/path")).toThrow(/does not exist/i)
  })

  it("constructor throws for a file path (not directory)", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const filePath = join(tempDir, ".claude", "settings.json")
    expect(() => new ClaudeHooks(filePath)).toThrow(/not a directory/i)
  })

  // --- hasClaudeDirectory ---

  it("hasClaudeDirectory returns true when .claude exists", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    expect(hooks.hasClaudeDirectory()).toBe(true)
  })

  it("hasClaudeDirectory returns false when .claude does not exist", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const emptyDir = join(tmpdir(), `cch-empty-${Date.now()}`)
    mkdirSync(emptyDir, { recursive: true })
    try {
      const hooks = new ClaudeHooks(emptyDir)
      expect(hooks.hasClaudeDirectory()).toBe(false)
    } finally {
      rmSync(emptyDir, { recursive: true, force: true })
    }
  })

  // --- Instance methods exist ---

  it("exposes all instance methods", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)

    expect(hooks.addHookConfig).toBeTypeOf("function")
    expect(hooks.install).toBeTypeOf("function")
    expect(hooks.uninstall).toBeTypeOf("function")
    expect(hooks.getHooks).toBeTypeOf("function")
    expect(hooks.test).toBeTypeOf("function")
    expect(hooks.buildSyntheticInput).toBeTypeOf("function")
    expect(hooks.getDocs).toBeTypeOf("function")
    expect(hooks.getAvailableDocs).toBeTypeOf("function")
    expect(hooks.scaffold).toBeTypeOf("function")
    expect(hooks.buildHookCommand).toBeTypeOf("function")
    expect(hooks.discoverSkills).toBeTypeOf("function")
    expect(hooks.validateSkillFrontmatter).toBeTypeOf("function")
  })

  // --- Static properties ---

  it("metadata is a static property", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    expect(ClaudeHooks.metadata).toBeDefined()
    expect(ClaudeHooks.metadata.events).toBeDefined()
    expect(ClaudeHooks.metadata.getEvent).toBeTypeOf("function")
    expect(ClaudeHooks.metadata.eventNames).toBeDefined()
    expect(ClaudeHooks.metadata.handlerTypes).toBeDefined()
  })

  it("SkillFrontmatterSchema is a static property", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    expect(ClaudeHooks.SkillFrontmatterSchema).toBeDefined()
    expect(ClaudeHooks.SkillFrontmatterSchema.parse).toBeTypeOf("function")
  })

  it("metadata is not on instances", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    // metadata should be on the class, not on instances (it's static)
    expect((hooks as any).metadata).toBeUndefined()
  })

  // --- Static metadata behavior ---

  it("metadata.getEvent returns hook metadata for PreToolUse", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const meta = ClaudeHooks.metadata.getEvent("PreToolUse")

    expect(meta).toBeDefined()
    expect(meta!.name).toBe("PreToolUse")
    expect(Array.isArray(meta!.handlerTypes)).toBe(true)
    expect(typeof meta!.description).toBe("string")
  })

  it("metadata.eventNames has 26 entries", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    expect(ClaudeHooks.metadata.eventNames.length).toBe(26)
  })

  // --- Functional behavior through instance ---

  it("getDocs through instance works", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    const docs = hooks.getDocs("PreToolUse")

    expect(docs).not.toBeNull()
    expect(typeof docs).toBe("string")
    expect(docs).toContain("PreToolUse")
  })

  it("buildSyntheticInput through instance works", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    const input = hooks.buildSyntheticInput("Stop")

    expect(input.hook_event_name).toBe("Stop")
    expect(input.last_assistant_message).toBeDefined()
  })

  // --- settingsPath property ---

  it("settingsPath resolves to .claude/settings.json", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    expect(hooks.settingsPath).toBe(join(tempDir, ".claude", "settings.json"))
  })
})
