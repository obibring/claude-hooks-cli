/** WorktreeRemove does not support matchers — always fires. */
export const WorktreeRemoveMatcherSchema: undefined
/** Command-only hook. No matcher support. */
export const WorktreeRemoveConfigSchema: z.ZodObject<
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
/** @typedef {z.infer<typeof WorktreeRemoveConfigSchema>} WorktreeRemoveConfig */
export const WorktreeRemoveInputSchema: z.ZodObject<
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
    hook_event_name: z.ZodLiteral<"WorktreeRemove">
    worktree_path: z.ZodString
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof WorktreeRemoveInputSchema>} WorktreeRemoveInput */
export const WorktreeRemoveOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
export type WorktreeRemoveConfig = z.infer<typeof WorktreeRemoveConfigSchema>
export type WorktreeRemoveInput = z.infer<typeof WorktreeRemoveInputSchema>
export type WorktreeRemoveOutput = z.infer<typeof WorktreeRemoveOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=WorktreeRemove.d.mts.map
