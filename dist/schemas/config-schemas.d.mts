/**
 * Shared optional properties present on every handler type.
 * Hook files import this and extend/omit as needed (e.g. adding `if` or `once`).
 */
export const SharedHandlerPropsSchema: z.ZodObject<
  {
    timeout: z.ZodOptional<z.ZodNumber>
    async: z.ZodOptional<z.ZodBoolean>
    asyncRewake: z.ZodOptional<z.ZodBoolean>
    statusMessage: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
/** @typedef {z.infer<typeof SharedHandlerPropsSchema>} SharedHandlerProps */
/**
 * HTTP-specific properties (in addition to shared props).
 */
export const HttpExtraPropsSchema: z.ZodObject<
  {
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
    allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>
  },
  z.core.$strip
>
export type SharedHandlerProps = z.infer<typeof SharedHandlerPropsSchema>
export type HttpExtraProps = z.infer<typeof HttpExtraPropsSchema>
import { z } from "zod/v4"
//# sourceMappingURL=config-schemas.d.mts.map
