import { z } from "zod/v4"

import { BlockDecisionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const SubagentStopMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStopMatcherSchema>} SubagentStopMatcher */

// --- Config ---

/** Supports all 4 handler types. Matcher matches agent_type. */
export const SubagentStopConfigSchema = z.object({
  matcher: SubagentTypeMatcherSchema.optional(),
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
            type: z.literal("prompt"),
            prompt: z.string(),
            timeout: z.number().int().positive().optional(),
            async: z.boolean().optional(),
            asyncRewake: z.boolean().optional(),
            statusMessage: z.string().optional(),
          })
          .strict(),
        z
          .object({
            type: z.literal("agent"),
            prompt: z.string(),
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
