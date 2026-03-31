import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
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
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-schema-builder.mjs"

// --- Matcher ---

/** Agent type matcher for SubagentStart. */
export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema.describe(
  "Agent type matcher for SubagentStart.",
)

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = z.object({
  /** Agent type to filter on. Example: \"Bash\", \"Explore\", \"Plan\". */
  matcher: SubagentStartMatcherSchema.optional().describe(
    'Agent type to filter on. Example: "Bash", "Explore", "Plan".',
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

/** @typedef {z.infer<typeof SubagentStartConfigSchema>} SubagentStartConfig */

// --- Input ---

export const SubagentStartInputSchema = BaseHookInputSchema.extend({
  /** SubagentStart */
  hook_event_name: z.literal("SubagentStart").describe("SubagentStart"),
  /** Unique identifier for this subagent instance. */
  agent_id: z
    .string()
    .describe("Unique identifier for this subagent instance."),
  /** Type of agent starting. Built-in: \"Bash\", \"Explore\", \"Plan\", or a custom agent name. */
  agent_type: z
    .string()
    .describe(
      'Type of agent starting. Built-in: "Bash", "Explore", "Plan", or a custom agent name.',
    ),
})

/** @typedef {z.infer<typeof SubagentStartInputSchema>} SubagentStartInput */

// --- Output ---

export const SubagentStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SubagentStartOutputSchema>} SubagentStartOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _matcherField = {
  matcher: {
    type: "string",
    description:
      'Agent type to filter on. Built-in: "Bash", "Explore", "Plan", or a custom agent name.',
  },
}
/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  agent_id: {
    type: "string",
    description: "Unique identifier for this subagent instance.",
    required: true,
  },
  agent_type: {
    type: "string",
    description:
      'Type of agent starting. Built-in: "Bash", "Explore", "Plan", or a custom agent name.',
    required: true,
  },
}

hookSchemaBuilder
  .addHookType("SubagentStart", "command", {
    settings: {
      ..._matcherField,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("SubagentStart", "http", {
    settings: {
      ..._matcherField,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
