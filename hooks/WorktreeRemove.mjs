import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** WorktreeRemove does not support matchers — always fires. */
export const WorktreeRemoveMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. */
export const WorktreeRemoveConfigSchema = makeUnmatchedConfigSchema(
  CommandOnlyHandlerSchema,
)

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
