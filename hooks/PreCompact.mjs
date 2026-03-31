import { z } from "zod/v4"

import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"
import {
  hookFormBuilder,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
  ONCE_SETTINGS_FIELD,
} from "../lib/hook-form-builder.mjs"

// --- Matcher ---

/** Compact trigger matcher for PreCompact. \"manual\" or \"auto\". */
export const PreCompactMatcherSchema = CompactTriggerMatcherSchema.describe(
  'Compact trigger matcher for PreCompact. "manual" or "auto".',
)

/** @typedef {z.infer<typeof PreCompactMatcherSchema>} PreCompactMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
  /** When true, this hook only fires once per session. Subsequent events are silently skipped. Only supported in settings-based hooks and skill frontmatter — not agent frontmatter. */
  once: z
    .boolean()
    .optional()
    .describe(
      "When true, this hook only fires once per session. Subsequent events are silently skipped. Only supported in settings-based hooks and skill frontmatter — not agent frontmatter.",
    ),
})

/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema = z.object({
  /** Compact trigger to filter on. \"manual\" or \"auto\". */
  matcher: PreCompactMatcherSchema.optional().describe(
    'Compact trigger to filter on. "manual" or "auto".',
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

/** @typedef {z.infer<typeof PreCompactConfigSchema>} PreCompactConfig */

// --- Input ---

export const PreCompactInputSchema = BaseHookInputSchema.extend({
  /** PreCompact */
  hook_event_name: z.literal("PreCompact").describe("PreCompact"),
  /** What triggered the compaction. */
  trigger: CompactTriggerSchema.describe("What triggered the compaction."),
  /** Custom compaction instructions provided by the user, if any. */
  custom_instructions: z
    .string()
    .optional()
    .describe("Custom compaction instructions provided by the user, if any."),
})

/** @typedef {z.infer<typeof PreCompactInputSchema>} PreCompactInput */

// --- Output ---

export const PreCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PreCompactOutputSchema>} PreCompactOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _matcherField = {
  matcher: {
    type: "enum",
    description: "Compact trigger to filter on.",
    values: ["manual", "auto"],
    strict: true,
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  trigger: {
    type: "enum",
    description: "What triggered the compaction.",
    values: ["manual", "auto"],
    strict: true,
    required: true,
  },
  custom_instructions: {
    type: "string",
    description: "Custom compaction instructions provided by the user, if any.",
  },
}

hookFormBuilder
  .addHookType("PreCompact", "command", {
    settings: {
      ..._matcherField,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
      ...ONCE_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("PreCompact", "http", {
    settings: {
      ..._matcherField,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
      ...ONCE_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
