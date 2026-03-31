import type { z } from "zod/v4"

/** Valid field types for hook form field definitions. */
export type FieldType = "string" | "number" | "boolean" | "object" | "array" | "enum"

/** Describes a single field in a hook's settings, input, or output. */
export interface FieldDefinition {
  /** The data type of this field. */
  type: FieldType
  /** Human-readable description of what this field does. */
  description: string
  /** When `true`, this field is required (must be present in the object). */
  required?: boolean
  /** Zod schema that validates the field's value at runtime. */
  schema?: z.ZodType
  /** Nested field definitions. Only used when `type` is `"object"`. */
  fields?: Record<string, FieldDefinition>
  /** Item definition for array elements. Only used when `type` is `"array"`. */
  items?: FieldDefinition
  /** Allowed values. Only used when `type` is `"enum"`. */
  values?: string[]
  /** When `true`, only the `values` are accepted. When `false`, free-form strings are also allowed alongside the enum values. Only used when `type` is `"enum"`. */
  strict?: boolean
}

/** A map of field names to their definitions. */
export type FieldMap = Record<string, FieldDefinition>

/** Field definitions for a single hook + handler type combination. */
export interface HookTypeDefinition {
  /** Configurable fields in the settings.json hook entry. */
  settings: FieldMap
  /** JSON fields received on stdin when the hook fires. */
  input: FieldMap
  /** JSON fields the hook can write to stdout. */
  output: FieldMap
}

/** Complete map: hook name → handler type → field definitions. */
export type HookFormMap = Record<string, Record<string, HookTypeDefinition>>

/** Singleton builder for querying hook form definitions. */
export declare const hookFormBuilder: {
  /**
   * Registers a handler type definition for a hook event.
   * @param hookName - Hook event name (e.g. `"PreToolUse"`)
   * @param handlerType - Handler type
   * @param definition - Field definitions for settings, input, and output
   */
  addHookType(
    hookName: string,
    handlerType: "command" | "prompt" | "agent" | "http",
    definition: HookTypeDefinition,
  ): typeof hookFormBuilder

  /** Returns an array of all registered hook event names. */
  getHookNames(): string[]

  /**
   * Returns the full definition for a hook: a record mapping handler types
   * to their settings/input/output field maps.
   * Returns `undefined` if the hook is not registered.
   */
  getHookDefinition(hookName: string): Record<string, HookTypeDefinition> | undefined
}

/** Base input fields present on every hook event. */
export declare const BASE_INPUT_FIELDS: FieldMap
/** Tool fields shared by PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest. */
export declare const TOOL_INPUT_FIELDS: FieldMap
/** Base output fields available to all hooks. */
export declare const BASE_OUTPUT_FIELDS: FieldMap
/** Shared settings fields for command handlers. */
export declare const COMMAND_SETTINGS_FIELDS: FieldMap
/** Shared settings fields for prompt handlers. */
export declare const PROMPT_SETTINGS_FIELDS: FieldMap
/** Shared settings fields for agent handlers. */
export declare const AGENT_SETTINGS_FIELDS: FieldMap
/** Shared settings fields for http handlers. */
export declare const HTTP_SETTINGS_FIELDS: FieldMap
/** The `if` conditional settings field. */
export declare const IF_SETTINGS_FIELD: FieldMap
/** The `once` settings field. */
export declare const ONCE_SETTINGS_FIELD: FieldMap
/** The `matcher` settings field for tool-name regex matching. */
export declare const TOOL_MATCHER_FIELD: FieldMap
