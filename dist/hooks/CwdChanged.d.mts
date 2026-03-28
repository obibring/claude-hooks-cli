/** CwdChanged does not support matchers — always fires. */
export const CwdChangedMatcherSchema: undefined;
/** Command-only hook. No matcher support. */
export const CwdChangedConfigSchema: z.ZodObject<{
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
/** @typedef {z.infer<typeof CwdChangedConfigSchema>} CwdChangedConfig */
export const CwdChangedInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"CwdChanged">;
    old_cwd: z.ZodString;
    new_cwd: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof CwdChangedInputSchema>} CwdChangedInput */
export const CwdChangedOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CwdChangedConfig = z.infer<typeof CwdChangedConfigSchema>;
export type CwdChangedInput = z.infer<typeof CwdChangedInputSchema>;
export type CwdChangedOutput = z.infer<typeof CwdChangedOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=CwdChanged.d.mts.map