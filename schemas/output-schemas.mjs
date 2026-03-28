import { z } from "zod/v4"

/**
 * Universal JSON output fields that all hooks can return via stdout.
 * Hook-specific output schemas (e.g., PreToolUse's permissionDecision)
 * are defined in each hook's individual file.
 */
export const BaseHookOutputSchema = z.object({
  /** Set to false to stop Claude entirely. The stopReason message will be displayed. If omitted or true, Claude continues normally. */
  continue: z
    .boolean()
    .optional()
    .describe(
      "Set to false to stop Claude entirely. The stopReason message will be displayed. If omitted or true, Claude continues normally.",
    ),
  /** Message displayed to the user when continue is false. Example: "Hook blocked execution: unsafe operation detected." */
  stopReason: z
    .string()
    .optional()
    .describe(
      'Message displayed to the user when continue is false. Example: "Hook blocked execution: unsafe operation detected."',
    ),
  /** When true, hides this hook's stdout from verbose mode output. Useful for hooks that return JSON control data you don't want cluttering the terminal. */
  suppressOutput: z
    .boolean()
    .optional()
    .describe(
      "When true, hides this hook's stdout from verbose mode output. Useful for hooks that return JSON control data you don't want cluttering the terminal.",
    ),
  /** Warning or info message shown to the user in the Claude Code UI. Does not affect Claude's behavior -- purely for user visibility. Example: "Note: this file is in a protected directory." */
  systemMessage: z
    .string()
    .optional()
    .describe(
      'Warning or info message shown to the user in the Claude Code UI. Does not affect Claude\'s behavior — purely for user visibility. Example: "Note: this file is in a protected directory."',
    ),
  /** Context string injected into Claude's conversation. Claude will see this as additional information when formulating its next response. Example: "The user prefers TypeScript over JavaScript." */
  additionalContext: z
    .string()
    .optional()
    .describe(
      'Context string injected into Claude\'s conversation. Claude will see this as additional information when formulating its next response. Example: "The user prefers TypeScript over JavaScript."',
    ),
})

/** @typedef {z.infer<typeof BaseHookOutputSchema>} BaseHookOutput */
