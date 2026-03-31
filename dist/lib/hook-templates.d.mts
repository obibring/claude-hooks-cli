/**
 * Generates a hook script file contents for the given event and extension.
 * Prefers the HookHandler template for JS/TS files, falls back to the basic template.
 *
 * @param {string} event - Hook event name (e.g. "PreToolUse")
 * @param {string} ext - File extension including dot (e.g. ".ts", ".mjs", ".py")
 * @returns {string | null} The file contents, or null if the extension is not supported
 */
export function generateHookScript(event: string, ext: string): string | null;
/**
 * Returns all supported file extensions.
 * @returns {string[]}
 */
export function getSupportedExtensions(): string[];
/**
 * Hook script file templates. Pure module — no Node.js APIs.
 * Used by the CLI's scaffolding and available to browser consumers
 * for generating hook file contents.
 */
/**
 * Templates that use the HookHandler class from this package.
 * These produce files with `import { HookHandler } from "@obibring/claude-hooks-cli/handler"`.
 * @type {Record<string, (event: string) => string>}
 */
export const HOOK_HANDLER_TEMPLATES: Record<string, (event: string) => string>;
/**
 * Basic starter templates for hook scripts (without HookHandler).
 * These produce files that read stdin directly.
 * @type {Record<string, string>}
 */
export const BASIC_FILE_TEMPLATES: Record<string, string>;
//# sourceMappingURL=hook-templates.d.mts.map