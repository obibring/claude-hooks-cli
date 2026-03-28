import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** TaskCompleted does not support matchers — always fires. */
export const TaskCompletedMatcherSchema = undefined

// --- Config ---

/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCompletedConfigSchema =
  makeUnmatchedConfigSchema(AnyHandlerSchema)

/** @typedef {z.infer<typeof TaskCompletedConfigSchema>} TaskCompletedConfig */

// --- Input ---

export const TaskCompletedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("TaskCompleted"),
  task_id: z.string(),
  task_subject: z.string(),
  task_description: z.string(),
  teammate_name: z.string(),
  team_name: z.string(),
})

/** @typedef {z.infer<typeof TaskCompletedInputSchema>} TaskCompletedInput */

// --- Output ---

/** TaskCompleted supports JSON decision control with continue/stopReason. */
export const TaskCompletedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof TaskCompletedOutputSchema>} TaskCompletedOutput */
