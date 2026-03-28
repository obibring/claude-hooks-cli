/** Compact trigger matcher for PreCompact. \"manual\" or \"auto\". */
export const PreCompactMatcherSchema: z.ZodEnum<{
    manual: "manual";
    auto: "auto";
}>;
/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        manual: "manual";
        auto: "auto";
    }>>;
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        once: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        once: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
    }, z.core.$strict>], "type">>;
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