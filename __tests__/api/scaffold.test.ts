import { describe, it, expect, afterEach } from "vitest"
import { existsSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("scaffoldHookFile", () => {
  const files: string[] = []

  afterEach(() => {
    for (const f of files) {
      if (existsSync(f)) rmSync(f, { recursive: true, force: true })
    }
    files.length = 0
  })

  it("creates a TypeScript hook file with HookHandler template", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.ts`)
    files.push(filePath)

    const result = await scaffoldHookFile({
      event: "PreToolUse",
      filePath,
    })

    expect(result.created).toBe(true)
    expect(result.runnerCommand).toContain("npx")
    expect(result.runnerCommand).toContain("tsx")
    expect(existsSync(filePath)).toBe(true)

    const content = readFileSync(filePath, "utf-8")
    expect(content).toContain("HookHandler")
    expect(content).toContain("PreToolUse")
  })

  it("creates a JavaScript hook file", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.mjs`)
    files.push(filePath)

    const result = await scaffoldHookFile({
      event: "PostToolUse",
      filePath,
    })

    expect(result.created).toBe(true)
    expect(result.runnerCommand).toContain("node")
  })

  it("returns created: false if file already exists", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.ts`)
    files.push(filePath)

    // Create first
    await scaffoldHookFile({ event: "PreToolUse", filePath })
    // Try again
    const result = await scaffoldHookFile({ event: "PreToolUse", filePath })
    expect(result.created).toBe(false)
    expect(result.runnerCommand).toBeDefined()
  })

  it("overwrite: true replaces existing file", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.ts`)
    files.push(filePath)

    // Create first
    await scaffoldHookFile({ event: "PostToolUse", filePath })
    // Overwrite with a different event
    const result = await scaffoldHookFile({
      event: "PreToolUse",
      filePath,
      overwrite: true,
    })
    expect(result.created).toBe(true)

    const content = readFileSync(filePath, "utf-8")
    expect(content).toContain("PreToolUse")
  })

  it("Python extension", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.py`)
    files.push(filePath)

    const result = await scaffoldHookFile({ event: "PreToolUse", filePath })
    expect(result.runnerCommand).toContain("python3")
    expect(existsSync(filePath)).toBe(true)
  })

  it("Shell extension", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.sh`)
    files.push(filePath)

    const result = await scaffoldHookFile({ event: "PreToolUse", filePath })
    expect(result.runnerCommand).toContain("bash")
    expect(existsSync(filePath)).toBe(true)
  })

  it("No extension throws", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-no-ext`)

    await expect(scaffoldHookFile({ event: "PreToolUse", filePath })).rejects.toThrow(
      /extension/i,
    )
  })

  it("Parent directory created", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const topDir = join(tmpdir(), `cch-deep-${Date.now()}`)
    const filePath = join(topDir, "sub", "hook.ts")
    // Track the top-level dir for cleanup
    files.push(topDir)

    const result = await scaffoldHookFile({ event: "PreToolUse", filePath })
    expect(result.created).toBe(true)
    expect(existsSync(filePath)).toBe(true)
  })
})
