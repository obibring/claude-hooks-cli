import { z } from "zod/v4"

import {
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  hookFormBuilder,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-form-builder.mjs"
import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { StopFailureErrorSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { StopFailureMatcherSchema as _StopFailureMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** StopFailure error type matcher. */
export const StopFailureMatcherSchema = _StopFailureMatcherSchema.describe(
  "StopFailure error type matcher.",
)

/** @typedef {z.infer<typeof StopFailureMatcherSchema>} StopFailureMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Command-only hook. Matcher matches error type. */
export const StopFailureConfigSchema = z.object({
  /** Error type to filter on. */
  matcher: StopFailureMatcherSchema.optional().describe(
    "Error type to filter on.",
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

/** @typedef {z.infer<typeof StopFailureConfigSchema>} StopFailureConfig */

// --- Input ---

export const StopFailureInputSchema = BaseHookInputSchema.extend({
  /** StopFailure */
  hook_event_name: z.literal("StopFailure").describe("StopFailure"),
  /** The API error type that caused the failure. */
  error: StopFailureErrorSchema.describe(
    "The API error type that caused the failure.",
  ),
  /** Additional error details (shape varies by error type — may contain rate limit timing, auth error codes, etc.). */
  error_details: z
    .unknown()
    .describe(
      "Additional error details (shape varies by error type — may contain rate limit timing, auth error codes, etc.).",
    ),
  /** Claude's last response text before the error occurred. */
  last_assistant_message: z
    .string()
    .describe("Claude's last response text before the error occurred."),
})

/** @typedef {z.infer<typeof StopFailureInputSchema>} StopFailureInput */

// --- Output ---

export const StopFailureOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof StopFailureOutputSchema>} StopFailureOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _matcherField = {
  matcher: {
    type: "enum",
    description: "Error type to filter on.",
    values: [
      "rate_limit",
      "authentication_failed",
      "billing_error",
      "invalid_request",
      "server_error",
      "max_output_tokens",
      "unknown",
    ],
    strict: true,
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  error: {
    type: "enum",
    description: "The API error type that caused the failure.",
    values: [
      "rate_limit",
      "authentication_failed",
      "billing_error",
      "invalid_request",
      "server_error",
      "max_output_tokens",
      "unknown",
    ],
    strict: true,
    required: true,
  },
  error_details: {
    type: "object",
    description: "Additional error details.",
    required: true,
  },
  last_assistant_message: {
    type: "string",
    description: "Claude's last response text before the error.",
    required: true,
  },
}

hookFormBuilder
  .addHookType("StopFailure", "command", {
    settings: {
      ..._matcherField,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("StopFailure", "http", {
    settings: {
      ..._matcherField,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
