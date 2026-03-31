/**
 * Programmatic API for claude-hooks-cli.
 * No interactive prompts — all functions take explicit options and return results.
 */

import { existsSync, statSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

import {
  createCommandFile,
  parseCommandAsFile,
  resolveCommand,
} from "./command-resolver.mjs"
import { HOOK_DOCS_MAP } from "./docs-map.mjs"
import {
  getHookMeta,
  HANDLER_TYPE_INFO,
  HOOK_EVENT_NAMES,
  HOOK_METADATA,
} from "./hook-metadata.mjs"
import { deleteHook, getHooks, saveHook } from "./hooks-manager.mjs"
import {
  addHook as addHookToStore,
  removeHook as removeHookFromStore,
  listHooks as listHooksFromStore,
} from "./hooks-store.mjs"
import { runCommand } from "./run-command.mjs"
import { getSettingsPath, readSettings, writeSettings } from "./settings-io.mjs"
export {
  discoverSkills,
  parseFrontmatter,
  validateSkillFrontmatter,
  SkillFrontmatterSchema,
} from "./skills.mjs"
import {
  discoverSkills,
  validateSkillFrontmatter,
  SkillFrontmatterSchema,
} from "./skills.mjs"
import { buildSyntheticInput } from "./synthetic-input.mjs"

/**
 * @typedef {object} AddHookOptions
 * @property {string} event - Hook event name (e.g. "PreToolUse")
 * @property {"command" | "prompt" | "agent" | "http"} type - Handler type
 * @property {string} [command] - Command string (required for type: "command")
 * @property {string} [prompt] - Prompt string (required for type: "prompt" | "agent")
 * @property {string} [url] - URL string (required for type: "http")
 * @property {string} [matcher] - Matcher pattern
 * @property {number} [timeout] - Timeout in ms
 * @property {boolean} [async] - Run asynchronously
 * @property {boolean} [asyncRewake] - Async with rewake on failure
 * @property {boolean} [once] - Fire once per session
 * @property {string} [statusMessage] - Spinner status message
 * @property {string} [if] - Conditional execution rule
 * @property {string} [model] - Model for prompt handlers
 * @property {Record<string, string>} [headers] - HTTP headers (http type only)
 * @property {string[]} [allowedEnvVars] - Allowed env vars for header interpolation (http type only)
 * @property {boolean} [autoPromptSuffix] - Append JSON response instructions to prompt (default: true)
 */

/**
 * @typedef {object} AddHookResult
 * @property {string} eventName
 * @property {{ matcher?: string, hooks: Array<Record<string, unknown>> }} configEntry
 */

const PROMPT_HOOK_SUFFIX =
  '\n\nRespond with JSON: {"ok": true} to allow stopping, or {"ok": false, "reason": "your explanation"} to continue working.'

/**
 * Builds a validated hook config entry from explicit options.
 * Does NOT write to disk — use with `saveHook()` to persist.
 *
 * @param {AddHookOptions} options
 * @returns {AddHookResult}
 * @throws {Error} on invalid options
 */
export function addHookConfig(options) {
  const { event, type } = options

  // Validate event name
  const meta = getHookMeta(event)
  if (!meta) {
    throw new Error(
      `Unknown hook event: "${event}". Valid events: ${HOOK_EVENT_NAMES.join(", ")}`,
    )
  }

  // Validate handler type
  if (!meta.handlerTypes.includes(type)) {
    throw new Error(
      `Handler type "${type}" is not supported for ${event}. Supported: ${meta.handlerTypes.join(", ")}`,
    )
  }

  // Validate required primary field
  const handlerInfo = HANDLER_TYPE_INFO[type]
  const primaryField = handlerInfo.requiredFields[0]
  const primaryValue =
    primaryField === "command"
      ? options.command
      : primaryField === "url"
        ? options.url
        : options.prompt

  if (!primaryValue) {
    throw new Error(`${primaryField} is required for handler type "${type}"`)
  }

  // Validate required matcher (FileChanged)
  if (meta.matcherRequired && !options.matcher) {
    throw new Error(
      `Matcher is required for ${event} (${meta.matcherDescription})`,
    )
  }

  // Build handler object
  /** @type {Record<string, unknown>} */
  const handler = { type }

  if (type === "command") {
    handler.command = resolveCommand(primaryValue)
  } else if (type === "http") {
    handler.url = primaryValue
    if (options.headers) handler.headers = options.headers
    if (options.allowedEnvVars) handler.allowedEnvVars = options.allowedEnvVars
  } else if (type === "prompt") {
    let prompt = primaryValue
    if (options.autoPromptSuffix !== false) {
      prompt += PROMPT_HOOK_SUFFIX
    }
    handler.prompt = prompt
    if (options.model) handler.model = options.model
  } else {
    // agent
    handler.prompt = primaryValue
  }

  // Apply optional fields
  if (options.timeout !== undefined) handler.timeout = options.timeout
  if (options.async !== undefined) handler.async = options.async
  if (options.asyncRewake !== undefined)
    handler.asyncRewake = options.asyncRewake
  if (options.once !== undefined && meta.supportsOnce)
    handler.once = options.once
  if (options.statusMessage) handler.statusMessage = options.statusMessage
  if (options.if && meta.supportsIf) handler.if = options.if

  // Build config entry
  /** @type {Record<string, unknown>} */
  const configEntry = {}
  if (options.matcher) {
    configEntry.matcher = options.matcher
  }
  configEntry.hooks = [handler]

  return { eventName: event, configEntry }
}

/**
 * @typedef {object} TestHookOptions
 * @property {string} event - Hook event name
 * @property {Record<string, unknown>} handler - Handler object (from configEntry.hooks[n])
 * @property {Record<string, unknown>} [input] - Custom input (overrides synthetic)
 * @property {Record<string, string>} [env] - Additional env vars
 * @property {number} [timeout] - Timeout in ms
 */

/**
 * @typedef {object} TestHookResult
 * @property {number} exitCode
 * @property {string} stdout
 * @property {string} stderr
 * @property {boolean} [skipped]
 * @property {string} [reason]
 */

/**
 * Tests a single hook handler by running it with synthetic or custom input.
 * Only command handlers can be tested locally.
 *
 * @param {TestHookOptions} options
 * @returns {Promise<TestHookResult>}
 */
export async function testHook(options) {
  const { event, handler, input, env, timeout } = options

  if (handler.type !== "command") {
    return {
      exitCode: -1,
      stdout: "",
      stderr: "",
      skipped: true,
      reason: `Only command handlers can be tested locally (got: ${handler.type})`,
    }
  }

  const syntheticInput = input || buildSyntheticInput(event)
  const result = await runCommand(
    /** @type {string} */ (handler.command),
    JSON.stringify(syntheticInput),
    { env, timeout },
  )

  return result
}

/**
 * Returns the markdown documentation for a hook event.
 *
 * @param {string} eventName
 * @returns {string | null}
 */
export function getDocs(eventName) {
  return HOOK_DOCS_MAP[eventName] || null
}

/**
 * Returns an array of all event names that have documentation.
 *
 * @returns {string[]}
 */
export function getAvailableDocs() {
  return Object.keys(HOOK_DOCS_MAP)
}

/**
 * Returns all hook entries for a given scope as structured data.
 * This is the programmatic equivalent of `claude-hooks list`.
 *
 * @param {"user" | "project" | "local"} scope
 * @returns {Promise<{ filePath: string, hooks: Array<{ eventName: string, index: number, entry: object }> }>}
 */
export async function listHookEntries(scope) {
  return getHooks(scope)
}

/**
 * @typedef {object} PersistTarget
 * @property {string} [filePath] - Direct path to settings file (overrides scope)
 * @property {"user" | "project" | "local"} [scope] - Settings scope (default: "project")
 */

/**
 * Builds a hook config and saves it to a settings file in one call.
 * Combines addHookConfig() + saveHook().
 *
 * @param {AddHookOptions} options - Hook configuration options
 * @param {PersistTarget} [target] - Where to save (filePath or scope)
 * @returns {Promise<{ filePath: string, eventName: string, configEntry: object }>}
 */
export async function installHook(options, target = {}) {
  const { eventName, configEntry } = addHookConfig(options)

  if (target.filePath) {
    const settings = await readSettings(target.filePath)
    addHookToStore(settings, eventName, configEntry)
    await writeSettings(target.filePath, settings)
    return { filePath: target.filePath, eventName, configEntry }
  }

  const scope = target.scope || "project"
  const { filePath } = await saveHook(scope, eventName, configEntry)
  return { filePath, eventName, configEntry }
}

/**
 * Removes a hook from a settings file by event name and index.
 *
 * @param {string} eventName
 * @param {number} index
 * @param {PersistTarget} [target]
 * @returns {Promise<{ filePath: string, removed: boolean }>}
 */
export async function uninstallHook(eventName, index, target = {}) {
  if (target.filePath) {
    const settings = await readSettings(target.filePath)
    const removed = removeHookFromStore(settings, eventName, index)
    if (removed) {
      await writeSettings(target.filePath, settings)
    }
    return { filePath: target.filePath, removed }
  }

  const scope = target.scope || "project"
  return deleteHook(scope, eventName, index)
}

/**
 * @typedef {object} ScaffoldOptions
 * @property {string} event - Hook event name (for template generation)
 * @property {string} filePath - Absolute path for the hook file
 * @property {boolean} [overwrite] - Overwrite existing file (default: false)
 */

/** @type {Record<string, (event: string) => string>} */
const HOOK_HANDLER_TEMPLATES = {
  ".ts": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
  ".tsx": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
`,
  ".mts": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
`,
  ".js": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
  ".mjs": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
}

/**
 * Creates a hook script file with a starter template.
 * The template uses HookHandler with the correct event name.
 *
 * @param {ScaffoldOptions} options
 * @returns {Promise<{ created: boolean, filePath: string, runnerCommand: string }>}
 */
export async function scaffoldHookFile(options) {
  const { event, filePath, overwrite = false } = options

  const parsed = parseCommandAsFile(filePath)
  if ("error" in parsed) {
    throw new Error(parsed.error)
  }

  const { resolved, ext, runnerCommand } = parsed

  if (existsSync(resolved) && !overwrite) {
    return { created: false, filePath: resolved, runnerCommand }
  }

  // Use HookHandler template for JS/TS files, fall back to generic template
  const templateFn = HOOK_HANDLER_TEMPLATES[ext]
  if (templateFn) {
    const dir = dirname(resolved)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
    await writeFile(resolved, templateFn(event), "utf-8")
  } else {
    await createCommandFile(resolved, ext)
  }

  return { created: true, filePath: resolved, runnerCommand }
}

/**
 * Builds a hook command string for running a script file, using the same format
 * as the CLI's interactive "Add a hook" flow. Relative paths are prefixed with
 * `$CLAUDE_PROJECT_DIR` so the hook resolves correctly at runtime regardless
 * of the working directory.
 *
 * @param {"node" | "tsx"} runner - Runtime to use: `"node"` for JavaScript, `"tsx"` for TypeScript
 * @param {string} filePath - Path to the script file (absolute or relative to project root)
 * @returns {string} A command string suitable for a hook handler's `command` field
 */
export function buildHookCommand(runner, filePath) {
  const trimmed = filePath.trim()

  if (runner !== "node" && runner !== "tsx") {
    throw new Error(`Invalid runner: "${runner}". Must be "node" or "tsx".`)
  }

  if (!trimmed) {
    throw new Error("filePath is required")
  }

  const prefix = runner === "tsx" ? "npx -y tsx" : "node"

  if (trimmed.startsWith("/")) {
    return `${prefix} "${trimmed}"`
  }

  return `${prefix} "$CLAUDE_PROJECT_DIR/${trimmed}"`
}

/**
 * Resolves the settings file path for a project directory.
 * @param {string} projectDir - Absolute path to the project root
 * @returns {string}
 */
function resolveProjectSettingsPath(projectDir) {
  return join(projectDir, ".claude", "settings.json")
}

/**
 * Returns all hook entries from a project directory's `.claude/settings.json` file.
 * This is a directory-based alternative to `listHookEntries()` that does not rely on
 * git root detection or scope resolution — you provide the project directory directly.
 *
 * @param {string} projectDir - Absolute path to the project root directory
 * @returns {Promise<{ filePath: string, hooks: Array<{ eventName: string, index: number, entry: object }> }>}
 */
export async function getHooksForProjectDir(projectDir) {
  const filePath = resolveProjectSettingsPath(projectDir)
  const settings = await readSettings(filePath)
  const hooks = listHooksFromStore(settings)
  return { filePath, hooks }
}

/**
 * Saves a hook config entry to a project directory's `.claude/settings.json` file.
 * This is a directory-based alternative to `installHook()` with `{ filePath }` target.
 * Validates the options, builds the config entry, and writes to `<projectDir>/.claude/settings.json`.
 *
 * @param {string} projectDir - Absolute path to the project root directory
 * @param {AddHookOptions} options - Hook configuration options
 * @returns {Promise<{ filePath: string, eventName: string, configEntry: object }>}
 * @throws {Error} If validation fails (the settings file is not modified on validation errors).
 */
export async function saveHookToProjectDir(projectDir, options) {
  const { eventName, configEntry } = addHookConfig(options)
  const filePath = resolveProjectSettingsPath(projectDir)
  const settings = await readSettings(filePath)
  addHookToStore(settings, eventName, configEntry)
  await writeSettings(filePath, settings)
  return { filePath, eventName, configEntry }
}

/**
 * Removes a hook from a project directory's `.claude/settings.json` file by event name and index.
 *
 * @param {string} projectDir - Absolute path to the project root directory
 * @param {string} eventName - Hook event name
 * @param {number} index - Index of the hook entry to remove
 * @returns {Promise<{ filePath: string, removed: boolean }>}
 */
export async function removeHookFromProjectDir(projectDir, eventName, index) {
  const filePath = resolveProjectSettingsPath(projectDir)
  const settings = await readSettings(filePath)
  const removed = removeHookFromStore(settings, eventName, index)
  if (removed) {
    await writeSettings(filePath, settings)
  }
  return { filePath, removed }
}

/**
 * Directory-scoped API for managing Claude Code hooks and skills.
 *
 * @example
 * ```js
 * import { ClaudeProject } from "@obibring/claude-hooks-cli/api"
 *
 * const hooks = new ClaudeProject("/path/to/my-project")
 * await hooks.install({ event: "PreToolUse", type: "command", command: "echo" })
 * const { hooks: entries } = await hooks.getHooks()
 * ```
 */
export class ClaudeProject {
  /** @type {string} */
  #dir

  /** @type {string} */
  #settingsPath

  /**
   * @param {string} dir - Absolute path to the project directory to operate on.
   *   Must exist and must be a directory.
   * @throws {Error} If the path does not exist or is not a directory.
   */
  constructor(dir) {
    if (!existsSync(dir)) {
      throw new Error(`Directory does not exist: ${dir}`)
    }
    if (!statSync(dir).isDirectory()) {
      throw new Error(`Path is not a directory: ${dir}`)
    }
    this.#dir = dir
    this.#settingsPath = resolveProjectSettingsPath(dir)
  }

  /** The absolute path to the project directory this instance operates on. */
  get dir() {
    return this.#dir
  }

  /** The resolved path to `.claude/settings.json` for this project. */
  get settingsPath() {
    return this.#settingsPath
  }

  /**
   * Returns `true` if this project directory has a `.claude` directory.
   * @returns {boolean}
   */
  hasClaudeDirectory() {
    return existsSync(join(this.#dir, ".claude"))
  }

  /**
   * Ensures the `.claude` directory exists, creating it if necessary.
   * @returns {Promise<void>}
   */
  async #ensureClaudeDir() {
    const claudeDir = dirname(this.#settingsPath)
    if (!existsSync(claudeDir)) {
      await mkdir(claudeDir, { recursive: true })
    }
  }

  // ---- Hook config building (static, no I/O) ----

  /**
   * Builds a validated hook config entry from explicit options.
   * Does NOT write to disk — use `install()` to persist.
   * @param {AddHookOptions} options
   * @returns {AddHookResult}
   */
  addHookConfig(options) {
    return addHookConfig(options)
  }

  /**
   * Builds a hook command string for a script file.
   * @param {"node" | "tsx"} runner
   * @param {string} filePath
   * @returns {string}
   */
  buildHookCommand(runner, filePath) {
    return buildHookCommand(runner, filePath)
  }

  // ---- Hook management (reads/writes this.#settingsPath) ----

  /**
   * Returns all hook entries from this project's `.claude/settings.json`.
   * @returns {Promise<{ filePath: string, hooks: Array<{ eventName: string, index: number, entry: object }> }>}
   */
  async getHooks() {
    return getHooksForProjectDir(this.#dir)
  }

  /**
   * Validates and saves a hook configuration to this project's `.claude/settings.json`.
   * Creates the `.claude` directory if it does not exist.
   * @param {AddHookOptions} options
   * @returns {Promise<{ filePath: string, eventName: string, configEntry: object }>}
   */
  async install(options) {
    await this.#ensureClaudeDir()
    return saveHookToProjectDir(this.#dir, options)
  }

  /**
   * Removes a hook from this project's `.claude/settings.json` by event name and index.
   * @param {string} eventName
   * @param {number} index
   * @returns {Promise<{ filePath: string, removed: boolean }>}
   */
  async uninstall(eventName, index) {
    return removeHookFromProjectDir(this.#dir, eventName, index)
  }

  // ---- Testing ----

  /**
   * Tests a single hook handler by running it with synthetic or custom input.
   * @param {TestHookOptions} options
   * @returns {Promise<TestHookResult>}
   */
  async test(options) {
    return testHook(options)
  }

  /**
   * Builds a synthetic hook input object for testing.
   * @param {string} eventName
   * @param {Record<string, unknown>} [overrides]
   * @returns {Record<string, unknown>}
   */
  buildSyntheticInput(eventName, overrides) {
    return buildSyntheticInput(eventName, overrides)
  }

  // ---- Docs ----

  /**
   * Returns markdown documentation for a hook event, or `null` if unknown.
   * @param {string} eventName
   * @returns {string | null}
   */
  getDocs(eventName) {
    return getDocs(eventName)
  }

  /**
   * Returns all event names that have documentation.
   * @returns {string[]}
   */
  getAvailableDocs() {
    return getAvailableDocs()
  }

  // ---- Scaffolding ----

  /**
   * Creates a hook script file with a starter template.
   * @param {ScaffoldOptions} options
   * @returns {Promise<{ created: boolean, filePath: string, runnerCommand: string }>}
   */
  async scaffold(options) {
    return scaffoldHookFile(options)
  }

  // ---- Skills ----

  /**
   * Discovers all skills available for this project directory.
   * @param {{ recursive?: boolean, includePlugins?: boolean }} [options]
   * @returns {Record<string, import("./skills.mjs").SkillDefinition>}
   */
  discoverSkills(options) {
    return discoverSkills(this.#dir, options)
  }

  /**
   * Validates a skill frontmatter object.
   * @param {Record<string, unknown>} frontmatter
   * @param {{ extraProperties?: string[] }} [options]
   * @returns {import("./skills.mjs").ValidateSkillResult}
   */
  validateSkillFrontmatter(frontmatter, options) {
    return validateSkillFrontmatter(frontmatter, options)
  }

  // ---- Static references ----

  /** Zod schema for skill frontmatter validation. */
  static SkillFrontmatterSchema = SkillFrontmatterSchema

  /** Hook metadata registry. */
  static metadata = {
    events: HOOK_METADATA,
    getEvent: getHookMeta,
    eventNames: HOOK_EVENT_NAMES,
    handlerTypes: HANDLER_TYPE_INFO,
  }
}
