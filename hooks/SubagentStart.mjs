import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = makeConfigSchemaWithMatched(
  SubagentStartMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof SubagentStartConfigSchema>} SubagentStartConfig */

// --- Input ---

export const SubagentStartInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SubagentStart"),
  agent_id: z.string(),
  agent_type: z.string(),
})

/** @typedef {z.infer<typeof SubagentStartInputSchema>} SubagentStartInput */

// --- Output ---

export const SubagentStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SubagentStartOutputSchema>} SubagentStartOutput */
