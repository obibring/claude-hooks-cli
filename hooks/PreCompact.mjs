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

export const PreCompactMatcherSchema = CompactTriggerMatcherSchema

/** @typedef {z.infer<typeof PreCompactMatcherSchema>} PreCompactMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  once: z.boolean().optional(),
})

/** Command-only hook. Supports `once`. Matcher matches trigger. */
export const PreCompactConfigSchema = z.object({
  matcher: PreCompactMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof PreCompactConfigSchema>} PreCompactConfig */

// --- Input ---

export const PreCompactInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PreCompact"),
  trigger: CompactTriggerSchema,
  custom_instructions: z.string().optional(),
})

/** @typedef {z.infer<typeof PreCompactInputSchema>} PreCompactInput */

// --- Output ---

export const PreCompactOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof PreCompactOutputSchema>} PreCompactOutput */
