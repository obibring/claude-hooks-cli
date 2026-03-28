export const NotificationMatcherExportSchema: z.ZodEnum<{
    permission_prompt: "permission_prompt";
    idle_prompt: "idle_prompt";
    auth_success: "auth_success";
    elicitation_dialog: "elicitation_dialog";
}>;
/** @typedef {z.infer<typeof NotificationMatcherExportSchema>} NotificationMatcher */
/** Command-only hook. Matcher matches notification_type. */
export const NotificationConfigSchema: z.ZodObject<{
    matcher: z.ZodOptional<z.ZodEnum<{
        permission_prompt: "permission_prompt";
        idle_prompt: "idle_prompt";
        auth_success: "auth_success";
        elicitation_dialog: "elicitation_dialog";
    }>>;
    hooks: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        async: z.ZodOptional<z.ZodBoolean>;
        asyncRewake: z.ZodOptional<z.ZodBoolean>;
        statusMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof NotificationConfigSchema>} NotificationConfig */
export const NotificationInputSchema: z.ZodObject<{
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
    hook_event_name: z.ZodLiteral<"Notification">;
    notification_type: z.ZodEnum<{
        permission_prompt: "permission_prompt";
        idle_prompt: "idle_prompt";
        auth_success: "auth_success";
        elicitation_dialog: "elicitation_dialog";
    }>;
    message: z.ZodString;
    title: z.ZodString;
}, z.core.$strip>;
/** @typedef {z.infer<typeof NotificationInputSchema>} NotificationInput */
export const NotificationOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type NotificationMatcher = z.infer<typeof NotificationMatcherExportSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type NotificationInput = z.infer<typeof NotificationInputSchema>;
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=Notification.d.mts.map