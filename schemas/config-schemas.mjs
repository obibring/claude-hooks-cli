import { z } from "zod/v4"

/**
 * Shared optional properties present on every handler type.
 * Hook files import this and extend/omit as needed (e.g. adding `if` or `once`).
 */
export const SharedHandlerPropsSchema = z.object({
  timeout: z.number().int().positive().optional(),
  async: z.boolean().optional(),
  asyncRewake: z.boolean().optional(),
  statusMessage: z.string().optional(),
})

/** @typedef {z.infer<typeof SharedHandlerPropsSchema>} SharedHandlerProps */

/**
 * HTTP-specific properties (in addition to shared props).
 */
export const HttpExtraPropsSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  allowedEnvVars: z.array(z.string()).optional(),
})

/** @typedef {z.infer<typeof HttpExtraPropsSchema>} HttpExtraProps */
