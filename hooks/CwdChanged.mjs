import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** CwdChanged does not support matchers — always fires. */
export const CwdChangedMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. No matcher support. */
export const CwdChangedConfigSchema = z.object({
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

/** @typedef {z.infer<typeof CwdChangedConfigSchema>} CwdChangedConfig */

// --- Input ---

export const CwdChangedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("CwdChanged"),
  old_cwd: z.string(),
  new_cwd: z.string(),
})

/** @typedef {z.infer<typeof CwdChangedInputSchema>} CwdChangedInput */

// --- Output ---

export const CwdChangedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof CwdChangedOutputSchema>} CwdChangedOutput */
