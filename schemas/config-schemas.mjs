import { z } from "zod/v4"

/**
 * Handler: type "command" — runs a shell command.
 * Available for ALL 26 hook events.
 */
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

/**
 * Handler: type "prompt" — sends a prompt to a Claude model for single-turn evaluation.
 * Only supported for: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest,
 * UserPromptSubmit, Stop, SubagentStop, TaskCreated, TaskCompleted.
 */
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

/**
 * Handler: type "agent" — spawns a subagent with multi-turn tool access.
 * Same event support as "prompt".
 */
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

/**
 * Handler: type "http" — POSTs JSON to a URL.
 * Same event support as "prompt" and "agent".
 */
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

// --- Handler variants WITH `if` (tool event hooks only) ---

/**
 * Union of all 4 handler types with `if` support, discriminated on "type".
 * Only for: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest.
 */
export const AnyHandlerWithIfSchema = z.discriminatedUnion("type", [
  CommandHandlerSchema,
  PromptHandlerSchema,
  AgentHandlerSchema,
  HttpHandlerSchema,
])

/** @typedef {z.infer<typeof AnyHandlerWithIfSchema>} AnyHandlerWithIf */

/**
 * Command handler with `if` support.
 * Only for tool event hooks that are command-only (none currently, but kept for symmetry).
 */
export const CommandHandlerWithIfSchema = CommandHandlerSchema

/** @typedef {z.infer<typeof CommandHandlerWithIfSchema>} CommandHandlerWithIf */

// --- Handler variants WITHOUT `if` (all other hooks) ---

const CommandHandlerNoIfSchema = CommandHandlerSchema.omit({
  if: true,
}).strict()
const PromptHandlerNoIfSchema = PromptHandlerSchema.omit({ if: true }).strict()
const AgentHandlerNoIfSchema = AgentHandlerSchema.omit({ if: true }).strict()
const HttpHandlerNoIfSchema = HttpHandlerSchema.omit({ if: true }).strict()

/**
 * Union of all 4 handler types without `if`, discriminated on "type".
 * For hooks that support all handler types but NOT `if`:
 * UserPromptSubmit, Stop, SubagentStop, TaskCreated, TaskCompleted.
 */
export const AnyHandlerSchema = z.discriminatedUnion("type", [
  CommandHandlerNoIfSchema,
  PromptHandlerNoIfSchema,
  AgentHandlerNoIfSchema,
  HttpHandlerNoIfSchema,
])

/** @typedef {z.infer<typeof AnyHandlerSchema>} AnyHandler */

/**
 * Command-only handler without `if`.
 * For most command-only hooks.
 */
export const CommandOnlyHandlerSchema = CommandHandlerNoIfSchema

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
export function makeMatchedConfigSchema(matcherSchema, handlerSchema) {
  return z.object({
    matcher: matcherSchema,
    hooks: z.array(handlerSchema).nonempty(),
  })
}

/**
 * Builds a hook config entry schema without matcher support.
 *
 * @template {z.ZodType} HS - Handler schema
 * @param {HS} handlerSchema - Zod schema for individual hook handlers
 * @returns {z.ZodObject<{ hooks: z.ZodArray<HS> }>}
 */
export function makeUnmatchedConfigSchema(handlerSchema) {
  return z.object({
    hooks: z.array(handlerSchema).nonempty(),
  })
}

/**
 * Builds a config entry with matcher and `once` support.
 * `once` is only valid for: SessionStart, SessionEnd, PreCompact.
 * Uses `.extend()` to preserve strict mode from the handler schema.
 *
 * @template {z.ZodType} MS - Matcher schema (preserves optionality)
 * @template {z.ZodObject} HS - Handler schema (must be a z.ZodObject to support .extend())
 * @param {MS} matcherSchema - Zod schema for the matcher field
 * @param {HS} handlerSchema - Zod schema for individual hook handlers (extended with `once?: boolean`)
 * @returns {z.ZodObject<{ matcher: MS, hooks: z.ZodArray }>}
 */
export function makeMatchedConfigWithOnceSchema(matcherSchema, handlerSchema) {
  const withOnce = handlerSchema.extend({ once: z.boolean().optional() })
  return z.object({
    matcher: matcherSchema,
    hooks: z.array(withOnce).nonempty(),
  })
}

/**
 * Builds a config entry without matcher but with `once` support.
 * `once` is only valid for: SessionStart, SessionEnd, PreCompact.
 * Uses `.extend()` to preserve strict mode from the handler schema.
 *
 * @template {z.ZodObject} HS - Handler schema (must be a z.ZodObject to support .extend())
 * @param {HS} handlerSchema - Zod schema for individual hook handlers (extended with `once?: boolean`)
 * @returns {z.ZodObject<{ hooks: z.ZodArray }>}
 */
export function makeUnmatchedConfigWithOnceSchema(handlerSchema) {
  const withOnce = handlerSchema.extend({ once: z.boolean().optional() })
  return z.object({
    hooks: z.array(withOnce).nonempty(),
  })
}
