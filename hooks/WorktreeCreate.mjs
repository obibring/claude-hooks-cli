import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** WorktreeCreate does not support matchers — always fires. */
export const WorktreeCreateMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. No matcher support. */
export const WorktreeCreateConfigSchema = z.object({
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

/** @typedef {z.infer<typeof WorktreeCreateConfigSchema>} WorktreeCreateConfig */

// --- Input ---

export const WorktreeCreateInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("WorktreeCreate"),
  name: z.string(),
})

/** @typedef {z.infer<typeof WorktreeCreateInputSchema>} WorktreeCreateInput */

// --- Output ---

/** WorktreeCreate: non-zero exit fails creation; stdout provides worktree path. */
export const WorktreeCreateOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeCreateOutputSchema>} WorktreeCreateOutput */
