// Re-export schemas (enums, base schemas, matchers, config builders, output)
export * from "./schemas/index.mjs"

// Re-export HookHandler class for hook script authors
// Types HookIOMap and HookEventName are available via ./lib/handler-types.d.mts
export { HookHandler } from "./lib/handler.mjs"

// Re-export utility modules for programmatic use
export {
  getSettingsPath,
  readSettings,
  writeSettings,
} from "./lib/settings-io.mjs"
export {
  getHooksObject,
  addHook,
  removeHook,
  listHooks,
} from "./lib/hooks-store.mjs"
export { getHooks, saveHook, deleteHook } from "./lib/hooks-manager.mjs"

// Re-export hook metadata for programmatic use
export {
  HOOK_METADATA,
  getHookMeta,
  HOOK_EVENT_NAMES,
  HANDLER_TYPE_INFO,
} from "./lib/hook-metadata.mjs"

// Re-export command resolver utilities
export {
  resolveCommand,
  parseCommandAsFile,
  createCommandFile,
} from "./lib/command-resolver.mjs"

// Re-export documentation map
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs"

// Re-export programmatic API
export {
  ClaudeProject,
  addHookConfig,
  buildHookCommand,
  installHook,
  uninstallHook,
  listHookEntries,
  getHooksForProjectDir,
  saveHookToProjectDir,
  removeHookFromProjectDir,
  testHook,
  getDocs,
  getAvailableDocs,
  scaffoldHookFile,
  discoverSkills,
  parseFrontmatter,
  validateSkillFrontmatter,
  SkillFrontmatterSchema,
} from "./lib/api.mjs"

// Re-export buildSyntheticInput for test utilities
export { buildSyntheticInput } from "./lib/synthetic-input.mjs"

// Re-export hook form builder for consumers
export { hookFormBuilder } from "./lib/hook-form-builder.mjs"

// Re-export HookSchemas map (hook name → { Config, Input, Output, Matcher?, HookSpecificOutput? })
export { HookSchemas } from "./hooks/index.mjs"
