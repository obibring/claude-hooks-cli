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
export class HookHandler<E extends keyof HookIOMap> {
    /** @param {E} event */
    constructor(event: E);
    /** @readonly */
    readonly event: E;
    /** @private */
    private _inputSchema;
    /**
     * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
     * Exits with code 2 if stdin is empty, not valid JSON, or fails schema validation.
     *
     * @returns {HookIOMap[E]["input"]}
     */
    parseInput(): HookIOMap[E]["input"];
    /**
     * Writes JSON output to stdout and exits with code 0.
     * Code after this call is unreachable.
     *
     * @this {HookHandler<E>}
     * @param {HookIOMap[E]["output"]} output
     * @returns {never}
     */
    emitOutput(this: HookHandler<E>, output: HookIOMap[E]["output"]): never;
    /**
     * Writes an error message to stderr and exits with code 2 (blocking error).
     * The message is fed back to the Claude model.
     * Code after this call is unreachable.
     *
     * @param {string} message
     * @returns {never}
     */
    emitBlockingError(message: string): never;
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
     * @param {import("../schemas/enums.mjs").ClaudeEnvVarName} name - One of the Claude Code environment variable names
     * @returns {string | undefined}
     */
    getEnv(name: import("../schemas/enums.mjs").ClaudeEnvVarName): string | undefined;
    /**
     * Exits silently with code 0 (no output — hook passes through).
     * Code after this call is unreachable.
     *
     * @returns {never}
     */
    exit(): never;
}
export type HookIOMap = import("./handler-types.d.mts").HookIOMap;
export type HookEventName = import("./handler-types.d.mts").HookEventName;
//# sourceMappingURL=handler.d.mts.map