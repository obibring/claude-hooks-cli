import { z } from "zod/v4"
import { PermissionModeSchema } from "./enums.mjs"

/**
 * Common input fields present in every hook's stdin JSON.
 * Hook-specific files extend this with their own fields using z.object().extend().
 */
export const BaseHookInputSchema = z.object({
  /** Name of the hook event that fired */
  hook_event_name: z.string(),
  /** Current session identifier */
  session_id: z.string(),
  /** Path to the conversation transcript JSON file */
  transcript_path: z.string(),
  /** Current working directory */
  cwd: z.string(),
  /** Current permission mode */
  permission_mode: PermissionModeSchema,
  /** Unique subagent identifier (present in subagent context) */
  agent_id: z.string().optional(),
  /** Agent type name (present when using --agent or inside a subagent) */
  agent_type: z.string().optional(),
})

/** @typedef {z.infer<typeof BaseHookInputSchema>} BaseHookInput */

/**
 * Shared shape for tool-related hooks (PreToolUse, PostToolUse, etc.).
 * Contains tool_name and tool_input fields common to all tool event hooks.
 */
export const ToolFieldsSchema = z.object({
  tool_name: z.string(),
  tool_input: z.record(z.string(), z.unknown()),
})

/** @typedef {z.infer<typeof ToolFieldsSchema>} ToolFields */
