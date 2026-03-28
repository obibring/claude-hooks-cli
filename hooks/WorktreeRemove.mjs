import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** WorktreeRemove does not support matchers — always fires. */
export const WorktreeRemoveMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. */
export const WorktreeRemoveConfigSchema = z
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

/** @typedef {z.infer<typeof WorktreeRemoveConfigSchema>} WorktreeRemoveConfig */

// --- Input ---

export const WorktreeRemoveInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("WorktreeRemove"),
  worktree_path: z.string(),
})

/** @typedef {z.infer<typeof WorktreeRemoveInputSchema>} WorktreeRemoveInput */

// --- Output ---

export const WorktreeRemoveOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeRemoveOutputSchema>} WorktreeRemoveOutput */
