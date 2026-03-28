import { z } from "zod/v4"

import { InstructionsLoadReasonSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { InstructionsLoadedMatcherSchema as _InstructionsLoadedMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Instructions load reason matcher. */
export const InstructionsLoadedMatcherSchema =
  _InstructionsLoadedMatcherSchema.describe("Instructions load reason matcher.")

/** @typedef {z.infer<typeof InstructionsLoadedMatcherSchema>} InstructionsLoadedMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema

/** Command-only hook. Matcher matches load_reason. */
export const InstructionsLoadedConfigSchema = z.object({
  /** Load reason to filter on. */
  matcher: InstructionsLoadedMatcherSchema.optional().describe(
    "Load reason to filter on.",
  ),
  hooks: z
    .array(
      z.discriminatedUnion("type", [
        z
          .object({
            /** Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error. */
            type: z
              .literal("command")
              .describe(
                "Runs a shell command. Receives JSON input on stdin, returns JSON on stdout. Exit code 0 = success, 2 = blocking error.",
              ),
            /** Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout. */
            command: z
              .string()
              .describe(
                "Shell command to execute. The hook receives JSON input on stdin and can return JSON on stdout.",
              ),
            ...handlerProps.shape,
          })
          .strict(),
        z
          .object({
            /** POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63. */
            type: z
              .literal("http")
              .describe(
                "POSTs JSON to a URL and receives a JSON response. Routed through sandbox network proxy when sandboxing is enabled. Since v2.1.63.",
              ),
            /** URL to POST the hook JSON payload to. */
            url: z.url().describe("URL to POST the hook JSON payload to."),
            ...handlerProps.shape,
            ...HttpExtraPropsSchema.shape,
          })
          .strict(),
      ]),
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof InstructionsLoadedConfigSchema>} InstructionsLoadedConfig */

// --- Input ---

export const InstructionsLoadedInputSchema = BaseHookInputSchema.extend({
  /** InstructionsLoaded */
  hook_event_name: z
    .literal("InstructionsLoaded")
    .describe("InstructionsLoaded"),
  /** Path to the loaded instruction file (CLAUDE.md or rules file). */
  file_path: z
    .string()
    .describe("Path to the loaded instruction file (CLAUDE.md or rules file)."),
  /** Type of memory/instruction being loaded. */
  memory_type: z.string().describe("Type of memory/instruction being loaded."),
  /** Why the instruction file was loaded. */
  load_reason: InstructionsLoadReasonSchema.describe(
    "Why the instruction file was loaded.",
  ),
  /** Glob patterns that triggered the load (only for path_glob_match reason). */
  globs: z
    .unknown()
    .optional()
    .describe(
      "Glob patterns that triggered the load (only for path_glob_match reason).",
    ),
  /** Path to the file that triggered loading (for path_glob_match). */
  trigger_file_path: z
    .string()
    .optional()
    .describe("Path to the file that triggered loading (for path_glob_match)."),
  /** Path to the parent instruction file (for include reason). */
  parent_file_path: z
    .string()
    .optional()
    .describe("Path to the parent instruction file (for include reason)."),
})

/** @typedef {z.infer<typeof InstructionsLoadedInputSchema>} InstructionsLoadedInput */

// --- Output ---

export const InstructionsLoadedOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof InstructionsLoadedOutputSchema>} InstructionsLoadedOutput */
