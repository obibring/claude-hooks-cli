/**
 * Known Claude Code tool names.
 * Use these constants instead of string literals for type safety and autocomplete.
 *
 * @example
 * ```ts
 * import { TOOL_NAMES } from "@obibring/claude-hooks-cli"
 *
 * const bash = handler.getToolInput(TOOL_NAMES.Bash, input)
 * ```
 */
export const TOOL_NAMES = /** @type {const} */ ({
  Bash: "Bash",
  Write: "Write",
  Edit: "Edit",
  Read: "Read",
  Glob: "Glob",
  Grep: "Grep",
  WebFetch: "WebFetch",
  WebSearch: "WebSearch",
  Agent: "Agent",
  AskUserQuestion: "AskUserQuestion",
  ExitPlanMode: "ExitPlanMode",
})

/** @typedef {keyof typeof TOOL_NAMES} ToolName */
