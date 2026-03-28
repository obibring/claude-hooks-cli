import * as clack from "@clack/prompts"
import { getHooks } from "./hooks-manager.mjs"

/**
 * Lists all hooks configured in a settings file.
 * @param {"user" | "project" | "local"} scope
 */
export async function listHooksFlow(scope) {
  const { filePath, hooks } = await getHooks(scope)

  if (hooks.length === 0) {
    clack.log.info(`No hooks configured in ${scope} settings (${filePath})`)
    return
  }

  clack.log.info(`Hooks in ${scope} settings (${filePath}):`)

  for (const { eventName, index, entry } of hooks) {
    const e = /** @type {Record<string, unknown>} */ (entry)
    const matcher = e.matcher ? ` [matcher: ${e.matcher}]` : ""
    const handlers = /** @type {unknown[]} */ (e.hooks || [])
    const handlerSummaries = handlers.map((h) => {
      const hObj = /** @type {Record<string, unknown>} */ (h)
      const type = hObj.type || "?"
      let detail = ""
      if (type === "command") detail = ` → ${hObj.command}`
      else if (type === "http") detail = ` → ${hObj.url}`
      else if (type === "prompt" || type === "agent")
        detail = ` → ${String(hObj.prompt || "").slice(0, 60)}...`
      const flags = []
      if (hObj.async) flags.push("async")
      if (hObj.asyncRewake) flags.push("asyncRewake")
      if (hObj.once) flags.push("once")
      if (hObj.if) flags.push(`if: ${hObj.if}`)
      const flagStr = flags.length ? ` (${flags.join(", ")})` : ""
      return `    [${type}]${detail}${flagStr}`
    })

    clack.log.message(
      `  ${eventName}#${index}${matcher}\n${handlerSummaries.join("\n")}`,
    )
  }
}
