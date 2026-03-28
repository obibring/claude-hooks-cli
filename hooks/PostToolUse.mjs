import { z } from "zod/v4"

import {
  AnyHandlerWithIfSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { BlockDecisionSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PostToolUseMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PostToolUseMatcherSchema>} PostToolUseMatcher */

// --- Config ---

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseConfigSchema = makeConfigSchemaWithMatched(
  PostToolUseMatcherSchema.optional(),
  AnyHandlerWithIfSchema,
)

/** @typedef {z.infer<typeof PostToolUseConfigSchema>} PostToolUseConfig */

// --- Input ---

export const PostToolUseInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PostToolUse"),
  ...ToolFieldsSchema.shape,
  tool_use_id: z.string(),
  tool_response: z.unknown(),
})

/** @typedef {z.infer<typeof PostToolUseInputSchema>} PostToolUseInput */

// --- Output ---

export const PostToolUseOutputSchema = BaseHookOutputSchema.extend({
  decision: BlockDecisionSchema.optional(),
})

/** @typedef {z.infer<typeof PostToolUseOutputSchema>} PostToolUseOutput */
