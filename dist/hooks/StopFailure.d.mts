export { StopFailureMatcherSchema };
/** @typedef {z.infer<typeof StopFailureMatcherSchema>} StopFailureMatcher */
/** Command-only hook. Matcher matches error type. */
export const StopFailureConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        rate_limit: "rate_limit";
        authentication_failed: "authentication_failed";
        billing_error: "billing_error";
        invalid_request: "invalid_request";
        server_error: "server_error";
        max_output_tokens: "max_output_tokens";
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
/** @typedef {z.infer<typeof StopFailureConfigSchema>} StopFailureConfig */
export const StopFailureInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"StopFailure">;
    error: z.ZodEnum<{
        unknown: "unknown";
        rate_limit: "rate_limit";
        authentication_failed: "authentication_failed";
        billing_error: "billing_error";
        invalid_request: "invalid_request";
        server_error: "server_error";
        max_output_tokens: "max_output_tokens";
    }>;
    error_details: z.ZodUnknown;
    last_assistant_message: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof StopFailureInputSchema>} StopFailureInput */
export const StopFailureOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type StopFailureMatcher = z.infer<typeof StopFailureMatcherSchema>;
export type StopFailureConfig = z.infer<typeof StopFailureConfigSchema>;
export type StopFailureInput = z.infer<typeof StopFailureInputSchema>;
export type StopFailureOutput = z.infer<typeof StopFailureOutputSchema>;
import { StopFailureMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=StopFailure.d.mts.map