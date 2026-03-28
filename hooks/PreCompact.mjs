import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigWithOnceSchema,
} from "../schemas/config-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { CompactTriggerSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export const PreCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PreCompactMatcherSchema>} PreCompactMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema = makeMatchedConfigWithOnceSchema(
  PreCompactMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

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
