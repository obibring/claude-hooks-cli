import { z } from "zod/v4"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  CommandOnlyHandlerSchema,
  makeMatchedConfigSchema,
} from "../schemas/config-schemas.mjs"
import { FileChangedMatcherSchema } from "../schemas/matcher-schemas.mjs"

// --- Matcher ---

export { FileChangedMatcherSchema }

/** @typedef {z.infer<typeof FileChangedMatcherSchema>} FileChangedMatcher */

// --- Config ---

/**
 * Command-only hook. Matcher is REQUIRED — pipe-separated basenames
 * specifying which files to watch (e.g. ".envrc|.env").
 */
export const FileChangedConfigSchema = makeMatchedConfigSchema(
  FileChangedMatcherSchema,
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof FileChangedConfigSchema>} FileChangedConfig */

// --- Input ---

export const FileChangedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("FileChanged"),
  file_path: z.string(),
  event: z.string(),
})

/** @typedef {z.infer<typeof FileChangedInputSchema>} FileChangedInput */

// --- Output ---

export const FileChangedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof FileChangedOutputSchema>} FileChangedOutput */
