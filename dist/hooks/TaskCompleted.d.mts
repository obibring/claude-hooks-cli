/** TaskCompleted does not support matchers — always fires. */
export const TaskCompletedMatcherSchema: undefined
/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCompletedConfigSchema: z.ZodObject<
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
              if: z.ZodOptional<z.ZodString>
              type: z.ZodLiteral<"command">
              command: z.ZodString
            },
            z.core.$strict
          >,
          z.ZodObject<
            {
              type: z.ZodLiteral<"prompt">
              prompt: z.ZodString
              model: z.ZodOptional<
                z.ZodEnum<{
                  opus: "opus"
                  sonnet: "sonnet"
                  haiku: "haiku"
                  "opus[4m]": "opus[4m]"
                  "sonnet[4m]": "sonnet[4m]"
                }>
              >
              if: z.ZodOptional<z.ZodString>
              timeout: z.ZodOptional<z.ZodNumber>
              statusMessage: z.ZodOptional<z.ZodString>
            },
            z.core.$strict
          >,
          z.ZodObject<
            {
              timeout: z.ZodOptional<z.ZodNumber>
              async: z.ZodOptional<z.ZodBoolean>
              asyncRewake: z.ZodOptional<z.ZodBoolean>
              statusMessage: z.ZodOptional<z.ZodString>
              if: z.ZodOptional<z.ZodString>
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
              if: z.ZodOptional<z.ZodString>
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
/** @typedef {z.infer<typeof TaskCompletedConfigSchema>} TaskCompletedConfig */
export const TaskCompletedInputSchema: z.ZodObject<
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
    hook_event_name: z.ZodLiteral<"TaskCompleted">
    task_id: z.ZodString
    task_subject: z.ZodString
    task_description: z.ZodString
    teammate_name: z.ZodString
    team_name: z.ZodString
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof TaskCompletedInputSchema>} TaskCompletedInput */
/** TaskCompleted supports JSON decision control with continue/stopReason. */
export const TaskCompletedOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
export type TaskCompletedConfig = z.infer<typeof TaskCompletedConfigSchema>
export type TaskCompletedInput = z.infer<typeof TaskCompletedInputSchema>
export type TaskCompletedOutput = z.infer<typeof TaskCompletedOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=TaskCompleted.d.mts.map
