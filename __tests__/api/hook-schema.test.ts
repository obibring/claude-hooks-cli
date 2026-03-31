import { describe, it, expect } from "vitest"

describe("HOOK_SCHEMA_MAP", () => {
  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HOOK_SCHEMA_MAP).toBeDefined()
    expect(typeof mod.HOOK_SCHEMA_MAP).toBe("object")
  })

  it("contains all 26 hook events", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    expect(Object.keys(HOOK_SCHEMA_MAP)).toHaveLength(26)
  })

  it("PreToolUse has all 4 handler types", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const types = Object.keys(HOOK_SCHEMA_MAP.PreToolUse)
    expect(types).toContain("command")
    expect(types).toContain("prompt")
    expect(types).toContain("agent")
    expect(types).toContain("http")
  })

  it("SessionStart has only command handler type", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const types = Object.keys(HOOK_SCHEMA_MAP.SessionStart)
    expect(types).toEqual(["command"])
  })

  it("each handler type has settings, input, and output", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    for (const [hookName, handlerTypes] of Object.entries(HOOK_SCHEMA_MAP)) {
      for (const [handlerType, def] of Object.entries(
        handlerTypes as Record<string, any>,
      )) {
        expect(def.settings).toBeDefined()
        expect(def.input).toBeDefined()
        expect(def.output).toBeDefined()
        expect(typeof def.settings).toBe("object")
        expect(typeof def.input).toBe("object")
        expect(typeof def.output).toBe("object")
      }
    }
  })

  it("field definitions have type and description", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const commandSettings = HOOK_SCHEMA_MAP.PreToolUse.command.settings as Record<
      string,
      any
    >
    for (const [key, field] of Object.entries(commandSettings)) {
      expect(field.type).toBeTypeOf("string")
      expect(field.description).toBeTypeOf("string")
      expect(["string", "number", "boolean", "object", "array", "enum"]).toContain(
        field.type,
      )
    }
  })

  it("command handler has required command field in settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.PreToolUse.command.settings as Record<string, any>
    expect(settings.command).toBeDefined()
    expect(settings.command.type).toBe("string")
    expect(settings.command.required).toBe(true)
  })

  it("prompt handler has required prompt field in settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.PreToolUse.prompt.settings as Record<string, any>
    expect(settings.prompt).toBeDefined()
    expect(settings.prompt.type).toBe("string")
    expect(settings.prompt.required).toBe(true)
  })

  it("http handler has required url field in settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.PreToolUse.http.settings as Record<string, any>
    expect(settings.url).toBeDefined()
    expect(settings.url.type).toBe("string")
    expect(settings.url.required).toBe(true)
  })

  it("tool events have tool_name and tool_input in input", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    for (const hookName of [
      "PreToolUse",
      "PostToolUse",
      "PostToolUseFailure",
      "PermissionRequest",
    ]) {
      const input = (HOOK_SCHEMA_MAP as any)[hookName].command.input
      expect(input.tool_name).toBeDefined()
      expect(input.tool_input).toBeDefined()
    }
  })

  it("base input fields are present on all hooks", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    for (const [hookName, handlerTypes] of Object.entries(HOOK_SCHEMA_MAP)) {
      const firstType = Object.keys(handlerTypes as any)[0]
      const input = (handlerTypes as any)[firstType].input
      expect(input.hook_event_name).toBeDefined()
      expect(input.session_id).toBeDefined()
      expect(input.cwd).toBeDefined()
      expect(input.permission_mode).toBeDefined()
    }
  })

  it("base output fields are present on all hooks", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    for (const [hookName, handlerTypes] of Object.entries(HOOK_SCHEMA_MAP)) {
      const firstType = Object.keys(handlerTypes as any)[0]
      const output = (handlerTypes as any)[firstType].output
      expect(output.continue).toBeDefined()
      expect(output.additionalContext).toBeDefined()
    }
  })

  it("PreToolUse output has hookSpecificOutput with nested fields", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const output = HOOK_SCHEMA_MAP.PreToolUse.command.output as Record<string, any>
    expect(output.hookSpecificOutput).toBeDefined()
    expect(output.hookSpecificOutput.type).toBe("object")
    expect(output.hookSpecificOutput.fields).toBeDefined()
    expect(output.hookSpecificOutput.fields.permissionDecision).toBeDefined()
  })

  it("enum fields have values array and strict flag", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const pm = HOOK_SCHEMA_MAP.PreToolUse.command.input as Record<string, any>
    expect(pm.permission_mode.type).toBe("enum")
    expect(pm.permission_mode.values).toContain("default")
    expect(pm.permission_mode.values).toContain("bypassPermissions")
    expect(pm.permission_mode.strict).toBe(true)
  })

  it("PreToolUse permissionDecision is an enum", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const output = HOOK_SCHEMA_MAP.PreToolUse.command.output as Record<string, any>
    const pd = output.hookSpecificOutput.fields.permissionDecision
    expect(pd.type).toBe("enum")
    expect(pd.values).toEqual(["allow", "deny", "ask"])
    expect(pd.strict).toBe(true)
  })

  it("Stop output has decision field as enum", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const output = HOOK_SCHEMA_MAP.Stop.command.output as Record<string, any>
    expect(output.decision).toBeDefined()
    expect(output.decision.type).toBe("enum")
    expect(output.decision.values).toEqual(["block"])
    expect(output.decision.strict).toBe(true)
  })

  it("SessionStart has once in command settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.SessionStart.command.settings as Record<string, any>
    expect(settings.once).toBeDefined()
    expect(settings.once.type).toBe("boolean")
  })

  it("tool event hooks have if in settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.PreToolUse.command.settings as Record<string, any>
    expect(settings.if).toBeDefined()
    expect(settings.if.type).toBe("string")
  })

  it("FileChanged has required matcher in settings", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const settings = HOOK_SCHEMA_MAP.FileChanged.command.settings as Record<string, any>
    expect(settings.matcher).toBeDefined()
    expect(settings.matcher.required).toBe(true)
  })

  it("UserPromptSubmit output has prompt field", async () => {
    const { HOOK_SCHEMA_MAP } = await import("../../lib/hook-schema-map.mjs")
    const output = HOOK_SCHEMA_MAP.UserPromptSubmit.command.output as Record<string, any>
    expect(output.prompt).toBeDefined()
    expect(output.prompt.type).toBe("string")
  })
})

describe("hookSchemaBuilder", () => {
  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.hookSchemaBuilder).toBeDefined()
  })

  it("has addHookType and build methods", async () => {
    const { hookSchemaBuilder } = await import("../../lib/hook-schema-builder.mjs")
    expect(hookSchemaBuilder.addHookType).toBeTypeOf("function")
    expect(hookSchemaBuilder.build).toBeTypeOf("function")
  })

  it("build returns registered hooks after importing registrations", async () => {
    await import("../../hooks/index.mjs")
    const { hookSchemaBuilder } = await import("../../lib/hook-schema-builder.mjs")
    const result = hookSchemaBuilder.build()
    expect(Object.keys(result).length).toBe(26)
  })
})
