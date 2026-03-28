import { z } from "zod/v4"

import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { ElicitationActionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export { ElicitationMatcherSchema }

/** @typedef {z.infer<typeof ElicitationMatcherSchema>} ElicitationMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationConfigSchema = z.object({
  matcher: ElicitationMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof ElicitationConfigSchema>} ElicitationConfig */

// --- Input ---

export const ElicitationInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Elicitation"),
  mcp_server_name: z.string(),
  message: z.string(),
  mode: z.string(),
  url: z.string(),
  elicitation_id: z.string(),
  requested_schema: z.unknown(),
})

/** @typedef {z.infer<typeof ElicitationInputSchema>} ElicitationInput */

// --- Output ---

export const ElicitationHookSpecificOutputSchema = z.object({
  action: ElicitationActionSchema.optional(),
  content: z.unknown().optional(),
})

export const ElicitationOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationOutputSchema>} ElicitationOutput */
