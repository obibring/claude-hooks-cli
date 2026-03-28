import { z } from "zod/v4"

import { BlockDecisionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Agent type matcher for SubagentStop. */
export const SubagentStopMatcherSchema = SubagentTypeMatcherSchema.describe(
  "Agent type matcher for SubagentStop.",
)

/** @typedef {z.infer<typeof SubagentStopMatcherSchema>} SubagentStopMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Supports all 4 handler types. Matcher matches agent_type. */
export const SubagentStopConfigSchema = z.object({
  /** Agent type to filter on. Example: \"Bash\", \"Explore\". */
  matcher: SubagentTypeMatcherSchema.optional().describe(
    'Agent type to filter on. Example: "Bash", "Explore".',
  ),
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

/** @typedef {z.infer<typeof SubagentStopConfigSchema>} SubagentStopConfig */

// --- Input ---

export const SubagentStopInputSchema = BaseHookInputSchema.extend({
  /** SubagentStop */
  hook_event_name: z.literal("SubagentStop").describe("SubagentStop"),
  /** Unique identifier for the completed subagent. */
  agent_id: z
    .string()
    .describe("Unique identifier for the completed subagent."),
  /** Type of the completed agent. */
  agent_type: z.string().describe("Type of the completed agent."),
  /** The subagent's final response text. */
  last_assistant_message: z
    .string()
    .describe("The subagent's final response text."),
  /** Path to the subagent's full transcript JSON file. Useful for post-processing. */
  agent_transcript_path: z
    .string()
    .describe(
      "Path to the subagent's full transcript JSON file. Useful for post-processing.",
    ),
  /** True if a stop hook is already running. */
  stop_hook_active: z
    .boolean()
    .describe("True if a stop hook is already running."),
})

/** @typedef {z.infer<typeof SubagentStopInputSchema>} SubagentStopInput */

// --- Output ---

export const SubagentStopOutputSchema = BaseHookOutputSchema.extend({
  /** Set to \"block\" to stop execution after subagent completion. */
  decision: BlockDecisionSchema.optional().describe(
    'Set to "block" to stop execution after subagent completion.',
  ),
})

/** @typedef {z.infer<typeof SubagentStopOutputSchema>} SubagentStopOutput */
