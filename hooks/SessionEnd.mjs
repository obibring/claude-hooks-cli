import { z } from "zod/v4"

import { SessionEndReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionEndMatcherSchema as _SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs"
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
  ONCE_SETTINGS_FIELD,
} from "../lib/hook-schema-builder.mjs"

// --- Matcher ---

/** Session end reason matcher. */
export const SessionEndMatcherSchema = _SessionEndMatcherSchema.describe(
  "Session end reason matcher.",
)

/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */

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

/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema = z.object({
  /** Session end reason to filter on. */
  matcher: SessionEndMatcherSchema.optional().describe(
    "Session end reason to filter on.",
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

/** @typedef {z.infer<typeof SessionEndConfigSchema>} SessionEndConfig */

// --- Input ---

export const SessionEndInputSchema = BaseHookInputSchema.extend({
  /** SessionEnd */
  hook_event_name: z.literal("SessionEnd").describe("SessionEnd"),
  /** Why the session ended. */
  reason: SessionEndReasonSchema.describe("Why the session ended."),
})

/** @typedef {z.infer<typeof SessionEndInputSchema>} SessionEndInput */

// --- Output ---

export const SessionEndOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionEndOutputSchema>} SessionEndOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _matcherField = {
  matcher: {
    type: "enum",
    description: "Session end reason to filter on.",
    values: [
      "clear",
      "resume",
      "logout",
      "prompt_input_exit",
      "bypass_permissions_disabled",
      "other",
    ],
    strict: true,
  },
}
/** @satisfies {import("../lib/hook-schema-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  reason: {
    type: "enum",
    description: "Why the session ended.",
    values: [
      "clear",
      "resume",
      "logout",
      "prompt_input_exit",
      "bypass_permissions_disabled",
      "other",
    ],
    strict: true,
    required: true,
  },
}

hookSchemaBuilder
  .addHookType("SessionEnd", "command", {
    settings: {
      ..._matcherField,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
      ...ONCE_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("SessionEnd", "http", {
    settings: {
      ..._matcherField,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
      ...ONCE_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
