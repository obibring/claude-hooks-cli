import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** UserPromptSubmit does not support matchers — always fires. */
export const UserPromptSubmitMatcherSchema = undefined

// --- Config ---

/** Supports all 4 handler types. No matcher support. */
export const UserPromptSubmitConfigSchema = z.object({
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
            type: z.literal("prompt"),
            prompt: z.string(),
            timeout: z.number().int().positive().optional(),
            async: z.boolean().optional(),
            asyncRewake: z.boolean().optional(),
            statusMessage: z.string().optional(),
          })
          .strict(),
        z
          .object({
            type: z.literal("agent"),
            prompt: z.string(),
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

/** @typedef {z.infer<typeof UserPromptSubmitConfigSchema>} UserPromptSubmitConfig */

// --- Input ---

export const UserPromptSubmitInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("UserPromptSubmit"),
  prompt: z.string(),
})

/** @typedef {z.infer<typeof UserPromptSubmitInputSchema>} UserPromptSubmitInput */

// --- Output ---

/** UserPromptSubmit can modify the prompt field in output. */
export const UserPromptSubmitOutputSchema = BaseHookOutputSchema.extend({
  prompt: z.string().optional(),
})

/** @typedef {z.infer<typeof UserPromptSubmitOutputSchema>} UserPromptSubmitOutput */
