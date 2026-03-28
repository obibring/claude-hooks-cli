import { z } from "zod/v4"

import { CompactTriggerSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { CompactTriggerMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export const PostCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PostCompactMatcherSchema>} PostCompactMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches trigger. */
export const PostCompactConfigSchema = z.object({
  matcher: PostCompactMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof PostCompactConfigSchema>} PostCompactConfig */

// --- Input ---

export const PostCompactInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PostCompact"),
  trigger: CompactTriggerSchema,
  compact_summary: z.string(),
})

/** @typedef {z.infer<typeof PostCompactInputSchema>} PostCompactInput */

// --- Output ---

export const PostCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PostCompactOutputSchema>} PostCompactOutput */
