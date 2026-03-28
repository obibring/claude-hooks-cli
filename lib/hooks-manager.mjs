/**
 * High-level hook management operations.
 * Combines settings I/O with hook store operations into
 * single-call functions scoped to a settings file.
 */

import { getSettingsPath, readSettings, writeSettings } from "./settings-io.mjs"
import {
  addHook as addHookToStore,
  removeHook as removeHookFromStore,
  listHooks as listHooksFromStore,
} from "./hooks-store.mjs"

/** @typedef {import("./settings-io.mjs").SettingsScope} SettingsScope */
/** @typedef {import("./hooks-store.mjs").HookEntry} HookEntry */

/**
 * Reads settings for the given scope and returns all hook entries.
 * @param {SettingsScope} scope
 * @returns {Promise<{ filePath: string, hooks: HookEntry[] }>}
 */
export async function getHooks(scope) {
  const filePath = getSettingsPath(scope)
  const settings = await readSettings(filePath)
  const hooks = listHooksFromStore(settings)
  return { filePath, hooks }
}

/**
 * Adds a hook config entry to the settings file for the given scope.
 * Reads the file, adds the entry, and writes it back.
 * @param {SettingsScope} scope
 * @param {string} eventName
 * @param {object} configEntry
 * @returns {Promise<{ filePath: string }>}
 */
export async function saveHook(scope, eventName, configEntry) {
  const filePath = getSettingsPath(scope)
  const settings = await readSettings(filePath)
  addHookToStore(settings, eventName, configEntry)
  await writeSettings(filePath, settings)
  return { filePath }
}

/**
 * Removes a hook config entry from the settings file for the given scope.
 * Reads the file, removes the entry, and writes it back.
 * @param {SettingsScope} scope
 * @param {string} eventName
 * @param {number} index
 * @returns {Promise<{ filePath: string, removed: boolean }>}
 */
export async function deleteHook(scope, eventName, index) {
  const filePath = getSettingsPath(scope)
  const settings = await readSettings(filePath)
  const removed = removeHookFromStore(settings, eventName, index)
  if (removed) {
    await writeSettings(filePath, settings)
  }
  return { filePath, removed }
}
