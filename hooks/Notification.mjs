import { z } from "zod/v4"

import { NotificationTypeSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { NotificationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Notification type matcher. Values: \"permission_prompt\", \"idle_prompt\", \"auth_success\", \"elicitation_dialog\". */
export const NotificationMatcherExportSchema =
  NotificationMatcherSchema.describe(
    'Notification type matcher. Values: "permission_prompt", "idle_prompt", "auth_success", "elicitation_dialog".',
  )

/** @typedef {z.infer<typeof NotificationMatcherExportSchema>} NotificationMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Command-only hook. Matcher matches notification_type. */
export const NotificationConfigSchema = z.object({
  /** Notification type to filter on. Only fires when the notification matches. */
  matcher: NotificationMatcherSchema.optional().describe(
    "Notification type to filter on. Only fires when the notification matches.",
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

/** @typedef {z.infer<typeof NotificationConfigSchema>} NotificationConfig */

// --- Input ---

export const NotificationInputSchema = BaseHookInputSchema.extend({
  /** Notification */
  hook_event_name: z.literal("Notification").describe("Notification"),
  /** Type of notification being sent. */
  notification_type: NotificationTypeSchema.describe(
    "Type of notification being sent.",
  ),
  /** Notification message body. */
  message: z.string().describe("Notification message body."),
  /** Notification title. */
  title: z.string().describe("Notification title."),
})

/** @typedef {z.infer<typeof NotificationInputSchema>} NotificationInput */

// --- Output ---

export const NotificationOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof NotificationOutputSchema>} NotificationOutput */
