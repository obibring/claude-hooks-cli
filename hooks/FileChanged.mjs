import { z } from "zod/v4"

import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import {
  hookFormBuilder,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-form-builder.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { FileChangedMatcherSchema as _FileChangedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** REQUIRED pipe-separated file basenames to watch. */
export const FileChangedMatcherSchema = _FileChangedMatcherSchema.describe(
  "REQUIRED pipe-separated file basenames to watch.",
)

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/**
 * Command-only hook. Matcher is REQUIRED — pipe-separated basenames
 * specifying which files to watch (e.g. ".envrc|.env").
 */
export const FileChangedConfigSchema = z.object({
  /** REQUIRED pipe-separated basenames to watch. Example: \".envrc|.env\". */
  matcher: FileChangedMatcherSchema.describe(
    'REQUIRED pipe-separated basenames to watch. Example: ".envrc|.env".',
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

/** @typedef {z.infer<typeof FileChangedConfigSchema>} FileChangedConfig */

// --- Input ---

export const FileChangedInputSchema = BaseHookInputSchema.extend({
  /** FileChanged */
  hook_event_name: z.literal("FileChanged").describe("FileChanged"),
  /** Full path to the changed file. */
  file_path: z.string().describe("Full path to the changed file."),
  /** Type of file system event (e.g. \"change\"). */
  event: z.string().describe('Type of file system event (e.g. "change").'),
})

/** @typedef {z.infer<typeof FileChangedInputSchema>} FileChangedInput */

// --- Output ---

export const FileChangedOutputSchema = z.object({
  ...BaseHookOutputSchema.shape,
  /**
   * Array of absolute paths. Replaces the current dynamic watch list (paths from your
   * matcher configuration are always watched). Use this when your hook script discovers
   * additional files to watch based on the changed file
   */
  watchPaths: z
    .string()
    .array()
    .optional()
    .describe(
      "Array of absolute paths. Replaces the current dynamic watch list (paths from your matcher configuration are always watched). Use this when your hook script discovers additional files to watch based on the changed file.",
    ),
})

/** @typedef {z.infer<typeof FileChangedOutputSchema>} FileChangedOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _matcherField = {
  matcher: {
    type: "string",
    description:
      'REQUIRED pipe-separated basenames to watch. Example: ".envrc|.env".',
    required: true,
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  file_path: {
    type: "string",
    description: "Full path to the changed file.",
    required: true,
  },
  event: {
    type: "string",
    description: 'Type of file system event (e.g. "change").',
    required: true,
  },
}
/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _output = {
  ...BASE_OUTPUT_FIELDS,
  watchPaths: {
    type: "array",
    description:
      "Array of absolute paths. Replaces the current dynamic watch list.",
    items: { type: "string", description: "Absolute file path to watch." },
  },
}

hookFormBuilder
  .addHookType("FileChanged", "command", {
    settings: {
      ..._matcherField,
      ...COMMAND_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
  .addHookType("FileChanged", "http", {
    settings: {
      ..._matcherField,
      ...HTTP_SETTINGS_FIELDS,
      ...IF_SETTINGS_FIELD,
    },
    input: _input,
    output: _output,
  })
