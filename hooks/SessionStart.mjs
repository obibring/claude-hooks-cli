import { z } from "zod/v4"

import { SessionStartSourceSchema } from "../schemas/enums.mjs"
import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { SessionStartMatcherSchema as _SessionStartMatcherSchema } from "../schemas/matcher-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import { SharedHandlerPropsSchema } from "../schemas/config-schemas.mjs"

// --- Matcher ---

/** Session start source matcher. \"startup\", \"resume\", \"clear\", or \"compact\". */
export const SessionStartMatcherSchema = _SessionStartMatcherSchema.describe(
  'Session start source matcher. "startup", "resume", "clear", or "compact".',
)

/** @typedef {z.infer<typeof SessionStartMatcherSchema>} SessionStartMatcher */

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  /** When true, this hook only fires once per session. Subsequent events are silently skipped. Only supported in settings-based hooks and skill frontmatter — not agent frontmatter. */
  once: z
    .boolean()
    .optional()
    .describe(
      "When true, this hook only fires once per session. Subsequent events are silently skipped. Only supported in settings-based hooks and skill frontmatter — not agent frontmatter.",
    ),
})

/** Command-only hook. Supports `once`. Matcher matches source. */
export const SessionStartConfigSchema = z.object({
  /** Session start source to filter on. */
  matcher: SessionStartMatcherSchema.optional().describe(
    "Session start source to filter on.",
  ),
  hooks: z
    .array(
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
    )
    .nonempty(),
})

/** @typedef {z.infer<typeof SessionStartConfigSchema>} SessionStartConfig */

// --- Input ---

export const SessionStartInputSchema = BaseHookInputSchema.extend({
  /** SessionStart */
  hook_event_name: z.literal("SessionStart").describe("SessionStart"),
  /** The Claude model being used for this session (e.g. \"claude-opus-4-6\"). */
  model: z
    .string()
    .describe(
      'The Claude model being used for this session (e.g. "claude-opus-4-6").',
    ),
  /** How the session started. */
  source: SessionStartSourceSchema.describe("How the session started."),
})

/** @typedef {z.infer<typeof SessionStartInputSchema>} SessionStartInput */

// --- Output ---

export const SessionStartOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SessionStartOutputSchema>} SessionStartOutput */
