/**
 * Discovers and parses Claude Code skills from project directories and plugins.
 * Mirrors the skill resolution algorithm from the `skills()` shell function.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve, dirname, parse as pathParse, basename } from "node:path"
import { homedir } from "node:os"
import { z } from "zod/v4"

/**
 * @typedef {object} SkillReference
 * @property {string} path - Absolute path to the reference file
 * @property {string} name - Filename (e.g. "animations.md")
 * @property {string} contents - File contents as a UTF-8 string
 */

/**
 * @typedef {object} SkillDefinition
 * @property {string} path - Absolute path to the SKILL.md file
 * @property {string} name - Skill name (from frontmatter, or directory name as fallback)
 * @property {string | undefined} pluginName - Plugin name if this is a plugin skill, undefined otherwise
 * @property {Record<string, string>} frontmatter - Parsed YAML frontmatter as key-value pairs
 * @property {string} contents - The markdown content below the frontmatter
 * @property {Record<string, SkillReference>} references - Map of absolute file paths to reference file objects
 */

/**
 * @typedef {object} DiscoverSkillsOptions
 * @property {boolean} [recursive] - When true, walks up parent directories looking for additional .claude/skills/ directories. Always includes ~/.claude/skills/.
 * @property {boolean} [includePlugins] - When true, includes skills from installed Claude Code plugins.
 */

/**
 * Parses YAML-like frontmatter from a SKILL.md file.
 * Handles the simple `key: value` format used by Claude Code skills.
 *
 * @param {string} raw - Raw file contents
 * @returns {{ frontmatter: Record<string, string | boolean>, contents: string }}
 */
export function parseFrontmatter(raw) {
  /** @type {Record<string, string | boolean>} */
  const frontmatter = {}

  if (!raw.startsWith("---")) {
    return { frontmatter, contents: raw }
  }

  const endIdx = raw.indexOf("\n---", 3)
  if (endIdx === -1) {
    return { frontmatter, contents: raw }
  }

  const fmBlock = raw.slice(4, endIdx)
  const rest = raw.slice(endIdx + 4).replace(/^\n/, "")

  // Known boolean frontmatter fields
  const BOOLEAN_FIELDS = new Set(["disable-model-invocation", "user-invocable"])

  // Parse key: value pairs, supporting multiline values (indented continuation)
  let currentKey = ""
  let currentValue = ""

  /** @param {string} key @param {string} val */
  function flush(key, val) {
    const trimmed = val.trim()
    if (BOOLEAN_FIELDS.has(key)) {
      frontmatter[key] = trimmed === "true"
    } else {
      frontmatter[key] = trimmed
    }
  }

  for (const line of fmBlock.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (match) {
      // Flush previous key
      if (currentKey) {
        flush(currentKey, currentValue)
      }
      currentKey = match[1]
      currentValue = match[2]
    } else if (currentKey && (line.startsWith("  ") || line.startsWith("\t"))) {
      // Continuation line
      currentValue += "\n" + line.trim()
    } else if (currentKey && line.trim() === "") {
      // Blank line in multiline value
      currentValue += "\n"
    }
  }

  // Flush last key
  if (currentKey) {
    flush(currentKey, currentValue)
  }

  return { frontmatter, contents: rest }
}

// ---- Skill frontmatter validation ----

/** Set of all known Claude Code skill frontmatter property names. */
const KNOWN_FRONTMATTER_KEYS = new Set([
  "name",
  "description",
  "disable-model-invocation",
  "argument-hint",
  "user-invocable",
  "allowed-tools",
  "effort",
  "model",
  "context",
  "agent",
  "license",
])

/** Zod schema for validating skill frontmatter objects. */
export const SkillFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  "disable-model-invocation": z.boolean().optional(),
  "argument-hint": z.string().optional(),
  "user-invocable": z.boolean().optional(),
  "allowed-tools": z.string().optional(),
  effort: z.enum(["low", "medium", "high", "max", "auto"]).optional(),
  model: z
    .enum([
      "opus",
      "sonnet",
      "haiku",
      "inherit",
      "sonnet[1m]",
      "opus[1m]",
      "opusplan",
    ])
    .optional(),
  context: z.enum(["fork"]).optional(),
  agent: z.string().optional(),
  license: z.string().optional(),
})

/**
 * @typedef {object} ValidateSkillOptions
 * @property {string[]} [extraProperties] - Additional property names to treat as known (suppresses warnings for these keys)
 */

/**
 * @typedef {object} ValidateSkillResult
 * @property {boolean} success - `true` when there are no errors
 * @property {Record<string, string>} warnings - Map of unrecognized keys to warning messages
 * @property {Record<string, string>} errors - Map of missing/invalid keys to error messages
 */

/**
 * Validates a skill frontmatter object against the known Claude Code skill schema.
 * Returns errors for missing required fields (`name`, `description`) and invalid enum values,
 * plus warnings for any unrecognized keys.
 *
 * @param {Record<string, unknown>} frontmatter - The frontmatter object to validate
 * @param {ValidateSkillOptions} [options]
 * @returns {ValidateSkillResult}
 */
export function validateSkillFrontmatter(frontmatter, options = {}) {
  const { extraProperties = [] } = options
  const extraSet = new Set(extraProperties)

  /** @type {Record<string, string>} */
  const errors = {}
  /** @type {Record<string, string>} */
  const warnings = {}

  // Run Zod validation for required fields and type/enum checks
  const result = SkillFrontmatterSchema.safeParse(frontmatter)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path.join(".")
      if (issue.code === "invalid_type" && frontmatter[key] === undefined) {
        errors[key] = "missing"
      } else {
        errors[key] = issue.message
      }
    }
  }

  // Check for unrecognized keys
  for (const key of Object.keys(frontmatter)) {
    if (!KNOWN_FRONTMATTER_KEYS.has(key) && !extraSet.has(key)) {
      warnings[key] =
        `"${key}" is not recognized as a Claude SKILL frontmatter property. Pass extraProperties to remove this warning`
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    warnings,
    errors,
  }
}

/**
 * Collects all non-hidden files in a directory tree recursively.
 *
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of absolute file paths
 */
function collectFiles(dir) {
  /** @type {string[]} */
  const results = []

  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(full))
    } else if (entry.isFile()) {
      results.push(full)
    }
  }

  return results
}

/**
 * Parses a single skill directory into a SkillDefinition.
 *
 * @param {string} skillDir - Absolute path to the skill directory
 * @param {string | undefined} pluginName - Plugin name or undefined
 * @returns {SkillDefinition | null} Null if SKILL.md does not exist
 */
function parseSkillDir(skillDir, pluginName) {
  const skillMdPath = join(skillDir, "SKILL.md")
  if (!existsSync(skillMdPath)) return null

  let raw
  try {
    raw = readFileSync(skillMdPath, "utf-8")
  } catch {
    return null
  }

  const { frontmatter, contents } = parseFrontmatter(raw)
  const name = frontmatter.name || basename(skillDir)

  // Collect reference files (everything except SKILL.md, non-hidden, recursive)
  /** @type {Record<string, SkillReference>} */
  const references = {}

  const allFiles = collectFiles(skillDir)
  for (const filePath of allFiles) {
    if (filePath === skillMdPath) continue
    try {
      const fileContents = readFileSync(filePath, "utf-8")
      references[filePath] = {
        path: filePath,
        name: basename(filePath),
        contents: fileContents,
      }
    } catch {
      // Skip unreadable files
    }
  }

  return {
    path: skillMdPath,
    name,
    pluginName,
    frontmatter,
    contents,
    references,
  }
}

/**
 * Lists skill directories inside a .claude/skills/ parent.
 *
 * @param {string} skillsDir - Absolute path to a .claude/skills/ directory
 * @returns {string[]} Array of absolute paths to skill subdirectories
 */
function listSkillDirs(skillsDir) {
  if (!existsSync(skillsDir)) return []

  try {
    return readdirSync(skillsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => join(skillsDir, e.name))
  } catch {
    return []
  }
}

/**
 * Reads the installed plugins manifest and returns plugin skill directories
 * that are relevant for the given project directories.
 *
 * @param {string[]} projectDirs - Absolute paths to project directories (for scope matching)
 * @returns {Array<{ pluginName: string, skillsDir: string }>}
 */
function findPluginSkillDirs(projectDirs) {
  const manifestPath = join(
    homedir(),
    ".claude",
    "plugins",
    "installed_plugins.json",
  )
  if (!existsSync(manifestPath)) return []

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf-8"))
  } catch {
    return []
  }

  const plugins = manifest.plugins
  if (!plugins || typeof plugins !== "object") return []

  /** @type {Array<{ pluginName: string, installPath: string }>} */
  const relevantInstalls = []
  const seenPaths = new Set()

  for (const [key, installs] of Object.entries(plugins)) {
    const pluginName = key.split("@")[0]
    if (!Array.isArray(installs)) continue

    for (const inst of installs) {
      const installPath = inst.installPath
      if (!installPath || seenPaths.has(installPath)) continue

      const scope = inst.scope || ""
      const projectPath = inst.projectPath || ""

      if (scope === "user") {
        seenPaths.add(installPath)
        relevantInstalls.push({ pluginName, installPath })
      } else if ((scope === "project" || scope === "local") && projectPath) {
        const normPP = resolve(projectPath)
        for (const pd of projectDirs) {
          const normPD = resolve(pd)
          if (normPD === normPP || normPD.startsWith(normPP + "/")) {
            seenPaths.add(installPath)
            relevantInstalls.push({ pluginName, installPath })
            break
          }
        }
      }
    }
  }

  // For each install path, recursively find "skills" directories
  /** @type {Array<{ pluginName: string, skillsDir: string }>} */
  const result = []

  for (const { pluginName, installPath } of relevantInstalls) {
    if (!existsSync(installPath)) continue
    const skillsDirs = findSkillsDirsRecursive(installPath)
    for (const sd of skillsDirs) {
      result.push({ pluginName, skillsDir: sd })
    }
  }

  return result
}

/**
 * Recursively finds directories named "skills" under a root path,
 * skipping node_modules and .git.
 *
 * @param {string} root - Root directory to search
 * @returns {string[]}
 */
function findSkillsDirsRecursive(root) {
  /** @type {string[]} */
  const results = []

  let entries
  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name === "node_modules" || entry.name === ".git") continue

    const full = join(root, entry.name)
    if (entry.name === "skills") {
      results.push(full)
    } else {
      results.push(...findSkillsDirsRecursive(full))
    }
  }

  return results
}

/**
 * Discovers all Claude Code skills available for the given project directories.
 *
 * Resolution algorithm (mirrors the `skills()` shell function):
 * 1. For each provided directory, look for `<dir>/.claude/skills/`
 * 2. If `recursive` is true, walk up parent directories looking for additional `.claude/skills/` dirs
 * 3. Always include `~/.claude/skills/` (user-level skills)
 * 4. If `includePlugins` is true, read `~/.claude/plugins/installed_plugins.json` and include plugin skills
 *
 * @param {string | string[]} dirs - Absolute path(s) to project directories
 * @param {DiscoverSkillsOptions} [options]
 * @returns {Record<string, SkillDefinition>} Map of absolute SKILL.md paths to skill definition objects
 */
export function discoverSkills(dirs, options = {}) {
  const { recursive = false, includePlugins = false } = options

  const dirArray = Array.isArray(dirs) ? dirs : [dirs]
  const resolvedDirs = dirArray.map((d) => resolve(d))

  // Collect all .claude/skills/ directories to scan
  /** @type {Set<string>} */
  const skillsParentDirs = new Set()

  for (const dir of resolvedDirs) {
    const skillsDir = join(dir, ".claude", "skills")
    if (existsSync(skillsDir)) {
      skillsParentDirs.add(skillsDir)
    }

    if (recursive) {
      let current = dirname(dir)
      const { root } = pathParse(dir)
      while (current !== root) {
        const parentSkillsDir = join(current, ".claude", "skills")
        if (existsSync(parentSkillsDir)) {
          skillsParentDirs.add(parentSkillsDir)
        }
        current = dirname(current)
      }
    }
  }

  // Always include user-level skills
  const userSkillsDir = join(homedir(), ".claude", "skills")
  if (existsSync(userSkillsDir)) {
    skillsParentDirs.add(userSkillsDir)
  }

  /** @type {Record<string, SkillDefinition>} */
  const result = {}

  // Parse standard skills
  for (const parentDir of skillsParentDirs) {
    const skillDirs = listSkillDirs(parentDir)
    for (const skillDir of skillDirs) {
      const skill = parseSkillDir(skillDir, undefined)
      if (skill) {
        result[skill.path] = skill
      }
    }
  }

  // Parse plugin skills
  if (includePlugins) {
    const pluginDirs = findPluginSkillDirs(resolvedDirs)
    for (const { pluginName, skillsDir } of pluginDirs) {
      const skillDirs = listSkillDirs(skillsDir)
      for (const skillDir of skillDirs) {
        const skill = parseSkillDir(skillDir, pluginName)
        if (skill) {
          result[skill.path] = skill
        }
      }
    }
  }

  return result
}
