/**
 * Get hook metadata by event name.
 * @param {string} name
 * @returns {HookMeta | undefined}
 */
export function getHookMeta(name: string): HookMeta | undefined
/**
 * Central metadata registry for all 26 Claude Code hook events.
 * Powers the interactive CLI by describing each hook's capabilities,
 * matcher support, handler types, and field descriptions.
 */
/** @typedef {"command" | "prompt" | "agent" | "http"} HandlerType */
/**
 * @typedef {object} HookMeta
 * @property {string} name - Hook event name
 * @property {string} description - Short description for selection menus
 * @property {HandlerType[]} handlerTypes - Supported handler types
 * @property {boolean} hasMatcher - Whether the hook supports a matcher field
 * @property {boolean} matcherRequired - Whether the matcher is required (FileChanged)
 * @property {string | null} matcherField - The input field the matcher matches against
 * @property {string | null} matcherDescription - Human-readable description of what the matcher matches
 * @property {string[] | null} matcherValues - Fixed enum values for the matcher, or null if free-form/regex
 * @property {boolean} supportsOnce - Whether the hook supports the `once` option
 * @property {boolean} supportsIf - Whether the hook supports the `if` conditional
 * @property {number} defaultTimeout - Default timeout in ms
 * @property {boolean} experimental - Whether the hook requires experimental features
 * @property {string | null} experimentalFlag - Env var needed for experimental hooks
 */
/** @type {HookMeta[]} */
export const HOOK_METADATA: HookMeta[]
/** All valid hook event names */
export const HOOK_EVENT_NAMES: string[]
export namespace HANDLER_TYPE_INFO {
  namespace command {
    let label: string
    let description: string
    let requiredFields: string[]
  }
  namespace prompt {
    let label_1: string
    export { label_1 as label }
    let description_1: string
    export { description_1 as description }
    let requiredFields_1: string[]
    export { requiredFields_1 as requiredFields }
  }
  namespace agent {
    let label_2: string
    export { label_2 as label }
    let description_2: string
    export { description_2 as description }
    let requiredFields_2: string[]
    export { requiredFields_2 as requiredFields }
  }
  namespace http {
    let label_3: string
    export { label_3 as label }
    let description_3: string
    export { description_3 as description }
    let requiredFields_3: string[]
    export { requiredFields_3 as requiredFields }
  }
}
export type HandlerType = "command" | "prompt" | "agent" | "http"
export type HookMeta = {
  /**
   * - Hook event name
   */
  name: string
  /**
   * - Short description for selection menus
   */
  description: string
  /**
   * - Supported handler types
   */
  handlerTypes: HandlerType[]
  /**
   * - Whether the hook supports a matcher field
   */
  hasMatcher: boolean
  /**
   * - Whether the matcher is required (FileChanged)
   */
  matcherRequired: boolean
  /**
   * - The input field the matcher matches against
   */
  matcherField: string | null
  /**
   * - Human-readable description of what the matcher matches
   */
  matcherDescription: string | null
  /**
   * - Fixed enum values for the matcher, or null if free-form/regex
   */
  matcherValues: string[] | null
  /**
   * - Whether the hook supports the `once` option
   */
  supportsOnce: boolean
  /**
   * - Whether the hook supports the `if` conditional
   */
  supportsIf: boolean
  /**
   * - Default timeout in ms
   */
  defaultTimeout: number
  /**
   * - Whether the hook requires experimental features
   */
  experimental: boolean
  /**
   * - Env var needed for experimental hooks
   */
  experimentalFlag: string | null
}
//# sourceMappingURL=hook-metadata.d.mts.map
