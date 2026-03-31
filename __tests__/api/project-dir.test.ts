import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("project directory API", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cch-projdir-${Date.now()}`)
    mkdirSync(join(tempDir, ".claude"), { recursive: true })
    writeFileSync(join(tempDir, ".claude", "settings.json"), JSON.stringify({}, null, 2))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  // --- getHooksForProjectDir ---

  describe("getHooksForProjectDir", () => {
    it("returns hooks from a project directory", async () => {
      const { getHooksForProjectDir, saveHookToProjectDir } =
        await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: 'echo "hello"',
        matcher: "Bash",
      })

      const { filePath, hooks } = await getHooksForProjectDir(tempDir)
      expect(filePath).toBe(join(tempDir, ".claude", "settings.json"))
      expect(hooks).toHaveLength(1)
      expect(hooks[0].eventName).toBe("PreToolUse")
      expect(hooks[0].index).toBe(0)
    })

    it("returns empty hooks when no hooks configured", async () => {
      const { getHooksForProjectDir } = await import("../../lib/api.mjs")

      const { hooks } = await getHooksForProjectDir(tempDir)
      expect(hooks).toHaveLength(0)
    })

    it("returns empty hooks when settings file does not exist", async () => {
      const { getHooksForProjectDir } = await import("../../lib/api.mjs")

      rmSync(join(tempDir, ".claude", "settings.json"))

      const { hooks } = await getHooksForProjectDir(tempDir)
      expect(hooks).toHaveLength(0)
    })

    it("returns hooks across multiple events", async () => {
      const { getHooksForProjectDir, saveHookToProjectDir } =
        await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo pre",
        matcher: "Bash",
      })
      await saveHookToProjectDir(tempDir, {
        event: "Stop",
        type: "command",
        command: "echo stop",
      })

      const { hooks } = await getHooksForProjectDir(tempDir)
      expect(hooks).toHaveLength(2)
      const events = hooks.map((h: { eventName: string }) => h.eventName)
      expect(events).toContain("PreToolUse")
      expect(events).toContain("Stop")
    })

    it("resolves to .claude/settings.json inside the directory", async () => {
      const { getHooksForProjectDir } = await import("../../lib/api.mjs")

      const { filePath } = await getHooksForProjectDir(tempDir)
      expect(filePath).toBe(join(tempDir, ".claude", "settings.json"))
    })
  })

  // --- saveHookToProjectDir ---

  describe("saveHookToProjectDir", () => {
    it("saves a hook and returns result", async () => {
      const { saveHookToProjectDir } = await import("../../lib/api.mjs")

      const result = await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: 'echo "test"',
        matcher: "Bash",
      })

      expect(result.filePath).toBe(join(tempDir, ".claude", "settings.json"))
      expect(result.eventName).toBe("PreToolUse")
      expect(result.configEntry).toBeDefined()

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.PreToolUse).toHaveLength(1)
      expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe('echo "test"')
    })

    it("creates .claude directory and settings.json if they do not exist", async () => {
      const { saveHookToProjectDir } = await import("../../lib/api.mjs")

      rmSync(join(tempDir, ".claude"), { recursive: true, force: true })

      await saveHookToProjectDir(tempDir, {
        event: "Stop",
        type: "command",
        command: "echo stop",
      })

      expect(existsSync(join(tempDir, ".claude", "settings.json"))).toBe(true)
      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.Stop).toHaveLength(1)
    })

    it("preserves existing settings keys", async () => {
      const { saveHookToProjectDir } = await import("../../lib/api.mjs")

      writeFileSync(
        join(tempDir, ".claude", "settings.json"),
        JSON.stringify({ permissions: { allow: ["Edit"] } }, null, 2),
      )

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo test",
      })

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks).toBeDefined()
      expect(settings.permissions).toEqual({ allow: ["Edit"] })
    })

    it("appends multiple hooks for the same event", async () => {
      const { saveHookToProjectDir } = await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 1",
      })
      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 2",
      })

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.PreToolUse).toHaveLength(2)
    })

    it("throws on invalid options without modifying the file", async () => {
      const { saveHookToProjectDir } = await import("../../lib/api.mjs")

      const before = readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8")

      await expect(
        saveHookToProjectDir(tempDir, {
          event: "FakeEvent",
          type: "command",
          command: "echo",
        }),
      ).rejects.toThrow(/unknown hook event/i)

      const after = readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8")
      expect(after).toBe(before)
    })
  })

  // --- removeHookFromProjectDir ---

  describe("removeHookFromProjectDir", () => {
    it("removes a hook by event and index", async () => {
      const { saveHookToProjectDir, removeHookFromProjectDir } =
        await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 1",
      })
      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 2",
      })

      const result = await removeHookFromProjectDir(tempDir, "PreToolUse", 0)
      expect(result.removed).toBe(true)
      expect(result.filePath).toBe(join(tempDir, ".claude", "settings.json"))

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.PreToolUse).toHaveLength(1)
      expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe("echo 2")
    })

    it("returns removed: false for out-of-bounds index", async () => {
      const { saveHookToProjectDir, removeHookFromProjectDir } =
        await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 1",
      })

      const result = await removeHookFromProjectDir(tempDir, "PreToolUse", 99)
      expect(result.removed).toBe(false)

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.PreToolUse).toHaveLength(1)
    })

    it("returns removed: false for non-existent event", async () => {
      const { removeHookFromProjectDir } = await import("../../lib/api.mjs")

      const result = await removeHookFromProjectDir(tempDir, "FakeEvent", 0)
      expect(result.removed).toBe(false)
    })

    it("cleans up event key when last hook is removed", async () => {
      const { saveHookToProjectDir, removeHookFromProjectDir } =
        await import("../../lib/api.mjs")

      await saveHookToProjectDir(tempDir, {
        event: "PreToolUse",
        type: "command",
        command: "echo 1",
      })

      await removeHookFromProjectDir(tempDir, "PreToolUse", 0)

      const settings = JSON.parse(
        readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8"),
      )
      expect(settings.hooks.PreToolUse).toBeUndefined()
    })

    it("does not modify file when removal fails", async () => {
      const { removeHookFromProjectDir } = await import("../../lib/api.mjs")

      const before = readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8")

      await removeHookFromProjectDir(tempDir, "PreToolUse", 0)

      const after = readFileSync(join(tempDir, ".claude", "settings.json"), "utf-8")
      expect(after).toBe(before)
    })
  })

  // --- End-to-end via ClaudeHooks class ---

  describe("ClaudeHooks class", () => {
    it("exposes getHooks, install, and uninstall methods", async () => {
      const { ClaudeHooks } = await import("../../lib/api.mjs")
      const hooks = new ClaudeHooks(tempDir)

      expect(hooks.getHooks).toBeTypeOf("function")
      expect(hooks.install).toBeTypeOf("function")
      expect(hooks.uninstall).toBeTypeOf("function")
    })

    it("round-trips install, getHooks, and uninstall via class", async () => {
      const { ClaudeHooks } = await import("../../lib/api.mjs")
      const hooks = new ClaudeHooks(tempDir)

      await hooks.install({
        event: "PostToolUse",
        type: "command",
        command: "echo post",
        matcher: "Bash",
      })

      const { hooks: entries } = await hooks.getHooks()
      expect(entries).toHaveLength(1)
      expect(entries[0].eventName).toBe("PostToolUse")

      const { removed } = await hooks.uninstall("PostToolUse", 0)
      expect(removed).toBe(true)

      const after = await hooks.getHooks()
      expect(after.hooks).toHaveLength(0)
    })
  })
})
