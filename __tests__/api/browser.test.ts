import { describe, it, expect } from "vitest"

describe("browser entry point", () => {
  it("exports hookFormBuilder", async () => {
    const mod = await import("../../browser.mjs")
    expect(mod.hookFormBuilder).toBeDefined()
    expect(mod.hookFormBuilder.getHookNames).toBeTypeOf("function")
    expect(mod.hookFormBuilder.getHookDefinition).toBeTypeOf("function")
  })

  it("hookFormBuilder has all 26 hooks registered", async () => {
    const { hookFormBuilder } = await import("../../browser.mjs")
    expect(hookFormBuilder.getHookNames()).toHaveLength(26)
  })

  it("hookFormBuilder.getHookDefinition works", async () => {
    const { hookFormBuilder } = await import("../../browser.mjs")
    const def = hookFormBuilder.getHookDefinition("PreToolUse")
    expect(def).toBeDefined()
    expect(Object.keys(def!)).toContain("command")
    expect(def!.command.settings).toBeDefined()
    expect(def!.command.input).toBeDefined()
    expect(def!.command.output).toBeDefined()
  })

  it("exports HookSchemas", async () => {
    const { HookSchemas } = await import("../../browser.mjs")
    expect(HookSchemas).toBeDefined()
    expect(Object.keys(HookSchemas)).toHaveLength(26)
    expect(HookSchemas.PreToolUse.Input.parse).toBeTypeOf("function")
  })

  it("exports Schemas namespace", async () => {
    const { Schemas } = await import("../../browser.mjs")
    expect(Schemas).toBeDefined()
    expect(Schemas.HookEventNameSchema).toBeDefined()
    expect(Schemas.BaseHookInputSchema).toBeDefined()
    expect(Schemas.BaseHookOutputSchema).toBeDefined()
  })

  it("exports hook metadata", async () => {
    const { HOOK_METADATA, getHookMeta, HOOK_EVENT_NAMES, HANDLER_TYPE_INFO } =
      await import("../../browser.mjs")
    expect(HOOK_METADATA).toBeDefined()
    expect(HOOK_METADATA.length).toBe(26)
    expect(getHookMeta("PreToolUse")).toBeDefined()
    expect(HOOK_EVENT_NAMES.length).toBe(26)
    expect(HANDLER_TYPE_INFO.command).toBeDefined()
  })

  it("exports hook templates", async () => {
    const {
      HOOK_HANDLER_TEMPLATES,
      BASIC_FILE_TEMPLATES,
      generateHookScript,
      getSupportedExtensions,
    } = await import("../../browser.mjs")

    expect(HOOK_HANDLER_TEMPLATES).toBeDefined()
    expect(BASIC_FILE_TEMPLATES).toBeDefined()
    expect(generateHookScript).toBeTypeOf("function")
    expect(getSupportedExtensions).toBeTypeOf("function")
  })

  it("generateHookScript produces TS template with HookHandler", async () => {
    const { generateHookScript } = await import("../../browser.mjs")
    const result = generateHookScript("PreToolUse", ".ts")
    expect(result).toContain("HookHandler")
    expect(result).toContain("PreToolUse")
    expect(result).toContain("import")
  })

  it("generateHookScript produces JS template", async () => {
    const { generateHookScript } = await import("../../browser.mjs")
    const result = generateHookScript("Stop", ".mjs")
    expect(result).toContain("HookHandler")
    expect(result).toContain("Stop")
  })

  it("generateHookScript falls back to basic template for .py", async () => {
    const { generateHookScript } = await import("../../browser.mjs")
    const result = generateHookScript("Stop", ".py")
    expect(result).toContain("import sys")
    expect(result).toContain("json.load")
  })

  it("generateHookScript falls back to basic template for .sh", async () => {
    const { generateHookScript } = await import("../../browser.mjs")
    const result = generateHookScript("Stop", ".sh")
    expect(result).toContain("#!/usr/bin/env bash")
    expect(result).toContain("INPUT=$(cat)")
  })

  it("generateHookScript returns null for unsupported extension", async () => {
    const { generateHookScript } = await import("../../browser.mjs")
    expect(generateHookScript("Stop", ".rb")).toBeNull()
  })

  it("getSupportedExtensions returns all extensions", async () => {
    const { getSupportedExtensions } = await import("../../browser.mjs")
    const exts = getSupportedExtensions()
    expect(exts).toContain(".ts")
    expect(exts).toContain(".mjs")
    expect(exts).toContain(".py")
    expect(exts).toContain(".sh")
    expect(exts).toContain(".cjs")
  })

  it("exports ClaudeMd", async () => {
    const { ClaudeMd } = await import("../../browser.mjs")
    expect(ClaudeMd).toBeDefined()
    const md = new ClaudeMd("---\nname: test\n---\nbody")
    expect(md.frontmatter.name).toBe("test")
    expect(md.content).toBe("body")
  })

  it("exports HOOK_DOCS_MAP", async () => {
    const { HOOK_DOCS_MAP } = await import("../../browser.mjs")
    expect(HOOK_DOCS_MAP).toBeDefined()
    expect(HOOK_DOCS_MAP.PreToolUse).toContain("PreToolUse")
  })

  it("exports hooks-store utilities", async () => {
    const { getHooksObject, addHook, removeHook, listHooks } =
      await import("../../browser.mjs")
    expect(getHooksObject).toBeTypeOf("function")
    expect(addHook).toBeTypeOf("function")
    expect(removeHook).toBeTypeOf("function")
    expect(listHooks).toBeTypeOf("function")
  })

  it("does NOT export Node-only modules", async () => {
    const mod = await import("../../browser.mjs") as any
    // These should NOT be in the browser entry point
    expect(mod.ClaudeProject).toBeUndefined()
    expect(mod.HookHandler).toBeUndefined()
    expect(mod.getSettingsPath).toBeUndefined()
    expect(mod.readSettings).toBeUndefined()
    expect(mod.writeSettings).toBeUndefined()
    expect(mod.installHook).toBeUndefined()
    expect(mod.uninstallHook).toBeUndefined()
    expect(mod.resolveCommand).toBeUndefined()
    expect(mod.testHook).toBeUndefined()
    expect(mod.buildSyntheticInput).toBeUndefined()
    expect(mod.discoverSkills).toBeUndefined()
  })
})
