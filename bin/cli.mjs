#!/usr/bin/env node

import { Command } from "commander"
import * as clack from "@clack/prompts"
import { addHookFlow } from "../lib/add-hook.mjs"
import { listHooksFlow } from "../lib/list-hooks.mjs"
import { removeHookFlow } from "../lib/remove-hook.mjs"
import { testHookFlow } from "../lib/test-hook.mjs"
import {
  getSettingsPath,
  readSettings,
  writeSettings,
  addHookToSettings,
} from "../lib/settings.mjs"
import { HOOK_EVENT_NAMES } from "../lib/hook-metadata.mjs"

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
  .option("--non-interactive", "Non-interactive mode (for agents/scripts)")

addScopeOption(addCmd)

addCmd.action(async (opts) => {
  const scope = validateScope(opts.scope)
  if (!scope) return

  clack.intro("Add a Claude Code hook")

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
    nonInteractive: opts.nonInteractive,
  })

  if (!result) {
    clack.outro("Cancelled")
    return
  }

  const filePath = getSettingsPath(scope)
  const settings = await readSettings(filePath)
  addHookToSettings(settings, result.eventName, result.configEntry)
  await writeSettings(filePath, settings)

  clack.log.success(
    `Added ${result.eventName} hook to ${scope} settings (${filePath})`,
  )
  clack.log.message(JSON.stringify(result.configEntry, null, 2))
  clack.outro("Done")
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
  await listHooksFlow(scope)
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

  await removeHookFlow(scope, {
    event: opts.event,
    index: opts.index,
    nonInteractive: opts.nonInteractive,
  })

  clack.outro("Done")
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
  await testHookFlow(scope)
  clack.outro("Done")
})

program.addCommand(testCmd)

// --- Default: interactive menu ---

program.action(async () => {
  clack.intro("Claude Code Hooks Manager")

  const action = await clack.select({
    message: "What would you like to do?",
    options: [
      {
        value: "add",
        label: "Add a hook",
        hint: "Create a new hook configuration",
      },
      { value: "list", label: "List hooks", hint: "Show all configured hooks" },
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
    ],
  })

  if (clack.isCancel(action)) {
    clack.outro("Goodbye")
    return
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

  if (clack.isCancel(scope)) {
    clack.outro("Goodbye")
    return
  }

  switch (action) {
    case "add": {
      const result = await addHookFlow()
      if (result) {
        const filePath = getSettingsPath(
          /** @type {"user"|"project"|"local"} */ (scope),
        )
        const settings = await readSettings(filePath)
        addHookToSettings(settings, result.eventName, result.configEntry)
        await writeSettings(filePath, settings)
        clack.log.success(`Added ${result.eventName} hook to ${scope} settings`)
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

  clack.outro("Done")
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
