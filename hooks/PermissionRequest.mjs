import { z } from "zod/v4"

import { PermissionRequestDecisionBehaviorSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export const PermissionRequestMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PermissionRequestMatcherSchema>} PermissionRequestMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z.string().optional(),
})

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PermissionRequestConfigSchema = z.object({
  matcher: ToolNameMatcherSchema.optional(),
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            type: z.literal("command"),
            command: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("prompt"),
            prompt: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("agent"),
            prompt: z.string(),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            type: z.literal("http"),
            url: z.url(),
            ...handlerProps.shape,
            ...HttpExtraPropsSchema.shape,
          })
          .strict(),
      ]),
    )
    .nonempty(),
})

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
