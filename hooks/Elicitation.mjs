import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { ElicitationActionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { ElicitationMatcherSchema }

/** @typedef {z.infer<typeof ElicitationMatcherSchema>} ElicitationMatcher */

// --- Config ---

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationConfigSchema = makeMatchedConfigSchema(
  ElicitationMatcherSchema.optional(),
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof ElicitationConfigSchema>} ElicitationConfig */

// --- Input ---

export const ElicitationInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Elicitation"),
  mcp_server_name: z.string(),
  message: z.string(),
  mode: z.string(),
  url: z.string(),
  elicitation_id: z.string(),
  requested_schema: z.unknown(),
})

/** @typedef {z.infer<typeof ElicitationInputSchema>} ElicitationInput */

// --- Output ---

export const ElicitationHookSpecificOutputSchema = z.object({
  action: ElicitationActionSchema.optional(),
  content: z.unknown().optional(),
})

export const ElicitationOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationOutputSchema>} ElicitationOutput */
