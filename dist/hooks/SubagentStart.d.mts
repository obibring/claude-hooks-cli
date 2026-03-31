/** Agent type matcher for SubagentStart. */
export const SubagentStartMatcherSchema: z.ZodString
/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema: z.ZodObject<
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
              if: z.ZodOptional<z.ZodString>
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
/** @typedef {z.infer<typeof SubagentStartConfigSchema>} SubagentStartConfig */
export const SubagentStartInputSchema: z.ZodObject<
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
    hook_event_name: z.ZodLiteral<"SubagentStart">
    agent_id: z.ZodString
    agent_type: z.ZodString
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof SubagentStartInputSchema>} SubagentStartInput */
export const SubagentStartOutputSchema: z.ZodObject<
  {
    continue: z.ZodOptional<z.ZodBoolean>
    stopReason: z.ZodOptional<z.ZodString>
    suppressOutput: z.ZodOptional<z.ZodBoolean>
    systemMessage: z.ZodOptional<z.ZodString>
    additionalContext: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
export type SubagentStartMatcher = z.infer<typeof SubagentStartMatcherSchema>
export type SubagentStartConfig = z.infer<typeof SubagentStartConfigSchema>
export type SubagentStartInput = z.infer<typeof SubagentStartInputSchema>
export type SubagentStartOutput = z.infer<typeof SubagentStartOutputSchema>
import { z } from "zod/v4"
//# sourceMappingURL=SubagentStart.d.mts.map
