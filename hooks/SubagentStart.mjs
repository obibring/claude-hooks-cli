import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SubagentTypeMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Agent type matcher for SubagentStart. */
export const SubagentStartMatcherSchema = SubagentTypeMatcherSchema.describe(
  "Agent type matcher for SubagentStart.",
)

/** @typedef {z.infer<typeof SubagentStartMatcherSchema>} SubagentStartMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches agent_type. */
export const SubagentStartConfigSchema = z.object({
  /** Agent type to filter on. Example: \"Bash\", \"Explore\", \"Plan\". */
  matcher: SubagentStartMatcherSchema.optional().describe(
    'Agent type to filter on. Example: "Bash", "Explore", "Plan".',
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

/** @typedef {z.infer<typeof SubagentStartConfigSchema>} SubagentStartConfig */

// --- Input ---

export const SubagentStartInputSchema = BaseHookInputSchema.extend({
  /** SubagentStart */
  hook_event_name: z.literal("SubagentStart").describe("SubagentStart"),
  /** Unique identifier for this subagent instance. */
  agent_id: z
    .string()
    .describe("Unique identifier for this subagent instance."),
  /** Type of agent starting. Built-in: \"Bash\", \"Explore\", \"Plan\", or a custom agent name. */
  agent_type: z
    .string()
    .describe(
      'Type of agent starting. Built-in: "Bash", "Explore", "Plan", or a custom agent name.',
    ),
})

/** @typedef {z.infer<typeof SubagentStartInputSchema>} SubagentStartInput */

// --- Output ---

export const SubagentStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SubagentStartOutputSchema>} SubagentStartOutput */
