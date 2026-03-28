import { z } from "zod/v4"

import { PermissionRequestDecisionBehaviorSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Regex pattern matching tool names for PermissionRequest. */
export const PermissionRequestMatcherSchema = ToolNameMatcherSchema.describe(
  "Regex pattern matching tool names for PermissionRequest.",
)

/** @typedef {z.infer<typeof PermissionRequestMatcherSchema>} PermissionRequestMatcher */

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
export const PermissionRequestConfigSchema = z.object({
  /** Regex pattern matching tool names. Same as PreToolUse matcher. */
  matcher: ToolNameMatcherSchema.optional().describe(
    "Regex pattern matching tool names. Same as PreToolUse matcher.",
  ),
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            /** Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error. */
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

/** @typedef {z.infer<typeof PermissionRequestConfigSchema>} PermissionRequestConfig */

// --- Input ---

export const PermissionRequestInputSchema = BaseHookInputSchema.extend({
  /** PermissionRequest */
  hook_event_name: z.literal("PermissionRequest").describe("PermissionRequest"),
  ...ToolFieldsSchema.shape,
  /** Suggestions for the permission prompt. Shape varies. */
  permission_suggestions: z
    .unknown()
    .optional()
    .describe("Suggestions for the permission prompt. Shape varies."),
})

/** @typedef {z.infer<typeof PermissionRequestInputSchema>} PermissionRequestInput */

// --- Output ---

export const PermissionRequestHookSpecificOutputSchema = z.object({
  /** Permission decision. "allow" grants the permission, "deny" blocks it. */
  decision: z
    .object({
      /** Permission decision. \"allow\" grants the permission, \"deny\" blocks it. */
      behavior: PermissionRequestDecisionBehaviorSchema.describe(
        'Permission decision. "allow" grants the permission, "deny" blocks it.',
      ),
    })
    .optional(),
})

export const PermissionRequestOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: PermissionRequestHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof PermissionRequestOutputSchema>} PermissionRequestOutput */
