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
export const ToolNameMatcherSchema = z.string().check(
  z.refine((v) => {
    try {
      new RegExp(v)
      return true
    } catch {
      return false
    }
  }, "Must be a valid regex pattern matching tool names"),
)

/** @typedef {z.infer<typeof ToolNameMatcherSchema>} ToolNameMatcher */

/** Notification type matcher */
export const NotificationMatcherSchema = NotificationTypeSchema

/** Subagent type matcher (agent_type field) */
export const SubagentTypeMatcherSchema = z.string()

/** SessionStart source matcher */
export const SessionStartMatcherSchema = SessionStartSourceSchema

/** SessionEnd reason matcher */
export const SessionEndMatcherSchema = SessionEndReasonSchema

/** Compact trigger matcher (PreCompact, PostCompact) */
export const CompactTriggerMatcherSchema = CompactTriggerSchema

/** Elicitation/ElicitationResult MCP server name matcher */
export const ElicitationMatcherSchema = z.string()

/** ConfigChange source matcher */
export const ConfigChangeMatcherSchema = ConfigChangeSourceSchema

/** InstructionsLoaded load_reason matcher */
export const InstructionsLoadedMatcherSchema = InstructionsLoadReasonSchema

/** StopFailure error matcher */
export const StopFailureMatcherSchema = StopFailureErrorSchema

/**
 * FileChanged matcher — pipe-separated basenames of files to watch.
 * e.g. ".envrc|.env" or ".env.local"
 */
export const FileChangedMatcherSchema = z
  .string()
  .check(
    z.refine(
      (v) => v.length > 0 && v.split("|").every((s) => s.trim().length > 0),
      "Must be pipe-separated basenames (e.g. '.envrc|.env')",
    ),
  )

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */
