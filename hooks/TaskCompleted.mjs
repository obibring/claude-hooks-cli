import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** TaskCompleted does not support matchers — always fires. */
export const TaskCompletedMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Supports all 4 handler types. No matcher support. Requires experimental agent teams. */
export const TaskCompletedConfigSchema = z.object({
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

/** @typedef {z.infer<typeof TaskCompletedConfigSchema>} TaskCompletedConfig */

// --- Input ---

export const TaskCompletedInputSchema = BaseHookInputSchema.extend({
  /** TaskCompleted */
  hook_event_name: z.literal("TaskCompleted").describe("TaskCompleted"),
  /** Unique identifier for the completed task. */
  task_id: z.string().describe("Unique identifier for the completed task."),
  /** Subject line of the completed task. */
  task_subject: z.string().describe("Subject line of the completed task."),
  /** Full description of the completed task. */
  task_description: z
    .string()
    .describe("Full description of the completed task."),
  /** Name of the teammate that completed the task. */
  teammate_name: z
    .string()
    .describe("Name of the teammate that completed the task."),
  /** Name of the agent team. */
  team_name: z.string().describe("Name of the agent team."),
})

/** @typedef {z.infer<typeof TaskCompletedInputSchema>} TaskCompletedInput */

// --- Output ---

/** TaskCompleted supports JSON decision control with continue/stopReason. */
export const TaskCompletedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof TaskCompletedOutputSchema>} TaskCompletedOutput */
