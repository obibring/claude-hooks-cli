import { readFileSync, existsSync } from "node:fs"
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
  /**
   * @param {E} event
   * @param {{ readFile?: (filename: string) => string, writeFile?: (filename: string, contents: string, options: { encoding: "utf-8" }) => void }} [options]
   */
  constructor(event, options) {
    /** @readonly */
    this.event = event
    const entry = HOOK_SCHEMA_MAP[event]
    if (!entry) {
      throw new Error(`Unknown hook event: ${event}`)
    }
    /** @private */
    this._inputSchema = entry.inputSchema
    /** @private @type {HookIOMap[E]["input"] | undefined} */
    this._cachedInput = undefined
    /** @private @type {Record<string, string> | undefined} */
    this._cachedEnvFileVars = undefined
    /** @private */
    this._options = options
  }

  /**
   * Creates a hook handler with the correct type for the given event name.
   *
   * @template {keyof HookIOMap} T
   * @param {T} event
   * @param {any} [options]
   * @returns {any}
   */
  static for(event, options) {
    return new HookHandler(event, options)
  }

  /**
   * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
   * Returns cached data on subsequent calls — stdin is only read once.
   * Exits with code 2 if stdin is empty, not valid JSON, or fails schema validation.
   *
   * @returns {HookIOMap[E]["input"]}
   */
  parseInput() {
    if (this._cachedInput !== undefined) {
      return this._cachedInput
    }

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
    this._cachedInput = /** @type {HookIOMap[E]["input"]} */ (result.data)
    return this._cachedInput
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
   * Reads and parses the CLAUDE_ENV_FILE into a key-value object.
   *
   * Only available for SessionStart, CwdChanged, and FileChanged hooks — these
   * are the only events where Claude Code sets the CLAUDE_ENV_FILE env var.
   *
   * Parses the file by splitting lines, stripping comments (# and inline #),
   * extracting VAR_NAME=value pairs, and unwrapping matched quotes from values.
   * Subsequent lines with the same key override earlier ones.
   *
   * Results are cached — call multiple times without performance penalty.
   * Pass `{ force: true }` to re-read the file from disk (result is still
   * cached for subsequent non-force calls).
   *
   * Returns an empty object if CLAUDE_ENV_FILE is not set or the file doesn't exist.
   *
   * @param {{ force?: boolean }} [options]
   * @returns {Record<string, string>}
   */
  getEnvFileVars(options) {
    if (this._cachedEnvFileVars !== undefined && !options?.force) {
      return this._cachedEnvFileVars
    }

    const filePath = process.env.CLAUDE_ENV_FILE
    if (!filePath) {
      this._cachedEnvFileVars = {}
      return this._cachedEnvFileVars
    }

    let raw
    try {
      if (this._options?.readFile) {
        raw = this._options.readFile(filePath)
      } else {
        if (!existsSync(filePath)) {
          this._cachedEnvFileVars = {}
          return this._cachedEnvFileVars
        }
        raw = readFileSync(filePath, "utf-8")
      }
    } catch {
      this._cachedEnvFileVars = {}
      return this._cachedEnvFileVars
    }

    /** @type {Record<string, string>} */
    const result = {}

    const lines = raw.split("\n")
    for (const rawLine of lines) {
      let line = rawLine.trim()
      if (!line || line.startsWith("#")) continue

      // Strip inline comments (# not inside quotes)
      const commentIdx = line.indexOf("#")
      if (commentIdx !== -1) {
        line = line.slice(0, commentIdx).trim()
      }

      // Match VAR_NAME=value
      const eqIdx = line.indexOf("=")
      if (eqIdx === -1) continue

      const key = line.slice(0, eqIdx).trim()
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

      let value = line.slice(eqIdx + 1).trim()

      // Unwrap matched quotes
      if (
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
        (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
      ) {
        value = value.slice(1, -1)
      }

      result[key] = value
    }

    this._cachedEnvFileVars = result
    return result
  }

  /**
   * Returns the strongly-typed tool_input if the input's `tool_name`
   * matches the provided tool name, or `null` if it doesn't match.
   *
   * @template {keyof import("./handler-types.d.mts").ToolInputMap} T
   * @param {T} toolName - The tool name to match against
   * @param {HookIOMap[E]["input"]} input - The parsed input from parseInput()
   * @returns {any}
   */
  getToolInput(toolName, input) {
    const inp = /** @type {Record<string, unknown>} */ (input)
    if (inp.tool_name !== toolName) {
      return null
    }
    return inp.tool_input
  }

  /**
   * Exits the hook script.
   *
   * - `exit("success")` — pass through, no output (exit code 0)
   * - `exit("success", output)` — write JSON output to stdout (exit code 0)
   * - `exit("error", message)` — write error to stderr, fed back to model (exit code 2)
   *
   * @param {"success" | "error"} status
   * @param {any} [data]
   * @returns {never}
   */
  exit(status, data) {
    if (status === "error") {
      process.stderr.write(String(data) + "\n")
      process.exit(2)
    }
    if (data !== undefined) {
      process.stdout.write(JSON.stringify(data) + "\n")
    }
    process.exit(0)
  }
}
