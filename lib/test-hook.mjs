import * as clack from "@clack/prompts"
import { getHooks } from "./hooks-manager.mjs"
import { runCommand } from "./run-command.mjs"
import { buildSyntheticInput } from "./synthetic-input.mjs"

/**
 * Interactive flow to test a hook by running its command handlers
 * with a synthetic JSON input on stdin.
 *
 * @param {"user" | "project" | "local"} scope
 * @returns {Promise<void>}
 */
export async function testHookFlow(scope) {
  const { hooks } = await getHooks(scope)

  if (hooks.length === 0) {
    clack.log.info(`No hooks configured in ${scope} settings`)
    return
  }

  const choice = await clack.select({
    message: "Select a hook to test:",
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

  if (clack.isCancel(choice)) return

  const [evName, idxStr] = /** @type {string} */ (choice).split("::")
  const idx = Number(idxStr)
  const hookEntry = hooks.find((h) => h.eventName === evName && h.index === idx)
  if (!hookEntry) return

  const entry = /** @type {Record<string, unknown>} */ (hookEntry.entry)
  const handlers = /** @type {Array<Record<string, unknown>>} */ (
    entry.hooks || []
  )

  // Build synthetic input
  const syntheticInput = buildSyntheticInput(evName)

  clack.log.info(`Testing ${evName}#${idx} with synthetic input...`)
  clack.log.message(JSON.stringify(syntheticInput, null, 2))

  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i]

    if (handler.type !== "command") {
      clack.log.warn(
        `Skipping handler ${i} (type: ${handler.type}) — only command handlers can be tested locally`,
      )
      continue
    }

    const command = /** @type {string} */ (handler.command)
    clack.log.step(`Running handler ${i}: ${command}`)

    const s = clack.spinner()
    s.start("Executing...")

    try {
      const result = await runCommand(command, JSON.stringify(syntheticInput))
      s.stop("Done")

      if (result.exitCode !== 0) {
        clack.log.error(`Exit code: ${result.exitCode}`)
      } else {
        clack.log.success(`Exit code: ${result.exitCode}`)
      }

      if (result.stdout.trim()) {
        clack.log.message(`stdout:\n${result.stdout}`)
      }
      if (result.stderr.trim()) {
        clack.log.warn(`stderr:\n${result.stderr}`)
      }
    } catch (err) {
      s.stop("Failed")
      clack.log.error(`Error: ${err.message}`)
    }
  }
}
