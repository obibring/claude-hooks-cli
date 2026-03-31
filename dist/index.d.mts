export * from "./schemas/index.mjs"
export { HookHandler } from "./lib/handler.mjs"
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs"
export { buildSyntheticInput } from "./lib/synthetic-input.mjs"
export { hookFormBuilder } from "./lib/hook-form-builder.mjs"
export { HookSchemas } from "./hooks/index.mjs"
export { getSettingsPath, readSettings, writeSettings } from "./lib/settings-io.mjs"
export { getHooksObject, addHook, removeHook, listHooks } from "./lib/hooks-store.mjs"
export { getHooks, saveHook, deleteHook } from "./lib/hooks-manager.mjs"
export {
  HOOK_METADATA,
  getHookMeta,
  HOOK_EVENT_NAMES,
  HANDLER_TYPE_INFO,
} from "./lib/hook-metadata.mjs"
export {
  resolveCommand,
  parseCommandAsFile,
  createCommandFile,
} from "./lib/command-resolver.mjs"
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
//# sourceMappingURL=index.d.mts.map
