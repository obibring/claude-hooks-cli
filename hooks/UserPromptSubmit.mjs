import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeUnmatchedConfigSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** UserPromptSubmit does not support matchers — always fires. */
export const UserPromptSubmitMatcherSchema = undefined

// --- Config ---

/** Supports all 4 handler types. No matcher support. */
export const UserPromptSubmitConfigSchema =
  makeUnmatchedConfigSchema(AnyHandlerSchema)

/** @typedef {z.infer<typeof UserPromptSubmitConfigSchema>} UserPromptSubmitConfig */

// --- Input ---

export const UserPromptSubmitInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("UserPromptSubmit"),
  prompt: z.string(),
})

/** @typedef {z.infer<typeof UserPromptSubmitInputSchema>} UserPromptSubmitInput */

// --- Output ---

/** UserPromptSubmit can modify the prompt field in output. */
export const UserPromptSubmitOutputSchema = BaseHookOutputSchema.extend({
  prompt: z.string().optional(),
})

/** @typedef {z.infer<typeof UserPromptSubmitOutputSchema>} UserPromptSubmitOutput */
