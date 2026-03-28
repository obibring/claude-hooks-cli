import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { BlockDecisionSchema } from "../schemas/enums.mjs"

// --- Matcher ---

/** Stop does not support matchers — always fires. */
export const StopMatcherSchema = undefined

// --- Config ---

/** Supports all 4 handler types. No matcher support. */
export const StopConfigSchema = makeUnmatchedConfigSchema(AnyHandlerSchema)

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
