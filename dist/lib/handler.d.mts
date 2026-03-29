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