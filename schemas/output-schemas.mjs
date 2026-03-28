import { z } from "zod/v4"

/**
 * Universal JSON output fields that all hooks can return via stdout.
 * Hook-specific output schemas (e.g., PreToolUse's permissionDecision)
 * are defined in each hook's individual file.
 */
export const BaseHookOutputSchema = z.object({
  /** If false, stops Claude entirely */
  continue: z.boolean().optional(),
  /** Message shown when continue is false */
  stopReason: z.string().optional(),
  /** Hides stdout from verbose mode */
  suppressOutput: z.boolean().optional(),
  /** Warning message shown to user */
  systemMessage: z.string().optional(),
  /** Context added to Claude's conversation */
  additionalContext: z.string().optional(),
})

/** @typedef {z.infer<typeof BaseHookOutputSchema>} BaseHookOutput */
