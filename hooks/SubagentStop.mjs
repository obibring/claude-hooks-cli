import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BlockDecisionSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export const SubagentStopMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStopMatcherSchema>} SubagentStopMatcher */

// --- Config ---

/** Supports all 4 handler types. Matcher matches agent_type. */
export const SubagentStopConfigSchema = makeMatchedConfigSchema(
  SubagentStopMatcherSchema.optional(),
  AnyHandlerSchema,
)

/** @typedef {z.infer<typeof SubagentStopConfigSchema>} SubagentStopConfig */

// --- Input ---

export const SubagentStopInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SubagentStop"),
  agent_id: z.string(),
  agent_type: z.string(),
  last_assistant_message: z.string(),
  agent_transcript_path: z.string(),
  stop_hook_active: z.boolean(),
})

/** @typedef {z.infer<typeof SubagentStopInputSchema>} SubagentStopInput */

// --- Output ---

export const SubagentStopOutputSchema = BaseHookOutputSchema.extend({
  decision: BlockDecisionSchema.optional(),
})

/** @typedef {z.infer<typeof SubagentStopOutputSchema>} SubagentStopOutput */
