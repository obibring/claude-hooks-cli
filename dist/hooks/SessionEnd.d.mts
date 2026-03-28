export { SessionEndMatcherSchema };
/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */
/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        resume: "resume";
        clear: "clear";
        logout: "logout";
        prompt_input_exit: "prompt_input_exit";
        bypass_permissions_disabled: "bypass_permissions_disabled";
        other: "other";
    }>>;
    hooks: z.ZodArray;
}, z.core.$strip>;
/** @typedef {z.infer<typeof SessionEndConfigSchema>} SessionEndConfig */
export const SessionEndInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"SessionEnd">;
    reason: z.ZodEnum<{
        resume: "resume";
        clear: "clear";
        logout: "logout";
        prompt_input_exit: "prompt_input_exit";
        bypass_permissions_disabled: "bypass_permissions_disabled";
        other: "other";
    }>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof SessionEndInputSchema>} SessionEndInput */
export const SessionEndOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SessionEndMatcher = z.infer<typeof SessionEndMatcherSchema>;
export type SessionEndConfig = z.infer<typeof SessionEndConfigSchema>;
export type SessionEndInput = z.infer<typeof SessionEndInputSchema>;
export type SessionEndOutput = z.infer<typeof SessionEndOutputSchema>;
import { SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs";
import { z } from "zod/v4";
//# sourceMappingURL=SessionEnd.d.mts.map