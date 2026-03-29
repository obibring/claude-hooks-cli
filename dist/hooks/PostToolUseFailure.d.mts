/** Regex pattern matching tool names for PostToolUseFailure. */
export const PostToolUseFailureMatcherSchema: z.ZodString;
/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseFailureConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodString>;
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"prompt">;
        prompt: z.ZodString;
        model: z.ZodEnum<{
            opus: "opus";
            sonnet: "sonnet";
            haiku: "haiku";
            "opus[4m]": "opus[4m]";
            "sonnet[4m]": "sonnet[4m]";
        }>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"agent">;
        prompt: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
    }, z.core.$strict>], "type">>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostToolUseFailureConfigSchema>} PostToolUseFailureConfig */
export const PostToolUseFailureInputSchema: z.ZodObject<{
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
    error: z.ZodString;
    is_interrupt: z.ZodBoolean;
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    hook_event_name: z.ZodLiteral<"PostToolUseFailure">;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PostToolUseFailureInputSchema>} PostToolUseFailureInput */
export const PostToolUseFailureOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PostToolUseFailureMatcher = z.infer<typeof PostToolUseFailureMatcherSchema>;
export type PostToolUseFailureConfig = z.infer<typeof PostToolUseFailureConfigSchema>;
export type PostToolUseFailureInput = z.infer<typeof PostToolUseFailureInputSchema>;
export type PostToolUseFailureOutput = z.infer<typeof PostToolUseFailureOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PostToolUseFailure.d.mts.map