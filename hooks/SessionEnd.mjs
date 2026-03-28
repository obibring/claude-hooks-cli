import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigWithOnceSchema,
} from "../schemas/config-schemas.mjs"
import { SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { SessionEndReasonSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export { SessionEndMatcherSchema }

/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */

// --- Config ---

/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema = makeMatchedConfigWithOnceSchema(
  SessionEndMatcherSchema,
  CommandOnlyHandlerSchema,
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
