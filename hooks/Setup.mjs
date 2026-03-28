import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import { SharedHandlerPropsSchema } from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Setup does not support matchers — always fires. */
export const SetupMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. No matcher support. Default timeout 30000ms. */
export const SetupConfigSchema = z.object({
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

/** @typedef {z.infer<typeof SetupConfigSchema>} SetupConfig */

// --- Input ---

export const SetupInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Setup"),
})

/** @typedef {z.infer<typeof SetupInputSchema>} SetupInput */

// --- Output ---

export const SetupOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SetupOutputSchema>} SetupOutput */
