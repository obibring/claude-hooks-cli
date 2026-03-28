import { z } from "zod/v4"

import {
  HttpExtraPropsSchema,
  SharedHandlerPropsSchema,
} from "../schemas/config-schemas.mjs"
import { ElicitationActionSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { ElicitationMatcherSchema as _ElicitationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** MCP server name matcher for Elicitation. */
export const ElicitationMatcherSchema = _ElicitationMatcherSchema.describe(
  "MCP server name matcher for Elicitation.",
)

/** @typedef {z.infer<typeof ElicitationMatcherSchema>} ElicitationMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches mcp_server_name. */
export const ElicitationConfigSchema = z.object({
  /** MCP server name to filter on. */
  matcher: ElicitationMatcherSchema.optional().describe(
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

/** @typedef {z.infer<typeof ElicitationConfigSchema>} ElicitationConfig */

// --- Input ---

export const ElicitationInputSchema = BaseHookInputSchema.extend({
  /** Elicitation */
  hook_event_name: z.literal("Elicitation").describe("Elicitation"),
  /** Name of the MCP server requesting user input. */
  mcp_server_name: z
    .string()
    .describe("Name of the MCP server requesting user input."),
  /** The prompt message shown to the user. */
  message: z.string().describe("The prompt message shown to the user."),
  /** Elicitation mode. */
  mode: z.string().describe("Elicitation mode."),
  /** URL associated with the elicitation. */
  url: z.string().describe("URL associated with the elicitation."),
  /** Unique identifier for this elicitation request. */
  elicitation_id: z
    .string()
    .describe("Unique identifier for this elicitation request."),
  /** JSON schema describing the expected response format. */
  requested_schema: z
    .unknown()
    .describe("JSON schema describing the expected response format."),
})

/** @typedef {z.infer<typeof ElicitationInputSchema>} ElicitationInput */

// --- Output ---

export const ElicitationHookSpecificOutputSchema = z.object({
  /** Controls the elicitation response. \"accept\" sends the content, \"decline\" rejects, \"cancel\" aborts. */
  action: ElicitationActionSchema.optional().describe(
    'Controls the elicitation response. "accept" sends the content, "decline" rejects, "cancel" aborts.',
  ),
  /** Response content to send back (shape depends on requested_schema). */
  content: z
    .unknown()
    .optional()
    .describe(
      "Response content to send back (shape depends on requested_schema).",
    ),
})

export const ElicitationOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: ElicitationHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof ElicitationOutputSchema>} ElicitationOutput */
