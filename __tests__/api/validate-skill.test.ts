import { describe, it, expect } from "vitest"

describe("validateSkillFrontmatter", () => {
  it("returns success for valid frontmatter with name and description", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "A useful skill",
    })
    expect(result.success).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.warnings).toEqual({})
  })

  it("returns error when name is missing", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      description: "A useful skill",
    })
    expect(result.success).toBe(false)
    expect(result.errors.name).toBe("missing")
  })

  it("returns error when description is missing", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
    })
    expect(result.success).toBe(false)
    expect(result.errors.description).toBe("missing")
  })

  it("returns errors for both missing name and description", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({})
    expect(result.success).toBe(false)
    expect(result.errors.name).toBe("missing")
    expect(result.errors.description).toBe("missing")
  })

  it("returns warning for unrecognized keys", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      "custom-field": "value",
      "another-unknown": "thing",
    })
    expect(result.success).toBe(true)
    expect(Object.keys(result.warnings)).toHaveLength(2)
    expect(result.warnings["custom-field"]).toContain("not recognized")
    expect(result.warnings["custom-field"]).toContain("extraProperties")
    expect(result.warnings["another-unknown"]).toContain("not recognized")
  })

  it("suppresses warnings for keys listed in extraProperties", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter(
      {
        name: "my-skill",
        description: "desc",
        "custom-field": "value",
        "another-unknown": "thing",
      },
      { extraProperties: ["custom-field"] },
    )
    expect(result.success).toBe(true)
    expect(Object.keys(result.warnings)).toHaveLength(1)
    expect(result.warnings["custom-field"]).toBeUndefined()
    expect(result.warnings["another-unknown"]).toContain("not recognized")
  })

  it("suppresses all warnings when all extra keys are listed", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter(
      {
        name: "my-skill",
        description: "desc",
        "custom-field": "value",
      },
      { extraProperties: ["custom-field"] },
    )
    expect(result.success).toBe(true)
    expect(result.warnings).toEqual({})
  })

  it("does not warn for known optional fields", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      "disable-model-invocation": true,
      "argument-hint": "[issue-number]",
      "user-invocable": false,
      "allowed-tools": "Read,Edit",
      effort: "high",
      model: "opus",
      context: "fork",
      agent: "Explore",
      license: "MIT",
    })
    expect(result.success).toBe(true)
    expect(result.warnings).toEqual({})
    expect(result.errors).toEqual({})
  })

  it("returns error for invalid effort enum value", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      effort: "extreme",
    })
    expect(result.success).toBe(false)
    expect(result.errors.effort).toBeDefined()
  })

  it("returns error for invalid model enum value", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      model: "gpt-4",
    })
    expect(result.success).toBe(false)
    expect(result.errors.model).toBeDefined()
  })

  it("returns error for invalid context enum value", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      context: "inline",
    })
    expect(result.success).toBe(false)
    expect(result.errors.context).toBeDefined()
  })

  it("can have both errors and warnings simultaneously", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      "custom-field": "value",
    })
    expect(result.success).toBe(false)
    expect(result.errors.name).toBe("missing")
    expect(result.errors.description).toBe("missing")
    expect(result.warnings["custom-field"]).toContain("not recognized")
  })

  it("warnings do not affect success status", async () => {
    const { validateSkillFrontmatter } = await import("../../lib/skills.mjs")
    const result = validateSkillFrontmatter({
      name: "my-skill",
      description: "desc",
      "my-custom": "val",
    })
    expect(result.success).toBe(true)
    expect(Object.keys(result.warnings).length).toBeGreaterThan(0)
  })
})

describe("SkillFrontmatterSchema", () => {
  it("is exported from skills module", async () => {
    const { SkillFrontmatterSchema } = await import("../../lib/skills.mjs")
    expect(SkillFrontmatterSchema).toBeDefined()
    expect(SkillFrontmatterSchema.parse).toBeTypeOf("function")
  })

  it("validates a complete frontmatter object", async () => {
    const { SkillFrontmatterSchema } = await import("../../lib/skills.mjs")
    const result = SkillFrontmatterSchema.safeParse({
      name: "test",
      description: "A test skill",
      model: "opus[1m]",
    })
    expect(result.success).toBe(true)
  })

  it("fails for missing required name", async () => {
    const { SkillFrontmatterSchema } = await import("../../lib/skills.mjs")
    const result = SkillFrontmatterSchema.safeParse({
      description: "desc",
    })
    expect(result.success).toBe(false)
  })

  it("is accessible on ClaudeProject instances and class", async () => {
    const { ClaudeProject } = await import("../../lib/api.mjs")
    const { tmpdir } = await import("node:os")
    const hooks = new ClaudeProject(tmpdir())
    expect(hooks.validateSkillFrontmatter).toBeTypeOf("function")
    expect(ClaudeProject.SkillFrontmatterSchema).toBeDefined()
  })

  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.validateSkillFrontmatter).toBeTypeOf("function")
    expect(mod.SkillFrontmatterSchema).toBeDefined()
  })
})
