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

/** TaskCreated does not support matchers — always fires. */
export const TaskCreatedMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCreatedConfigSchema = z.object({
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

/** @typedef {z.infer<typeof TaskCreatedConfigSchema>} TaskCreatedConfig */

// --- Input ---

export const TaskCreatedInputSchema = BaseHookInputSchema.extend({
  /** TaskCreated */
  hook_event_name: z.literal("TaskCreated").describe("TaskCreated"),
  /** Unique identifier for the created task. */
  task_id: z.string().describe("Unique identifier for the created task."),
  /** Subject line of the task. */
  task_subject: z.string().describe("Subject line of the task."),
  /** Full description of the task. */
  task_description: z.string().describe("Full description of the task."),
  /** Name of the teammate assigned to the task. */
  teammate_name: z
    .string()
    .describe("Name of the teammate assigned to the task."),
  /** Name of the agent team. */
  team_name: z.string().describe("Name of the agent team."),
})

/** @typedef {z.infer<typeof TaskCreatedInputSchema>} TaskCreatedInput */

// --- Output ---

/** TaskCreated uses exit code 2 to block task creation (stderr fed back to model).
 *  Also supports JSON decision control with continue/stopReason. */
export const TaskCreatedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof TaskCreatedOutputSchema>} TaskCreatedOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  task_id: {
    type: "string",
    description: "Unique identifier for the created task.",
    required: true,
  },
  task_subject: {
    type: "string",
    description: "Subject line of the task.",
    required: true,
  },
  task_description: {
    type: "string",
    description: "Full description of the task.",
    required: true,
  },
  teammate_name: {
    type: "string",
    description: "Name of the teammate assigned to the task.",
    required: true,
  },
  team_name: {
    type: "string",
    description: "Name of the agent team.",
    required: true,
  },
}

hookSchemaBuilder
  .addHookType("TaskCreated", "command", {
    settings: { ...COMMAND_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("TaskCreated", "prompt", {
    settings: { ...PROMPT_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("TaskCreated", "agent", {
    settings: { ...AGENT_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("TaskCreated", "http", {
    settings: { ...HTTP_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
