/**
 * Builder for constructing typed hook form definitions.
 *
 * Each hook file calls `hookFormBuilder.addHookType(...)` to register
 * its per-handler-type field definitions. Consumers import the builder
 * and call `getHookNames()` / `getHookDefinition()` to query the registry.
 */

import { z } from "zod/v4"

/**
 * @typedef {"string" | "number" | "boolean" | "object" | "array" | "enum"} FieldType
 */

/**
 * @typedef {object} FieldDefinition
 * @property {FieldType} type - One of: "string", "number", "boolean", "object", "array", "enum"
 * @property {string} description
 * @property {boolean} [required]
 * @property {import("zod/v4").z.ZodType} [schema] - Zod schema that validates the field's value
 * @property {Record<string, FieldDefinition>} [fields] - Nested fields for type "object"
 * @property {FieldDefinition} [items] - Item definition for type "array"
 * @property {string[]} [values] - Allowed values for type "enum"
 * @property {boolean} [strict] - When true, only the enum values are accepted. When false, free-form strings are also allowed. Only for type "enum".
 */

/**
 * @typedef {Record<string, FieldDefinition>} FieldMap
 */

/**
 * @typedef {object} HookTypeDefinition
 * @property {FieldMap} settings - Configurable fields in settings.json for this handler type
 * @property {FieldMap} input - JSON fields received on stdin
 * @property {FieldMap} output - JSON fields written to stdout
 */

/**
 * @typedef {Record<string, Record<string, HookTypeDefinition>>} HookFormMap
 */

class HookFormBuilder {
  /** @type {HookFormMap} */
  #schema = {}

  /**
   * Registers a handler type definition for a hook event.
   *
   * @param {string} hookName - Hook event name (e.g. "PreToolUse")
   * @param {"command" | "prompt" | "agent" | "http"} handlerType
   * @param {HookTypeDefinition} definition - Field definitions for settings, input, and output
   * @returns {this}
   */
  addHookType(hookName, handlerType, definition) {
    if (!this.#schema[hookName]) {
      this.#schema[hookName] = {}
    }
    this.#schema[hookName][handlerType] = definition
    return this
  }

  /**
   * Returns an array of all registered hook event names.
   * @returns {string[]}
   */
  getHookNames() {
    return Object.keys(this.#schema)
  }

  /**
   * Returns the full definition for a hook: a record of handler types to their
   * settings/input/output field maps. Returns `undefined` if the hook is not registered.
   *
   * @param {string} hookName
   * @returns {Record<string, HookTypeDefinition> | undefined}
   */
  getHookDefinition(hookName) {
    return this.#schema[hookName]
  }
}

/** Singleton builder instance used by all hook files. */
export const hookFormBuilder = new HookFormBuilder()

// ---- Shared field fragments reusable across hook registrations ----

/** @type {FieldMap} Base input fields present on every hook event. */
export const BASE_INPUT_FIELDS = {
  hook_event_name: {
    type: "enum",
    description: "Name of the hook event that fired.",
    schema: z.enum([
      "PreToolUse",
      "PermissionRequest",
      "PostToolUse",
      "PostToolUseFailure",
      "UserPromptSubmit",
      "Notification",
      "Stop",
      "SubagentStart",
      "SubagentStop",
      "PreCompact",
      "PostCompact",
      "SessionStart",
      "SessionEnd",
      "Setup",
      "TeammateIdle",
      "TaskCreated",
      "TaskCompleted",
      "ConfigChange",
      "WorktreeCreate",
      "WorktreeRemove",
      "InstructionsLoaded",
      "Elicitation",
      "ElicitationResult",
      "StopFailure",
      "CwdChanged",
      "FileChanged",
    ]),
    values: [
      "PreToolUse",
      "PermissionRequest",
      "PostToolUse",
      "PostToolUseFailure",
      "UserPromptSubmit",
      "Notification",
      "Stop",
      "SubagentStart",
      "SubagentStop",
      "PreCompact",
      "PostCompact",
      "SessionStart",
      "SessionEnd",
      "Setup",
      "TeammateIdle",
      "TaskCreated",
      "TaskCompleted",
      "ConfigChange",
      "WorktreeCreate",
      "WorktreeRemove",
      "InstructionsLoaded",
      "Elicitation",
      "ElicitationResult",
      "StopFailure",
      "CwdChanged",
      "FileChanged",
    ],
    strict: true,
    required: true,
  },
  session_id: {
    type: "string",
    description: "Unique identifier for the current Claude Code session.",
    schema: z.string(),
    required: true,
  },
  transcript_path: {
    type: "string",
    description: "Absolute path to the conversation transcript JSON file.",
    schema: z.string(),
    required: true,
  },
  cwd: {
    type: "string",
    description: "Current working directory of the Claude Code session.",
    schema: z.string(),
    required: true,
  },
  permission_mode: {
    type: "enum",
    description: "Active permission mode.",
    schema: z.enum([
      "default",
      "plan",
      "acceptEdits",
      "dontAsk",
      "bypassPermissions",
    ]),
    values: ["default", "plan", "acceptEdits", "dontAsk", "bypassPermissions"],
    strict: true,
    required: true,
  },
  agent_id: {
    type: "string",
    description: "Subagent identifier. Present only inside a subagent context.",
    schema: z.string().optional(),
  },
  agent_type: {
    type: "string",
    description:
      'Agent type name (e.g. "Bash", "Explore", "Plan"). Present inside subagent contexts.',
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} Tool fields shared by PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest. */
export const TOOL_INPUT_FIELDS = {
  tool_name: {
    type: "string",
    description:
      'Name of the tool being called (e.g. "Bash", "Edit", "mcp__server__tool").',
    schema: z.string(),
    required: true,
  },
  tool_input: {
    type: "object",
    description:
      "Arguments passed to the tool as key-value pairs. Shape varies by tool.",
    schema: z.record(z.string(), z.unknown()),
    required: true,
  },
}

/** @type {FieldMap} Base output fields available to all hooks. */
export const BASE_OUTPUT_FIELDS = {
  continue: {
    type: "boolean",
    description:
      "Set to false to stop Claude entirely. If omitted or true, Claude continues.",
    schema: z.boolean().optional(),
  },
  stopReason: {
    type: "string",
    description: "Message displayed to the user when continue is false.",
    schema: z.string().optional(),
  },
  suppressOutput: {
    type: "boolean",
    description:
      "When true, hides this hook's stdout from verbose mode output.",
    schema: z.boolean().optional(),
  },
  systemMessage: {
    type: "string",
    description:
      "Warning or info message shown to the user in the Claude Code UI.",
    schema: z.string().optional(),
  },
  additionalContext: {
    type: "string",
    description:
      "Context string injected into Claude's conversation for the next response.",
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} Shared settings fields for command handlers. */
export const COMMAND_SETTINGS_FIELDS = {
  command: {
    type: "string",
    description:
      "Shell command to execute. Receives JSON on stdin, returns JSON on stdout.",
    schema: z.string(),
    required: true,
  },
  timeout: {
    type: "number",
    description: "Maximum execution time in milliseconds. Default: 5000ms.",
    schema: z.number().int().positive().optional(),
  },
  async: {
    type: "boolean",
    description: "When true, runs in background without blocking Claude Code.",
    schema: z.boolean().optional(),
  },
  asyncRewake: {
    type: "boolean",
    description:
      "When true, runs async but wakes model on exit code 2 (blocking error).",
    schema: z.boolean().optional(),
  },
  statusMessage: {
    type: "string",
    description: "Custom spinner message shown while the hook runs.",
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} Shared settings fields for prompt handlers. */
export const PROMPT_SETTINGS_FIELDS = {
  prompt: {
    type: "string",
    description:
      "Prompt text sent to a Claude model. Use $ARGUMENTS for dynamic input.",
    schema: z.string(),
    required: true,
  },
  model: {
    type: "enum",
    description: "Model to use for the prompt.",
    schema: z
      .enum(["opus", "sonnet", "haiku", "opus[4m]", "sonnet[4m]"])
      .optional(),
    values: ["opus", "sonnet", "haiku", "opus[4m]", "sonnet[4m]"],
    strict: true,
  },
  timeout: {
    type: "number",
    description: "Seconds before canceling. Default: 30 for prompt hooks.",
    schema: z.number().int().positive().optional(),
  },
  statusMessage: {
    type: "string",
    description: "Custom spinner message shown while the hook runs.",
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} Shared settings fields for agent handlers. */
export const AGENT_SETTINGS_FIELDS = {
  prompt: {
    type: "string",
    description:
      "Prompt text sent to the Claude model. $ARGUMENTS is replaced with hook context.",
    schema: z.string(),
    required: true,
  },
  timeout: {
    type: "number",
    description: "Maximum execution time in milliseconds. Default: 5000ms.",
    schema: z.number().int().positive().optional(),
  },
  async: {
    type: "boolean",
    description: "When true, runs in background without blocking Claude Code.",
    schema: z.boolean().optional(),
  },
  asyncRewake: {
    type: "boolean",
    description:
      "When true, runs async but wakes model on exit code 2 (blocking error).",
    schema: z.boolean().optional(),
  },
  statusMessage: {
    type: "string",
    description: "Custom spinner message shown while the hook runs.",
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} Shared settings fields for http handlers. */
export const HTTP_SETTINGS_FIELDS = {
  url: {
    type: "string",
    description: "URL to POST the hook JSON payload to.",
    schema: z.string().url(),
    required: true,
  },
  timeout: {
    type: "number",
    description: "Maximum execution time in milliseconds. Default: 5000ms.",
    schema: z.number().int().positive().optional(),
  },
  async: {
    type: "boolean",
    description: "When true, runs in background without blocking Claude Code.",
    schema: z.boolean().optional(),
  },
  asyncRewake: {
    type: "boolean",
    description:
      "When true, runs async but wakes model on exit code 2 (blocking error).",
    schema: z.boolean().optional(),
  },
  statusMessage: {
    type: "string",
    description: "Custom spinner message shown while the hook runs.",
    schema: z.string().optional(),
  },
  headers: {
    type: "object",
    description:
      'HTTP headers. Supports $VAR interpolation. Example: {"Authorization": "Bearer $TOKEN"}.',
    schema: z.record(z.string(), z.string()).optional(),
  },
  allowedEnvVars: {
    type: "array",
    description: "Env var names allowed for $VAR interpolation in headers.",
    schema: z.array(z.string()).optional(),
    items: {
      type: "string",
      description: "Environment variable name.",
      schema: z.string(),
    },
  },
}

/** @type {FieldMap} The `if` settings field, used on tool-event hooks and some others. */
export const IF_SETTINGS_FIELD = {
  if: {
    type: "string",
    description:
      'Conditional execution using permission rule syntax (e.g. "Bash(git *)").',
    schema: z.string().optional(),
  },
}

/** @type {FieldMap} The `once` settings field, used on SessionStart, SessionEnd, PreCompact. */
export const ONCE_SETTINGS_FIELD = {
  once: {
    type: "boolean",
    description:
      "When true, fires only once per session. Subsequent events are skipped.",
    schema: z.boolean().optional(),
  },
}

/** @type {FieldMap} The `matcher` settings field for tool-name matching. */
export const TOOL_MATCHER_FIELD = {
  matcher: {
    type: "string",
    description:
      'Regex pattern matching tool names (e.g. "Bash", "Edit|Write").',
    schema: z.string().optional(),
  },
}
