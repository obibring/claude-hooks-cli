/**
 * Pure data operations on a settings object's hooks property.
 * No I/O — operates on in-memory objects only.
 */
/**
 * @typedef {object} HookEntry
 * @property {string} eventName - Hook event name
 * @property {number} index - Index within the event's array
 * @property {object} entry - The config entry object ({ matcher?, hooks: [...] })
 */
/**
 * Gets the hooks object from settings, creating it if absent.
 * @param {Record<string, unknown>} settings
 * @returns {Record<string, unknown[]>}
 */
export function getHooksObject(
  settings: Record<string, unknown>,
): Record<string, unknown[]>
/**
 * Adds a hook config entry to settings under the given event name.
 * Mutates the settings object in place.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {object} configEntry - The { matcher?, hooks: [...] } object
 */
export function addHook(
  settings: Record<string, unknown>,
  eventName: string,
  configEntry: object,
): void
/**
 * Removes a hook config entry by event name and index.
 * Mutates the settings object in place.
 * Cleans up the event key if the array becomes empty.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {number} index
 * @returns {boolean} true if removed
 */
export function removeHook(
  settings: Record<string, unknown>,
  eventName: string,
  index: number,
): boolean
/**
 * Lists all hook entries across all events in a settings object.
 * @param {Record<string, unknown>} settings
 * @returns {HookEntry[]}
 */
export function listHooks(settings: Record<string, unknown>): HookEntry[]
export type HookEntry = {
  /**
   * - Hook event name
   */
  eventName: string
  /**
   * - Index within the event's array
   */
  index: number
  /**
   * - The config entry object ({ matcher?, hooks: [...] })
   */
  entry: object
}
//# sourceMappingURL=hooks-store.d.mts.map
