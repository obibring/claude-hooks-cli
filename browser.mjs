/**
 * Browser-safe entry point. No Node.js APIs (fs, path, os, child_process, process).
 * All exports here work in browsers, Deno, Cloudflare Workers, etc.
 */

// Hook form builder (field definitions, Zod schemas per field)
export { hookFormBuilder } from "./lib/hook-form-builder.mjs"

// Hook schemas (Config, Input, Output, Matcher per hook event)
export { HookSchemas } from "./hooks/index.mjs"

// Base schemas (enums, shared input/output schemas)
export * as Schemas from "./schemas/index.mjs"

// Hook metadata (event names, handler type info)
export {
  HOOK_METADATA,
  getHookMeta,
  HOOK_EVENT_NAMES,
  HANDLER_TYPE_INFO,
} from "./lib/hook-metadata.mjs"

// Hook file templates (generate TS/JS/Python/Shell starter files)
export {
  HOOK_HANDLER_TEMPLATES,
  BASIC_FILE_TEMPLATES,
  generateHookScript,
  getSupportedExtensions,
} from "./lib/hook-templates.mjs"

// CLAUDE.md parser
export { ClaudeMd } from "./lib/claude-md.mjs"

// Hook documentation
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs"

// Pure data utilities (no I/O)
export {
  getHooksObject,
  addHook,
  removeHook,
  listHooks,
} from "./lib/hooks-store.mjs"
