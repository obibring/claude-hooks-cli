import { z } from "zod/v4"

import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PreCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PreCompactMatcherSchema>} PreCompactMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema = z
  .object({
    matcher: PreCompactMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof PreCompactConfigSchema>} PreCompactConfig */

// --- Input ---

export const PreCompactInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PreCompact"),
  trigger: CompactTriggerSchema,
  custom_instructions: z.string().optional(),
})

/** @typedef {z.infer<typeof PreCompactInputSchema>} PreCompactInput */

// --- Output ---

export const PreCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PreCompactOutputSchema>} PreCompactOutput */
