import { z } from "zod/v4"

import { BlockDecisionSchema } from "../schemas/enums.mjs"
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

export const PostToolUseMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PostToolUseMatcherSchema>} PostToolUseMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z.string().optional(),
})

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseConfigSchema = z.object({
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
