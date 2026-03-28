import { z } from "zod/v4"

import { SessionEndReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionEndMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export { SessionEndMatcherSchema }

/** @typedef {z.infer<typeof SessionEndMatcherSchema>} SessionEndMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  once: z.boolean().optional(),
})

/** Command-only hook. Supports `once`. Matcher matches reason. */
export const SessionEndConfigSchema = z.object({
  matcher: SessionEndMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof SessionEndConfigSchema>} SessionEndConfig */

// --- Input ---

export const SessionEndInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SessionEnd"),
  reason: SessionEndReasonSchema,
})

/** @typedef {z.infer<typeof SessionEndInputSchema>} SessionEndInput */

// --- Output ---

export const SessionEndOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionEndOutputSchema>} SessionEndOutput */
