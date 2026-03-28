export { ConfigChangeMatcherSchema };
/** @typedef {z.infer<typeof ConfigChangeMatcherSchema>} ConfigChangeMatcher */
/** Command-only hook. Matcher matches source. */
export const ConfigChangeConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        user_settings: "user_settings";
        project_settings: "project_settings";
        local_settings: "local_settings";
        policy_settings: "policy_settings";
        skills: "skills";
    }>>;
    hooks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>], "type">>;
}, z.core.$strict>;
/** @typedef {z.infer<typeof ConfigChangeConfigSchema>} ConfigChangeConfig */
export const ConfigChangeInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"ConfigChange">;
    file_path: z.ZodString;
    source: z.ZodEnum<{
        user_settings: "user_settings";
        project_settings: "project_settings";
        local_settings: "local_settings";
        policy_settings: "policy_settings";
        skills: "skills";
    }>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof ConfigChangeInputSchema>} ConfigChangeInput */
export const ConfigChangeOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
    decision: z.ZodOptional<z.ZodLiteral<"block">>;
}, z.core.$strip>;
export type ConfigChangeMatcher = z.infer<typeof ConfigChangeMatcherSchema>;
export type ConfigChangeConfig = z.infer<typeof ConfigChangeConfigSchema>;
export type ConfigChangeInput = z.infer<typeof ConfigChangeInputSchema>;
export type ConfigChangeOutput = z.infer<typeof ConfigChangeOutputSchema>;
import { ConfigChangeMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=ConfigChange.d.mts.map