/** Singleton builder instance used by all hook files. */
export const hookSchemaBuilder: HookSchemaBuilder
/** @type {FieldMap} Base input fields present on every hook event. */
export const BASE_INPUT_FIELDS: FieldMap
/** @type {FieldMap} Tool fields shared by PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest. */
export const TOOL_INPUT_FIELDS: FieldMap
/** @type {FieldMap} Base output fields available to all hooks. */
export const BASE_OUTPUT_FIELDS: FieldMap
/** @type {FieldMap} Shared settings fields for command handlers. */
export const COMMAND_SETTINGS_FIELDS: FieldMap
/** @type {FieldMap} Shared settings fields for prompt handlers. */
export const PROMPT_SETTINGS_FIELDS: FieldMap
/** @type {FieldMap} Shared settings fields for agent handlers. */
export const AGENT_SETTINGS_FIELDS: FieldMap
/** @type {FieldMap} Shared settings fields for http handlers. */
export const HTTP_SETTINGS_FIELDS: FieldMap
/** @type {FieldMap} The `if` settings field, used on tool-event hooks and some others. */
export const IF_SETTINGS_FIELD: FieldMap
/** @type {FieldMap} The `once` settings field, used on SessionStart, SessionEnd, PreCompact. */
export const ONCE_SETTINGS_FIELD: FieldMap
/** @type {FieldMap} The `matcher` settings field for tool-name matching. */
export const TOOL_MATCHER_FIELD: FieldMap
export type FieldType = "string" | "number" | "boolean" | "object" | "array"
export type FieldDefinition = {
  type: FieldType
  description: string
  required?: boolean | undefined
  /**
   * - Nested fields for type "object"
   */
  fields?: Record<string, FieldDefinition> | undefined
  /**
   * - Item definition for type "array"
   */
  items?: FieldDefinition | undefined
}
export type FieldMap = Record<string, FieldDefinition>
export type HookTypeDefinition = {
  /**
   * - Configurable fields in settings.json for this handler type
   */
  settings: FieldMap
  /**
   * - JSON fields received on stdin
   */
  input: FieldMap
  /**
   * - JSON fields written to stdout
   */
  output: FieldMap
}
export type HookSchemaMap = Record<string, Record<string, HookTypeDefinition>>
/**
 * Builder for constructing a typed hook schema definition object.
 *
 * Each hook file calls `hookSchemaBuilder.addHookType(...)` to register
 * its per-handler-type field definitions. At build time, `build()` returns
 * the complete map: { [HookName]: { [HandlerType]: { settings, input, output } } }
 *
 * Field definitions use the shape:
 *   { type: "string" | "number" | "boolean" | "object" | "array",
 *     description: string, required?: boolean,
 *     fields?: { ... } }    // recursive for nested objects
 */
/**
 * @typedef {"string" | "number" | "boolean" | "object" | "array"} FieldType
 */
/**
 * @typedef {object} FieldDefinition
 * @property {FieldType} type
 * @property {string} description
 * @property {boolean} [required]
 * @property {Record<string, FieldDefinition>} [fields] - Nested fields for type "object"
 * @property {FieldDefinition} [items] - Item definition for type "array"
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
 * @typedef {Record<string, Record<string, HookTypeDefinition>>} HookSchemaMap
 */
declare class HookSchemaBuilder {
  /**
   * Registers a handler type definition for a hook event.
   *
   * @param {string} hookName - Hook event name (e.g. "PreToolUse")
   * @param {string} handlerType - Handler type (e.g. "command", "prompt", "agent", "http")
   * @param {{ settings: Record<string, any>, input: Record<string, any>, output: Record<string, any> }} definition - Field definitions for settings, input, and output
   * @returns {this}
   */
  addHookType(
    hookName: string,
    handlerType: string,
    definition: {
      settings: Record<string, any>
      input: Record<string, any>
      output: Record<string, any>
    },
  ): this
  /**
   * Returns the complete schema map.
   * @returns {HookSchemaMap}
   */
  build(): HookSchemaMap
  #private
}
export {}
//# sourceMappingURL=hook-schema-builder.d.mts.map
