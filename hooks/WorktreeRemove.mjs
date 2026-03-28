import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** WorktreeRemove does not support matchers — always fires. */
export const WorktreeRemoveMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. No matcher support. */
export const WorktreeRemoveConfigSchema = z.object({
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

/** @typedef {z.infer<typeof WorktreeRemoveConfigSchema>} WorktreeRemoveConfig */

// --- Input ---

export const WorktreeRemoveInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("WorktreeRemove"),
  worktree_path: z.string(),
})

/** @typedef {z.infer<typeof WorktreeRemoveInputSchema>} WorktreeRemoveInput */

// --- Output ---

export const WorktreeRemoveOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeRemoveOutputSchema>} WorktreeRemoveOutput */
