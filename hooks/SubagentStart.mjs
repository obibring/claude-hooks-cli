import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = z.object({
  matcher: SubagentStartMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof SubagentStartConfigSchema>} SubagentStartConfig */

// --- Input ---

export const SubagentStartInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("SubagentStart"),
  agent_id: z.string(),
  agent_type: z.string(),
})

/** @typedef {z.infer<typeof SubagentStartInputSchema>} SubagentStartInput */

// --- Output ---

export const SubagentStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SubagentStartOutputSchema>} SubagentStartOutput */
