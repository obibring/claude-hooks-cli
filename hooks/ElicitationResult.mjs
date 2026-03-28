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

/** MCP server name matcher for ElicitationResult. */
export const ElicitationResultMatcherSchema = ElicitationMatcherSchema.describe(
  "MCP server name matcher for ElicitationResult.",
)

/** @typedef {z.infer<typeof ElicitationResultMatcherSchema>} ElicitationResultMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationResultConfigSchema = z.object({
  /** MCP server name to filter on. */
  matcher: ElicitationResultMatcherSchema.optional().describe(
    "MCP server name to filter on.",
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

/** @typedef {z.infer<typeof ElicitationResultConfigSchema>} ElicitationResultConfig */

// --- Input ---

export const ElicitationResultInputSchema = BaseHookInputSchema.extend({
  /** ElicitationResult */
  hook_event_name: z.literal("ElicitationResult").describe("ElicitationResult"),
  /** Name of the MCP server. */
  mcp_server_name: z.string().describe("Name of the MCP server."),
  /** The user's response to the elicitation (shape varies). */
  user_response: z
    .unknown()
    .describe("The user's response to the elicitation (shape varies)."),
  /** The original prompt message. */
  message: z.string().describe("The original prompt message."),
  /** Unique identifier matching the original Elicitation. */
  elicitation_id: z
    .string()
    .describe("Unique identifier matching the original Elicitation."),
})

/** @typedef {z.infer<typeof ElicitationResultInputSchema>} ElicitationResultInput */

// --- Output ---

export const ElicitationResultHookSpecificOutputSchema = z.object({
  /** Override the user's response. \"accept\" sends replacement content, \"decline\" rejects, \"cancel\" aborts. */
  action: ElicitationActionSchema.optional().describe(
    'Override the user\'s response. "accept" sends replacement content, "decline" rejects, "cancel" aborts.',
  ),
  /** Replacement response content. */
  content: z.unknown().optional().describe("Replacement response content."),
})

export const ElicitationResultOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationResultHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationResultOutputSchema>} ElicitationResultOutput */
