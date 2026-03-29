import { readFileSync } from "node:fs"
import { HOOK_SCHEMA_MAP } from "./schema-map.mjs"

/** @typedef {import("./handler-types.d.mts").HookIOMap} HookIOMap */
/** @typedef {import("./handler-types.d.mts").HookEventName} HookEventName */

/**
 * Strongly-typed handler for Claude Code hook scripts.
 *
 * Provides typed input parsing and output emission based on the hook event name
 * passed to the constructor. Methods that call `process.exit()` return `never`
 * so code after them is correctly flagged as unreachable.
 *
 * @example
 * ```js
 * import { HookHandler } from "@obibring/claude-hooks-cli/handler"
 *
 * const handler = new HookHandler("PreToolUse")
 * const input = handler.parseInput()
 *
 * if (input.tool_name === "Bash" && input.tool_input.command?.includes("rm -rf")) {
 *   handler.emitOutput({
 *     hookSpecificOutput: {
 *       permissionDecision: "deny",
 *       permissionDecisionReason: "Blocked dangerous rm -rf command"
 *     }
 *   })
 * }
 *
 * handler.exit()
 * ```
 *
 * @template {keyof HookIOMap} E
 */
export class HookHandler {
  /** @param {E} event */
  constructor(event) {
    /** @readonly */
    this.event = event
    const entry = HOOK_SCHEMA_MAP[event]
    if (!entry) {
      throw new Error(`Unknown hook event: ${event}`)
    }
    /** @private */
    this._inputSchema = entry.inputSchema
  }

  /**
   * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
   * Exits with code 2 if stdin is empty, not valid JSON, or fails schema validation.
   *
   * @returns {HookIOMap[E]["input"]}
   */
  parseInput() {
    let raw
    try {
      raw = readFileSync(0, "utf-8")
    } catch (/** @type {any} */ e) {
      process.stderr.write(`Failed to read stdin: ${e.message}\n`)
      process.exit(2)
    }

    let json
    try {
      json = JSON.parse(raw)
    } catch (/** @type {any} */ e) {
      process.stderr.write(`Failed to parse stdin as JSON: ${e.message}\n`)
      process.exit(2)
    }

    const result = this._inputSchema.safeParse(json)
    if (!result.success) {
      process.stderr.write(
        `Input validation failed for ${this.event}: ${result.error.message}\n`,
      )
      process.exit(2)
    }
    return /** @type {HookIOMap[E]["input"]} */ (result.data)
  }

  /**
   * Writes JSON output to stdout and exits with code 0.
   * Code after this call is unreachable.
   *
   * @this {HookHandler<E>}
   * @param {HookIOMap[E]["output"]} output
   * @returns {never}
   */
  emitOutput(output) {
    process.stdout.write(JSON.stringify(output) + "\n")
    process.exit(0)
  }

  /**
   * Writes an error message to stderr and exits with code 2 (blocking error).
   * The message is fed back to the Claude model.
   * Code after this call is unreachable.
   *
   * @param {string} message
   * @returns {never}
   */
  emitBlockingError(message) {
    process.stderr.write(message + "\n")
    process.exit(2)
  }

  /**
   * Reads a Claude Code environment variable by name.
   * Returns the value from `process.env`, or `undefined` if not set.
   *
   * Available variables:
   *
   * - `CLAUDE_PROJECT_DIR` — Project root directory. Available to **all hooks**.
   *   Always set. Wrap in quotes for paths with spaces.
   *
   * - `CLAUDE_ENV_FILE` — File path for persisting environment variables for
   *   subsequent Bash commands. Use append (`>>`) to preserve variables from
   *   other hooks. **Only available in SessionStart, CwdChanged, and FileChanged hooks.**
   *   For other hook events, the return type is narrowed to `undefined`.
   *
   * - `CLAUDE_PLUGIN_ROOT` — Plugin's root directory, for scripts bundled with
   *   a plugin. **Only available in plugin hooks.** Not set in project or user hooks.
   *
   * - `CLAUDE_CODE_REMOTE` — Set to `"true"` when running in remote web
   *   environments (e.g. claude.ai/code). **Not set in local CLI sessions.**
   *   Check for `=== "true"` rather than truthiness.
   *
   * - `CLAUDE_SKILL_DIR` — Skill's own directory, for scripts bundled with a
   *   skill. **Only available in skill hooks.** Since v2.1.69.
   *
   * - `CLAUDE_PLUGIN_DATA` — Plugin's persistent data directory that survives
   *   plugin updates. **Only available in plugin hooks.** Since v2.1.78.
   *
   * - `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` — Override SessionEnd hook
   *   timeout in milliseconds. Prior to v2.1.74, SessionEnd hooks were killed
   *   after 1.5s regardless of configured timeout. Now respects the hook's
   *   `timeout` value, or this env var if set. Since v2.1.74.
   *
   * @template {import("../schemas/enums.mjs").ClaudeEnvVarName} N
   * @param {N} name - One of the Claude Code environment variable names
   * @returns {N extends "CLAUDE_ENV_FILE" ? (E extends "SessionStart" | "CwdChanged" | "FileChanged" ? string | undefined : undefined | `CLAUDE_ENV_FILE is not available in "${E & string}" hooks. It is only available in: SessionStart, CwdChanged, FileChanged.`) : string | undefined}
   */
  getEnv(name) {
    return /** @type {any} */ (process.env[name])
  }

  /**
   * Exits silently with code 0 (no output — hook passes through).
   * Code after this call is unreachable.
   *
   * @returns {never}
   */
  exit() {
    process.exit(0)
  }
}
