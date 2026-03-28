import * as clack from "@clack/prompts"
import {
  HOOK_METADATA,
  getHookMeta,
  HANDLER_TYPE_INFO,
} from "./hook-metadata.mjs"
import { resolveCommand } from "./command-resolver.mjs"

/**
 * Interactive flow to build a complete hook config entry.
 * Returns null if cancelled at any point.
 *
 * @param {object} [options]
 * @param {string} [options.event] - Pre-selected event name (skips event selection)
 * @param {string} [options.type] - Pre-selected handler type
 * @param {string} [options.command] - Pre-provided command/prompt/url
 * @param {string} [options.matcher] - Pre-provided matcher value
 * @param {number} [options.timeout] - Pre-provided timeout
 * @param {boolean} [options.async] - Pre-provided async flag
 * @param {boolean} [options.once] - Pre-provided once flag
 * @param {string} [options.statusMessage] - Pre-provided status message
 * @param {string} [options.ifCondition] - Pre-provided if condition
 * @param {boolean} [options.nonInteractive] - Skip interactive prompts (use provided values only)
 * @returns {Promise<{ eventName: string, configEntry: object } | null>}
 */
export async function addHookFlow(options = {}) {
  // Step 1: Select hook event
  const eventName = options.event || (await selectHookEvent())
  if (!eventName || clack.isCancel(eventName)) return null

  const meta = getHookMeta(eventName)
  if (!meta) {
    clack.log.error(`Unknown hook event: ${eventName}`)
    return null
  }

  if (meta.experimental) {
    clack.log.warn(
      `This hook requires ${meta.experimentalFlag}=1 to be set when launching Claude Code.`,
    )
  }

  // Step 2: Select handler type
  const handlerType = options.type || (await selectHandlerType(meta))
  if (!handlerType || clack.isCancel(handlerType)) return null

  // Step 3: Get required field value (command, prompt, or url)
  const handlerInfo = HANDLER_TYPE_INFO[handlerType]
  const primaryField = handlerInfo.requiredFields[0]
  const primaryValue = await getRequiredFieldValue(
    primaryField,
    handlerType,
    options,
  )
  if (primaryValue === null || clack.isCancel(primaryValue)) return null

  // Build the handler object
  /** @type {Record<string, unknown>} */
  const handler = { type: handlerType }

  if (handlerType === "command") {
    handler.command = resolveCommand(primaryValue)
  } else if (handlerType === "http") {
    handler.url = primaryValue
  } else {
    handler.prompt = primaryValue
  }

  // Step 4: Get matcher (required for FileChanged, optional for others with matcher support)
  /** @type {string | undefined} */
  let matcher
  if (meta.matcherRequired) {
    matcher = await getMatcherValue(meta, options, true)
    if (matcher === null || clack.isCancel(matcher)) return null
  }

  // Step 5: Optional fields menu (only in interactive mode)
  if (!options.nonInteractive) {
    const result = await optionalFieldsMenu(meta, handler, options)
    if (result === null) return null
    if (result.matcher !== undefined) matcher = result.matcher
  } else {
    applyNonInteractiveOptions(meta, handler, options)
    if (options.matcher && meta.hasMatcher && !meta.matcherRequired) {
      matcher = options.matcher
    }
  }

  // Build the config entry
  /** @type {Record<string, unknown>} */
  const configEntry = {}
  if (matcher) {
    configEntry.matcher = matcher
  }
  configEntry.hooks = [handler]

  return { eventName, configEntry }
}

/**
 * @returns {Promise<string | symbol>}
 */
async function selectHookEvent() {
  return clack.select({
    message: "Select a hook event:",
    options: HOOK_METADATA.map((h) => ({
      value: h.name,
      label: h.name,
      hint: `${h.description}${h.experimental ? " [experimental]" : ""}`,
    })),
  })
}

/**
 * @param {import("./hook-metadata.mjs").HookMeta} meta
 * @returns {Promise<string | symbol>}
 */
async function selectHandlerType(meta) {
  if (meta.handlerTypes.length === 1) {
    clack.log.info(
      `Handler type: command (only supported type for ${meta.name})`,
    )
    return "command"
  }

  return clack.select({
    message: "Select handler type:",
    options: meta.handlerTypes.map((t) => ({
      value: t,
      label: HANDLER_TYPE_INFO[t].label,
      hint: HANDLER_TYPE_INFO[t].description,
    })),
  })
}

/**
 * @param {string} field
 * @param {string} handlerType
 * @param {object} options
 * @returns {Promise<string | null | symbol>}
 */
async function getRequiredFieldValue(field, handlerType, options) {
  // Check if provided via options
  if (field === "command" && options.command) return options.command
  if (field === "url" && options.command) return options.command
  if (field === "prompt" && options.command) return options.command
  if (options.nonInteractive) {
    clack.log.error(`Missing required field: ${field}`)
    return null
  }

  const messages = {
    command: "Enter the command to run (or path to a .ts/.js/.py/.sh file):",
    prompt:
      "Enter the prompt to send to the Claude model ($ARGUMENTS will be replaced with hook context):",
    url: "Enter the URL to POST to:",
  }

  return clack.text({
    message: messages[field] || `Enter value for ${field}:`,
    validate: (v) => {
      if (!v.trim()) return `${field} is required`
    },
  })
}

/**
 * @param {import("./hook-metadata.mjs").HookMeta} meta
 * @param {object} options
 * @param {boolean} required
 * @returns {Promise<string | null | symbol>}
 */
async function getMatcherValue(meta, options, required) {
  if (options.matcher) return options.matcher
  if (options.nonInteractive && !options.matcher) {
    if (required) {
      clack.log.error(`Matcher is required for ${meta.name}`)
      return null
    }
    return undefined
  }

  clack.log.info(
    `Matcher for ${meta.name}:\n  Matches on: ${meta.matcherField}\n  ${meta.matcherDescription}`,
  )

  if (meta.matcherValues) {
    return clack.select({
      message: `Select ${meta.matcherField} to match:`,
      options: meta.matcherValues.map((v) => ({
        value: v,
        label: v,
      })),
    })
  }

  return clack.text({
    message: `Enter matcher pattern (matches ${meta.matcherField}):`,
    placeholder: meta.name === "FileChanged" ? ".envrc|.env" : "Bash",
    validate: (v) => {
      if (required && !v.trim()) return "Matcher is required"
      if (meta.matcherField === "tool_name") {
        try {
          new RegExp(v)
        } catch {
          return "Must be a valid regex pattern"
        }
      }
    },
  })
}

/**
 * Interactive loop for optional config fields.
 * @param {import("./hook-metadata.mjs").HookMeta} meta
 * @param {Record<string, unknown>} handler
 * @param {object} options
 * @returns {Promise<{ matcher?: string } | null>}
 */
async function optionalFieldsMenu(meta, handler, options) {
  /** @type {string | undefined} */
  let matcher = undefined
  let done = false

  while (!done) {
    /** @type {Array<{ value: string, label: string, hint: string }>} */
    const menuOptions = []

    menuOptions.push({
      value: "__done__",
      label: "Done — save this hook",
      hint: "Finish configuring and add the hook",
    })

    if (meta.hasMatcher && !meta.matcherRequired && matcher === undefined) {
      menuOptions.push({
        value: "matcher",
        label: "Matcher",
        hint: `Filter which ${meta.matcherField} events trigger this hook`,
      })
    }

    if (handler.timeout === undefined) {
      menuOptions.push({
        value: "timeout",
        label: "Timeout",
        hint: `Max execution time in ms (default: ${meta.defaultTimeout})`,
      })
    }

    if (handler.async === undefined) {
      menuOptions.push({
        value: "async",
        label: "Async",
        hint: "Run in background without blocking Claude Code",
      })
    }

    if (handler.asyncRewake === undefined) {
      menuOptions.push({
        value: "asyncRewake",
        label: "Async Rewake",
        hint: "Run async but wake model on failure (exit code 2)",
      })
    }

    if (handler.statusMessage === undefined) {
      menuOptions.push({
        value: "statusMessage",
        label: "Status Message",
        hint: "Custom spinner message shown while hook runs",
      })
    }

    if (meta.supportsIf && handler.if === undefined) {
      menuOptions.push({
        value: "if",
        label: "If Condition",
        hint: "Only spawn hook when this permission rule matches (e.g. Bash(git *))",
      })
    }

    if (meta.supportsOnce && handler.once === undefined) {
      menuOptions.push({
        value: "once",
        label: "Once",
        hint: "Only fire once per session (skills only, not agents)",
      })
    }

    if (handler.type === "http" && handler.headers === undefined) {
      menuOptions.push({
        value: "headers",
        label: "Headers",
        hint: "HTTP headers (supports $VAR_NAME interpolation)",
      })
    }

    if (handler.type === "http" && handler.allowedEnvVars === undefined) {
      menuOptions.push({
        value: "allowedEnvVars",
        label: "Allowed Env Vars",
        hint: "Environment variables allowed in header interpolation",
      })
    }

    // If only "Done" remains, auto-finish
    if (menuOptions.length === 1) {
      done = true
      break
    }

    const choice = await clack.select({
      message: "Configure optional fields (or Done to finish):",
      options: menuOptions,
    })

    if (clack.isCancel(choice)) return null

    if (choice === "__done__") {
      done = true
      break
    }

    const result = await handleOptionalField(
      /** @type {string} */ (choice),
      meta,
      handler,
    )
    if (result === null) return null
    if (result === "cancel") continue // back to menu
    if (choice === "matcher") matcher = /** @type {string} */ (result)
  }

  return { matcher }
}

/**
 * Handles a single optional field selection.
 * Returns "cancel" to go back, null if user cancelled entirely, or the value.
 * @param {string} field
 * @param {import("./hook-metadata.mjs").HookMeta} meta
 * @param {Record<string, unknown>} handler
 * @returns {Promise<unknown>}
 */
async function handleOptionalField(field, meta, handler) {
  switch (field) {
    case "matcher": {
      const val = await getMatcherValue(meta, {}, false)
      if (clack.isCancel(val)) return "cancel"
      return val
    }

    case "timeout": {
      const val = await clack.text({
        message: `Enter timeout in milliseconds (default: ${meta.defaultTimeout}):`,
        placeholder: String(meta.defaultTimeout),
        validate: (v) => {
          if (!v.trim()) return undefined // accept empty = skip
          const n = Number(v)
          if (!Number.isInteger(n) || n <= 0)
            return "Must be a positive integer"
        },
      })
      if (clack.isCancel(val)) return "cancel"
      if (val && val.trim()) handler.timeout = Number(val)
      return val
    }

    case "async": {
      const val = await clack.confirm({
        message: "Run this hook asynchronously (non-blocking)?",
      })
      if (clack.isCancel(val)) return "cancel"
      handler.async = val
      return val
    }

    case "asyncRewake": {
      clack.log.info(
        "asyncRewake: Runs async but wakes the model if the hook exits with code 2 (blocking error).",
      )
      const val = await clack.confirm({
        message: "Enable asyncRewake?",
      })
      if (clack.isCancel(val)) return "cancel"
      handler.asyncRewake = val
      return val
    }

    case "statusMessage": {
      const val = await clack.text({
        message: "Enter status message (shown in spinner while hook runs):",
        placeholder: meta.name,
      })
      if (clack.isCancel(val)) return "cancel"
      if (val && val.trim()) handler.statusMessage = val
      return val
    }

    case "if": {
      clack.log.info(
        "The `if` condition uses permission rule syntax.\nExamples: Bash(git *), Edit(*.ts), mcp__.*",
      )
      const val = await clack.text({
        message: "Enter if condition:",
        placeholder: "Bash(git *)",
      })
      if (clack.isCancel(val)) return "cancel"
      if (val && val.trim()) handler.if = val
      return val
    }

    case "once": {
      const val = await clack.confirm({
        message: "Only fire this hook once per session?",
      })
      if (clack.isCancel(val)) return "cancel"
      handler.once = val
      return val
    }

    case "headers": {
      const val = await clack.text({
        message:
          'Enter headers as JSON (e.g. {"Authorization": "Bearer $MY_TOKEN"}):',
        validate: (v) => {
          if (!v.trim()) return undefined
          try {
            const parsed = JSON.parse(v)
            if (typeof parsed !== "object" || Array.isArray(parsed))
              return "Must be a JSON object"
          } catch {
            return "Invalid JSON"
          }
        },
      })
      if (clack.isCancel(val)) return "cancel"
      if (val && val.trim()) handler.headers = JSON.parse(val)
      return val
    }

    case "allowedEnvVars": {
      const val = await clack.text({
        message: "Enter allowed env var names (comma-separated):",
        placeholder: "MY_TOKEN,API_KEY",
      })
      if (clack.isCancel(val)) return "cancel"
      if (val && val.trim()) {
        handler.allowedEnvVars = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return val
    }

    default:
      return "cancel"
  }
}

/**
 * Applies non-interactive options to the handler.
 * @param {import("./hook-metadata.mjs").HookMeta} meta
 * @param {Record<string, unknown>} handler
 * @param {object} options
 */
function applyNonInteractiveOptions(meta, handler, options) {
  if (options.timeout !== undefined) handler.timeout = options.timeout
  if (options.async !== undefined) handler.async = options.async
  if (options.once !== undefined && meta.supportsOnce)
    handler.once = options.once
  if (options.statusMessage) handler.statusMessage = options.statusMessage
  if (options.ifCondition && meta.supportsIf) handler.if = options.ifCondition
}
