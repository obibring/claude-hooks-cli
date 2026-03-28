export const ElicitationResultMatcherSchema: z.ZodString;
/** @typedef {z.infer<typeof ElicitationResultMatcherSchema>} ElicitationResultMatcher */
/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationResultConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodString>;
    hooks: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof ElicitationResultConfigSchema>} ElicitationResultConfig */
export const ElicitationResultInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"ElicitationResult">;
    mcp_server_name: z.ZodString;
    user_response: z.ZodUnknown;
    message: z.ZodString;
    elicitation_id: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof ElicitationResultInputSchema>} ElicitationResultInput */
export const ElicitationResultHookSpecificOutputSchema: z.ZodObject<{
    action: z.ZodOptional<z.ZodEnum<{
        accept: "accept";
        decline: "decline";
        cancel: "cancel";
    }>>;
    content: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export const ElicitationResultOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    hookSpecificOutput: z.ZodOptional<z.ZodObject<{
        action: z.ZodOptional<z.ZodEnum<{
            accept: "accept";
            decline: "decline";
            cancel: "cancel";
        }>>;
        content: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ElicitationResultMatcher = z.infer<typeof ElicitationResultMatcherSchema>;
export type ElicitationResultConfig = z.infer<typeof ElicitationResultConfigSchema>;
export type ElicitationResultInput = z.infer<typeof ElicitationResultInputSchema>;
export type ElicitationResultOutput = z.infer<typeof ElicitationResultOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=ElicitationResult.d.mts.map