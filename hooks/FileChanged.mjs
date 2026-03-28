import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { FileChangedMatcherSchema as _FileChangedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** REQUIRED pipe-separated file basenames to watch. */
export const FileChangedMatcherSchema = _FileChangedMatcherSchema.describe(
  "REQUIRED pipe-separated file basenames to watch.",
)

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

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

export const FileChangedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof FileChangedOutputSchema>} FileChangedOutput */
