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
export function getHooksObject(settings) {
  if (!settings.hooks || typeof settings.hooks !== "object") {
    settings.hooks = {}
  }
  return /** @type {Record<string, unknown[]>} */ (settings.hooks)
}

/**
 * Adds a hook config entry to settings under the given event name.
 * Mutates the settings object in place.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {object} configEntry - The { matcher?, hooks: [...] } object
 */
export function addHook(settings, eventName, configEntry) {
  const hooks = getHooksObject(settings)
  if (!Array.isArray(hooks[eventName])) {
    hooks[eventName] = []
  }
  hooks[eventName].push(configEntry)
}

/**
 * Removes a hook config entry by event name and index.
 * Mutates the settings object in place.
 * Cleans up the event key if the array becomes empty.
 * @param {Record<string, unknown>} settings
 * @param {string} eventName
 * @param {number} index
 * @returns {boolean} true if removed
 */
export function removeHook(settings, eventName, index) {
  const hooks = getHooksObject(settings)
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
 * Lists all hook entries across all events in a settings object.
 * @param {Record<string, unknown>} settings
 * @returns {HookEntry[]}
 */
export function listHooks(settings) {
  const hooks = getHooksObject(settings)
  /** @type {HookEntry[]} */
  const results = []
  for (const [eventName, entries] of Object.entries(hooks)) {
    if (Array.isArray(entries)) {
      entries.forEach((entry, index) => {
        results.push({
          eventName,
          index,
          entry: /** @type {object} */ (entry),
        })
      })
    }
  }
  return results
}
