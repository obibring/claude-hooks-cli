import { existsSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import * as clack from "@clack/prompts"
import {
  HOOK_METADATA,
  getHookMeta,
  HANDLER_TYPE_INFO,
} from "./hook-metadata.mjs"
import {
  resolveCommand,
  parseCommandAsFile,
  createCommandFile,
} from "./command-resolver.mjs"

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
 * @param {boolean} [options.create] - Create the command file if it doesn't exist
 * @param {boolean} [options.autoPromptSuffix] - Auto-append JSON response instructions to prompt hooks (default: ask in interactive, true in non-interactive)
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
    eventName,
  )
  if (primaryValue === null || clack.isCancel(primaryValue)) return null

  // Build the handler object
  /** @type {Record<string, unknown>} */
  const handler = { type: handlerType }

  if (handlerType === "command") {
    // Handle --create: create the command file if requested
    if (options.create) {
      const fileResult = await handleCreateFile(primaryValue, options)
      if (fileResult === null) return null
      handler.command = fileResult
    } else if (options.command) {
      // Non-interactive: resolve bare file paths to runner commands
      handler.command = resolveCommand(primaryValue)
    } else {
      // Interactive: getCommandInteractive() already built the full command
      handler.command = primaryValue
    }
  } else if (handlerType === "http") {
    handler.url = primaryValue
  } else if (handlerType === "prompt") {
    handler.prompt = await maybeAppendPromptSuffix(primaryValue, options)
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
 * Handles --create: parse the command as a file path, validate it has
 * an extension, confirm with the user, create the file, and return
 * the runner-wrapped command string.
 *
 * @param {string} commandValue - User-provided command/path string
 * @param {object} options
 * @param {boolean} [options.nonInteractive]
 * @returns {Promise<string | null>} Runner-wrapped command, or null if cancelled/errored
 */
async function handleCreateFile(commandValue, options) {
  const result = parseCommandAsFile(commandValue)

  if ("error" in result) {
    clack.log.error(result.error)
    return null
  }

  const { resolved, relativePath, ext, runnerCommand } = result

  if (existsSync(resolved)) {
    clack.log.info(`File already exists: ${relativePath}`)
    return runnerCommand
  }

  clack.log.info(`Will create: ${relativePath}`)

  if (!options.nonInteractive) {
    const confirmed = await clack.confirm({
      message: `Create ${relativePath}?`,
    })
    if (clack.isCancel(confirmed) || !confirmed) return null
  }

  await createCommandFile(resolved, ext)
  clack.log.success(`Created ${relativePath}`)

  return runnerCommand
}

const PROMPT_HOOK_SUFFIX =
  '\n\nRespond with JSON: {"ok": true} to allow stopping, or {"ok": false, "reason": "your explanation"} to continue working.'

/**
 * Asks the user (in interactive mode) whether to auto-append the JSON response
 * instructions to their prompt. In non-interactive mode, appends by default
 * unless autoPromptSuffix is explicitly false.
 *
 * @param {string} promptValue - The user's prompt text
 * @param {object} options
 * @param {boolean} [options.autoPromptSuffix]
 * @param {boolean} [options.nonInteractive]
 * @returns {Promise<string>}
 */
async function maybeAppendPromptSuffix(promptValue, options) {
  if (options.nonInteractive) {
    if (options.autoPromptSuffix === false) {
      return promptValue
    }
    return promptValue + PROMPT_HOOK_SUFFIX
  }

  const shouldAppend = await clack.confirm({
    message:
      "Append JSON response format instructions to your prompt automatically?",
    initialValue: true,
  })

  if (clack.isCancel(shouldAppend)) {
    return promptValue
  }

  if (shouldAppend) {
    clack.log.success("Response format instructions will be appended.")
    return promptValue + PROMPT_HOOK_SUFFIX
  }

  clack.log.info(
    "Make sure your prompt instructs Claude to respond with {ok: boolean, reason?: string}.",
  )
  return promptValue
}

/**
 * @returns {Promise<string | symbol>}
 */
async function selectHookEvent() {
  const sorted = [...HOOK_METADATA].sort((a, b) => a.name.localeCompare(b.name))
  return clack.autocomplete({
    message: "Select a hook event (type to filter):",
    options: sorted.map((h) => ({
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
 * @param {string} eventName
 * @returns {Promise<string | null | symbol>}
 */
async function getRequiredFieldValue(field, handlerType, options, eventName) {
  // Check if provided via options
  if (field === "command" && options.command) return options.command
  if (field === "url" && options.command) return options.command
  if (field === "prompt" && options.command) return options.command
  if (options.nonInteractive) {
    clack.log.error(`Missing required field: ${field}`)
    return null
  }

  // Interactive command input — ask what kind of command
  if (field === "command") {
    return getCommandInteractive(eventName)
  }

  if (field === "prompt" && handlerType === "prompt") {
    clack.log.info(
      `Prompt hooks must instruct Claude to respond with JSON:\n` +
        `  {"ok": true} to allow/approve, or\n` +
        `  {"ok": false, "reason": "explanation"} to deny/block.\n` +
        `You can write your own response instructions, or the CLI can\n` +
        `append them automatically after your prompt.`,
    )
  }

  const messages = {
    prompt:
      "Enter your prompt ($ARGUMENTS will be replaced with hook context at runtime; response format instructions will be handled separately):",
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
 * Generates a hook script template with HookHandler usage.
 *
 * @param {string} eventName - The hook event name
 * @param {"ts" | "js"} lang - Language variant
 * @returns {string}
 */
function generateHookScript(eventName, lang) {
  const isToolEvent = [
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "PermissionRequest",
  ].includes(eventName)

  const toolInputDocs = isToolEvent
    ? `
 *
 * Get typed tool input (only for tool-event hooks):
 *   const bash = handler.getToolInput("Bash", input)
 *   if (bash) {
 *     console.log(bash.command) // strongly typed
 *   }
 *   // Supported: Bash, Write, Edit, Read, Glob, Grep,
 *   //            WebFetch, WebSearch, Agent, AskUserQuestion`
    : ""

  return `${lang === "ts" ? "#!/usr/bin/env npx tsx" : "#!/usr/bin/env node"}
import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = new HookHandler("${eventName}")

/**
 * Parse the hook input from stdin (synchronous, strongly typed):
 *   const input = handler.parseInput()
 *
 * Emit output and exit with code 0:
 *   handler.emitOutput({ additionalContext: "extra info for Claude" })
 *
 * Exit with a blocking error (code 2, message fed to model):
 *   handler.emitBlockingError("Something went wrong")
 *
 * Read Claude Code environment variables:
 *   const projectDir = handler.getEnv("CLAUDE_PROJECT_DIR")${toolInputDocs}
 *
 * Pass through (exit 0, no output):
 *   handler.exit()
 */

const input = handler.parseInput()

// TODO: Add your hook logic here, then call one of:
//   handler.emitOutput({ ... })      — send output to Claude and exit (code 0)
//   handler.emitBlockingError("...")  — block with error message (code 2)
//   handler.exit()                    — pass through, no output (code 0)
`
}

/**
 * Interactive flow for getting a command value.
 * Asks the user whether they want a TS script, JS script, or custom command.
 * For scripts, checks if the file exists and scaffolds it if not.
 * Builds the correct invocation with $CLAUDE_PROJECT_DIR for relative paths.
 *
 * @param {string} eventName - The hook event name
 * @returns {Promise<string | null | symbol>}
 */
async function getCommandInteractive(eventName) {
  const choice = await clack.select({
    message: "What kind of command do you want to run?",
    options: [
      {
        value: "ts",
        label: "TypeScript file",
        hint: "Runs with npx -y tsx",
      },
      {
        value: "js",
        label: "JavaScript file",
        hint: "Runs with node",
      },
      {
        value: "custom",
        label: "Custom command",
        hint: "Enter a shell command directly",
      },
    ],
  })

  if (clack.isCancel(choice)) return null

  if (choice === "custom") {
    return clack.text({
      message: "Enter the shell command to run:",
      validate: (v) => {
        if (!v.trim()) return "Command is required"
      },
    })
  }

  // TS or JS script file
  const scriptPath = await clack.text({
    message: `Enter the path to your ${choice === "ts" ? "TypeScript" : "JavaScript"} file:`,
    placeholder: choice === "ts" ? "./hooks/my-hook.ts" : "./hooks/my-hook.mjs",
    validate: (v) => {
      if (!v.trim()) return "File path is required"
    },
  })

  if (clack.isCancel(scriptPath)) return null

  const trimmed = scriptPath.trim()
  let finalPath = trimmed
  let resolved = resolve(process.cwd(), finalPath)
  let shouldWrite = !existsSync(resolved)

  // Handle existing files — warn and ask what to do
  while (existsSync(resolved)) {
    clack.log.warn(`File already exists: ${finalPath}`)

    const action = await clack.select({
      message: "What would you like to do?",
      options: [
        {
          value: "overwrite",
          label: "Overwrite",
          hint: "Replace the existing file with a new template",
        },
        {
          value: "change",
          label: "Change path",
          hint: "Enter a different file path",
        },
        {
          value: "keep",
          label: "Keep existing",
          hint: "Use the existing file as-is",
        },
      ],
    })

    if (clack.isCancel(action)) return null

    if (action === "keep") {
      clack.log.info(`Using existing file: ${finalPath}`)
      break
    }

    if (action === "overwrite") {
      shouldWrite = true
      break
    }

    // change path
    const newPath = await clack.text({
      message: `Enter a new path for the ${choice === "ts" ? "TypeScript" : "JavaScript"} file:`,
      validate: (v) => {
        if (!v.trim()) return "File path is required"
      },
    })
    if (clack.isCancel(newPath)) return null
    finalPath = newPath.trim()
    resolved = resolve(process.cwd(), finalPath)
    shouldWrite = !existsSync(resolved)
  }

  if (shouldWrite) {
    const dir = dirname(resolved)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    const template = generateHookScript(eventName, choice)
    writeFileSync(resolved, template, "utf-8")
    clack.log.success(`Created ${eventName} hook file at ${finalPath}`)
  }

  const runner = choice === "ts" ? "npx -y tsx" : "node"

  // Absolute paths are used as-is; relative paths are prefixed with $CLAUDE_PROJECT_DIR
  if (finalPath.startsWith("/")) {
    return `${runner} "${finalPath}"`
  }

  return `${runner} "$CLAUDE_PROJECT_DIR/${finalPath}"`
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
