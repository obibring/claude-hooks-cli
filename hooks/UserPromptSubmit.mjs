import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"
import {
  hookSchemaBuilder,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  PROMPT_SETTINGS_FIELDS,
  AGENT_SETTINGS_FIELDS,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-schema-builder.mjs"

// --- Matcher ---

/** UserPromptSubmit does not support matchers — always fires. */
export const UserPromptSubmitMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Supports all 4 handler types. No matcher support. */
export const UserPromptSubmitConfigSchema = z.object({
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

/** @typedef {z.infer<typeof UserPromptSubmitConfigSchema>} UserPromptSubmitConfig */

// --- Input ---

export const UserPromptSubmitInputSchema = BaseHookInputSchema.extend({
  /** UserPromptSubmit */
  hook_event_name: z.literal("UserPromptSubmit").describe("UserPromptSubmit"),
  /** The user's submitted prompt text, before Claude processes it. */
  prompt: z
    .string()
    .describe("The user's submitted prompt text, before Claude processes it."),
})

/** @typedef {z.infer<typeof UserPromptSubmitInputSchema>} UserPromptSubmitInput */

// --- Output ---

/** UserPromptSubmit can modify the prompt field in output. */
export const UserPromptSubmitOutputSchema = BaseHookOutputSchema.extend({
  /** Modified prompt text that replaces the original. Claude will see this instead of what the user typed. */
  prompt: z
    .string()
    .optional()
    .describe(
      "Modified prompt text that replaces the original. Claude will see this instead of what the user typed.",
    ),
})

/** @typedef {z.infer<typeof UserPromptSubmitOutputSchema>} UserPromptSubmitOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  prompt: {
    type: "string",
    description:
      "The user's submitted prompt text, before Claude processes it.",
    required: true,
  },
}
/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _output = {
  ...BASE_OUTPUT_FIELDS,
  prompt: {
    type: "string",
    description:
      "Modified prompt text that replaces the original. Claude will see this instead of what the user typed.",
  },
}

hookSchemaBuilder
  .addHookType("UserPromptSubmit", "command", {
    settings: { ...COMMAND_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: _output,
  })
  .addHookType("UserPromptSubmit", "prompt", {
    settings: { ...PROMPT_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: _output,
  })
  .addHookType("UserPromptSubmit", "agent", {
    settings: { ...AGENT_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: _output,
  })
  .addHookType("UserPromptSubmit", "http", {
    settings: { ...HTTP_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: _output,
  })
