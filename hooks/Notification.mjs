import { z } from "zod/v4"

import { NotificationTypeSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { NotificationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const NotificationMatcherExportSchema = NotificationMatcherSchema

/** @typedef {z.infer<typeof NotificationMatcherExportSchema>} NotificationMatcher */

// --- Config ---

/** Command-only hook. Matcher matches notification_type. */
export const NotificationConfigSchema = z
  .object({
    matcher: NotificationMatcherSchema.optional(),
    hooks: z
      .array(
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("command"),
              command: z.string(),
              timeout: z.number().int().positive().optional(),
              async: z.boolean().optional(),
              asyncRewake: z.boolean().optional(),
              statusMessage: z.string().optional(),
            })
            .strict(),
          z
            .object({
              type: z.literal("http"),
              url: z.url(),
              timeout: z.number().int().positive().optional(),
              async: z.boolean().optional(),
              asyncRewake: z.boolean().optional(),
              statusMessage: z.string().optional(),
              headers: z.record(z.string(), z.string()).optional(),
              allowedEnvVars: z.array(z.string()).optional(),
            })
            .strict(),
        ]),
      )
      .nonempty(),
  })
  .strict()

/** @typedef {z.infer<typeof NotificationConfigSchema>} NotificationConfig */

// --- Input ---

export const NotificationInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("Notification"),
  notification_type: NotificationTypeSchema,
  message: z.string(),
  title: z.string(),
})

/** @typedef {z.infer<typeof NotificationInputSchema>} NotificationInput */

// --- Output ---

export const NotificationOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof NotificationOutputSchema>} NotificationOutput */
