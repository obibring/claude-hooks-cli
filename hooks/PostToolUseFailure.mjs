import { z } from "zod/v4"

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

export const PostToolUseFailureMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PostToolUseFailureMatcherSchema>} PostToolUseFailureMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z.string().optional(),
})

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PostToolUseFailureConfigSchema = z.object({
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
