import { z } from "zod/v4"

import {
  BlockDecisionSchema,
  ConfigChangeSourceSchema,
} from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ConfigChangeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { ConfigChangeMatcherSchema }

/** @typedef {z.infer<typeof ConfigChangeMatcherSchema>} ConfigChangeMatcher */

// --- Config ---

/** Command-only hook. Matcher matches source. */
export const ConfigChangeConfigSchema = z
  .object({
    matcher: ConfigChangeMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof ConfigChangeConfigSchema>} ConfigChangeConfig */

// --- Input ---

export const ConfigChangeInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("ConfigChange"),
  file_path: z.string(),
  source: ConfigChangeSourceSchema,
})

/** @typedef {z.infer<typeof ConfigChangeInputSchema>} ConfigChangeInput */

// --- Output ---

export const ConfigChangeOutputSchema = BaseHookOutputSchema.extend({
  decision: BlockDecisionSchema.optional(),
})

/** @typedef {z.infer<typeof ConfigChangeOutputSchema>} ConfigChangeOutput */
