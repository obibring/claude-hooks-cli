export { InstructionsLoadedMatcherSchema };
/** @typedef {z.infer<typeof InstructionsLoadedMatcherSchema>} InstructionsLoadedMatcher */
/** Command-only hook. Matcher matches load_reason. */
export const InstructionsLoadedConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        compact: "compact";
        session_start: "session_start";
        nested_traversal: "nested_traversal";
        path_glob_match: "path_glob_match";
        include: "include";
    }>>;
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
/** @typedef {z.infer<typeof InstructionsLoadedConfigSchema>} InstructionsLoadedConfig */
export const InstructionsLoadedInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"InstructionsLoaded">;
    file_path: z.ZodString;
    memory_type: z.ZodString;
    load_reason: z.ZodEnum<{
        compact: "compact";
        session_start: "session_start";
        nested_traversal: "nested_traversal";
        path_glob_match: "path_glob_match";
        include: "include";
    }>;
    globs: z.ZodOptional<z.ZodUnknown>;
    trigger_file_path: z.ZodOptional<z.ZodString>;
    parent_file_path: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof InstructionsLoadedInputSchema>} InstructionsLoadedInput */
export const InstructionsLoadedOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InstructionsLoadedMatcher = z.infer<typeof InstructionsLoadedMatcherSchema>;
export type InstructionsLoadedConfig = z.infer<typeof InstructionsLoadedConfigSchema>;
export type InstructionsLoadedInput = z.infer<typeof InstructionsLoadedInputSchema>;
export type InstructionsLoadedOutput = z.infer<typeof InstructionsLoadedOutputSchema>;
import { InstructionsLoadedMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=InstructionsLoaded.d.mts.map