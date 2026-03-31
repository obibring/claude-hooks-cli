import { z } from "zod/v4"

import {
  AGENT_SETTINGS_FIELDS,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  hookFormBuilder,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
  PROMPT_SETTINGS_FIELDS,
  TOOL_INPUT_FIELDS,
  TOOL_MATCHER_FIELD,
} from "../lib/hook-form-builder.mjs"
import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { PermissionRequestDecisionBehaviorSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

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
            type: z
              .literal("prompt")
              .describe(
                "Sends a prompt to a Claude model for single-turn evaluation. Returns a yes/no decision as JSON.",
              ),
            prompt: z
              .string()
              .describe(
                "Prompt to send to the model. Prompt must support yes/no type answers. Use $ARGUMENTS for dynamic input.",
              ),
            model: z
              .enum(["opus", "sonnet", "haiku", "opus[4m]", "sonnet[4m]"])
              .describe("Model to use for the prompt.")
              .optional(),
            if: z
              .string()
              .optional()
              .describe(
                "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
              ),
            timeout: z
              .number()
              .int()
              .positive()
              .optional()
              .describe(
                "Seconds before canceling. Default: 30 for prompt hooks.",
              ),
            statusMessage: z
              .string()
              .optional()
              .describe(
                "Custom spinner message displayed while the hook runs.",
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

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  ...TOOL_INPUT_FIELDS,
  permission_suggestions: {
    type: "object",
    description: "Suggestions for the permission prompt. Shape varies.",
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _output = {
  ...BASE_OUTPUT_FIELDS,
  hookSpecificOutput: {
    type: "object",
    description: "PermissionRequest-specific output fields.",
    fields: {
      decision: {
        type: "object",
        description: "Permission decision object.",
        fields: {
          behavior: {
            type: "enum",
            description: 'Permission decision. "allow" grants, "deny" blocks.',
            values: ["allow", "deny"],
            strict: true,
          },
        },
      },
    },
  },
}

hookFormBuilder
  .addHookType("PermissionRequest", "command", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PermissionRequest", "prompt", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...PROMPT_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PermissionRequest", "agent", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...AGENT_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PermissionRequest", "http", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
