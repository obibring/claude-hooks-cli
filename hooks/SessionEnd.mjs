import { z } from "zod/v4"

import { SessionEndReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { SessionEndMatcherSchema }

/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema = z
  .object({
    matcher: SessionEndMatcherSchema.optional(),
    hooks: z
      .array(
        z.discriminatedUnion("type", [
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
          z
            .object({
              type: z.literal("http"),
              url: z.url(),
              timeout: z.number().int().positive().optional(),
              async: z.boolean().optional(),
              asyncRewake: z.boolean().optional(),
              statusMessage: z.string().optional(),
              headers: z.record(z.string(), z.string()).optional(),
              allowedEnvVars: z.array(z.string()).optional(),
              once: z.boolean().optional(),
            })
            .strict(),
        ]),
      )
      .nonempty(),
  })
  .strict()

/** @typedef {z.infer<typeof SessionEndConfigSchema>} SessionEndConfig */

// --- Input ---

export const SessionEndInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SessionEnd"),
  reason: SessionEndReasonSchema,
})

/** @typedef {z.infer<typeof SessionEndInputSchema>} SessionEndInput */

// --- Output ---

export const SessionEndOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionEndOutputSchema>} SessionEndOutput */
