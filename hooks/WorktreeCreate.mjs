import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** WorktreeCreate does not support matchers — always fires. */
export const WorktreeCreateMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. */
export const WorktreeCreateConfigSchema = z
  .object({
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

/** @typedef {z.infer<typeof WorktreeCreateConfigSchema>} WorktreeCreateConfig */

// --- Input ---

export const WorktreeCreateInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("WorktreeCreate"),
  name: z.string(),
})

/** @typedef {z.infer<typeof WorktreeCreateInputSchema>} WorktreeCreateInput */

// --- Output ---

/** WorktreeCreate: non-zero exit fails creation; stdout provides worktree path. */
export const WorktreeCreateOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeCreateOutputSchema>} WorktreeCreateOutput */
