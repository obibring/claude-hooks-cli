import { z } from "zod/v4"

import { InstructionsLoadReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { InstructionsLoadedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { InstructionsLoadedMatcherSchema }

/** @typedef {z.infer<typeof InstructionsLoadedMatcherSchema>} InstructionsLoadedMatcher */

// --- Config ---

/** Command-only hook. Matcher matches load_reason. */
export const InstructionsLoadedConfigSchema = z
  .object({
    matcher: InstructionsLoadedMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof InstructionsLoadedConfigSchema>} InstructionsLoadedConfig */

// --- Input ---

export const InstructionsLoadedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("InstructionsLoaded"),
  file_path: z.string(),
  memory_type: z.string(),
  load_reason: InstructionsLoadReasonSchema,
  globs: z.unknown().optional(),
  trigger_file_path: z.string().optional(),
  parent_file_path: z.string().optional(),
})

/** @typedef {z.infer<typeof InstructionsLoadedInputSchema>} InstructionsLoadedInput */

// --- Output ---

export const InstructionsLoadedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof InstructionsLoadedOutputSchema>} InstructionsLoadedOutput */
