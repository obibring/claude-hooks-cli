import { describe, it, expect } from "vitest"
import { z } from "zod/v4"

describe("ClaudeMd", () => {
  // --- Basic parsing ---

  it("parses frontmatter and content from a standard CLAUDE.md", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd(
      "---\nname: my-project\ndescription: A test project\n---\n# Hello\n\nBody text.",
    )
    expect(md.frontmatter.name).toBe("my-project")
    expect(md.frontmatter.description).toBe("A test project")
    expect(md.content).toBe("# Hello\n\nBody text.")
  })

  it("returns empty frontmatter when no delimiters", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("# Just markdown\nNo frontmatter.")
    expect(md.frontmatter).toEqual({})
    expect(md.content).toBe("# Just markdown\nNo frontmatter.")
  })

  it("returns empty frontmatter when only opening delimiter", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\nname: test\nno closing delimiter")
    expect(md.frontmatter).toEqual({})
  })

  it("handles empty file", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("")
    expect(md.frontmatter).toEqual({})
    expect(md.content).toBe("")
  })

  it("handles frontmatter with no body", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\nname: test\n---\n")
    expect(md.frontmatter.name).toBe("test")
    expect(md.content).toBe("")
  })

  it("handles empty frontmatter block", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\n---\n# Body")
    expect(md.frontmatter).toEqual({})
    expect(md.content).toBe("# Body")
  })

  // --- Value types ---

  it("parses boolean true values", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\nenabled: true\n---\nbody")
    expect(md.frontmatter.enabled).toBe(true)
  })

  it("parses boolean false values", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\ndisabled: false\n---\nbody")
    expect(md.frontmatter.disabled).toBe(false)
  })

  it("keeps non-boolean strings as strings", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\nname: true-ish\n---\nbody")
    expect(md.frontmatter.name).toBe("true-ish")
  })

  it("handles multiline values with indentation", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd(
      "---\ndescription:\n  This is a long\n  description\n---\nbody",
    )
    expect(md.frontmatter.description).toBe("This is a long\ndescription")
  })

  it("handles hyphenated keys", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd(
      "---\ndisable-model-invocation: true\nargument-hint: [filename]\n---\nbody",
    )
    expect(md.frontmatter["disable-model-invocation"]).toBe(true)
    expect(md.frontmatter["argument-hint"]).toBe("[filename]")
  })

  // --- Properties ---

  it("raw returns the original string", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const contents = "---\nname: test\n---\nbody"
    const md = new ClaudeMd(contents)
    expect(md.raw).toBe(contents)
  })

  it("hasFrontmatter returns true when delimiters exist", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    expect(new ClaudeMd("---\nname: test\n---\nbody").hasFrontmatter).toBe(
      true,
    )
  })

  it("hasFrontmatter returns false when no delimiters", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    expect(new ClaudeMd("# Just markdown").hasFrontmatter).toBe(false)
  })

  it("hasFrontmatter returns false for empty string", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    expect(new ClaudeMd("").hasFrontmatter).toBe(false)
  })

  // --- Lazy parsing ---

  it("does not parse until frontmatter or content is accessed", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    // Should not throw even with an invalid schema, because parsing is lazy
    const schema = z.object({ required_field: z.string() })
    const md = new ClaudeMd("---\nname: test\n---\nbody", schema)
    // No error yet — accessing raw doesn't trigger parsing
    expect(md.raw).toBe("---\nname: test\n---\nbody")
    expect(md.hasFrontmatter).toBe(true)
    // NOW it should throw when we access frontmatter
    expect(() => md.frontmatter).toThrow()
  })

  // --- Zod schema validation ---

  it("validates frontmatter against a Zod schema", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      name: z.string(),
      version: z.string(),
    })
    const md = new ClaudeMd(
      "---\nname: my-project\nversion: 1.0.0\n---\nbody",
      schema,
    )
    expect(md.frontmatter.name).toBe("my-project")
    expect(md.frontmatter.version).toBe("1.0.0")
  })

  it("throws ZodError when frontmatter fails schema validation", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      name: z.string(),
      required_field: z.string(),
    })
    const md = new ClaudeMd("---\nname: test\n---\nbody", schema)
    expect(() => md.frontmatter).toThrow()
  })

  it("schema validates boolean fields correctly", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      name: z.string(),
      enabled: z.boolean(),
    })
    const md = new ClaudeMd("---\nname: test\nenabled: true\n---\nbody", schema)
    expect(md.frontmatter.enabled).toBe(true)
  })

  it("schema with optional fields passes when fields are absent", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      name: z.string(),
      optional_field: z.string().optional(),
    })
    const md = new ClaudeMd("---\nname: test\n---\nbody", schema)
    expect(md.frontmatter.name).toBe("test")
    expect(md.frontmatter.optional_field).toBeUndefined()
  })

  it("schema with enum validates correctly", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      model: z.enum(["opus", "sonnet", "haiku"]),
    })
    const md = new ClaudeMd("---\nmodel: opus\n---\nbody", schema)
    expect(md.frontmatter.model).toBe("opus")
  })

  it("schema with enum rejects invalid values", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      model: z.enum(["opus", "sonnet", "haiku"]),
    })
    const md = new ClaudeMd("---\nmodel: gpt-4\n---\nbody", schema)
    expect(() => md.frontmatter).toThrow()
  })

  // --- Caching ---

  it("caches parsed result across multiple accesses", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const md = new ClaudeMd("---\nname: test\n---\nbody")
    const fm1 = md.frontmatter
    const fm2 = md.frontmatter
    expect(fm1).toBe(fm2) // same reference
    const c1 = md.content
    const c2 = md.content
    expect(c1).toBe(c2)
  })

  // --- Constructor validation ---

  it("throws when contents is not a string", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    expect(() => new ClaudeMd(123 as any)).toThrow(/must be a string/)
  })

  it("throws when contents is null", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    expect(() => new ClaudeMd(null as any)).toThrow(/must be a string/)
  })

  // --- Real-world CLAUDE.md ---

  it("parses a realistic CLAUDE.md file", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const contents = [
      "---",
      "name: my-skill",
      "description: Use when the user asks about X",
      "model: opus[1m]",
      "disable-model-invocation: true",
      "user-invocable: false",
      "---",
      "",
      "# My Skill",
      "",
      "## Instructions",
      "",
      "Do the thing.",
    ].join("\n")

    const md = new ClaudeMd(contents)
    expect(md.frontmatter.name).toBe("my-skill")
    expect(md.frontmatter.description).toBe(
      "Use when the user asks about X",
    )
    expect(md.frontmatter.model).toBe("opus[1m]")
    expect(md.frontmatter["disable-model-invocation"]).toBe(true)
    expect(md.frontmatter["user-invocable"]).toBe(false)
    expect(md.content).toContain("# My Skill")
    expect(md.content).toContain("Do the thing.")
  })

  it("parses a realistic CLAUDE.md with Zod validation", async () => {
    const { ClaudeMd } = await import("../../lib/claude-md.mjs")
    const schema = z.object({
      name: z.string(),
      description: z.string(),
      model: z.string().optional(),
      "disable-model-invocation": z.boolean().optional(),
      "user-invocable": z.boolean().optional(),
    })

    const contents = [
      "---",
      "name: my-skill",
      "description: A great skill",
      "model: opus",
      "disable-model-invocation: true",
      "---",
      "# Body",
    ].join("\n")

    const md = new ClaudeMd(contents, schema)
    expect(md.frontmatter.name).toBe("my-skill")
    expect(md.frontmatter["disable-model-invocation"]).toBe(true)
  })

  // --- Exports ---

  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.ClaudeMd).toBeDefined()
    expect(mod.ClaudeMd).toBeTypeOf("function")
  })

  it("can be instantiated from the package root export", async () => {
    const { ClaudeMd } = await import("../../index.mjs")
    const md = new ClaudeMd("---\nname: test\n---\nbody")
    expect(md.frontmatter.name).toBe("test")
  })
})
