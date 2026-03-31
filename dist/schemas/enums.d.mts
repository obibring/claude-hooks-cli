/** All 26 hook event names */
export const HookEventNameSchema: z.ZodEnum<{
  PreToolUse: "PreToolUse"
  PermissionRequest: "PermissionRequest"
  PostToolUse: "PostToolUse"
  PostToolUseFailure: "PostToolUseFailure"
  UserPromptSubmit: "UserPromptSubmit"
  Notification: "Notification"
  Stop: "Stop"
  SubagentStart: "SubagentStart"
  SubagentStop: "SubagentStop"
  PreCompact: "PreCompact"
  PostCompact: "PostCompact"
  SessionStart: "SessionStart"
  SessionEnd: "SessionEnd"
  Setup: "Setup"
  TeammateIdle: "TeammateIdle"
  TaskCreated: "TaskCreated"
  TaskCompleted: "TaskCompleted"
  ConfigChange: "ConfigChange"
  WorktreeCreate: "WorktreeCreate"
  WorktreeRemove: "WorktreeRemove"
  InstructionsLoaded: "InstructionsLoaded"
  Elicitation: "Elicitation"
  ElicitationResult: "ElicitationResult"
  StopFailure: "StopFailure"
  CwdChanged: "CwdChanged"
  FileChanged: "FileChanged"
}>
/** @typedef {z.infer<typeof HookEventNameSchema>} HookEventName */
/** The active permission mode for the Claude Code session. "default" prompts for each action, "dontAsk" auto-approves most actions, "bypassPermissions" skips all permission checks. */
export const PermissionModeSchema: z.ZodEnum<{
  default: "default"
  plan: "plan"
  acceptEdits: "acceptEdits"
  dontAsk: "dontAsk"
  bypassPermissions: "bypassPermissions"
}>
/** @typedef {z.infer<typeof PermissionModeSchema>} PermissionMode */
/** Type of notification sent by Claude Code. "permission_prompt" when asking for tool permission, "idle_prompt" when awaiting user input, "auth_success" after successful authentication, "elicitation_dialog" for MCP input dialogs. */
export const NotificationTypeSchema: z.ZodEnum<{
  permission_prompt: "permission_prompt"
  idle_prompt: "idle_prompt"
  auth_success: "auth_success"
  elicitation_dialog: "elicitation_dialog"
}>
/** @typedef {z.infer<typeof NotificationTypeSchema>} NotificationType */
/** How the session started. "startup" for a new session, "resume" when continuing a previous session, "clear" after /clear command, "compact" when restarting after automatic context compression. */
export const SessionStartSourceSchema: z.ZodEnum<{
  startup: "startup"
  resume: "resume"
  clear: "clear"
  compact: "compact"
}>
/** @typedef {z.infer<typeof SessionStartSourceSchema>} SessionStartSource */
/** Why the session ended. "clear" from /clear command, "resume" when session is being resumed elsewhere, "logout" on user logout, "prompt_input_exit" when user exits the prompt, "bypass_permissions_disabled" when bypass mode is revoked. */
export const SessionEndReasonSchema: z.ZodEnum<{
  resume: "resume"
  clear: "clear"
  logout: "logout"
  prompt_input_exit: "prompt_input_exit"
  bypass_permissions_disabled: "bypass_permissions_disabled"
  other: "other"
}>
/** @typedef {z.infer<typeof SessionEndReasonSchema>} SessionEndReason */
/** What triggered the context compaction. "manual" when the user explicitly ran /compact, "auto" when Claude Code automatically compacted due to context size limits. */
export const CompactTriggerSchema: z.ZodEnum<{
  manual: "manual"
  auto: "auto"
}>
/** @typedef {z.infer<typeof CompactTriggerSchema>} CompactTrigger */
/** Which settings source changed. "user_settings" for ~/.claude/settings.json, "project_settings" for .claude/settings.json, "local_settings" for .claude/settings.local.json, "policy_settings" for managed/admin settings, "skills" for skill configuration changes. */
export const ConfigChangeSourceSchema: z.ZodEnum<{
  user_settings: "user_settings"
  project_settings: "project_settings"
  local_settings: "local_settings"
  policy_settings: "policy_settings"
  skills: "skills"
}>
/** @typedef {z.infer<typeof ConfigChangeSourceSchema>} ConfigChangeSource */
/** Why the instruction file was loaded. "session_start" on initial load, "nested_traversal" when traversing parent directories, "path_glob_match" when a glob pattern matched, "include" when referenced by another file, "compact" on re-load after context compaction. */
export const InstructionsLoadReasonSchema: z.ZodEnum<{
  compact: "compact"
  session_start: "session_start"
  nested_traversal: "nested_traversal"
  path_glob_match: "path_glob_match"
  include: "include"
}>
/** @typedef {z.infer<typeof InstructionsLoadReasonSchema>} InstructionsLoadReason */
/** API error type that caused the turn to end. "rate_limit" when hitting API rate limits, "authentication_failed" for auth errors, "billing_error" for payment issues, "max_output_tokens" when the response was truncated. */
export const StopFailureErrorSchema: z.ZodEnum<{
  unknown: "unknown"
  rate_limit: "rate_limit"
  authentication_failed: "authentication_failed"
  billing_error: "billing_error"
  invalid_request: "invalid_request"
  server_error: "server_error"
  max_output_tokens: "max_output_tokens"
}>
/** @typedef {z.infer<typeof StopFailureErrorSchema>} StopFailureError */
/** Action to take on an MCP elicitation. "accept" sends the content as the response, "decline" rejects the request, "cancel" aborts the elicitation entirely. */
export const ElicitationActionSchema: z.ZodEnum<{
  accept: "accept"
  decline: "decline"
  cancel: "cancel"
}>
/** @typedef {z.infer<typeof ElicitationActionSchema>} ElicitationAction */
/** Permission decision for a PreToolUse hook. "allow" lets the tool call proceed, "deny" blocks it with the reason shown to the model, "ask" falls through to the normal user permission prompt. */
export const PreToolUsePermissionDecisionSchema: z.ZodEnum<{
  allow: "allow"
  deny: "deny"
  ask: "ask"
}>
/** @typedef {z.infer<typeof PreToolUsePermissionDecisionSchema>} PreToolUsePermissionDecision */
/** Permission decision for a PermissionRequest hook. "allow" grants the permission, "deny" blocks it. */
export const PermissionRequestDecisionBehaviorSchema: z.ZodEnum<{
  allow: "allow"
  deny: "deny"
}>
/** @typedef {z.infer<typeof PermissionRequestDecisionBehaviorSchema>} PermissionRequestDecisionBehavior */
/** Set to "block" to stop Claude from continuing after this hook runs. Used by PostToolUse, Stop, SubagentStop, and ConfigChange hooks. */
export const BlockDecisionSchema: z.ZodLiteral<"block">
/** @typedef {z.infer<typeof BlockDecisionSchema>} BlockDecision */
/** Valid Claude Code hook environment variable names */
export const ClaudeEnvVarNameSchema: z.ZodEnum<{
  CLAUDE_PROJECT_DIR: "CLAUDE_PROJECT_DIR"
  CLAUDE_ENV_FILE: "CLAUDE_ENV_FILE"
  CLAUDE_PLUGIN_ROOT: "CLAUDE_PLUGIN_ROOT"
  CLAUDE_CODE_REMOTE: "CLAUDE_CODE_REMOTE"
  CLAUDE_SKILL_DIR: "CLAUDE_SKILL_DIR"
  CLAUDE_PLUGIN_DATA: "CLAUDE_PLUGIN_DATA"
  CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS: "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS"
}>
export type HookEventName = z.infer<typeof HookEventNameSchema>
export type PermissionMode = z.infer<typeof PermissionModeSchema>
export type NotificationType = z.infer<typeof NotificationTypeSchema>
export type SessionStartSource = z.infer<typeof SessionStartSourceSchema>
export type SessionEndReason = z.infer<typeof SessionEndReasonSchema>
export type CompactTrigger = z.infer<typeof CompactTriggerSchema>
export type ConfigChangeSource = z.infer<typeof ConfigChangeSourceSchema>
export type InstructionsLoadReason = z.infer<typeof InstructionsLoadReasonSchema>
export type StopFailureError = z.infer<typeof StopFailureErrorSchema>
export type ElicitationAction = z.infer<typeof ElicitationActionSchema>
export type PreToolUsePermissionDecision = z.infer<
  typeof PreToolUsePermissionDecisionSchema
>
export type PermissionRequestDecisionBehavior = z.infer<
  typeof PermissionRequestDecisionBehaviorSchema
>
export type BlockDecision = z.infer<typeof BlockDecisionSchema>
export type ClaudeEnvVarName = z.infer<typeof ClaudeEnvVarNameSchema>
import { z } from "zod/v4"
//# sourceMappingURL=enums.d.mts.map
