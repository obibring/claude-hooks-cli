import * as clack from "@clack/prompts"
import { getHooks, deleteHook } from "./hooks-manager.mjs"

/**
 * Interactive flow to remove a hook from settings.
 * @param {"user" | "project" | "local"} scope
 * @param {object} [options]
 * @param {string} [options.event] - Event name to filter by
 * @param {number} [options.index] - Direct index to remove (non-interactive)
 * @param {boolean} [options.nonInteractive] - Skip interactive prompts
 * @returns {Promise<boolean>} true if a hook was removed
 */
export async function removeHookFlow(scope, options = {}) {
  let { hooks } = await getHooks(scope)

  if (options.event) {
    hooks = hooks.filter((h) => h.eventName === options.event)
  }

  if (hooks.length === 0) {
    clack.log.info(
      options.event
        ? `No ${options.event} hooks found in ${scope} settings`
        : `No hooks configured in ${scope} settings`,
    )
    return false
  }

  // Non-interactive mode: remove by event + index
  if (
    options.nonInteractive &&
    options.event !== undefined &&
    options.index !== undefined
  ) {
    const { removed } = await deleteHook(scope, options.event, options.index)
    if (removed) {
      clack.log.success(
        `Removed ${options.event}#${options.index} from ${scope} settings`,
      )
    } else {
      clack.log.error(`Hook ${options.event}#${options.index} not found`)
    }
    return removed
  }

  // Interactive: show selection
  const choice = await clack.select({
    message: "Select a hook to remove:",
    options: hooks.map(({ eventName, index, entry }) => {
      const e = /** @type {Record<string, unknown>} */ (entry)
      const matcher = e.matcher ? ` [${e.matcher}]` : ""
      const handlers = /** @type {unknown[]} */ (e.hooks || [])
      const types = handlers
        .map((h) => /** @type {Record<string, unknown>} */ (h).type)
        .join(", ")
      return {
        value: `${eventName}::${index}`,
        label: `${eventName}#${index}${matcher}`,
        hint: `handlers: ${types}`,
      }
    }),
  })

  if (clack.isCancel(choice)) return false

  const [evName, idxStr] = /** @type {string} */ (choice).split("::")
  const idx = Number(idxStr)

  const confirmed = await clack.confirm({
    message: `Remove ${evName}#${idx}?`,
  })

  if (clack.isCancel(confirmed) || !confirmed) return false

  const { removed } = await deleteHook(scope, evName, idx)
  if (removed) {
    clack.log.success(`Removed ${evName}#${idx} from ${scope} settings`)
  }
  return removed
}
