import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"

// --- Matcher ---

export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = makeMatchedConfigSchema(
  SubagentStartMatcherSchema,
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
