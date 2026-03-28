import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** TeammateIdle does not support matchers — always fires. */
export const TeammateIdleMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. Requires experimental agent teams. */
export const TeammateIdleConfigSchema = z
  .object({
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

/** @typedef {z.infer<typeof TeammateIdleConfigSchema>} TeammateIdleConfig */

// --- Input ---

export const TeammateIdleInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("TeammateIdle"),
  teammate_name: z.string(),
  team_name: z.string(),
})

/** @typedef {z.infer<typeof TeammateIdleInputSchema>} TeammateIdleInput */

// --- Output ---

/** TeammateIdle can return continue:false with stopReason via base output,
 *  or use exit code 2 with JSON decision control. */
export const TeammateIdleOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof TeammateIdleOutputSchema>} TeammateIdleOutput */
