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
            /** Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error. */
            type: z
              .literal("command")
              .describe(
                "Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error.",
              ),
            /** Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout. */
            command: z
              .string()
              .describe(
                "Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout.",
              ),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            /** POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63. */
            type: z
              .literal("http")
              .describe(
                "POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63.",
              ),
            /** URL to POST the hook JSON payload to. */
            url: z.url().describe("URL to POST the hook JSON payload to."),
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
  /** WorktreeRemove */
  hook_event_name: z.literal("WorktreeRemove").describe("WorktreeRemove"),
  /** Absolute path to the worktree being removed. */
  worktree_path: z
    .string()
    .describe("Absolute path to the worktree being removed."),
})

/** @typedef {z.infer<typeof WorktreeRemoveInputSchema>} WorktreeRemoveInput */

// --- Output ---

export const WorktreeRemoveOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeRemoveOutputSchema>} WorktreeRemoveOutput */
