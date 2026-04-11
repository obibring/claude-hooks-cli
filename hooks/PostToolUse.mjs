import { z } from "zod/v4"

import { BlockDecisionSchema } from "../schemas/enums.mjs"
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
import {
  hookFormBuilder,
  BASE_INPUT_FIELDS,
  TOOL_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  PROMPT_SETTINGS_FIELDS,
  AGENT_SETTINGS_FIELDS,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
  TOOL_MATCHER_FIELD,
} from "../lib/hook-form-builder.mjs"

// --- Matcher ---

/** Regex pattern matching tool names for PostToolUse. */
export const PostToolUseMatcherSchema = ToolNameMatcherSchema.describe(
  "Regex pattern matching tool names for PostToolUse.",
)

/** @typedef {z.infer<typeof PostToolUseMatcherSchema>} PostToolUseMatcher */

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
export const PostToolUseConfigSchema = z.object({
  /** Regex pattern matching tool names. Filters which completed tool calls trigger this hook. */
  matcher: ToolNameMatcherSchema.optional().describe(
    "Regex pattern matching tool names. Filters which completed tool calls trigger this hook.",
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

/** @typedef {z.infer<typeof PostToolUseConfigSchema>} PostToolUseConfig */

// --- Input ---

export const PostToolUseInputSchema = BaseHookInputSchema.extend({
  /** PostToolUse */
  hook_event_name: z.literal("PostToolUse").describe("PostToolUse"),
  ...ToolFieldsSchema.shape,
  /** Unique identifier for this tool call invocation. */
  tool_use_id: z
    .string()
    .describe("Unique identifier for this tool call invocation."),
  /** The tool's return value. Shape varies by tool. */
  tool_response: z
    .unknown()
    .describe("The tool's return value. Shape varies by tool."),
})

/** @typedef {z.infer<typeof PostToolUseInputSchema>} PostToolUseInput */

// --- Output ---

export const PostToolUseOutputSchema = BaseHookOutputSchema.extend({
  /** Set to "block" to prompt Claude with the reason. The tool has already executed; this provides reactive feedback, not a hard stop. */
  decision: BlockDecisionSchema.optional().describe(
    'Set to "block" to prompt Claude with the reason. The tool has already executed; this provides reactive feedback, not a hard stop.',
  ),
})

/** @typedef {z.infer<typeof PostToolUseOutputSchema>} PostToolUseOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  ...TOOL_INPUT_FIELDS,
  tool_use_id: {
    type: "string",
    description: "Unique identifier for this tool call invocation.",
    required: true,
  },
  tool_response: {
    type: "object",
    description: "The tool's return value. Shape varies by tool.",
    required: true,
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _output = {
  ...BASE_OUTPUT_FIELDS,
  decision: {
    type: "enum",
    description:
      'Set to "block" to prompt Claude with the reason. The tool has already executed; this provides reactive feedback, not a hard stop.',
    values: ["block"],
    strict: true,
  },
}

hookFormBuilder
  .addHookType("PostToolUse", "command", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PostToolUse", "prompt", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...PROMPT_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PostToolUse", "agent", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...AGENT_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("PostToolUse", "http", {
    settings: {
      ...TOOL_MATCHER_FIELD,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
