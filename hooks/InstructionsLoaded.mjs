import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { InstructionsLoadedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { InstructionsLoadReasonSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export { InstructionsLoadedMatcherSchema }

/** @typedef {z.infer<typeof InstructionsLoadedMatcherSchema>} InstructionsLoadedMatcher */

// --- Config ---

/** Command-only hook. Matcher matches load_reason. */
export const InstructionsLoadedConfigSchema = makeMatchedConfigSchema(
  InstructionsLoadedMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof InstructionsLoadedConfigSchema>} InstructionsLoadedConfig */

// --- Input ---

export const InstructionsLoadedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("InstructionsLoaded"),
  file_path: z.string(),
  memory_type: z.string(),
  load_reason: InstructionsLoadReasonSchema,
  globs: z.unknown().optional(),
  trigger_file_path: z.string().optional(),
  parent_file_path: z.string().optional(),
})

/** @typedef {z.infer<typeof InstructionsLoadedInputSchema>} InstructionsLoadedInput */

// --- Output ---

export const InstructionsLoadedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof InstructionsLoadedOutputSchema>} InstructionsLoadedOutput */
