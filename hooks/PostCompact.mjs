import { z } from "zod/v4"

import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PostCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PostCompactMatcherSchema>} PostCompactMatcher */

// --- Config ---

/** Command-only hook. Matcher matches trigger. */
export const PostCompactConfigSchema = z
  .object({
    matcher: PostCompactMatcherSchema.optional(),
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
            })
            .strict(),
        ]),
      )
      .nonempty(),
  })
  .strict()

/** @typedef {z.infer<typeof PostCompactConfigSchema>} PostCompactConfig */

// --- Input ---

export const PostCompactInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PostCompact"),
  trigger: CompactTriggerSchema,
  compact_summary: z.string(),
})

/** @typedef {z.infer<typeof PostCompactInputSchema>} PostCompactInput */

// --- Output ---

export const PostCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PostCompactOutputSchema>} PostCompactOutput */
