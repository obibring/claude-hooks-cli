import { z } from "zod/v4"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  AnyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"

// --- Matcher ---

export const PostToolUseFailureMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PostToolUseFailureMatcherSchema>} PostToolUseFailureMatcher */

// --- Config ---

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseFailureConfigSchema = makeMatchedConfigSchema(
  PostToolUseFailureMatcherSchema.optional(),
  AnyHandlerSchema,
)

/** @typedef {z.infer<typeof PostToolUseFailureConfigSchema>} PostToolUseFailureConfig */

// --- Input ---

export const PostToolUseFailureInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PostToolUseFailure"),
  ...ToolFieldsSchema.shape,
  tool_use_id: z.string(),
  error: z.string(),
  is_interrupt: z.boolean(),
})

/** @typedef {z.infer<typeof PostToolUseFailureInputSchema>} PostToolUseFailureInput */

// --- Output ---

export const PostToolUseFailureOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PostToolUseFailureOutputSchema>} PostToolUseFailureOutput */
