/** Stop does not support matchers — always fires. */
export const StopMatcherSchema: undefined;
/** Supports all 4 handler types. No matcher support. */
export const StopConfigSchema: z.ZodObject<{
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
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
        timeout: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"agent">;
        prompt: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
    }, z.core.$strict>], "type">>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof StopConfigSchema>} StopConfig */
export const StopInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"Stop">;
    last_assistant_message: z.ZodString;
    stop_hook_active: z.ZodBoolean;
}, z.core.$strip>;
/** @typedef {z.infer<typeof StopInputSchema>} StopInput */
export const StopOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    decision: z.ZodOptional<z.ZodLiteral<"block">>;
}, z.core.$strip>;
export type StopConfig = z.infer<typeof StopConfigSchema>;
export type StopInput = z.infer<typeof StopInputSchema>;
export type StopOutput = z.infer<typeof StopOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=Stop.d.mts.map