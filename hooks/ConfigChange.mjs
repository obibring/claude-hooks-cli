import { z } from "zod/v4"

import {
  BlockDecisionSchema,
  ConfigChangeSourceSchema,
} from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ConfigChangeMatcherSchema as _ConfigChangeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Config change source matcher. */
export const ConfigChangeMatcherSchema = _ConfigChangeMatcherSchema.describe(
  "Config change source matcher.",
)

/** @typedef {z.infer<typeof ConfigChangeMatcherSchema>} ConfigChangeMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches source. */
export const ConfigChangeConfigSchema = z.object({
  /** Config source to filter on. */
  matcher: ConfigChangeMatcherSchema.optional().describe(
    "Config source to filter on.",
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

/** @typedef {z.infer<typeof ConfigChangeConfigSchema>} ConfigChangeConfig */

// --- Input ---

export const ConfigChangeInputSchema = BaseHookInputSchema.extend({
  /** ConfigChange */
  hook_event_name: z.literal("ConfigChange").describe("ConfigChange"),
  /** Absolute path to the changed configuration file. */
  file_path: z
    .string()
    .describe("Absolute path to the changed configuration file."),
  /** Which configuration source changed. */
  source: ConfigChangeSourceSchema.describe(
    "Which configuration source changed.",
  ),
})

/** @typedef {z.infer<typeof ConfigChangeInputSchema>} ConfigChangeInput */

// --- Output ---

export const ConfigChangeOutputSchema = BaseHookOutputSchema.extend({
  /** Set to \"block\" to stop execution after config change. */
  decision: BlockDecisionSchema.optional().describe(
    'Set to "block" to stop execution after config change.',
  ),
})

/** @typedef {z.infer<typeof ConfigChangeOutputSchema>} ConfigChangeOutput */
