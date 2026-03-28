export const PostCompactMatcherSchema: z.ZodEnum<{
    manual: "manual";
    auto: "auto";
}>;
/** @typedef {z.infer<typeof PostCompactMatcherSchema>} PostCompactMatcher */
/** Command-only hook. Matcher matches trigger. */
export const PostCompactConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        manual: "manual";
        auto: "auto";
    }>>;
    hooks: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostCompactConfigSchema>} PostCompactConfig */
export const PostCompactInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"PostCompact">;
    trigger: z.ZodEnum<{
        manual: "manual";
        auto: "auto";
    }>;
    compact_summary: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostCompactInputSchema>} PostCompactInput */
export const PostCompactOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PostCompactMatcher = z.infer<typeof PostCompactMatcherSchema>;
export type PostCompactConfig = z.infer<typeof PostCompactConfigSchema>;
export type PostCompactInput = z.infer<typeof PostCompactInputSchema>;
export type PostCompactOutput = z.infer<typeof PostCompactOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PostCompact.d.mts.map