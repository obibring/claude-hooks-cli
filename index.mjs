// Re-export schemas (enums, base schemas, matchers, config builders, output)
export * as Schemas from "./schemas/index.mjs"

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
  addHook,
  getHooksObject,
  listHooks,
  removeHook,
} from "./lib/hooks-store.mjs"
export { deleteHook, getHooks, saveHook } from "./lib/hooks-manager.mjs"

// Re-export hook metadata for programmatic use
export {
  getHookMeta,
  HANDLER_TYPE_INFO,
  HOOK_EVENT_NAMES,
  HOOK_METADATA,
} from "./lib/hook-metadata.mjs"

// Re-export command resolver utilities
export {
  createCommandFile,
  parseCommandAsFile,
  resolveCommand,
} from "./lib/command-resolver.mjs"

// Re-export documentation map
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs"

// Re-export programmatic API
export {
  addHookConfig,
  buildHookCommand,
  ClaudeProject,
  discoverSkills,
  getAvailableDocs,
  getDocs,
  getHooksForProjectDir,
  installHook,
  listHookEntries,
  parseFrontmatter,
  removeHookFromProjectDir,
  saveHookToProjectDir,
  scaffoldHookFile,
  SkillFrontmatterSchema,
  testHook,
  uninstallHook,
  validateSkillFrontmatter,
} from "./lib/api.mjs"

// Re-export buildSyntheticInput for test utilities
export { buildSyntheticInput } from "./lib/synthetic-input.mjs"

// Re-export hook form builder for consumers
export { hookFormBuilder } from "./lib/hook-form-builder.mjs"

// Re-export HookSchemas map (hook name → { Config, Input, Output, Matcher?, HookSpecificOutput? })
export { HookSchemas } from "./hooks/index.mjs"

// Re-export ClaudeMd parser
export { ClaudeMd } from "./lib/claude-md.mjs"
