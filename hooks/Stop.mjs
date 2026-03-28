import { z } from "zod/v4"

import { BlockDecisionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Stop does not support matchers — always fires. */
export const StopMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Supports all 4 handler types. No matcher support. */
export const StopConfigSchema = z.object({
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            type: z.literal("command"),
            command: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("prompt"),
            prompt: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("agent"),
            prompt: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("http"),
            url: z.url(),
            ...handlerProps.shape,
            ...HttpExtraPropsSchema.shape,
          })
          .strict(),
      ]),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof StopConfigSchema>} StopConfig */

// --- Input ---

export const StopInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Stop"),
  last_assistant_message: z.string(),
  stop_hook_active: z.boolean(),
})

/** @typedef {z.infer<typeof StopInputSchema>} StopInput */

// --- Output ---

export const StopOutputSchema = BaseHookOutputSchema.extend({
  decision: BlockDecisionSchema.optional(),
})

/** @typedef {z.infer<typeof StopOutputSchema>} StopOutput */
