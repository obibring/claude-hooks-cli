import { z } from "zod/v4"

/**
 * Base handler schemas — exported for programmatic consumers who need
 * to reference individual handler type shapes. Each hook file defines
 * its own inline config schema with the exact handler variants it supports.
 */

/** Command handler with all possible fields including `if`. */
export const CommandHandlerSchema = z
  .object({
    type: z.literal("command"),
    command: z.string(),
    timeout: z.number().int().positive().optional(),
    async: z.boolean().optional(),
    asyncRewake: z.boolean().optional(),
    statusMessage: z.string().optional(),
    if: z.string().optional(),
  })
  .strict()

/** @typedef {z.infer<typeof CommandHandlerSchema>} CommandHandler */

/** Prompt handler with all possible fields including `if`. */
export const PromptHandlerSchema = z
  .object({
    type: z.literal("prompt"),
    prompt: z.string(),
    timeout: z.number().int().positive().optional(),
    async: z.boolean().optional(),
    asyncRewake: z.boolean().optional(),
    statusMessage: z.string().optional(),
    if: z.string().optional(),
  })
  .strict()

/** @typedef {z.infer<typeof PromptHandlerSchema>} PromptHandler */

/** Agent handler with all possible fields including `if`. */
export const AgentHandlerSchema = z
  .object({
    type: z.literal("agent"),
    prompt: z.string(),
    timeout: z.number().int().positive().optional(),
    async: z.boolean().optional(),
    asyncRewake: z.boolean().optional(),
    statusMessage: z.string().optional(),
    if: z.string().optional(),
  })
  .strict()

/** @typedef {z.infer<typeof AgentHandlerSchema>} AgentHandler */

/** HTTP handler with all possible fields including `if`. */
export const HttpHandlerSchema = z
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
  .strict()

/** @typedef {z.infer<typeof HttpHandlerSchema>} HttpHandler */
