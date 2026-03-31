import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import { SharedHandlerPropsSchema } from "../schemas/config-schemas.mjs"
import {
  hookFormBuilder,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-form-builder.mjs"

// --- Matcher ---

/** Setup does not support matchers — always fires. */
export const SetupMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Command-only hook. No matcher support. Default timeout 30000ms. */
export const SetupConfigSchema = z.object({
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

/** @typedef {z.infer<typeof SetupConfigSchema>} SetupConfig */

// --- Input ---

export const SetupInputSchema = BaseHookInputSchema.extend({
  /** Setup */
  hook_event_name: z.literal("Setup").describe("Setup"),
})

/** @typedef {z.infer<typeof SetupInputSchema>} SetupInput */

// --- Output ---

export const SetupOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof SetupOutputSchema>} SetupOutput */

// --- Schema Builder Registration ---

hookFormBuilder.addHookType("Setup", "command", {
  settings: { ...COMMAND_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
  input: { ...BASE_INPUT_FIELDS },
  output: { ...BASE_OUTPUT_FIELDS },
})
