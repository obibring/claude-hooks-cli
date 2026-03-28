import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { NotificationMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { NotificationTypeSchema } from "../schemas/enums.mjs"

// --- Matcher ---

export const NotificationMatcherExportSchema = NotificationMatcherSchema

/** @typedef {z.infer<typeof NotificationMatcherExportSchema>} NotificationMatcher */

// --- Config ---

/** Command-only hook. Matcher matches notification_type. */
export const NotificationConfigSchema = makeMatchedConfigSchema(
  NotificationMatcherSchema,
  CommandOnlyHandlerSchema,
)

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
