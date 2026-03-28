export { ElicitationMatcherSchema };
/** @typedef {z.infer<typeof ElicitationMatcherSchema>} ElicitationMatcher */
/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodString>;
    hooks: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof ElicitationConfigSchema>} ElicitationConfig */
export const ElicitationInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"Elicitation">;
    mcp_server_name: z.ZodString;
    message: z.ZodString;
    mode: z.ZodString;
    url: z.ZodString;
    elicitation_id: z.ZodString;
    requested_schema: z.ZodUnknown;
}, z.core.$strip>;
/** @typedef {z.infer<typeof ElicitationInputSchema>} ElicitationInput */
export const ElicitationHookSpecificOutputSchema: z.ZodObject<{
    action: z.ZodOptional<z.ZodEnum<{
        accept: "accept";
        decline: "decline";
        cancel: "cancel";
    }>>;
    content: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export const ElicitationOutputSchema: z.ZodObject<{
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
export type ElicitationMatcher = z.infer<typeof ElicitationMatcherSchema>;
export type ElicitationConfig = z.infer<typeof ElicitationConfigSchema>;
export type ElicitationInput = z.infer<typeof ElicitationInputSchema>;
export type ElicitationOutput = z.infer<typeof ElicitationOutputSchema>;
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=Elicitation.d.mts.map