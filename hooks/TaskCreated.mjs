import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** TaskCreated does not support matchers — always fires. */
export const TaskCreatedMatcherSchema = undefined

// --- Config ---

/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCreatedConfigSchema =
  makeUnmatchedConfigSchema(AnyHandlerSchema)

/** @typedef {z.infer<typeof TaskCreatedConfigSchema>} TaskCreatedConfig */

// --- Input ---

export const TaskCreatedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("TaskCreated"),
  task_id: z.string(),
  task_subject: z.string(),
  task_description: z.string(),
  teammate_name: z.string(),
  team_name: z.string(),
})

/** @typedef {z.infer<typeof TaskCreatedInputSchema>} TaskCreatedInput */

// --- Output ---

/** TaskCreated uses exit code 2 to block task creation (stderr fed back to model).
 *  Also supports JSON decision control with continue/stopReason. */
export const TaskCreatedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof TaskCreatedOutputSchema>} TaskCreatedOutput */
