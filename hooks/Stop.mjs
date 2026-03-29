import { z } from "zod/v4"

import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { BlockDecisionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** Stop does not support matchers — always fires. */
export const StopMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Supports all 4 handler types. No matcher support. */
export const StopConfigSchema = z.object({
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
            /** Sends a prompt to a Claude model for single-turn evaluation. Returns a yes/no decision as JSON. */
            type: z
              .literal("prompt")
              .describe(
                "Sends a prompt to a Claude model for single-turn evaluation. Returns a yes/no decision as JSON.",
              ),
            /**
             * Prompt to send to the model. Prompt must suppoprt yes/no type answers.
             * Use $ARGUMENTS for dynamic input.
             */
            prompt: z
              .string()
              .describe(
                "Prompt to send to the model. Prompt must suppoprt yes/no type answers. Use $ARGUMENTS for dynamic input.",
              ),
            /** Model to use for the prompt. */
            model: z
              .enum(["opus", "sonnet", "haiku", "opus[4m]", "sonnet[4m]"])
              .describe("Model to use for the prompt.")
              .optional(),
            /** Maximum execution time in milliseconds before the hook is killed. Default is 5000ms for most hooks, 30000ms for Setup. Example: 10000 gives the hook 10 seconds to complete. */
            timeout: z
              .number()
              .int()
              .positive()
              .optional()
              .describe(
                "Maximum execution time in milliseconds before the hook is killed. Default is 5000ms for most hooks, 30000ms for Setup. Example: 10000 gives the hook 10 seconds to complete.",
              ),
          })
          .strict(),
        z
          .object({
            /** Spawns a subagent with multi-turn tool access (Read, Grep, Glob) to verify conditions. */
            type: z
              .literal("agent")
              .describe(
                "Spawns a subagent with multi-turn tool access (Read, Grep, Glob) to verify conditions.",
              ),
            /** Prompt text sent to the Claude model. $ARGUMENTS is replaced with hook context. */
            prompt: z
              .string()
              .describe(
                "Prompt text sent to the Claude model. $ARGUMENTS is replaced with hook context.",
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

/** @typedef {z.infer<typeof StopConfigSchema>} StopConfig */

// --- Input ---

export const StopInputSchema = BaseHookInputSchema.extend({
  /** Stop */
  hook_event_name: z.literal("Stop").describe("Stop"),
  /** Claude's final response text for this turn. */
  last_assistant_message: z
    .string()
    .describe("Claude's final response text for this turn."),
  /** True if a stop hook is already running. Check this to avoid recursion. */
  stop_hook_active: z
    .boolean()
    .describe(
      "True if a stop hook is already running. Check this to avoid recursion.",
    ),
})

/** @typedef {z.infer<typeof StopInputSchema>} StopInput */

// --- Output ---

export const StopOutputSchema = BaseHookOutputSchema.extend({
  /** Set to \"block\" to re-engage Claude for another turn after it finished responding. */
  decision: BlockDecisionSchema.optional().describe(
    'Set to "block" to re-engage Claude for another turn after it finished responding.',
  ),
})

/** @typedef {z.infer<typeof StopOutputSchema>} StopOutput */
