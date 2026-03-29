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
   * @param {import("../schemas/enums.mjs").ClaudeEnvVarName} name - One of the Claude Code environment variable names
   * @returns {string | undefined}
   */
  getEnv(name) {
    return process.env[name]
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
