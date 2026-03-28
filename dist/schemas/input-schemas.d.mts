/**
 * Common input fields present in every hook's stdin JSON.
 * Hook-specific files extend this with their own fields using z.object().extend().
 */
export const BaseHookInputSchema: z.ZodObject<
  {
    hook_event_name: z.ZodString
    session_id: z.ZodString
    transcript_path: z.ZodString
    cwd: z.ZodString
    permission_mode: z.ZodEnum<{
      default: "default"
      plan: "plan"
      acceptEdits: "acceptEdits"
      dontAsk: "dontAsk"
      bypassPermissions: "bypassPermissions"
    }>
    agent_id: z.ZodOptional<z.ZodString>
    agent_type: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof BaseHookInputSchema>} BaseHookInput */
/**
 * Shared shape for tool-related hooks (PreToolUse, PostToolUse, etc.).
 * Contains tool_name and tool_input fields common to all tool event hooks.
 */
export const ToolFieldsSchema: z.ZodObject<
  {
    tool_name: z.ZodString
    tool_input: z.ZodRecord<z.ZodString, z.ZodUnknown>
  },
  z.core.$strip
>
export type BaseHookInput = z.infer<typeof BaseHookInputSchema>
export type ToolFields = z.infer<typeof ToolFieldsSchema>
import { z } from "zod/v4"
//# sourceMappingURL=input-schemas.d.mts.map
