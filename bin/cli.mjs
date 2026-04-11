#!/usr/bin/env node

import { Command } from "commander"
import * as clack from "@clack/prompts"
import { addHookFlow } from "../lib/add-hook.mjs"
import { listHooksFlow } from "../lib/list-hooks.mjs"
import { removeHookFlow } from "../lib/remove-hook.mjs"
import { testHookFlow } from "../lib/test-hook.mjs"
import { saveHook } from "../lib/hooks-manager.mjs"
import { HOOK_EVENT_NAMES, HOOK_METADATA } from "../lib/hook-metadata.mjs"
import { HOOK_DOCS_MAP } from "../lib/docs-map.mjs"
import { marked } from "marked"
import { markedTerminal } from "marked-terminal"

marked.use(
  markedTerminal({
    width: Math.min(process.stdout.columns || 100, 120),
    tableOptions: {
      wordWrap: true,
      wrapOnWordBoundary: true,
      colWidths: [15, 22, 50],
    },
  }),
)

const program = new Command()

program
  .name("claude-hooks")
  .description("CLI tool for managing Claude Code hooks")
  .version("1.0.0")

/** @param {Command} cmd */
function addScopeOption(cmd) {
  return cmd.option(
    "-s, --scope <scope>",
    "Settings scope: user, project, or local",
    "project",
  )
}

// --- ADD ---

const addCmd = new Command("add")
  .description("Add a new hook to Claude Code settings")
  .option(
    "-e, --event <event>",
    `Hook event name (${HOOK_EVENT_NAMES.join(", ")})`,
  )
  .option("-t, --type <type>", "Handler type: command, prompt, agent, http")
  .option("-c, --command <command>", "Command, prompt, or URL for the handler")
  .option("-m, --matcher <matcher>", "Matcher pattern")
  .option("--timeout <ms>", "Timeout in milliseconds", parseInt)
  .option("--async", "Run asynchronously")
  .option("--once", "Only fire once per session")
  .option("--status-message <msg>", "Status spinner message")
  .option("--if <condition>", "Conditional execution rule")
  .option("--create", "Create the command file if it doesn't exist")
  .option(
    "--auto-prompt-suffix",
    "Auto-append JSON response format instructions to prompt hooks",
  )
  .option(
    "--no-auto-prompt-suffix",
    "Do not append JSON response format instructions to prompt hooks",
  )
  .option("--non-interactive", "Non-interactive mode (for agents/scripts)")

addScopeOption(addCmd)

addCmd.action(async (opts) => {
  const scope = validateScope(opts.scope)
  if (!scope) return

  clack.intro("Add a Claude Code hook")

  while (true) {
    const result = await addHookFlow({
      event: opts.event,
      type: opts.type,
      command: opts.command,
      matcher: opts.matcher,
      timeout: opts.timeout,
      async: opts.async,
      once: opts.once,
      statusMessage: opts.statusMessage,
      ifCondition: opts.if,
      create: opts.create,
      autoPromptSuffix: opts.autoPromptSuffix,
      nonInteractive: opts.nonInteractive,
    })

    if (!result) {
      clack.log.info("Cancelled")
    } else {
      const { filePath } = await saveHook(
        scope,
        result.eventName,
        result.configEntry,
      )

      clack.log.success(
        `Added ${result.eventName} hook to ${scope} settings (${filePath})`,
      )
      clack.log.message(JSON.stringify(result.configEntry, null, 2))
    }

    if (opts.nonInteractive) break
    clack.log.info("Press Ctrl+C to exit\n")
  }
})

program.addCommand(addCmd)

// --- LIST ---

const listCmd = new Command("list")
  .alias("ls")
  .description("List all configured hooks")

addScopeOption(listCmd)

listCmd.action(async (opts) => {
  const scope = validateScope(opts.scope)
  if (!scope) return

  clack.intro("List Claude Code hooks")

  while (true) {
    await listHooksFlow(scope)
    clack.log.info("Press Ctrl+C to exit\n")
  }
})

program.addCommand(listCmd)

// --- REMOVE ---

const removeCmd = new Command("remove")
  .alias("rm")
  .description("Remove a hook from settings")
  .option("-e, --event <event>", "Filter by event name")
  .option("-i, --index <index>", "Hook index to remove", parseInt)
  .option("--non-interactive", "Non-interactive mode")

addScopeOption(removeCmd)

removeCmd.action(async (opts) => {
  const scope = validateScope(opts.scope)
  if (!scope) return

  clack.intro("Remove a Claude Code hook")

  while (true) {
    await removeHookFlow(scope, {
      event: opts.event,
      index: opts.index,
      nonInteractive: opts.nonInteractive,
    })

    if (opts.nonInteractive) break
    clack.log.info("Press Ctrl+C to exit\n")
  }
})

program.addCommand(removeCmd)

// --- TEST ---

const testCmd = new Command("test").description(
  "Test a hook by running it with synthetic input",
)

addScopeOption(testCmd)

testCmd.action(async (opts) => {
  const scope = validateScope(opts.scope)
  if (!scope) return

  clack.intro("Test a Claude Code hook")

  while (true) {
    await testHookFlow(scope)
    clack.log.info("Press Ctrl+C to exit\n")
  }
})

program.addCommand(testCmd)

// --- DOCS ---

const docsCmd = new Command("docs")
  .description("View documentation for a hook event")
  .option("--hook <hook>", "Hook event name (required in non-interactive mode)")

docsCmd.action(async (opts) => {
  clack.intro("Hook Documentation")

  while (true) {
    let hookName = opts.hook

    if (!hookName) {
      const sorted = [...HOOK_METADATA].sort((a, b) =>
        a.name.localeCompare(b.name),
      )

      hookName = await clack.autocomplete({
        message: "Select a hook event (type to filter):",
        options: sorted.map((h) => ({
          value: h.name,
          label: h.name,
          hint: h.description,
        })),
      })

      if (clack.isCancel(hookName)) break
    }

    const doc = HOOK_DOCS_MAP[hookName]
    if (!doc) {
      clack.log.error(`Unknown hook event: ${hookName}`)
    } else {
      console.log(marked(doc))
    }

    // If --hook was passed, don't loop
    if (opts.hook) break
    clack.log.info("Press Ctrl+C to exit\n")
  }
})

program.addCommand(docsCmd)

// --- Default: interactive menu ---

program.action(async () => {
  clack.intro("Claude Code Hooks Manager")

  while (true) {
    const action = await clack.select({
      message: "What would you like to do?",
      options: [
        {
          value: "add",
          label: "Add a hook",
          hint: "Create a new hook configuration",
        },
        {
          value: "list",
          label: "List hooks",
          hint: "Show all configured hooks",
        },
        {
          value: "remove",
          label: "Remove a hook",
          hint: "Delete a hook configuration",
        },
        {
          value: "test",
          label: "Test a hook",
          hint: "Run a hook with synthetic input",
        },
        {
          value: "docs",
          label: "View docs",
          hint: "Read documentation for a hook event",
        },
      ],
    })

    if (clack.isCancel(action)) break

    // Docs don't need a scope — handle separately
    if (action === "docs") {
      const sorted = [...HOOK_METADATA].sort((a, b) =>
        a.name.localeCompare(b.name),
      )
      const hookName = await clack.autocomplete({
        message: "Select a hook event (type to filter):",
        options: sorted.map((h) => ({
          value: h.name,
          label: h.name,
          hint: h.description,
        })),
      })
      if (clack.isCancel(hookName)) continue
      const doc = HOOK_DOCS_MAP[hookName]
      if (doc) console.log(marked(doc))
      clack.log.info("Press Ctrl+C to exit\n")
      continue
    }

    const scope = await clack.select({
      message: "Which settings scope?",
      options: [
        {
          value: "project",
          label: "Project",
          hint: ".claude/settings.json (shared with team)",
        },
        {
          value: "local",
          label: "Local",
          hint: ".claude/settings.local.json (personal, git-ignored)",
        },
        {
          value: "user",
          label: "User",
          hint: "~/.claude/settings.json (global)",
        },
      ],
    })

    if (clack.isCancel(scope)) continue

    switch (action) {
      case "add": {
        const result = await addHookFlow()
        if (result) {
          await saveHook(
            /** @type {"user"|"project"|"local"} */ (scope),
            result.eventName,
            result.configEntry,
          )
          clack.log.success(
            `Added ${result.eventName} hook to ${scope} settings`,
          )
          clack.log.message(JSON.stringify(result.configEntry, null, 2))
        }
        break
      }
      case "list":
        await listHooksFlow(/** @type {"user"|"project"|"local"} */ (scope))
        break
      case "remove":
        await removeHookFlow(/** @type {"user"|"project"|"local"} */ (scope))
        break
      case "test":
        await testHookFlow(/** @type {"user"|"project"|"local"} */ (scope))
        break
    }

    clack.log.info("Press Ctrl+C to exit\n")
  }

  clack.outro("Goodbye")
})

program.parse()

/**
 * @param {string} scope
 * @returns {"user" | "project" | "local" | null}
 */
function validateScope(scope) {
  if (!["user", "project", "local"].includes(scope)) {
    console.error(`Invalid scope: ${scope}. Must be user, project, or local.`)
    return null
  }
  return /** @type {"user" | "project" | "local"} */ (scope)
}
