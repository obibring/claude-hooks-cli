import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PostCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PostCompactMatcherSchema>} PostCompactMatcher */

// --- Config ---

/** Command-only hook. Matcher matches trigger. */
export const PostCompactConfigSchema = makeConfigSchemaWithMatched(
  PostCompactMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof PostCompactConfigSchema>} PostCompactConfig */

// --- Input ---

export const PostCompactInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PostCompact"),
  trigger: CompactTriggerSchema,
  compact_summary: z.string(),
})

/** @typedef {z.infer<typeof PostCompactInputSchema>} PostCompactInput */

// --- Output ---

export const PostCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PostCompactOutputSchema>} PostCompactOutput */
