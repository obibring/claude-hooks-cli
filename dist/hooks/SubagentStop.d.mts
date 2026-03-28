export const SubagentStopMatcherSchema: z.ZodString
/** Supports all 4 handler types. Matcher matches agent_type. */
export const SubagentStopConfigSchema: z.ZodObject<
  {
    matcher: z.ZodOptional<z.ZodString>
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
/** @typedef {z.infer<typeof SubagentStopConfigSchema>} SubagentStopConfig */
export const SubagentStopInputSchema: z.ZodObject<
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
    hook_event_name: z.ZodLiteral<"SubagentStop">
    agent_id: z.ZodString
    agent_type: z.ZodString
    last_assistant_message: z.ZodString
    agent_transcript_path: z.ZodString
    stop_hook_active: z.ZodBoolean
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof SubagentStopInputSchema>} SubagentStopInput */
export const SubagentStopOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
    decision: z.ZodOptional<z.ZodLiteral<"block">>
  },
  z.core.$strip
>
export type SubagentStopMatcher = z.infer<typeof SubagentStopMatcherSchema>
export type SubagentStopConfig = z.infer<typeof SubagentStopConfigSchema>
export type SubagentStopInput = z.infer<typeof SubagentStopInputSchema>
export type SubagentStopOutput = z.infer<typeof SubagentStopOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=SubagentStop.d.mts.map
