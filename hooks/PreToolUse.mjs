import { z } from "zod/v4"

import {
  AnyHandlerWithIfSchema,
  makeConfigSchemaWithMatched,
} from "../schemas/config-schemas.mjs"
import { PreToolUsePermissionDecisionSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PreToolUseMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PreToolUseMatcherSchema>} PreToolUseMatcher */

// --- Config ---

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PreToolUseConfigSchema = makeConfigSchemaWithMatched(
  PreToolUseMatcherSchema.optional(),
  AnyHandlerWithIfSchema,
)

/** @typedef {z.infer<typeof PreToolUseConfigSchema>} PreToolUseConfig */

// --- Input ---

export const PreToolUseInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PreToolUse"),
  ...ToolFieldsSchema.shape,
  tool_use_id: z.string(),
})

/** @typedef {z.infer<typeof PreToolUseInputSchema>} PreToolUseInput */

// --- Output ---

export const PreToolUseHookSpecificOutputSchema = z.object({
  permissionDecision: PreToolUsePermissionDecisionSchema.optional(),
  permissionDecisionReason: z.string().optional(),
  autoAllow: z.boolean().optional(),
  updatedInput: z.record(z.string(), z.unknown()).optional(),
})

export const PreToolUseOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: PreToolUseHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof PreToolUseOutputSchema>} PreToolUseOutput */
