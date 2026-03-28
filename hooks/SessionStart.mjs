import { z } from "zod/v4"

import { SessionStartSourceSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionStartMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { SessionStartMatcherSchema }

/** @typedef {z.infer<typeof SessionStartMatcherSchema>} SessionStartMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches source. */
export const SessionStartConfigSchema = z.object({
  matcher: SessionStartMatcherSchema.optional(),
  hooks: z
    .array(
      z
        .object({
          type: z.literal("command"),
          command: z.string(),
          timeout: z.number().int().positive().optional(),
          async: z.boolean().optional(),
          asyncRewake: z.boolean().optional(),
          statusMessage: z.string().optional(),
          once: z.boolean().optional(),
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
