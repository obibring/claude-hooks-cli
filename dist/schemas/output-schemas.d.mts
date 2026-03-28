/**
 * Universal JSON output fields that all hooks can return via stdout.
 * Hook-specific output schemas (e.g., PreToolUse's permissionDecision)
 * are defined in each hook's individual file.
 */
export const BaseHookOutputSchema: z.ZodObject<{
    continue: z.ZodOptional<z.ZodBoolean>;
    stopReason: z.ZodOptional<z.ZodString>;
    suppressOutput: z.ZodOptional<z.ZodBoolean>;
    systemMessage: z.ZodOptional<z.ZodString>;
    additionalContext: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BaseHookOutput = z.infer<typeof BaseHookOutputSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=output-schemas.d.mts.map