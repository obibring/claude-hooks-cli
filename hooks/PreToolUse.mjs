import { z } from "zod/v4"

import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { PreToolUsePermissionDecisionSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** Regex pattern matching tool names for PreToolUse. Example: "Bash", "mcp__memory__.*". */
export const PreToolUseMatcherSchema = ToolNameMatcherSchema.describe(
  'Regex pattern matching tool names for PreToolUse. Example: "Bash", "mcp__memory__.*".',
)

/** @typedef {z.infer<typeof PreToolUseMatcherSchema>} PreToolUseMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  /** Conditional execution using permission rule syntax. Only spawns the hook when this condition matches, reducing unnecessary process spawning. Examples: "Bash(git *)" for git commands only, "Edit(*.ts)" for TypeScript edits only. */
  if: z
    .string()
    .optional()
    .describe(
      'Conditional execution using permission rule syntax. Only spawns the hook when this condition matches, reducing unnecessary process spawning. Examples: "Bash(git *)" for git commands only, "Edit(*.ts)" for TypeScript edits only.',
    ),
})

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PreToolUseConfigSchema = z.object({
  /** Regex pattern matching tool names. Filters which tool calls trigger this hook. Example: "Bash", "Edit|Write", "mcp__memory__.*". */
  matcher: ToolNameMatcherSchema.optional().describe(
    'Regex pattern matching tool names. Filters which tool calls trigger this hook. Example: "Bash", "Edit|Write", "mcp__memory__.*".',
  ),
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            /**
             * Runs a shell command, Receives JSON input on stdin, returns JSON on stdout.
             * Exit code 0 = success, 2 = blocking error.
             */
            type: z
              .literal("command")
              .describe(
                "Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error.",
              ),
            /** Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout. */
            command: z
              .string()
              .describe(
                "Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout.",
              ),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            /** Sends a prompt to a Claude model for single-turn evaluation. Returns a yes/no decision as JSON. */
            type: z
              .literal("prompt")
              .describe(
                "Sends a prompt to a Claude model for single-turn evaluation. Returns a yes/no decision as JSON.",
              ),
            /**
             * Prompt to send to the model. Prompt must support yes/no type answers.
             * Use $ARGUMENTS for dynamic input.
             */
            prompt: z
              .string()
              .describe(
                "Prompt to send to the model. Prompt must support yes/no type answers. Use $ARGUMENTS for dynamic input.",
              ),
            /** Model to use for the prompt. */
            model: z
              .enum(["opus", "sonnet", "haiku", "opus[4m]", "sonnet[4m]"])
              .describe("Model to use for the prompt."),
            /** Maximum execution time in milliseconds before the hook is killed. */
            timeout: z
              .number()
              .int()
              .positive()
              .optional()
              .describe(
                "Maximum execution time in milliseconds before the hook is killed.",
              ),
          })
          .strict(),
        z
          .object({
            /** Spawns a subagent with multi-turn tool access (Read, Grep, Glob) to verify conditions. */
            type: z
              .literal("agent")
              .describe(
                "Spawns a subagent with multi-turn tool access (Read, Grep, Glob) to verify conditions.",
              ),
            /** Prompt text sent to the Claude model. $ARGUMENTS is replaced with hook context. */
            prompt: z
              .string()
              .describe(
                "Prompt text sent to the Claude model. $ARGUMENTS is replaced with hook context.",
              ),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            /** POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63. */
            type: z
              .literal("http")
              .describe(
                "POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63.",
              ),
            /** URL to POST the hook JSON payload to. */
            url: z.url().describe("URL to POST the hook JSON payload to."),
            ...handlerProps.shape,
            ...HttpExtraPropsSchema.shape,
          })
          .strict(),
      ]),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof PreToolUseConfigSchema>} PreToolUseConfig */

// --- Input ---

export const PreToolUseInputSchema = BaseHookInputSchema.extend({
  /** PreToolUse */
  hook_event_name: z.literal("PreToolUse").describe("PreToolUse"),
  ...ToolFieldsSchema.shape,
  /** Unique identifier for this specific tool call invocation. */
  tool_use_id: z
    .string()
    .describe("Unique identifier for this specific tool call invocation."),
})

/** @typedef {z.infer<typeof PreToolUseInputSchema>} PreToolUseInput */

// --- Output ---

export const PreToolUseHookSpecificOutputSchema = z.object({
  /** Controls whether the tool call proceeds. "allow" lets it run, "deny" blocks it, "ask" falls through to the user permission prompt. */
  permissionDecision: PreToolUsePermissionDecisionSchema.optional().describe(
    'Controls whether the tool call proceeds. "allow" lets it run, "deny" blocks it, "ask" falls through to the user permission prompt.',
  ),
  /** Explanation shown to the model when permissionDecision is "deny". Helps Claude understand why the tool was blocked. */
  permissionDecisionReason: z
    .string()
    .optional()
    .describe(
      'Explanation shown to the model when permissionDecision is "deny". Helps Claude understand why the tool was blocked.',
    ),
  /** When true, auto-approves all future uses of this tool for the rest of the session. Since v2.0.76. */
  autoAllow: z
    .boolean()
    .optional()
    .describe(
      "When true, auto-approves all future uses of this tool for the rest of the session. Since v2.0.76.",
    ),
  /** Modified tool input that replaces the original. For AskUserQuestion, can include {question, answer} to auto-respond. Since v2.1.85. */
  updatedInput: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Modified tool input that replaces the original. For AskUserQuestion, can include {question, answer} to auto-respond. Since v2.1.85.",
    ),
})

export const PreToolUseOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: PreToolUseHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof PreToolUseOutputSchema>} PreToolUseOutput */
