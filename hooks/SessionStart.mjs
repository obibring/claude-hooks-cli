import { z } from "zod/v4"

import { SessionStartSourceSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionStartMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import { SharedHandlerPropsSchema } from "../schemas/config-schemas.mjs"

// --- Matcher ---

export { SessionStartMatcherSchema }

/** @typedef {z.infer<typeof SessionStartMatcherSchema>} SessionStartMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  once: z.boolean().optional(),
})

/** Command-only hook. Supports `once`. Matcher matches source. */
export const SessionStartConfigSchema = z.object({
  matcher: SessionStartMatcherSchema.optional(),
  hooks: z
    .array(
      z
        .object({
          type: z.literal("command"),
          command: z.string(),
          ...handlerProps.shape,
        })
        .strict(),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof SessionStartConfigSchema>} SessionStartConfig */

// --- Input ---

export const SessionStartInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SessionStart"),
  model: z.string(),
  source: SessionStartSourceSchema,
})

/** @typedef {z.infer<typeof SessionStartInputSchema>} SessionStartInput */

// --- Output ---

export const SessionStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionStartOutputSchema>} SessionStartOutput */
