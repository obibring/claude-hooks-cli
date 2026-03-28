/** TaskCreated does not support matchers — always fires. */
export const TaskCreatedMatcherSchema: undefined;
/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCreatedConfigSchema: z.ZodObject<{
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"prompt">;
        prompt: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"agent">;
        prompt: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        if: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>], "type">>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof TaskCreatedConfigSchema>} TaskCreatedConfig */
export const TaskCreatedInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"TaskCreated">;
    task_id: z.ZodString;
    task_subject: z.ZodString;
    task_description: z.ZodString;
    teammate_name: z.ZodString;
    team_name: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof TaskCreatedInputSchema>} TaskCreatedInput */
/** TaskCreated uses exit code 2 to block task creation (stderr fed back to model).
 *  Also supports JSON decision control with continue/stopReason. */
export const TaskCreatedOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TaskCreatedConfig = z.infer<typeof TaskCreatedConfigSchema>;
export type TaskCreatedInput = z.infer<typeof TaskCreatedInputSchema>;
export type TaskCreatedOutput = z.infer<typeof TaskCreatedOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=TaskCreated.d.mts.map