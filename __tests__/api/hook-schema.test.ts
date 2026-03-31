import { describe, it, expect } from "vitest"

// Import hooks to trigger registrations
import "../../hooks/index.mjs"

describe("hookFormBuilder", () => {
  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.hookFormBuilder).toBeDefined()
  })

  it("has getHookNames and getHookDefinition methods", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    expect(hookFormBuilder.getHookNames).toBeTypeOf("function")
    expect(hookFormBuilder.getHookDefinition).toBeTypeOf("function")
    expect(hookFormBuilder.addHookType).toBeTypeOf("function")
  })

  it("getHookNames returns all 26 hook events", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    expect(hookFormBuilder.getHookNames()).toHaveLength(26)
  })

  it("getHookDefinition returns handler types for PreToolUse", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const def = hookFormBuilder.getHookDefinition("PreToolUse")!
    const types = Object.keys(def)
    expect(types).toContain("command")
    expect(types).toContain("prompt")
    expect(types).toContain("agent")
    expect(types).toContain("http")
  })

  it("getHookDefinition returns undefined for unknown hook", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    expect(hookFormBuilder.getHookDefinition("FakeHook")).toBeUndefined()
  })

  it("SessionStart has only command handler type", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const def = hookFormBuilder.getHookDefinition("SessionStart")!
    expect(Object.keys(def)).toEqual(["command"])
  })

  it("each handler type has settings, input, and output", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    for (const hookName of hookFormBuilder.getHookNames()) {
      const def = hookFormBuilder.getHookDefinition(hookName)!
      for (const [handlerType, typeDef] of Object.entries(def)) {
        expect(typeDef.settings).toBeDefined()
        expect(typeDef.input).toBeDefined()
        expect(typeDef.output).toBeDefined()
      }
    }
  })

  it("field definitions have type and description", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const def = hookFormBuilder.getHookDefinition("PreToolUse")!
    for (const [key, field] of Object.entries(def.command.settings) as any) {
      expect(field.type).toBeTypeOf("string")
      expect(field.description).toBeTypeOf("string")
      expect(["string", "number", "boolean", "object", "array", "enum"]).toContain(
        field.type,
      )
    }
  })

  it("command handler has required command field in settings", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("PreToolUse")!.command
      .settings as any
    expect(settings.command).toBeDefined()
    expect(settings.command.type).toBe("string")
    expect(settings.command.required).toBe(true)
  })

  it("prompt handler has required prompt field in settings", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("PreToolUse")!.prompt
      .settings as any
    expect(settings.prompt).toBeDefined()
    expect(settings.prompt.type).toBe("string")
    expect(settings.prompt.required).toBe(true)
  })

  it("http handler has required url field in settings", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("PreToolUse")!.http.settings as any
    expect(settings.url).toBeDefined()
    expect(settings.url.type).toBe("string")
    expect(settings.url.required).toBe(true)
  })

  it("tool events have tool_name and tool_input in input", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    for (const hookName of [
      "PreToolUse",
      "PostToolUse",
      "PostToolUseFailure",
      "PermissionRequest",
    ]) {
      const input = hookFormBuilder.getHookDefinition(hookName)!.command.input as any
      expect(input.tool_name).toBeDefined()
      expect(input.tool_input).toBeDefined()
    }
  })

  it("base input fields are present on all hooks", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    for (const hookName of hookFormBuilder.getHookNames()) {
      const def = hookFormBuilder.getHookDefinition(hookName)!
      const firstType = Object.keys(def)[0]
      const input = def[firstType].input as any
      expect(input.hook_event_name).toBeDefined()
      expect(input.session_id).toBeDefined()
      expect(input.cwd).toBeDefined()
      expect(input.permission_mode).toBeDefined()
    }
  })

  it("base output fields are present on all hooks", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    for (const hookName of hookFormBuilder.getHookNames()) {
      const def = hookFormBuilder.getHookDefinition(hookName)!
      const firstType = Object.keys(def)[0]
      const output = def[firstType].output as any
      expect(output.continue).toBeDefined()
      expect(output.additionalContext).toBeDefined()
    }
  })

  it("PreToolUse output has hookSpecificOutput with nested fields", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const output = hookFormBuilder.getHookDefinition("PreToolUse")!.command.output as any
    expect(output.hookSpecificOutput).toBeDefined()
    expect(output.hookSpecificOutput.type).toBe("object")
    expect(output.hookSpecificOutput.fields).toBeDefined()
    expect(output.hookSpecificOutput.fields.permissionDecision).toBeDefined()
  })

  it("enum fields have values array and strict flag", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const pm = hookFormBuilder.getHookDefinition("PreToolUse")!.command.input as any
    expect(pm.permission_mode.type).toBe("enum")
    expect(pm.permission_mode.values).toContain("default")
    expect(pm.permission_mode.values).toContain("bypassPermissions")
    expect(pm.permission_mode.strict).toBe(true)
  })

  it("PreToolUse permissionDecision is an enum", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const output = hookFormBuilder.getHookDefinition("PreToolUse")!.command.output as any
    const pd = output.hookSpecificOutput.fields.permissionDecision
    expect(pd.type).toBe("enum")
    expect(pd.values).toEqual(["allow", "deny", "ask"])
    expect(pd.strict).toBe(true)
  })

  it("Stop output has decision field as enum", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const output = hookFormBuilder.getHookDefinition("Stop")!.command.output as any
    expect(output.decision).toBeDefined()
    expect(output.decision.type).toBe("enum")
    expect(output.decision.values).toEqual(["block"])
    expect(output.decision.strict).toBe(true)
  })

  it("SessionStart has once in command settings", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("SessionStart")!.command
      .settings as any
    expect(settings.once).toBeDefined()
    expect(settings.once.type).toBe("boolean")
  })

  it("fields have schema property for Zod validation", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("PreToolUse")!.command
      .settings as any
    expect(settings.command.schema).toBeDefined()
    expect(settings.command.schema.parse).toBeTypeOf("function")

    // Schema validates correctly
    expect(() => settings.command.schema.parse("echo test")).not.toThrow()
  })

  it("enum fields have working Zod schema", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const input = hookFormBuilder.getHookDefinition("PreToolUse")!.command.input as any
    const pm = input.permission_mode
    expect(pm.schema).toBeDefined()
    expect(() => pm.schema.parse("default")).not.toThrow()
    expect(() => pm.schema.parse("invalid")).toThrow()
  })

  it("FileChanged has required matcher in settings", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const settings = hookFormBuilder.getHookDefinition("FileChanged")!.command
      .settings as any
    expect(settings.matcher).toBeDefined()
    expect(settings.matcher.required).toBe(true)
  })

  it("UserPromptSubmit output has prompt field", async () => {
    const { hookFormBuilder } = await import("../../lib/hook-form-builder.mjs")
    const output = hookFormBuilder.getHookDefinition("UserPromptSubmit")!.command
      .output as any
    expect(output.prompt).toBeDefined()
    expect(output.prompt.type).toBe("string")
  })
})
