import { z } from "zod/v4"

/**
 * Shared optional properties present on every handler type.
 * Hook files import this and extend/omit as needed (e.g. adding `if` or `once`).
 */
export const SharedHandlerPropsSchema = z.object({
  /** Maximum execution time in milliseconds before the hook is killed. Default is 5000ms for most hooks, 30000ms for Setup. Example: 10000 gives the hook 10 seconds to complete. */
  timeout: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Maximum execution time in milliseconds before the hook is killed. Default is 5000ms for most hooks, 30000ms for Setup. Example: 10000 gives the hook 10 seconds to complete.",
    ),
  /** When true, the hook runs in the background without blocking Claude Code. Use for side-effects like logging, notifications, or sound playback. When false (default), Claude waits for the hook to complete before continuing. */
  async: z
    .boolean()
    .optional()
    .describe(
      "When true, the hook runs in the background without blocking Claude Code. Use for side-effects like logging, notifications, or sound playback. When false (default), Claude waits for the hook to complete before continuing.",
    ),
  /** When true, the hook runs async (implies async) but wakes the model if the hook exits with code 2 (blocking error). Useful for hooks that are normally non-blocking but need to surface critical failures. Since v2.1.72. */
  asyncRewake: z
    .boolean()
    .optional()
    .describe(
      "When true, the hook runs async (implies async) but wakes the model if the hook exits with code 2 (blocking error). Useful for hooks that are normally non-blocking but need to surface critical failures. Since v2.1.72.",
    ),
  /** Custom spinner message displayed to the user while the hook is running. Most visible for synchronous hooks. Example: "Validating changes..." or "Running security check...". */
  statusMessage: z
    .string()
    .optional()
    .describe(
      'Custom spinner message displayed to the user while the hook is running. Most visible for synchronous hooks. Example: "Validating changes..." or "Running security check...".',
    ),
})

/** @typedef {z.infer<typeof SharedHandlerPropsSchema>} SharedHandlerProps */

/**
 * HTTP-specific properties (in addition to shared props).
 */
export const HttpExtraPropsSchema = z.object({
  /** HTTP headers sent with the POST request. Supports $VAR_NAME interpolation for env vars listed in allowedEnvVars. Example: {"Authorization": "Bearer $MY_TOKEN", "Content-Type": "application/json"}. */
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'HTTP headers sent with the POST request. Supports $VAR_NAME interpolation for env vars listed in allowedEnvVars. Example: {"Authorization": "Bearer $MY_TOKEN", "Content-Type": "application/json"}.',
    ),
  /** Environment variable names allowed for interpolation in headers. Only variables listed here can be referenced with $VAR_NAME in header values. Example: ["MY_TOKEN", "API_KEY"]. */
  allowedEnvVars: z
    .array(z.string())
    .optional()
    .describe(
      'Environment variable names allowed for interpolation in headers. Only variables listed here can be referenced with $VAR_NAME in header values. Example: ["MY_TOKEN", "API_KEY"].',
    ),
})

/** @typedef {z.infer<typeof HttpExtraPropsSchema>} HttpExtraProps */
