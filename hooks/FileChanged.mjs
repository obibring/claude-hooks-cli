import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { FileChangedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export { FileChangedMatcherSchema }

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/**
 * Command-only hook. Matcher is REQUIRED — pipe-separated basenames
 * specifying which files to watch (e.g. ".envrc|.env").
 */
export const FileChangedConfigSchema = z.object({
  matcher: FileChangedMatcherSchema,
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            type: z.literal("command"),
            command: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("http"),
            url: z.url(),
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
  hook_event_name: z.literal("FileChanged"),
  file_path: z.string(),
  event: z.string(),
})

/** @typedef {z.infer<typeof FileChangedInputSchema>} FileChangedInput */

// --- Output ---

export const FileChangedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof FileChangedOutputSchema>} FileChangedOutput */
