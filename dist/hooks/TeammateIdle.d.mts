/** TeammateIdle does not support matchers — always fires. */
export const TeammateIdleMatcherSchema: undefined;
/** Command-only hook. No matcher support. Requires experimental agent teams. */
export const TeammateIdleConfigSchema: z.ZodObject<{
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
/** @typedef {z.infer<typeof TeammateIdleConfigSchema>} TeammateIdleConfig */
export const TeammateIdleInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"TeammateIdle">;
    teammate_name: z.ZodString;
    team_name: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof TeammateIdleInputSchema>} TeammateIdleInput */
/** TeammateIdle can return continue:false with stopReason via base output,
 *  or use exit code 2 with JSON decision control. */
export const TeammateIdleOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TeammateIdleConfig = z.infer<typeof TeammateIdleConfigSchema>;
export type TeammateIdleInput = z.infer<typeof TeammateIdleInputSchema>;
export type TeammateIdleOutput = z.infer<typeof TeammateIdleOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=TeammateIdle.d.mts.map