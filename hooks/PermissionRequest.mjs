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
import { PermissionRequestDecisionBehaviorSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export const PermissionRequestMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PermissionRequestMatcherSchema>} PermissionRequestMatcher */

// --- Config ---

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PermissionRequestConfigSchema = makeMatchedConfigSchema(
  PermissionRequestMatcherSchema,
  AnyHandlerSchema,
)

/** @typedef {z.infer<typeof PermissionRequestConfigSchema>} PermissionRequestConfig */

// --- Input ---

export const PermissionRequestInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PermissionRequest"),
  ...ToolFieldsSchema.shape,
  permission_suggestions: z.unknown().optional(),
})

/** @typedef {z.infer<typeof PermissionRequestInputSchema>} PermissionRequestInput */

// --- Output ---

export const PermissionRequestHookSpecificOutputSchema = z.object({
  decision: z
    .object({
      behavior: PermissionRequestDecisionBehaviorSchema,
    })
    .optional(),
})

export const PermissionRequestOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: PermissionRequestHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof PermissionRequestOutputSchema>} PermissionRequestOutput */
