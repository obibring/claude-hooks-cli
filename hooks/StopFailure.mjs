import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { StopFailureMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { StopFailureErrorSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export { StopFailureMatcherSchema }

/** @typedef {z.infer<typeof StopFailureMatcherSchema>} StopFailureMatcher */

// --- Config ---

/** Command-only hook. Matcher matches error type. */
export const StopFailureConfigSchema = makeMatchedConfigSchema(
  StopFailureMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

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
