import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { SessionEndReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { SessionEndMatcherSchema }

/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema = makeConfigSchemaWithMatched(
  SessionEndMatcherSchema.optional(),
  CommandOnlyHandlerSchema.extend({ once: z.boolean().optional() }),
)

/** @typedef {z.infer<typeof SessionEndConfigSchema>} SessionEndConfig */

// --- Input ---

export const SessionEndInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SessionEnd"),
  reason: SessionEndReasonSchema,
})

/** @typedef {z.infer<typeof SessionEndInputSchema>} SessionEndInput */

// --- Output ---

export const SessionEndOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionEndOutputSchema>} SessionEndOutput */
