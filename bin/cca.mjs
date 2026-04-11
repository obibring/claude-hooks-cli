#!/usr/bin/env node

import { Command } from "commander"
import * as clack from "@clack/prompts"
import { SelectPrompt, isCancel } from "@clack/core"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { styleText as t } from "node:util"
import { marked } from "marked"
import { markedTerminal } from "marked-terminal"

marked.use(
  markedTerminal({
    width: Math.min(process.stdout.columns || 100, 120),
  }),
)

const program = new Command()

program
  .name("cca")
  .description("CLI tool for browsing Claude Code agents")
  .version("1.0.0")

// ── Navigation symbols ──────────────────────────────────────────────

const BACK = Symbol("back")

/**
 * A select prompt that resolves to BACK on Shift+Tab.
 * Escape/Ctrl+C still cancels (clack cancel symbol).
 * @template T
 * @param {{ message: string, options: import("@clack/prompts").SelectOption<T>[] }} opts
 * @returns {Promise<T | symbol>}
 */
function selectWithBack(opts) {
  const bar = clack.unicode ? "\u2502" : "|"
  const radioOn = clack.unicode ? "\u25CF" : ">"
  const radioOff = clack.unicode ? "\u25CB" : " "
  const corner = clack.unicode ? "\u2514" : "\u2014"

  const prompt = new SelectPrompt({
    options: opts.options,
    render() {
      const symbol =
        this.state === "submit"
          ? t("dim", clack.unicode ? "\u25C7" : "o")
          : this.state === "cancel"
            ? t("dim", clack.unicode ? "\u25A0" : "x")
            : t("cyan", clack.unicode ? "\u25C6" : "*")
      const header = `${t("gray", bar)}\n${symbol}  ${opts.message}\n`

      if (this.state === "submit") {
        const cur = this.options[this.cursor]
        const label = cur.label ?? String(cur.value)
        return `${header}${t("gray", bar)}  ${t("dim", label)}`
      }
      if (this.state === "cancel") {
        const cur = this.options[this.cursor]
        const label = cur.label ?? String(cur.value)
        return `${header}${t("gray", bar)}  ${t(["strikethrough", "dim"], label)}\n${t("gray", bar)}`
      }

      const lines = this.options.map((o, i) => {
        const label = o.label ?? String(o.value)
        const hint = o.hint ? ` ${t("dim", `(${o.hint})`)}` : ""
        if (i === this.cursor)
          return `${t("cyan", bar)}  ${t("green", radioOn)} ${label}${hint}`
        return `${t("cyan", bar)}  ${t("dim", radioOff)} ${t("dim", label)}`
      })

      return `${header}${lines.join("\n")}\n${corner}\n`
    },
  })

  // Intercept Shift+Tab -> resolve with BACK
  prompt.on("key", (_char, key) => {
    if (key?.name === "tab" && key?.shift) {
      prompt.state = "submit"
      prompt.value = /** @type {any} */ (BACK)
      prompt.emit("finalize")
    }
  })

  return prompt.prompt()
}

// ── Agent discovery ─────────────────────────────────────────────────

/**
 * @typedef {{ name: string, filePath: string, dir: string }} AgentEntry
 */

/**
 * List .md files in a .claude/agents directory.
 * @param {string} baseDir
 * @returns {AgentEntry[]}
 */
function listAgentsIn(baseDir) {
  const agentsDir = path.join(baseDir, ".claude", "agents")
  if (!fs.existsSync(agentsDir)) return []
  return fs
    .readdirSync(agentsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      name: f.replace(/\.md$/, ""),
      filePath: path.join(agentsDir, f),
      dir: agentsDir,
    }))
}

/**
 * Walk from projectDir up to homeDir, collecting agents from every
 * .claude/agents directory along the path.
 * @param {string} projectDir
 * @param {string} homeDir
 * @returns {AgentEntry[]}
 */
function listAgentsAll(projectDir, homeDir) {
  /** @type {AgentEntry[]} */
  const results = []
  /** @type {Set<string>} */
  const seen = new Set()
  let current = path.resolve(projectDir)
  const home = path.resolve(homeDir)

  while (true) {
    if (!seen.has(current)) {
      seen.add(current)
      results.push(...listAgentsIn(current))
    }
    if (current === home) break
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }

  if (!seen.has(home)) {
    results.push(...listAgentsIn(home))
  }

  return results
}

// ── State machine ───────────────────────────────────────────────────

/**
 * @param {string} projectDir
 * @param {string} scope
 * @param {string} homeDir
 * @returns {AgentEntry[]}
 */
function agentsForScope(projectDir, scope, homeDir) {
  switch (scope) {
    case "project":
      return listAgentsIn(projectDir)
    case "user":
      return listAgentsIn(homeDir)
    case "all":
      return listAgentsAll(projectDir, homeDir)
    default:
      return []
  }
}

/**
 * Interactive loop with state-machine navigation.
 *
 * States:  scope  <-->  agents  --> (show content, stay on agents)
 *
 * - Escape at agents  -> back to scope
 * - Shift+Tab at agents -> back to scope
 * - Escape at scope   -> exit
 * - Shift+Tab at scope -> exit (nowhere further back)
 */
async function interactiveLoop() {
  const projectDir = process.env.CWD || process.env.PWD || process.cwd()
  const homeDir = os.homedir()

  clack.intro("Claude Code Agents")
  clack.log.info("Esc / Shift+Tab: go back  \u2022  Ctrl+C: exit\n")

  /** @type {string | null} */
  let lastRendered = null

  // Outer loop: scope selection
  while (true) {
    const scope = await selectWithBack({
      message: "Which agents?",
      options: [
        {
          value: "project",
          label: "Project",
          hint: path.join(projectDir, ".claude", "agents"),
        },
        {
          value: "user",
          label: "User",
          hint: path.join(homeDir, ".claude", "agents"),
        },
        {
          value: "all",
          label: "All",
          hint: `Walk from project dir to ${homeDir}`,
        },
      ],
    })

    if (isCancel(scope) || scope === BACK) break

    const agents = agentsForScope(
      projectDir,
      /** @type {string} */ (scope),
      homeDir,
    )

    if (agents.length === 0) {
      clack.log.warn("No agents found.")
      continue
    }

    // Inner loop: agent selection
    while (true) {
      const selected = await selectWithBack({
        message: "Select an agent (Esc to go back):",
        options: agents.map((a) => ({
          value: a.filePath,
          label: a.name,
          hint: a.dir,
        })),
      })

      // Escape or Shift+Tab -> back to scope
      if (isCancel(selected) || selected === BACK) {
        // If there was previously rendered content, re-print it
        // so user can see what they were looking at
        if (lastRendered) {
          console.log(lastRendered)
        }
        break
      }

      const raw = fs.readFileSync(/** @type {string} */ (selected), "utf-8")
      lastRendered = marked(raw)
      console.log(lastRendered)
    }
  }

  clack.outro("Goodbye")
}

// ── CLI commands ────────────────────────────────────────────────────

const showCmd = new Command("show")
  .description("Browse and view agent definition files")
  .option("-s, --scope <scope>", 'Scope: "project", "user", or "all"')

showCmd.action(async (opts) => {
  if (opts.scope) {
    const projectDir = process.env.CWD || process.env.PWD || process.cwd()
    const homeDir = os.homedir()

    const agents = agentsForScope(projectDir, opts.scope, homeDir)

    if (agents.length === 0) {
      clack.log.warn("No agents found.")
      return
    }

    const selected = await clack.select({
      message: "Select an agent:",
      options: agents.map((a) => ({
        value: a.filePath,
        label: a.name,
        hint: a.dir,
      })),
    })

    if (clack.isCancel(selected)) return

    const contents = fs.readFileSync(/** @type {string} */ (selected), "utf-8")
    console.log(marked(contents))
    return
  }

  await interactiveLoop()
})

program.addCommand(showCmd)

program.action(async () => {
  await showCmd.parseAsync([], { from: "user" })
})

program.parse()
