import { z } from "zod/v4"

import { BaseHookInputSchema } from "../schemas/input-schemas.mjs"
import { BaseHookOutputSchema } from "../schemas/output-schemas.mjs"
import {
  SharedHandlerPropsSchema,
  HttpExtraPropsSchema,
} from "../schemas/config-schemas.mjs"
import {
  hookFormBuilder,
  BASE_INPUT_FIELDS,
  BASE_OUTPUT_FIELDS,
  COMMAND_SETTINGS_FIELDS,
  HTTP_SETTINGS_FIELDS,
  IF_SETTINGS_FIELD,
} from "../lib/hook-form-builder.mjs"

// --- Matcher ---

/** WorktreeCreate does not support matchers — always fires. */
export const WorktreeCreateMatcherSchema = undefined

// --- Config ---

const handlerProps = SharedHandlerPropsSchema.extend({
  if: z
    .string()
    .optional()
    .describe(
      "Permission rule syntax to filter when this hook runs. Only evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). On other events, a hook with if set never runs.",
    ),
})

/** Command-only hook. No matcher support. */
export const WorktreeCreateConfigSchema = z.object({
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

/** @typedef {z.infer<typeof WorktreeCreateConfigSchema>} WorktreeCreateConfig */

// --- Input ---

export const WorktreeCreateInputSchema = BaseHookInputSchema.extend({
  /** WorktreeCreate */
  hook_event_name: z.literal("WorktreeCreate").describe("WorktreeCreate"),
  /** Name for the worktree being created. */
  name: z.string().describe("Name for the worktree being created."),
})

/** @typedef {z.infer<typeof WorktreeCreateInputSchema>} WorktreeCreateInput */

// --- Output ---

/** WorktreeCreate: non-zero exit fails creation; stdout provides worktree path. */
export const WorktreeCreateOutputSchema = BaseHookOutputSchema

/** @typedef {z.infer<typeof WorktreeCreateOutputSchema>} WorktreeCreateOutput */

// --- Schema Builder Registration ---

/** @satisfies {import("../lib/hook-form-builder.mjs").FieldMap} */
const _input = {
  ...BASE_INPUT_FIELDS,
  name: {
    type: "string",
    description: "Name for the worktree being created.",
    required: true,
  },
}

hookFormBuilder
  .addHookType("WorktreeCreate", "command", {
    settings: { ...COMMAND_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
  .addHookType("WorktreeCreate", "http", {
    settings: { ...HTTP_SETTINGS_FIELDS, ...IF_SETTINGS_FIELD },
    input: _input,
    output: { ...BASE_OUTPUT_FIELDS },
  })
