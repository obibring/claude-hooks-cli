import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** WorktreeCreate does not support matchers — always fires. */
export const WorktreeCreateMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. */
export const WorktreeCreateConfigSchema = makeUnmatchedConfigSchema(
  CommandOnlyHandlerSchema,
)

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
