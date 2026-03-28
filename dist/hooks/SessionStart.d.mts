export { SessionStartMatcherSchema };
/** @typedef {z.infer<typeof SessionStartMatcherSchema>} SessionStartMatcher */
/** Command-only hook. Supports `once`. Matcher matches source. */
export const SessionStartConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        startup: "startup";
        resume: "resume";
        clear: "clear";
        compact: "compact";
    }>>;
    hooks: z.ZodArray;
}, z.core.$strip>;
/** @typedef {z.infer<typeof SessionStartConfigSchema>} SessionStartConfig */
export const SessionStartInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"SessionStart">;
    model: z.ZodString;
    source: z.ZodEnum<{
        startup: "startup";
        resume: "resume";
        clear: "clear";
        compact: "compact";
    }>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof SessionStartInputSchema>} SessionStartInput */
export const SessionStartOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SessionStartMatcher = z.infer<typeof SessionStartMatcherSchema>;
export type SessionStartConfig = z.infer<typeof SessionStartConfigSchema>;
export type SessionStartInput = z.infer<typeof SessionStartInputSchema>;
export type SessionStartOutput = z.infer<typeof SessionStartOutputSchema>;
import { SessionStartMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=SessionStart.d.mts.map