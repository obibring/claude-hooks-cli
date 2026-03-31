import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

// Helper to create a skill directory with SKILL.md and optional references
function createSkill(
  skillsDir: string,
  name: string,
  frontmatter: Record<string, string>,
  body: string,
  references?: Record<string, string>,
) {
  const skillDir = join(skillsDir, name)
  mkdirSync(skillDir, { recursive: true })

  const fmLines = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")
  const content = `---\n${fmLines}\n---\n${body}`
  writeFileSync(join(skillDir, "SKILL.md"), content)

  if (references) {
    for (const [refPath, refContent] of Object.entries(references)) {
      const fullPath = join(skillDir, refPath)
      mkdirSync(join(fullPath, ".."), { recursive: true })
      writeFileSync(fullPath, refContent)
    }
  }
}

describe("parseFrontmatter", () => {
  it("parses simple key-value frontmatter", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      "---\nname: my-skill\ndescription: A test skill\n---\n# Content here",
    )
    expect(result.frontmatter.name).toBe("my-skill")
    expect(result.frontmatter.description).toBe("A test skill")
    expect(result.contents).toBe("# Content here")
  })

  it("handles multiline values with indentation", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      "---\nname: my-skill\ndescription:\n  This is a long\n  description\n---\nbody",
    )
    expect(result.frontmatter.description).toBe("This is a long\ndescription")
  })

  it("returns empty frontmatter when no delimiters", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter("# Just markdown\nNo frontmatter here")
    expect(result.frontmatter).toEqual({})
    expect(result.contents).toBe("# Just markdown\nNo frontmatter here")
  })

  it("returns empty frontmatter when only opening delimiter", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter("---\nname: test\nbody text")
    expect(result.frontmatter).toEqual({})
  })

  it("handles model and license fields", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      "---\nname: test\nmodel: opus[1m]\nlicense: MIT\n---\ncontent",
    )
    expect(result.frontmatter.model).toBe("opus[1m]")
    expect(result.frontmatter.license).toBe("MIT")
  })

  it("strips leading newline from contents", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter("---\nname: test\n---\n\n# Title")
    expect(result.contents).toBe("\n# Title")
  })

  it("parses disable-model-invocation as boolean true", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      "---\nname: test\ndisable-model-invocation: true\n---\nbody",
    )
    expect(result.frontmatter["disable-model-invocation"]).toBe(true)
  })

  it("parses disable-model-invocation as boolean false", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      "---\nname: test\ndisable-model-invocation: false\n---\nbody",
    )
    expect(result.frontmatter["disable-model-invocation"]).toBe(false)
  })

  it("parses user-invocable as boolean", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter("---\nname: test\nuser-invocable: false\n---\nbody")
    expect(result.frontmatter["user-invocable"]).toBe(false)
  })

  it("parses all known skill frontmatter fields", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter(
      [
        "---",
        "name: my-skill",
        "description: A great skill",
        "disable-model-invocation: true",
        "argument-hint: [issue-number]",
        "user-invocable: false",
        "allowed-tools: Read,Edit,Grep",
        "effort: high",
        "model: opus[1m]",
        "context: fork",
        "agent: Explore",
        "---",
        "# Body",
      ].join("\n"),
    )
    expect(result.frontmatter.name).toBe("my-skill")
    expect(result.frontmatter.description).toBe("A great skill")
    expect(result.frontmatter["disable-model-invocation"]).toBe(true)
    expect(result.frontmatter["argument-hint"]).toBe("[issue-number]")
    expect(result.frontmatter["user-invocable"]).toBe(false)
    expect(result.frontmatter["allowed-tools"]).toBe("Read,Edit,Grep")
    expect(result.frontmatter.effort).toBe("high")
    expect(result.frontmatter.model).toBe("opus[1m]")
    expect(result.frontmatter.context).toBe("fork")
    expect(result.frontmatter.agent).toBe("Explore")
  })

  it("keeps non-boolean fields as strings even if they look boolean", async () => {
    const { parseFrontmatter } = await import("../../lib/skills.mjs")
    const result = parseFrontmatter("---\nname: true\ndescription: false\n---\nbody")
    expect(result.frontmatter.name).toBe("true")
    expect(result.frontmatter.description).toBe("false")
  })
})

describe("discoverSkills", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cch-skills-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("discovers skills from a project .claude/skills/ directory", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "my-hook",
      { name: "my-hook", description: "A test hook skill" },
      "# My Hook\n\nDoes things.",
    )

    const result = discoverSkills(tempDir)
    const skills = Object.values(result)
    const myHook = skills.find((s) => s.name === "my-hook")

    expect(myHook).toBeDefined()
    expect(myHook!.path).toBe(join(skillsDir, "my-hook", "SKILL.md"))
    expect(myHook!.pluginName).toBeUndefined()
    expect(myHook!.frontmatter.name).toBe("my-hook")
    expect(myHook!.frontmatter.description).toBe("A test hook skill")
    expect(myHook!.contents).toContain("# My Hook")
  })

  it("includes reference files in skill definition", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "with-refs",
      { name: "with-refs", description: "Has references" },
      "# Skill with refs",
      {
        "config.json": '{"key": "value"}',
        "guide.md": "# Guide\nSome guide content.",
      },
    )

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "with-refs")

    expect(skill).toBeDefined()
    expect(Object.keys(skill!.references)).toHaveLength(2)

    const refPaths = Object.keys(skill!.references)
    const configRef = skill!.references[refPaths.find((p) => p.endsWith("config.json"))!]
    expect(configRef).toBeDefined()
    expect(configRef.name).toBe("config.json")
    expect(configRef.contents).toBe('{"key": "value"}')
    expect(configRef.path).toContain("config.json")

    const guideRef = skill!.references[refPaths.find((p) => p.endsWith("guide.md"))!]
    expect(guideRef.name).toBe("guide.md")
    expect(guideRef.contents).toContain("# Guide")
  })

  it("includes deeply nested reference files", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "deep-refs",
      { name: "deep-refs", description: "Nested" },
      "# Deep",
      {
        "docs/intro.md": "Intro",
        "docs/advanced/guide.md": "Advanced guide",
        "examples/basic.ts": "const x = 1",
      },
    )

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "deep-refs")

    expect(skill).toBeDefined()
    expect(Object.keys(skill!.references)).toHaveLength(3)

    const names = Object.values(skill!.references).map((r) => r.name)
    expect(names).toContain("intro.md")
    expect(names).toContain("guide.md")
    expect(names).toContain("basic.ts")
  })

  it("excludes hidden files and directories from references", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    const skillDir = join(skillsDir, "hidden-test")
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, "SKILL.md"), "---\nname: hidden-test\n---\ncontent")
    writeFileSync(join(skillDir, "visible.md"), "visible")
    writeFileSync(join(skillDir, ".hidden-file"), "hidden")
    mkdirSync(join(skillDir, ".hidden-dir"))
    writeFileSync(join(skillDir, ".hidden-dir", "nested.md"), "hidden nested")

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "hidden-test")

    expect(skill).toBeDefined()
    expect(Object.keys(skill!.references)).toHaveLength(1)
    expect(Object.values(skill!.references)[0].name).toBe("visible.md")
  })

  it("excludes SKILL.md from references", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "no-self-ref",
      { name: "no-self-ref", description: "test" },
      "body",
      { "extra.md": "extra" },
    )

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "no-self-ref")

    const refNames = Object.values(skill!.references).map((r) => r.name)
    expect(refNames).not.toContain("SKILL.md")
    expect(refNames).toContain("extra.md")
  })

  it("returns empty when no .claude/skills directory exists", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    // tempDir has no .claude/skills
    // But user-level skills will be found at ~/.claude/skills/
    // So we just check it doesn't crash and returns an object
    const result = discoverSkills(tempDir)
    expect(typeof result).toBe("object")
  })

  it("accepts an array of directories", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const dir1 = join(tempDir, "proj1")
    const dir2 = join(tempDir, "proj2")

    createSkill(
      join(dir1, ".claude", "skills"),
      "skill-a",
      { name: "skill-a", description: "From proj1" },
      "body a",
    )
    createSkill(
      join(dir2, ".claude", "skills"),
      "skill-b",
      { name: "skill-b", description: "From proj2" },
      "body b",
    )

    const result = discoverSkills([dir1, dir2])
    const names = Object.values(result).map((s) => s.name)
    expect(names).toContain("skill-a")
    expect(names).toContain("skill-b")
  })

  it("discovers skills from parent directories when recursive", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    // Create a parent with skills
    const parentDir = join(tempDir, "parent")
    const childDir = join(parentDir, "child", "grandchild")
    mkdirSync(childDir, { recursive: true })

    createSkill(
      join(parentDir, ".claude", "skills"),
      "parent-skill",
      { name: "parent-skill", description: "From parent" },
      "parent body",
    )

    // Also create a skill in the child
    createSkill(
      join(childDir, ".claude", "skills"),
      "child-skill",
      { name: "child-skill", description: "From child" },
      "child body",
    )

    // Non-recursive: only finds child skill (+ user skills)
    const nonRecursive = discoverSkills(childDir, { recursive: false })
    const nonRecNames = Object.values(nonRecursive).map((s) => s.name)
    expect(nonRecNames).toContain("child-skill")
    expect(nonRecNames).not.toContain("parent-skill")

    // Recursive: finds both
    const recursive = discoverSkills(childDir, { recursive: true })
    const recNames = Object.values(recursive).map((s) => s.name)
    expect(recNames).toContain("child-skill")
    expect(recNames).toContain("parent-skill")
  })

  it("always includes user-level skills from ~/.claude/skills/", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")
    const { homedir } = await import("node:os")

    const userSkillsDir = join(homedir(), ".claude", "skills")

    // This test just verifies user skills are included (they exist on this machine)
    if (existsSync(userSkillsDir)) {
      const result = discoverSkills(tempDir)
      // Should have at least some user-level skills
      expect(Object.keys(result).length).toBeGreaterThan(0)
      // At least one should have a path under ~/.claude/skills/
      const hasUserSkill = Object.values(result).some((s) =>
        s.path.startsWith(userSkillsDir),
      )
      expect(hasUserSkill).toBe(true)
    }
  })

  it("uses directory name as fallback when frontmatter has no name", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    const skillDir = join(skillsDir, "fallback-name")
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "---\ndescription: No name field\n---\nbody",
    )

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "fallback-name")
    expect(skill).toBeDefined()
    expect(skill!.name).toBe("fallback-name")
  })

  it("skips directories without SKILL.md", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    mkdirSync(join(skillsDir, "no-skill-md"), { recursive: true })
    writeFileSync(join(skillsDir, "no-skill-md", "README.md"), "not a skill")

    // Also create a valid skill for comparison
    createSkill(
      skillsDir,
      "valid-skill",
      { name: "valid-skill", description: "valid" },
      "body",
    )

    const result = discoverSkills(tempDir)
    const names = Object.values(result).map((s) => s.name)
    expect(names).toContain("valid-skill")
    expect(names).not.toContain("no-skill-md")
  })

  it("does not duplicate skills from the same directory", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "unique-skill",
      { name: "unique-skill", description: "test" },
      "body",
    )

    // Call with the same directory twice
    const result = discoverSkills([tempDir, tempDir])
    const matches = Object.values(result).filter((s) => s.name === "unique-skill")
    expect(matches).toHaveLength(1)
  })

  it("discovers plugin skills when includePlugins is true", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")
    const { homedir } = await import("node:os")

    const manifestPath = join(homedir(), ".claude", "plugins", "installed_plugins.json")
    if (!existsSync(manifestPath)) return // skip if no plugins installed

    const result = discoverSkills(tempDir, { includePlugins: true })
    const pluginSkills = Object.values(result).filter((s) => s.pluginName !== undefined)

    // If plugins are installed, we should find some plugin skills
    if (pluginSkills.length > 0) {
      const first = pluginSkills[0]
      expect(first.pluginName).toBeTypeOf("string")
      expect(first.name).toBeTypeOf("string")
      expect(first.path).toContain("SKILL.md")
    }
  })

  it("does not include plugin skills when includePlugins is false", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const result = discoverSkills(tempDir, { includePlugins: false })
    const pluginSkills = Object.values(result).filter((s) => s.pluginName !== undefined)
    expect(pluginSkills).toHaveLength(0)
  })

  it("is accessible on ClaudeHooks instances", async () => {
    const { ClaudeHooks } = await import("../../lib/api.mjs")
    const hooks = new ClaudeHooks(tempDir)
    expect(hooks.discoverSkills).toBeTypeOf("function")
  })

  it("is exported from the package root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.discoverSkills).toBeTypeOf("function")
    expect(mod.parseFrontmatter).toBeTypeOf("function")
  })

  it("skill path property matches the key in the returned map", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "path-check",
      { name: "path-check", description: "test" },
      "body",
    )

    const result = discoverSkills(tempDir)
    for (const [key, skill] of Object.entries(result)) {
      expect(skill.path).toBe(key)
    }
  })

  it("reference path property matches the key in the references map", async () => {
    const { discoverSkills } = await import("../../lib/skills.mjs")

    const skillsDir = join(tempDir, ".claude", "skills")
    createSkill(
      skillsDir,
      "ref-path-check",
      { name: "ref-path-check", description: "test" },
      "body",
      { "ref.md": "content" },
    )

    const result = discoverSkills(tempDir)
    const skill = Object.values(result).find((s) => s.name === "ref-path-check")

    for (const [key, ref] of Object.entries(skill!.references)) {
      expect(ref.path).toBe(key)
    }
  })
})
