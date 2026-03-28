/** Setup does not support matchers — always fires. */
export const SetupMatcherSchema: undefined;
/** Command-only hook. No matcher support. Default timeout 30000ms. */
export const SetupConfigSchema: z.ZodObject<{
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
/** @typedef {z.infer<typeof SetupConfigSchema>} SetupConfig */
export const SetupInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"Setup">;
}, z.core.$strip>;
/** @typedef {z.infer<typeof SetupInputSchema>} SetupInput */
export const SetupOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SetupConfig = z.infer<typeof SetupConfigSchema>;
export type SetupInput = z.infer<typeof SetupInputSchema>;
export type SetupOutput = z.infer<typeof SetupOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=Setup.d.mts.map