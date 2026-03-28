import { z } from "zod/v4"

import { ElicitationActionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

export const ElicitationResultMatcherSchema = ElicitationMatcherSchema

/** @typedef {z.infer<typeof ElicitationResultMatcherSchema>} ElicitationResultMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationResultConfigSchema = z.object({
  matcher: ElicitationResultMatcherSchema.optional(),
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

/** @typedef {z.infer<typeof ElicitationResultConfigSchema>} ElicitationResultConfig */

// --- Input ---

export const ElicitationResultInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("ElicitationResult"),
  mcp_server_name: z.string(),
  user_response: z.unknown(),
  message: z.string(),
  elicitation_id: z.string(),
})

/** @typedef {z.infer<typeof ElicitationResultInputSchema>} ElicitationResultInput */

// --- Output ---

export const ElicitationResultHookSpecificOutputSchema = z.object({
  action: ElicitationActionSchema.optional(),
  content: z.unknown().optional(),
})

export const ElicitationResultOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationResultHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationResultOutputSchema>} ElicitationResultOutput */
