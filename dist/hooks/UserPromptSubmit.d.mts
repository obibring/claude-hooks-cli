/** UserPromptSubmit does not support matchers — always fires. */
export const UserPromptSubmitMatcherSchema: undefined
/** Supports all 4 handler types. No matcher support. */
export const UserPromptSubmitConfigSchema: z.ZodObject<
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
              timeout: z.ZodOptional<z.ZodNumber>
              async: z.ZodOptional<z.ZodBoolean>
              asyncRewake: z.ZodOptional<z.ZodBoolean>
              statusMessage: z.ZodOptional<z.ZodString>
              type: z.ZodLiteral<"prompt">
              prompt: z.ZodString
            },
            z.core.$strict
          >,
          z.ZodObject<
            {
              timeout: z.ZodOptional<z.ZodNumber>
              async: z.ZodOptional<z.ZodBoolean>
              asyncRewake: z.ZodOptional<z.ZodBoolean>
              statusMessage: z.ZodOptional<z.ZodString>
              type: z.ZodLiteral<"agent">
              prompt: z.ZodString
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
/** @typedef {z.infer<typeof UserPromptSubmitConfigSchema>} UserPromptSubmitConfig */
export const UserPromptSubmitInputSchema: z.ZodObject<
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
    hook_event_name: z.ZodLiteral<"UserPromptSubmit">
    prompt: z.ZodString
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof UserPromptSubmitInputSchema>} UserPromptSubmitInput */
/** UserPromptSubmit can modify the prompt field in output. */
export const UserPromptSubmitOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
    prompt: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
export type UserPromptSubmitConfig = z.infer<typeof UserPromptSubmitConfigSchema>
export type UserPromptSubmitInput = z.infer<typeof UserPromptSubmitInputSchema>
export type UserPromptSubmitOutput = z.infer<typeof UserPromptSubmitOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=UserPromptSubmit.d.mts.map
