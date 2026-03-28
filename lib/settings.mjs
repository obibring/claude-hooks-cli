import { readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { execSync } from "node:child_process"

/**
 * Resolves the settings file path based on scope.
 * @param {"user" | "project" | "local"} scope
 * @returns {string}
 */
export function getSettingsPath(scope) {
  if (scope === "user") {
    const home = process.env.HOME || process.env.USERPROFILE || "~"
    return join(home, ".claude", "settings.json")
  }

  const projectRoot = getProjectRoot()
  if (scope === "project") {
    return join(projectRoot, ".claude", "settings.json")
  }
  // local
  return join(projectRoot, ".claude", "settings.local.json")
}

/**
 * Returns the git root or cwd as the project root.
 * @returns {string}
 */
function getProjectRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim()
  } catch {
    return process.cwd()
  }
}

/**
 * Reads and parses a Claude Code settings.json file.
 * Returns an empty object if the file doesn't exist.
 * @param {string} filePath
 * @returns {Promise<Record<string, unknown>>}
 */
export async function readSettings(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * Writes a settings object to a Claude Code settings.json file.
 * Creates parent directories if needed.
 * @param {string} filePath
 * @param {Record<string, unknown>} settings
 * @returns {Promise<void>}
 */
export async function writeSettings(filePath, settings) {
  const dir = resolve(filePath, "..")
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  await writeFile(filePath, JSON.stringify(settings, null, 2) + "\n", "utf-8")
}

/**
 * Gets the hooks object from settings, creating it if absent.
 * @param {Record<string, unknown>} settings
 * @returns {Record<string, unknown[]>}
 */
export function getHooksFromSettings(settings) {
  if (!settings.hooks || typeof settings.hooks !== "object") {
    settings.hooks = {}
  }
  return /** @type {Record<string, unknown[]>} */ (settings.hooks)
}

/**
 * Adds a hook config entry to settings under the given event name.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {object} configEntry - The { matcher?, hooks: [...] } object
 */
export function addHookToSettings(settings, eventName, configEntry) {
  const hooks = getHooksFromSettings(settings)
  if (!Array.isArray(hooks[eventName])) {
    hooks[eventName] = []
  }
  hooks[eventName].push(configEntry)
}

/**
 * Removes a hook config entry from settings by event name and index.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {number} index
 * @returns {boolean} true if removed
 */
export function removeHookFromSettings(settings, eventName, index) {
  const hooks = getHooksFromSettings(settings)
  if (
    !Array.isArray(hooks[eventName]) ||
    index < 0 ||
    index >= hooks[eventName].length
  ) {
    return false
  }
  hooks[eventName].splice(index, 1)
  if (hooks[eventName].length === 0) {
    delete hooks[eventName]
  }
  return true
}

/**
 * Lists all hook entries across all events in settings.
 * @param {Record<string, unknown>} settings
 * @returns {Array<{ eventName: string, index: number, entry: object }>}
 */
export function listAllHooks(settings) {
  const hooks = getHooksFromSettings(settings)
  /** @type {Array<{ eventName: string, index: number, entry: object }>} */
  const results = []
  for (const [eventName, entries] of Object.entries(hooks)) {
    if (Array.isArray(entries)) {
      entries.forEach((entry, index) => {
        results.push({ eventName, index, entry: /** @type {object} */ (entry) })
      })
    }
  }
  return results
}
