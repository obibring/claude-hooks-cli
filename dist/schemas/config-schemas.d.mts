/** @typedef {z.infer<typeof CommandOnlyHandlerSchema>} CommandOnlyHandler */
/**
 * Builds a hook config entry schema for a given matcher schema and handler schema.
 * The optionality of `matcher` in the resulting type is determined by the passed
 * schema — pass `schema.optional()` for an optional matcher, or the bare schema
 * for a required one (e.g. FileChanged).
 *
 * @template {z.ZodType} MS - Matcher schema (preserves optionality)
 * @template {z.ZodType} HS - Handler schema
 * @param {MS} matcherSchema - Zod schema for the matcher field
 * @param {HS} handlerSchema - Zod schema for individual hook handlers
 * @returns {z.ZodObject<{ matcher: MS, hooks: z.ZodArray<HS> }>}
 */
export function makeMatchedConfigSchema<MS extends z.ZodType, HS extends z.ZodType>(matcherSchema: MS, handlerSchema: HS): z.ZodObject<{
    matcher: MS;
    hooks: z.ZodArray<HS>;
}>;
/**
 * Builds a hook config entry schema without matcher support.
 *
 * @template {z.ZodType} HS - Handler schema
 * @param {HS} handlerSchema - Zod schema for individual hook handlers
 * @returns {z.ZodObject<{ hooks: z.ZodArray<HS> }>}
 */
export function makeUnmatchedConfigSchema<HS extends z.ZodType>(handlerSchema: HS): z.ZodObject<{
    hooks: z.ZodArray<HS>;
}>;
/**
 * Builds a config entry with matcher and `once` support.
 * `once` is only valid for: SessionStart, SessionEnd, PreCompact.
 * The optionality of `matcher` is determined by the passed schema.
 *
 * @template {z.ZodType} MS - Matcher schema (preserves optionality)
 * @template {z.ZodType} HS - Handler schema
 * @param {MS} matcherSchema - Zod schema for the matcher field
 * @param {HS} handlerSchema - Zod schema for individual hook handlers (intersected with `{ once?: boolean }`)
 * @returns {z.ZodObject<{ matcher: MS, hooks: z.ZodArray<z.ZodIntersection<HS, z.ZodObject<{ once: z.ZodOptional<z.ZodBoolean> }>>> }>}
 */
export function makeMatchedConfigWithOnceSchema<MS extends z.ZodType, HS extends z.ZodType>(matcherSchema: MS, handlerSchema: HS): z.ZodObject<{
    matcher: MS;
    hooks: z.ZodArray<z.ZodIntersection<HS, z.ZodObject<{
        once: z.ZodOptional<z.ZodBoolean>;
    }>>>;
}>;
/**
 * Builds a config entry without matcher but with `once` support.
 * `once` is only valid for: SessionStart, SessionEnd, PreCompact.
 *
 * @template {z.ZodType} HS - Handler schema
 * @param {HS} handlerSchema - Zod schema for individual hook handlers (intersected with `{ once?: boolean }`)
 * @returns {z.ZodObject<{ hooks: z.ZodArray<z.ZodIntersection<HS, z.ZodObject<{ once: z.ZodOptional<z.ZodBoolean> }>>> }>}
 */
export function makeUnmatchedConfigWithOnceSchema<HS extends z.ZodType>(handlerSchema: HS): z.ZodObject<{
    hooks: z.ZodArray<z.ZodIntersection<HS, z.ZodObject<{
        once: z.ZodOptional<z.ZodBoolean>;
    }>>>;
}>;
/**
 * Handler: type "command" — runs a shell command.
 * Available for ALL 26 hook events.
 */
export const CommandHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    command: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof CommandHandlerSchema>} CommandHandler */
/**
 * Handler: type "prompt" — sends a prompt to a Claude model for single-turn evaluation.
 * Only supported for: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest,
 * UserPromptSubmit, Stop, SubagentStop, TaskCreated, TaskCompleted.
 */
export const PromptHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof PromptHandlerSchema>} PromptHandler */
/**
 * Handler: type "agent" — spawns a subagent with multi-turn tool access.
 * Same event support as "prompt".
 */
export const AgentHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"agent">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** @typedef {z.infer<typeof AgentHandlerSchema>} AgentHandler */
/**
 * Handler: type "http" — POSTs JSON to a URL.
 * Same event support as "prompt" and "agent".
 */
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
}, z.core.$strip>;
/** @typedef {z.infer<typeof HttpHandlerSchema>} HttpHandler */
/**
 * Union of all 4 handler types, discriminated on "type".
 * For hooks that support all handler types.
 */
export const AnyHandlerSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"command">;
    command: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"agent">;
    prompt: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"http">;
    url: z.ZodURL;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    allowedEnvVars: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>], "type">;
/** @typedef {z.infer<typeof AnyHandlerSchema>} AnyHandler */
/**
 * Command-only handler union (single variant discriminated union for consistency).
 * For hooks that only support "command" type.
 */
export const CommandOnlyHandlerSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    command: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    async: z.ZodOptional<z.ZodBoolean>;
    asyncRewake: z.ZodOptional<z.ZodBoolean>;
    statusMessage: z.ZodOptional<z.ZodString>;
    if: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CommandOnlyHandler = z.infer<typeof CommandOnlyHandlerSchema>;
export type CommandHandler = z.infer<typeof CommandHandlerSchema>;
export type PromptHandler = z.infer<typeof PromptHandlerSchema>;
export type AgentHandler = z.infer<typeof AgentHandlerSchema>;
export type HttpHandler = z.infer<typeof HttpHandlerSchema>;
export type AnyHandler = z.infer<typeof AnyHandlerSchema>;
import { z } from "zod/v4";
//# sourceMappingURL=config-schemas.d.mts.map