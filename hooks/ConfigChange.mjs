import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import {
  BlockDecisionSchema,
  ConfigChangeSourceSchema,
} from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ConfigChangeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { ConfigChangeMatcherSchema }

/** @typedef {z.infer<typeof ConfigChangeMatcherSchema>} ConfigChangeMatcher */

// --- Config ---

/** Command-only hook. Matcher matches source. */
export const ConfigChangeConfigSchema = makeConfigSchemaWithMatched(
  ConfigChangeMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof ConfigChangeConfigSchema>} ConfigChangeConfig */

// --- Input ---

export const ConfigChangeInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("ConfigChange"),
  file_path: z.string(),
  source: ConfigChangeSourceSchema,
})

/** @typedef {z.infer<typeof ConfigChangeInputSchema>} ConfigChangeInput */

// --- Output ---

export const ConfigChangeOutputSchema = BaseHookOutputSchema.extend({
  decision: BlockDecisionSchema.optional(),
})

/** @typedef {z.infer<typeof ConfigChangeOutputSchema>} ConfigChangeOutput */
