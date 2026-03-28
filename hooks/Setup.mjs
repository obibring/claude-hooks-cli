import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** Setup does not support matchers — always fires. */
export const SetupMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. Default timeout 30000ms. */
export const SetupConfigSchema = z.object({
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
        })
        .strict(),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof SetupConfigSchema>} SetupConfig */

// --- Input ---

export const SetupInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Setup"),
})

/** @typedef {z.infer<typeof SetupInputSchema>} SetupInput */

// --- Output ---

export const SetupOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SetupOutputSchema>} SetupOutput */
