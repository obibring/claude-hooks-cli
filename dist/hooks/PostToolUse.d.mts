export const PostToolUseMatcherSchema: z.ZodString;
/** @typedef {z.infer<typeof PostToolUseMatcherSchema>} PostToolUseMatcher */
/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodString>;
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"prompt">;
        prompt: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"agent">;
        prompt: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>], "type">>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostToolUseConfigSchema>} PostToolUseConfig */
export const PostToolUseInputSchema: z.ZodObject<{
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
    tool_use_id: z.ZodString;
    tool_response: z.ZodUnknown;
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    hook_event_name: z.ZodLiteral<"PostToolUse">;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostToolUseInputSchema>} PostToolUseInput */
export const PostToolUseOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    decision: z.ZodOptional<z.ZodLiteral<"block">>;
}, z.core.$strip>;
export type PostToolUseMatcher = z.infer<typeof PostToolUseMatcherSchema>;
export type PostToolUseConfig = z.infer<typeof PostToolUseConfigSchema>;
export type PostToolUseInput = z.infer<typeof PostToolUseInputSchema>;
export type PostToolUseOutput = z.infer<typeof PostToolUseOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PostToolUse.d.mts.map