import { z } from "zod/v4"
import {
  NotificationTypeSchema,
  SessionStartSourceSchema,
  SessionEndReasonSchema,
  CompactTriggerSchema,
  ConfigChangeSourceSchema,
  InstructionsLoadReasonSchema,
  StopFailureErrorSchema,
} from "./enums.mjs"

/**
 * Tool name matcher — regex pattern matching tool names.
 * Supports built-in tools and MCP tools (mcp__<server>__<tool>).
 */
export const ToolNameMatcherSchema = z
  .string()
  .check(
    z.refine((v) => {
      try {
        new RegExp(v)
        return true
      } catch {
        return false
      }
    }, "Must be a valid regex pattern matching tool names"),
  )
  .describe(
    'Regex pattern matching tool names for PreToolUse, PostToolUse, PostToolUseFailure, and PermissionRequest. Examples: "Bash" (exact match), "Bash|Edit|Write" (multiple tools), "mcp__memory__.*" (all tools from memory MCP server), "mcp__.*__write.*" (any write tool from any server).',
  )

/** @typedef {z.infer<typeof ToolNameMatcherSchema>} ToolNameMatcher */

/** Notification type matcher — filters which notification events trigger the hook. */
export const NotificationMatcherSchema = NotificationTypeSchema.describe(
  'Matches the notification_type field. Values: "permission_prompt" (tool permission dialog), "idle_prompt" (awaiting input), "auth_success" (authentication completed), "elicitation_dialog" (MCP input dialog).',
)

/** Subagent type matcher — filters which agent types trigger the hook. */
export const SubagentTypeMatcherSchema = z
  .string()
  .describe(
    'Matches the agent_type field. Built-in types: "Bash", "Explore", "Plan". Can also match custom agent names defined in .claude/agents/.',
  )

/** SessionStart source matcher — filters which session start reasons trigger the hook. */
export const SessionStartMatcherSchema = SessionStartSourceSchema.describe(
  'Matches the source field on SessionStart. "startup" for new sessions, "resume" for continued sessions, "clear" after /clear, "compact" after automatic compaction.',
)

/** SessionEnd reason matcher — filters which session end reasons trigger the hook. */
export const SessionEndMatcherSchema = SessionEndReasonSchema.describe(
  'Matches the reason field on SessionEnd. "clear", "resume", "logout", "prompt_input_exit", "bypass_permissions_disabled", or "other".',
)

/** Compact trigger matcher — filters by manual or automatic compaction. */
export const CompactTriggerMatcherSchema = CompactTriggerSchema.describe(
  'Matches the trigger field on PreCompact/PostCompact. "manual" when user ran /compact, "auto" when Claude Code compacted automatically.',
)

/** Elicitation/ElicitationResult MCP server name matcher. */
export const ElicitationMatcherSchema = z
  .string()
  .describe(
    'Matches the mcp_server_name field. Filters elicitation events to a specific MCP server. Example: "my-auth-server".',
  )

/** ConfigChange source matcher — filters which config source triggered the change. */
export const ConfigChangeMatcherSchema = ConfigChangeSourceSchema.describe(
  'Matches the source field on ConfigChange. "user_settings" (~/.claude/settings.json), "project_settings" (.claude/settings.json), "local_settings" (.claude/settings.local.json), "policy_settings" (managed), "skills" (skill config).',
)

/** InstructionsLoaded load_reason matcher — filters why instruction files were loaded. */
export const InstructionsLoadedMatcherSchema =
  InstructionsLoadReasonSchema.describe(
    'Matches the load_reason field. "session_start" on initial load, "nested_traversal" for parent directory traversal, "path_glob_match" for glob patterns, "include" for file references, "compact" on re-load after compaction.',
  )

/** StopFailure error matcher — filters by API error type. */
export const StopFailureMatcherSchema = StopFailureErrorSchema.describe(
  'Matches the error field on StopFailure. "rate_limit", "authentication_failed", "billing_error", "invalid_request", "server_error", "max_output_tokens", or "unknown".',
)

/**
 * FileChanged matcher — pipe-separated basenames of files to watch.
 * REQUIRED for FileChanged hooks — without it, the hook won't fire.
 */
export const FileChangedMatcherSchema = z
  .string()
  .check(
    z.refine(
      (v) => v.length > 0 && v.split("|").every((s) => s.trim().length > 0),
      "Must be pipe-separated basenames (e.g. '.envrc|.env')",
    ),
  )
  .describe(
    'REQUIRED pipe-separated basenames of files to watch. Unlike other matchers, this is not regex — uses "|" as separator. Matches file basenames regardless of directory. Example: ".envrc|.env|.env.local".',
  )

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */
