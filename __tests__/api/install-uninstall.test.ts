import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { execSync } from "node:child_process"

describe("installHook / uninstallHook", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cch-test-${Date.now()}`)
    mkdirSync(join(tempDir, ".claude"), { recursive: true })
    writeFileSync(join(tempDir, ".claude", "settings.json"), JSON.stringify({}, null, 2))
    // Initialize a git repo so getSettingsPath("project") resolves correctly
    execSync("git init", { cwd: tempDir })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("installs a hook and reads it back", async () => {
    const { installHook } = await import("../../lib/api.mjs")

    // Use direct file path instead of scope to avoid git root detection
    const filePath = join(tempDir, ".claude", "settings.json")
    const result = await installHook(
      {
        event: "PreToolUse",
        type: "command",
        command: 'echo "test"',
        matcher: "Bash",
      },
      { filePath },
    )

    expect(result.filePath).toBe(filePath)
    expect(result.eventName).toBe("PreToolUse")

    // Verify it was written
    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe('echo "test"')
  })

  it("uninstalls a hook by event and index", async () => {
    const { installHook, uninstallHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 1" },
      { filePath },
    )
    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 2" },
      { filePath },
    )

    const result = await uninstallHook("PreToolUse", 0, { filePath })
    expect(result.removed).toBe(true)

    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe("echo 2")
  })

  it("out-of-bounds index returns removed: false", async () => {
    const { installHook, uninstallHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 1" },
      { filePath },
    )

    const result = await uninstallHook("PreToolUse", 99, { filePath })
    expect(result.removed).toBe(false)

    // Verify the hook is still there
    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
  })

  it("non-existent event returns removed: false", async () => {
    const { uninstallHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")

    const result = await uninstallHook("FakeEvent", 0, { filePath })
    expect(result.removed).toBe(false)
  })

  it("removing last hook cleans up event key", async () => {
    const { installHook, uninstallHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 1" },
      { filePath },
    )

    await uninstallHook("PreToolUse", 0, { filePath })

    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toBeUndefined()
  })

  it("install preserves existing settings keys", async () => {
    const { installHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")
    writeFileSync(filePath, JSON.stringify({ permissions: { allow: ["Edit"] } }, null, 2))

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo test" },
      { filePath },
    )

    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks).toBeDefined()
    expect(settings.permissions).toEqual({ allow: ["Edit"] })
  })

  it("install when settings file does not exist", async () => {
    const { installHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")
    rmSync(filePath, { force: true })

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo test" },
      { filePath },
    )

    expect(existsSync(filePath)).toBe(true)
    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
  })

  it("invalid options throw before file I/O", async () => {
    const { installHook } = await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")
    const before = readFileSync(filePath, "utf-8")

    await expect(
      installHook({ event: "FakeEvent", type: "command", command: "echo" }, { filePath }),
    ).rejects.toThrow()

    // Verify the file was NOT modified
    const after = readFileSync(filePath, "utf-8")
    expect(after).toBe(before)
  })
})
