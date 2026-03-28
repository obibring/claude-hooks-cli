/**
 * Tool name matcher — regex pattern matching tool names.
 * Supports built-in tools and MCP tools (mcp__<server>__<tool>).
 */
export const ToolNameMatcherSchema: z.ZodString;
/** @typedef {z.infer<typeof ToolNameMatcherSchema>} ToolNameMatcher */
/** Notification type matcher — filters which notification events trigger the hook. */
export const NotificationMatcherSchema: z.ZodEnum<{
    permission_prompt: "permission_prompt";
    idle_prompt: "idle_prompt";
    auth_success: "auth_success";
    elicitation_dialog: "elicitation_dialog";
}>;
/** Subagent type matcher — filters which agent types trigger the hook. */
export const SubagentTypeMatcherSchema: z.ZodString;
/** SessionStart source matcher — filters which session start reasons trigger the hook. */
export const SessionStartMatcherSchema: z.ZodEnum<{
    startup: "startup";
    resume: "resume";
    clear: "clear";
    compact: "compact";
}>;
/** SessionEnd reason matcher — filters which session end reasons trigger the hook. */
export const SessionEndMatcherSchema: z.ZodEnum<{
    resume: "resume";
    clear: "clear";
    logout: "logout";
    prompt_input_exit: "prompt_input_exit";
    bypass_permissions_disabled: "bypass_permissions_disabled";
    other: "other";
}>;
/** Compact trigger matcher — filters by manual or automatic compaction. */
export const CompactTriggerMatcherSchema: z.ZodEnum<{
    manual: "manual";
    auto: "auto";
}>;
/** Elicitation/ElicitationResult MCP server name matcher. */
export const ElicitationMatcherSchema: z.ZodString;
/** ConfigChange source matcher — filters which config source triggered the change. */
export const ConfigChangeMatcherSchema: z.ZodEnum<{
    user_settings: "user_settings";
    project_settings: "project_settings";
    local_settings: "local_settings";
    policy_settings: "policy_settings";
    skills: "skills";
}>;
/** InstructionsLoaded load_reason matcher — filters why instruction files were loaded. */
export const InstructionsLoadedMatcherSchema: z.ZodEnum<{
    compact: "compact";
    session_start: "session_start";
    nested_traversal: "nested_traversal";
    path_glob_match: "path_glob_match";
    include: "include";
}>;
/** StopFailure error matcher — filters by API error type. */
export const StopFailureMatcherSchema: z.ZodEnum<{
    unknown: "unknown";
    rate_limit: "rate_limit";
    authentication_failed: "authentication_failed";
    billing_error: "billing_error";
    invalid_request: "invalid_request";
    server_error: "server_error";
    max_output_tokens: "max_output_tokens";
}>;
/**
 * FileChanged matcher — pipe-separated basenames of files to watch.
 * REQUIRED for FileChanged hooks — without it, the hook won't fire.
 */
export const FileChangedMatcherSchema: z.ZodString;
export type ToolNameMatcher = z.infer<typeof ToolNameMatcherSchema>;
export type FileChangedMatcher = z.infer<typeof FileChangedMatcherSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=matcher-schemas.d.mts.map