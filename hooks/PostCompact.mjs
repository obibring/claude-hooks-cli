import { z } from "zod/v4"

import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Compact trigger matcher for PostCompact. */
export const PostCompactMatcherSchema = CompactTriggerMatcherSchema.describe(
  "Compact trigger matcher for PostCompact.",
)

/** @typedef {z.infer<typeof PostCompactMatcherSchema>} PostCompactMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches trigger. */
export const PostCompactConfigSchema = z.object({
  /** Compact trigger to filter on. \"manual\" or \"auto\". */
  matcher: PostCompactMatcherSchema.optional().describe(
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

/** @typedef {z.infer<typeof PostCompactConfigSchema>} PostCompactConfig */

// --- Input ---

export const PostCompactInputSchema = BaseHookInputSchema.extend({
  /** PostCompact */
  hook_event_name: z.literal("PostCompact").describe("PostCompact"),
  /** What triggered the compaction. */
  trigger: CompactTriggerSchema.describe("What triggered the compaction."),
  /** The summary text produced by the compaction operation. */
  compact_summary: z
    .string()
    .describe("The summary text produced by the compaction operation."),
})

/** @typedef {z.infer<typeof PostCompactInputSchema>} PostCompactInput */

// --- Output ---

export const PostCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PostCompactOutputSchema>} PostCompactOutput */
