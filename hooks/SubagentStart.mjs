import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = z
  .object({
    matcher: SubagentStartMatcherSchema.optional(),
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
