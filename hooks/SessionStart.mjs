import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { SessionStartSourceSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionStartMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { SessionStartMatcherSchema }

/** @typedef {z.infer<typeof SessionStartMatcherSchema>} SessionStartMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches source. */
export const SessionStartConfigSchema = makeConfigSchemaWithMatched(
  SessionStartMatcherSchema.optional(),
  CommandOnlyHandlerSchema.extend({ once: z.boolean().optional() }),
)

/** @typedef {z.infer<typeof SessionStartConfigSchema>} SessionStartConfig */

// --- Input ---

export const SessionStartInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SessionStart"),
  model: z.string(),
  source: SessionStartSourceSchema,
})

/** @typedef {z.infer<typeof SessionStartInputSchema>} SessionStartInput */

// --- Output ---

export const SessionStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionStartOutputSchema>} SessionStartOutput */
