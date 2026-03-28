import { z } from "zod/v4"

import { StopFailureErrorSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { StopFailureMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { StopFailureMatcherSchema }

/** @typedef {z.infer<typeof StopFailureMatcherSchema>} StopFailureMatcher */

// --- Config ---

/** Command-only hook. Matcher matches error type. */
export const StopFailureConfigSchema = z
  .object({
    matcher: StopFailureMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof StopFailureConfigSchema>} StopFailureConfig */

// --- Input ---

export const StopFailureInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("StopFailure"),
  error: StopFailureErrorSchema,
  error_details: z.unknown(),
  last_assistant_message: z.string(),
})

/** @typedef {z.infer<typeof StopFailureInputSchema>} StopFailureInput */

// --- Output ---

export const StopFailureOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof StopFailureOutputSchema>} StopFailureOutput */
