/** Regex pattern matching tool names for PreToolUse. Example: "Bash", "mcp__memory__.*". */
export const PreToolUseMatcherSchema: z.ZodString;
/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PreToolUseConfigSchema: z.ZodObject<{
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
        model: z.ZodOptional<z.ZodEnum<{
            opus: "opus";
            sonnet: "sonnet";
            haiku: "haiku";
            "opus[4m]": "opus[4m]";
            "sonnet[4m]": "sonnet[4m]";
        }>>;
        if: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        statusMessage: z.ZodOptional<z.ZodString>;
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
/** @typedef {z.infer<typeof PreToolUseConfigSchema>} PreToolUseConfig */
export const PreToolUseInputSchema: z.ZodObject<{
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
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    hook_event_name: z.ZodLiteral<"PreToolUse">;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PreToolUseInputSchema>} PreToolUseInput */
export const PreToolUseHookSpecificOutputSchema: z.ZodObject<{
    permissionDecision: z.ZodOptional<z.ZodEnum<{
        allow: "allow";
        deny: "deny";
        ask: "ask";
    }>>;
    permissionDecisionReason: z.ZodOptional<z.ZodString>;
    autoAllow: z.ZodOptional<z.ZodBoolean>;
    updatedInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export const PreToolUseOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    hookSpecificOutput: z.ZodOptional<z.ZodObject<{
        permissionDecision: z.ZodOptional<z.ZodEnum<{
            allow: "allow";
            deny: "deny";
            ask: "ask";
        }>>;
        permissionDecisionReason: z.ZodOptional<z.ZodString>;
        autoAllow: z.ZodOptional<z.ZodBoolean>;
        updatedInput: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PreToolUseMatcher = z.infer<typeof PreToolUseMatcherSchema>;
export type PreToolUseConfig = z.infer<typeof PreToolUseConfigSchema>;
export type PreToolUseInput = z.infer<typeof PreToolUseInputSchema>;
export type PreToolUseOutput = z.infer<typeof PreToolUseOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PreToolUse.d.mts.map