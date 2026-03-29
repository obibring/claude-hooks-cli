/** Regex pattern matching tool names for PermissionRequest. */
export const PermissionRequestMatcherSchema: z.ZodString;
/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PermissionRequestConfigSchema: z.ZodObject<{
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
/** @typedef {z.infer<typeof PermissionRequestConfigSchema>} PermissionRequestConfig */
export const PermissionRequestInputSchema: z.ZodObject<{
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
    permission_suggestions: z.ZodOptional<z.ZodUnknown>;
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    hook_event_name: z.ZodLiteral<"PermissionRequest">;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PermissionRequestInputSchema>} PermissionRequestInput */
export const PermissionRequestHookSpecificOutputSchema: z.ZodObject<{
    decision: z.ZodOptional<z.ZodObject<{
        behavior: z.ZodEnum<{
            allow: "allow";
            deny: "deny";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export const PermissionRequestOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    hookSpecificOutput: z.ZodOptional<z.ZodObject<{
        decision: z.ZodOptional<z.ZodObject<{
            behavior: z.ZodEnum<{
                allow: "allow";
                deny: "deny";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PermissionRequestMatcher = z.infer<typeof PermissionRequestMatcherSchema>;
export type PermissionRequestConfig = z.infer<typeof PermissionRequestConfigSchema>;
export type PermissionRequestInput = z.infer<typeof PermissionRequestInputSchema>;
export type PermissionRequestOutput = z.infer<typeof PermissionRequestOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=PermissionRequest.d.mts.map