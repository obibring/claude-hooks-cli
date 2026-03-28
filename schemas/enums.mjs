import { z } from "zod/v4"

/** All 26 hook event names */
export const HookEventNameSchema = z.enum([
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

/** @typedef {z.infer<typeof HookEventNameSchema>} HookEventName */

export const PermissionModeSchema = z.enum([
  "default",
  "plan",
  "acceptEdits",
  "dontAsk",
  "bypassPermissions",
])

/** @typedef {z.infer<typeof PermissionModeSchema>} PermissionMode */

export const NotificationTypeSchema = z.enum([
  "permission_prompt",
  "idle_prompt",
  "auth_success",
  "elicitation_dialog",
])

/** @typedef {z.infer<typeof NotificationTypeSchema>} NotificationType */

export const SessionStartSourceSchema = z.enum([
  "startup",
  "resume",
  "clear",
  "compact",
])

/** @typedef {z.infer<typeof SessionStartSourceSchema>} SessionStartSource */

export const SessionEndReasonSchema = z.enum([
  "clear",
  "resume",
  "logout",
  "prompt_input_exit",
  "bypass_permissions_disabled",
  "other",
])

/** @typedef {z.infer<typeof SessionEndReasonSchema>} SessionEndReason */

export const CompactTriggerSchema = z.enum(["manual", "auto"])

/** @typedef {z.infer<typeof CompactTriggerSchema>} CompactTrigger */

export const ConfigChangeSourceSchema = z.enum([
  "user_settings",
  "project_settings",
  "local_settings",
  "policy_settings",
  "skills",
])

/** @typedef {z.infer<typeof ConfigChangeSourceSchema>} ConfigChangeSource */

export const InstructionsLoadReasonSchema = z.enum([
  "session_start",
  "nested_traversal",
  "path_glob_match",
  "include",
  "compact",
])

/** @typedef {z.infer<typeof InstructionsLoadReasonSchema>} InstructionsLoadReason */

export const StopFailureErrorSchema = z.enum([
  "rate_limit",
  "authentication_failed",
  "billing_error",
  "invalid_request",
  "server_error",
  "max_output_tokens",
  "unknown",
])

/** @typedef {z.infer<typeof StopFailureErrorSchema>} StopFailureError */

export const ElicitationActionSchema = z.enum(["accept", "decline", "cancel"])

/** @typedef {z.infer<typeof ElicitationActionSchema>} ElicitationAction */

export const PreToolUsePermissionDecisionSchema = z.enum([
  "allow",
  "deny",
  "ask",
])

/** @typedef {z.infer<typeof PreToolUsePermissionDecisionSchema>} PreToolUsePermissionDecision */

export const PermissionRequestDecisionBehaviorSchema = z.enum(["allow", "deny"])

/** @typedef {z.infer<typeof PermissionRequestDecisionBehaviorSchema>} PermissionRequestDecisionBehavior */

export const BlockDecisionSchema = z.literal("block")

/** @typedef {z.infer<typeof BlockDecisionSchema>} BlockDecision */

/** Valid Claude Code hook environment variable names */
export const ClaudeEnvVarNameSchema = z.enum([
  "CLAUDE_PROJECT_DIR",
  "CLAUDE_ENV_FILE",
  "CLAUDE_PLUGIN_ROOT",
  "CLAUDE_CODE_REMOTE",
  "CLAUDE_SKILL_DIR",
  "CLAUDE_PLUGIN_DATA",
  "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS",
])

/** @typedef {z.infer<typeof ClaudeEnvVarNameSchema>} ClaudeEnvVarName */
