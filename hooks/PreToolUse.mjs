import { z } from "zod/v4"

import { PreToolUsePermissionDecisionSchema } from "../schemas/enums.mjs"
import {
  BaseHookInputSchema,
  ToolFieldsSchema,
} from "../schemas/input-schemas.mjs"
import { ToolNameMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

export const PreToolUseMatcherSchema = ToolNameMatcherSchema

/** @typedef {z.infer<typeof PreToolUseMatcherSchema>} PreToolUseMatcher */

// --- Config ---

/** Supports all 4 handler types. Supports `if` for per-handler conditional execution. */
export const PreToolUseConfigSchema = z.object({
  matcher: ToolNameMatcherSchema.optional(),
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
            if: z.string().optional(),
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
            if: z.string().optional(),
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
            if: z.string().optional(),
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
            if: z.string().optional(),
            headers: z.record(z.string(), z.string()).optional(),
            allowedEnvVars: z.array(z.string()).optional(),
          })
          .strict(),
      ]),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof PreToolUseConfigSchema>} PreToolUseConfig */

// --- Input ---

export const PreToolUseInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("PreToolUse"),
  ...ToolFieldsSchema.shape,
  tool_use_id: z.string(),
})

/** @typedef {z.infer<typeof PreToolUseInputSchema>} PreToolUseInput */

// --- Output ---

export const PreToolUseHookSpecificOutputSchema = z.object({
  permissionDecision: PreToolUsePermissionDecisionSchema.optional(),
  permissionDecisionReason: z.string().optional(),
  autoAllow: z.boolean().optional(),
  updatedInput: z.record(z.string(), z.unknown()).optional(),
})

export const PreToolUseOutputSchema = BaseHookOutputSchema.extend({
  hookSpecificOutput: PreToolUseHookSpecificOutputSchema.optional(),
})

/** @typedef {z.infer<typeof PreToolUseOutputSchema>} PreToolUseOutput */
