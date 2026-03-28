/** WorktreeCreate does not support matchers — always fires. */
export const WorktreeCreateMatcherSchema: undefined
/** Command-only hook. No matcher support. */
export const WorktreeCreateConfigSchema: z.ZodObject<
  {
    hooks: z.ZodArray<
      z.ZodDiscriminatedUnion<
        [
          z.ZodObject<
            {
              timeout: z.ZodOptional<z.ZodNumber>
              async: z.ZodOptional<z.ZodBoolean>
              asyncRewake: z.ZodOptional<z.ZodBoolean>
              statusMessage: z.ZodOptional<z.ZodString>
              type: z.ZodLiteral<"command">
              command: z.ZodString
            },
            z.core.$strict
          >,
          z.ZodObject<
            {
              headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
              allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>
              timeout: z.ZodOptional<z.ZodNumber>
              async: z.ZodOptional<z.ZodBoolean>
              asyncRewake: z.ZodOptional<z.ZodBoolean>
              statusMessage: z.ZodOptional<z.ZodString>
              type: z.ZodLiteral<"http">
              url: z.ZodURL
            },
            z.core.$strict
          >,
        ],
        "type"
      >
    >
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof WorktreeCreateConfigSchema>} WorktreeCreateConfig */
export const WorktreeCreateInputSchema: z.ZodObject<
  {
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
    hook_event_name: z.ZodLiteral<"WorktreeCreate">
    name: z.ZodString
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof WorktreeCreateInputSchema>} WorktreeCreateInput */
/** WorktreeCreate: non-zero exit fails creation; stdout provides worktree path. */
export const WorktreeCreateOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
export type WorktreeCreateConfig = z.infer<typeof WorktreeCreateConfigSchema>
export type WorktreeCreateInput = z.infer<typeof WorktreeCreateInputSchema>
export type WorktreeCreateOutput = z.infer<typeof WorktreeCreateOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=WorktreeCreate.d.mts.map
