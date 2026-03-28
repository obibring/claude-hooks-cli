import { z } from "zod/v4"

import { ElicitationActionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const ElicitationResultMatcherSchema = ElicitationMatcherSchema

/** @typedef {z.infer<typeof ElicitationResultMatcherSchema>} ElicitationResultMatcher */

// --- Config ---

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationResultConfigSchema = z
  .object({
    matcher: ElicitationResultMatcherSchema.optional(),
    hooks: z
      .array(
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("command"),
              command: z.string(),
              timeout: z.number().int().positive().optional(),
              async: z.boolean().optional(),
              asyncRewake: z.boolean().optional(),
              statusMessage: z.string().optional(),
            })
            .strict(),
          z
            .object({
              type: z.literal("http"),
              url: z.url(),
              timeout: z.number().int().positive().optional(),
              async: z.boolean().optional(),
              asyncRewake: z.boolean().optional(),
              statusMessage: z.string().optional(),
              headers: z.record(z.string(), z.string()).optional(),
              allowedEnvVars: z.array(z.string()).optional(),
            })
            .strict(),
        ]),
      )
      .nonempty(),
  })
  .strict()

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
