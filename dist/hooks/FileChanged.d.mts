export { FileChangedMatcherSchema };
/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */
/**
 * Command-only hook. Matcher is REQUIRED — pipe-separated basenames
 * specifying which files to watch (e.g. ".envrc|.env").
 */
export const FileChangedConfigSchema: z.ZodObject<{
    matcher: z.ZodString;
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
/** @typedef {z.infer<typeof FileChangedConfigSchema>} FileChangedConfig */
export const FileChangedInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"FileChanged">;
    file_path: z.ZodString;
    event: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof FileChangedInputSchema>} FileChangedInput */
export const FileChangedOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FileChangedMatcher = z.infer<typeof FileChangedMatcherSchema>;
export type FileChangedConfig = z.infer<typeof FileChangedConfigSchema>;
export type FileChangedInput = z.infer<typeof FileChangedInputSchema>;
export type FileChangedOutput = z.infer<typeof FileChangedOutputSchema>;
import { FileChangedMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=FileChanged.d.mts.map