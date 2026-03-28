export const PreCompactMatcherSchema: z.ZodEnum<{
    manual: "manual";
    auto: "auto";
}>;
/** @typedef {z.infer<typeof PreCompactMatcherSchema>} PreCompactMatcher */
/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        manual: "manual";
        auto: "auto";
    }>>;
    hooks: z.ZodArray;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PreCompactConfigSchema>} PreCompactConfig */
export const PreCompactInputSchema: z.ZodObject<{
    session_id: z.ZodString;
    transcript_path: z.ZodString;
    cwd: z.ZodString;
    permission_mode: z.ZodEnum<{
        default: "default";
        plan: "plan";
        acceptEdits: "acceptEdits";
        dontAsk: "dontAsk";
        bypassPermissions: "bypassPermissions";
    }>;
    agent_id: z.ZodOptional<z.ZodString>;
    agent_type: z.ZodOptional<z.ZodString>;
    hook_event_name: z.ZodLiteral<"PreCompact">;
    trigger: z.ZodEnum<{
        manual: "manual";
        auto: "auto";
    }>;
    custom_instructions: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PreCompactInputSchema>} PreCompactInput */
export const PreCompactOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PreCompactMatcher = z.infer<typeof PreCompactMatcherSchema>;
export type PreCompactConfig = z.infer<typeof PreCompactConfigSchema>;
export type PreCompactInput = z.infer<typeof PreCompactInputSchema>;
export type PreCompactOutput = z.infer<typeof PreCompactOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PreCompact.d.mts.map