import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { ElicitationActionSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export const ElicitationResultMatcherSchema = ElicitationMatcherSchema

/** @typedef {z.infer<typeof ElicitationResultMatcherSchema>} ElicitationResultMatcher */

// --- Config ---

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationResultConfigSchema = makeMatchedConfigSchema(
  ElicitationResultMatcherSchema,
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof ElicitationResultConfigSchema>} ElicitationResultConfig */

// --- Input ---

export const ElicitationResultInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("ElicitationResult"),
  mcp_server_name: z.string(),
  user_response: z.unknown(),
  message: z.string(),
  elicitation_id: z.string(),
})

/** @typedef {z.infer<typeof ElicitationResultInputSchema>} ElicitationResultInput */

// --- Output ---

export const ElicitationResultHookSpecificOutputSchema = z.object({
  action: ElicitationActionSchema.optional(),
  content: z.unknown().optional(),
})

export const ElicitationResultOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationResultHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationResultOutputSchema>} ElicitationResultOutput */
