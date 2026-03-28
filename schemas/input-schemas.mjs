import { z } from "zod/v4"
import { PermissionModeSchema } from "./enums.mjs"

/**
 * Common input fields present in every hook's stdin JSON.
 * Hook-specific files extend this with their own fields using z.object().extend().
 */
export const BaseHookInputSchema = z.object({
  /** Name of the hook event that fired (e.g. "PreToolUse", "Stop"). Use this to identify which event triggered your hook script when a single script handles multiple events. */
  hook_event_name: z
    .string()
    .describe(
      'Name of the hook event that fired (e.g. "PreToolUse", "Stop"). Use this to identify which event triggered your hook script when a single script handles multiple events.',
    ),
  /** Unique identifier for the current Claude Code session. Persists across compactions and resumes within the same session. */
  session_id: z
    .string()
    .describe(
      "Unique identifier for the current Claude Code session. Persists across compactions and resumes within the same session.",
    ),
  /** Absolute path to the conversation transcript JSON file. Can be read to inspect the full conversation history. */
  transcript_path: z
    .string()
    .describe(
      "Absolute path to the conversation transcript JSON file. Can be read to inspect the full conversation history.",
    ),
  /** Current working directory of the Claude Code session. */
  cwd: z
    .string()
    .describe("Current working directory of the Claude Code session."),
  /** The active permission mode. Affects which tool calls require user approval. "default" prompts for each action, "dontAsk" auto-approves most, "bypassPermissions" skips all checks. */
  permission_mode: PermissionModeSchema.describe(
    'The active permission mode. Affects which tool calls require user approval. "default" prompts for each action, "dontAsk" auto-approves most, "bypassPermissions" skips all checks.',
  ),
  /** Unique subagent identifier. Only present when the hook fires inside a subagent context (since v2.1.69). */
  agent_id: z
    .string()
    .optional()
    .describe(
      "Unique subagent identifier. Only present when the hook fires inside a subagent context (since v2.1.69).",
    ),
  /** Agent type name (e.g. "Bash", "Explore", "Plan", or a custom agent name). Present when using --agent flag or inside a subagent (since v2.1.69). */
  agent_type: z
    .string()
    .optional()
    .describe(
      'Agent type name (e.g. "Bash", "Explore", "Plan", or a custom agent name). Present when using --agent flag or inside a subagent (since v2.1.69).',
    ),
})

/** @typedef {z.infer<typeof BaseHookInputSchema>} BaseHookInput */

/**
 * Shared shape for tool-related hooks (PreToolUse, PostToolUse, etc.).
 * Contains tool_name and tool_input fields common to all tool event hooks.
 */
export const ToolFieldsSchema = z.object({
  /** Name of the tool being called. Built-in tools: "Bash", "Read", "Edit", "Write", "Glob", "Grep", "Agent", "WebFetch", "WebSearch", "AskUserQuestion", "ExitPlanMode". MCP tools follow the pattern "mcp__<server>__<tool>". */
  tool_name: z
    .string()
    .describe(
      'Name of the tool being called. Built-in tools: "Bash", "Read", "Edit", "Write", "Glob", "Grep", "Agent", "WebFetch", "WebSearch", "AskUserQuestion", "ExitPlanMode". MCP tools follow the pattern "mcp__<server>__<tool>".',
    ),
  /** Arguments passed to the tool as a key-value object. Shape varies by tool -- e.g. Bash has {command: string}, Edit has {file_path, old_string, new_string}. */
  tool_input: z
    .record(z.string(), z.unknown())
    .describe(
      "Arguments passed to the tool as a key-value object. Shape varies by tool — e.g. Bash has {command: string}, Edit has {file_path, old_string, new_string}.",
    ),
})

/** @typedef {z.infer<typeof ToolFieldsSchema>} ToolFields */
