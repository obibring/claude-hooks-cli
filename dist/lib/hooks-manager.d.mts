/** @typedef {import("./settings-io.mjs").SettingsScope} SettingsScope */
/** @typedef {import("./hooks-store.mjs").HookEntry} HookEntry */
/**
 * Reads settings for the given scope and returns all hook entries.
 * @param {SettingsScope} scope
 * @returns {Promise<{ filePath: string, hooks: HookEntry[] }>}
 */
export function getHooks(scope: SettingsScope): Promise<{
  filePath: string
  hooks: HookEntry[]
}>
/**
 * Adds a hook config entry to the settings file for the given scope.
 * Reads the file, adds the entry, and writes it back.
 * @param {SettingsScope} scope
 * @param {string} eventName
 * @param {object} configEntry
 * @returns {Promise<{ filePath: string }>}
 */
export function saveHook(
  scope: SettingsScope,
  eventName: string,
  configEntry: object,
): Promise<{
  filePath: string
}>
/**
 * Removes a hook config entry from the settings file for the given scope.
 * Reads the file, removes the entry, and writes it back.
 * @param {SettingsScope} scope
 * @param {string} eventName
 * @param {number} index
 * @returns {Promise<{ filePath: string, removed: boolean }>}
 */
export function deleteHook(
  scope: SettingsScope,
  eventName: string,
  index: number,
): Promise<{
  filePath: string
  removed: boolean
}>
export type SettingsScope = import("./settings-io.mjs").SettingsScope
export type HookEntry = import("./hooks-store.mjs").HookEntry
//# sourceMappingURL=hooks-manager.d.mts.map
