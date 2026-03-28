import { readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { execSync } from "node:child_process"

/** @typedef {"user" | "project" | "local"} SettingsScope */

/**
 * Resolves the settings file path based on scope.
 * @param {SettingsScope} scope
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
