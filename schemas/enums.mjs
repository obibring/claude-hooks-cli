import { z } from "zod/v4"

/** All 26 hook event names */
export const HookEventNameSchema = z
  .enum([
    "PreToolUse",
    "PermissionRequest",
    "PostToolUse",
    "PostToolUseFailure",
    "UserPromptSubmit",
    "Notification",
    "Stop",
    "SubagentStart",
    "SubagentStop",
    "PreCompact",
    "PostCompact",
    "SessionStart",
    "SessionEnd",
    "Setup",
    "TeammateIdle",
    "TaskCreated",
    "TaskCompleted",
    "ConfigChange",
    "WorktreeCreate",
    "WorktreeRemove",
    "InstructionsLoaded",
    "Elicitation",
    "ElicitationResult",
    "StopFailure",
    "CwdChanged",
    "FileChanged",
  ])
  .describe("One of the 26 Claude Code hook lifecycle event names.")

/** @typedef {z.infer<typeof HookEventNameSchema>} HookEventName */

/** The active permission mode for the Claude Code session. "default" prompts for each action, "dontAsk" auto-approves most actions, "bypassPermissions" skips all permission checks. */
export const PermissionModeSchema = z
  .enum(["default", "plan", "acceptEdits", "dontAsk", "bypassPermissions"])
  .describe(
    'The active permission mode for the Claude Code session. "default" prompts for each action, "dontAsk" auto-approves most actions, "bypassPermissions" skips all permission checks.',
  )

/** @typedef {z.infer<typeof PermissionModeSchema>} PermissionMode */

/** Type of notification sent by Claude Code. "permission_prompt" when asking for tool permission, "idle_prompt" when awaiting user input, "auth_success" after successful authentication, "elicitation_dialog" for MCP input dialogs. */
export const NotificationTypeSchema = z
  .enum([
    "permission_prompt",
    "idle_prompt",
    "auth_success",
    "elicitation_dialog",
  ])
  .describe(
    'Type of notification sent by Claude Code. "permission_prompt" when asking for tool permission, "idle_prompt" when awaiting user input, "auth_success" after successful authentication, "elicitation_dialog" for MCP input dialogs.',
  )

/** @typedef {z.infer<typeof NotificationTypeSchema>} NotificationType */

/** How the session started. "startup" for a new session, "resume" when continuing a previous session, "clear" after /clear command, "compact" when restarting after automatic context compression. */
export const SessionStartSourceSchema = z
  .enum(["startup", "resume", "clear", "compact"])
  .describe(
    'How the session started. "startup" for a new session, "resume" when continuing a previous session, "clear" after /clear command, "compact" when restarting after automatic context compression.',
  )

/** @typedef {z.infer<typeof SessionStartSourceSchema>} SessionStartSource */

/** Why the session ended. "clear" from /clear command, "resume" when session is being resumed elsewhere, "logout" on user logout, "prompt_input_exit" when user exits the prompt, "bypass_permissions_disabled" when bypass mode is revoked. */
export const SessionEndReasonSchema = z
  .enum([
    "clear",
    "resume",
    "logout",
    "prompt_input_exit",
    "bypass_permissions_disabled",
    "other",
  ])
  .describe(
    'Why the session ended. "clear" from /clear command, "resume" when session is being resumed elsewhere, "logout" on user logout, "prompt_input_exit" when user exits the prompt, "bypass_permissions_disabled" when bypass mode is revoked.',
  )

/** @typedef {z.infer<typeof SessionEndReasonSchema>} SessionEndReason */

/** What triggered the context compaction. "manual" when the user explicitly ran /compact, "auto" when Claude Code automatically compacted due to context size limits. */
export const CompactTriggerSchema = z
  .enum(["manual", "auto"])
  .describe(
    'What triggered the context compaction. "manual" when the user explicitly ran /compact, "auto" when Claude Code automatically compacted due to context size limits.',
  )

/** @typedef {z.infer<typeof CompactTriggerSchema>} CompactTrigger */

/** Which settings source changed. "user_settings" for ~/.claude/settings.json, "project_settings" for .claude/settings.json, "local_settings" for .claude/settings.local.json, "policy_settings" for managed/admin settings, "skills" for skill configuration changes. */
export const ConfigChangeSourceSchema = z
  .enum([
    "user_settings",
    "project_settings",
    "local_settings",
    "policy_settings",
    "skills",
  ])
  .describe(
    'Which settings source changed. "user_settings" for ~/.claude/settings.json, "project_settings" for .claude/settings.json, "local_settings" for .claude/settings.local.json, "policy_settings" for managed/admin settings, "skills" for skill configuration changes.',
  )

/** @typedef {z.infer<typeof ConfigChangeSourceSchema>} ConfigChangeSource */

/** Why the instruction file was loaded. "session_start" on initial load, "nested_traversal" when traversing parent directories, "path_glob_match" when a glob pattern matched, "include" when referenced by another file, "compact" on re-load after context compaction. */
export const InstructionsLoadReasonSchema = z
  .enum([
    "session_start",
    "nested_traversal",
    "path_glob_match",
    "include",
    "compact",
  ])
  .describe(
    'Why the instruction file was loaded. "session_start" on initial load, "nested_traversal" when traversing parent directories, "path_glob_match" when a glob pattern matched, "include" when referenced by another file, "compact" on re-load after context compaction.',
  )

/** @typedef {z.infer<typeof InstructionsLoadReasonSchema>} InstructionsLoadReason */

/** API error type that caused the turn to end. "rate_limit" when hitting API rate limits, "authentication_failed" for auth errors, "billing_error" for payment issues, "max_output_tokens" when the response was truncated. */
export const StopFailureErrorSchema = z
  .enum([
    "rate_limit",
    "authentication_failed",
    "billing_error",
    "invalid_request",
    "server_error",
    "max_output_tokens",
    "unknown",
  ])
  .describe(
    'API error type that caused the turn to end. "rate_limit" when hitting API rate limits, "authentication_failed" for auth errors, "billing_error" for payment issues, "max_output_tokens" when the response was truncated.',
  )

/** @typedef {z.infer<typeof StopFailureErrorSchema>} StopFailureError */

/** Action to take on an MCP elicitation. "accept" sends the content as the response, "decline" rejects the request, "cancel" aborts the elicitation entirely. */
export const ElicitationActionSchema = z
  .enum(["accept", "decline", "cancel"])
  .describe(
    'Action to take on an MCP elicitation. "accept" sends the content as the response, "decline" rejects the request, "cancel" aborts the elicitation entirely.',
  )

/** @typedef {z.infer<typeof ElicitationActionSchema>} ElicitationAction */

/** Permission decision for a PreToolUse hook. "allow" lets the tool call proceed, "deny" blocks it with the reason shown to the model, "ask" falls through to the normal user permission prompt. */
export const PreToolUsePermissionDecisionSchema = z
  .enum(["allow", "deny", "ask"])
  .describe(
    'Permission decision for a PreToolUse hook. "allow" lets the tool call proceed, "deny" blocks it with the reason shown to the model, "ask" falls through to the normal user permission prompt.',
  )

/** @typedef {z.infer<typeof PreToolUsePermissionDecisionSchema>} PreToolUsePermissionDecision */

/** Permission decision for a PermissionRequest hook. "allow" grants the permission, "deny" blocks it. */
export const PermissionRequestDecisionBehaviorSchema = z
  .enum(["allow", "deny"])
  .describe(
    'Permission decision for a PermissionRequest hook. "allow" grants the permission, "deny" blocks it.',
  )

/** @typedef {z.infer<typeof PermissionRequestDecisionBehaviorSchema>} PermissionRequestDecisionBehavior */

/** Set to "block" to stop Claude from continuing after this hook runs. Used by PostToolUse, Stop, SubagentStop, and ConfigChange hooks. */
export const BlockDecisionSchema = z
  .literal("block")
  .describe(
    'Set to "block" to stop Claude from continuing after this hook runs. Used by PostToolUse, Stop, SubagentStop, and ConfigChange hooks.',
  )

/** @typedef {z.infer<typeof BlockDecisionSchema>} BlockDecision */

/** Valid Claude Code hook environment variable names */
export const ClaudeEnvVarNameSchema = z
  .enum([
    "CLAUDE_PROJECT_DIR",
    "CLAUDE_ENV_FILE",
    "CLAUDE_PLUGIN_ROOT",
    "CLAUDE_CODE_REMOTE",
    "CLAUDE_SKILL_DIR",
    "CLAUDE_PLUGIN_DATA",
    "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS",
  ])
  .describe(
    "Environment variables provided by Claude Code to hook scripts. CLAUDE_PROJECT_DIR is available to all hooks. CLAUDE_ENV_FILE is only available in SessionStart, CwdChanged, and FileChanged hooks.",
  )

/** @typedef {z.infer<typeof ClaudeEnvVarNameSchema>} ClaudeEnvVarName */
