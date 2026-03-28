/**
 * Base handler schemas — exported for programmatic consumers who need
 * to reference individual handler type shapes. Each hook file defines
 * its own inline config schema with the exact handler variants it supports.
 */
/** Command handler with all possible fields including `if`. */
export const CommandHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    command: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** @typedef {z.infer<typeof CommandHandlerSchema>} CommandHandler */
/** Prompt handler with all possible fields including `if`. */
export const PromptHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** @typedef {z.infer<typeof PromptHandlerSchema>} PromptHandler */
/** Agent handler with all possible fields including `if`. */
export const AgentHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"agent">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** @typedef {z.infer<typeof AgentHandlerSchema>} AgentHandler */
/** HTTP handler with all possible fields including `if`. */
export const HttpHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"http">;
    url: z.ZodURL;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type CommandHandler = z.infer<typeof CommandHandlerSchema>;
export type PromptHandler = z.infer<typeof PromptHandlerSchema>;
export type AgentHandler = z.infer<typeof AgentHandlerSchema>;
export type HttpHandler = z.infer<typeof HttpHandlerSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=config-schemas.d.mts.map