export * as Schemas from "./schemas/index.mjs";
export { HookHandler } from "./lib/handler.mjs";
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs";
export { buildSyntheticInput } from "./lib/synthetic-input.mjs";
export { hookFormBuilder } from "./lib/hook-form-builder.mjs";
export { HookSchemas } from "./hooks/index.mjs";
export { getSettingsPath, readSettings, writeSettings } from "./lib/settings-io.mjs";
export { addHook, getHooksObject, listHooks, removeHook } from "./lib/hooks-store.mjs";
export { deleteHook, getHooks, saveHook } from "./lib/hooks-manager.mjs";
export { getHookMeta, HANDLER_TYPE_INFO, HOOK_EVENT_NAMES, HOOK_METADATA } from "./lib/hook-metadata.mjs";
export { createCommandFile, parseCommandAsFile, resolveCommand } from "./lib/command-resolver.mjs";
export { addHookConfig, buildHookCommand, ClaudeProject, discoverSkills, getAvailableDocs, getDocs, getHooksForProjectDir, installHook, listHookEntries, parseFrontmatter, removeHookFromProjectDir, saveHookToProjectDir, scaffoldHookFile, SkillFrontmatterSchema, testHook, uninstallHook, validateSkillFrontmatter } from "./lib/api.mjs";
//# sourceMappingURL=index.d.mts.map