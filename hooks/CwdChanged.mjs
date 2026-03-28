import { z } from "zod/v4"

import {
  CommandOnlyHandlerSchema,
  makeConfigSchemaWithoutMatched,
} from "../schemas/config-schemas.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"

// --- Matcher ---

/** CwdChanged does not support matchers — always fires. */
export const CwdChangedMatcherSchema = undefined

// --- Config ---

/** Command-only hook. No matcher support. */
export const CwdChangedConfigSchema = makeConfigSchemaWithoutMatched(
  CommandOnlyHandlerSchema,
)

/** @typedef {z.infer<typeof CwdChangedConfigSchema>} CwdChangedConfig */

// --- Input ---

export const CwdChangedInputSchema = BaseHookInputSchema.extend({
  hook_event_name: z.literal("CwdChanged"),
  old_cwd: z.string(),
  new_cwd: z.string(),
})

/** @typedef {z.infer<typeof CwdChangedInputSchema>} CwdChangedInput */

// --- Output ---

export const CwdChangedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof CwdChangedOutputSchema>} CwdChangedOutput */
