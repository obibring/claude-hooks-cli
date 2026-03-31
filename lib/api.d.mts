export type {
  AddHookOptions,
  AddHookResult,
  PersistTarget,
  InstallHookResult,
  UninstallHookResult,
  TestHookOptions,
  TestHookResult,
  ScaffoldOptions,
  ScaffoldResult,
  ClaudeHooksMetadata,
  ClaudeHooksSettings,
  HookMeta,
  HandlerTypeInfo,
  SkillFrontmatter,
  SkillReference,
  SkillDefinition,
  DiscoverSkillsOptions,
  ValidateSkillOptions,
  ValidateSkillResult,
} from "./api-types.d.mts"

/**
 * Builds a validated hook configuration entry from explicit options.
 * Does NOT write to disk — pass the result to {@link installHook} or use with `saveHook()` to persist.
 *
 * @throws {Error} If the event name is unknown, the handler type is unsupported for the event,
 *   a required field is missing, or a required matcher is not provided.
 *
 * @example
 * ```js
 * const { eventName, configEntry } = addHookConfig({
 *   event: "PreToolUse",
 *   type: "command",
 *   command: "node ./hooks/check-bash.mjs",
 *   matcher: "Bash",
 * })
 * ```
 */
export declare function addHookConfig(
  options: import("./api-types.d.mts").AddHookOptions,
): import("./api-types.d.mts").AddHookResult

/**
 * Builds a hook command string for running a script file, using the same format
 * as the CLI's interactive "Add a hook" flow. Relative paths are prefixed with
 * `$CLAUDE_PROJECT_DIR` so the hook resolves correctly at runtime regardless of working directory.
 *
 * @param runner - `"node"` for JavaScript files, `"tsx"` for TypeScript files
 * @param filePath - Path to the script file (absolute or relative to project root)
 * @returns A command string suitable for a hook handler's `command` field
 * @throws {Error} If runner is not `"node"` or `"tsx"`, or filePath is empty.
 *
 * @example
 * ```js
 * buildHookCommand("tsx", "./hooks/check-bash.ts")
 * // → 'npx -y tsx "$CLAUDE_PROJECT_DIR/./hooks/check-bash.ts"'
 *
 * buildHookCommand("node", "/absolute/path/hook.mjs")
 * // → 'node "/absolute/path/hook.mjs"'
 * ```
 */
export declare function buildHookCommand(runner: "node" | "tsx", filePath: string): string

/**
 * Builds and saves a hook configuration to a settings file in one call.
 * Validates options via {@link addHookConfig}, then writes to the target settings file.
 * Existing settings keys (e.g. `permissions`) are preserved.
 *
 * @throws {Error} If validation fails. The settings file is not modified on validation errors.
 *
 * @example
 * ```js
 * const { filePath } = await installHook(
 *   { event: "PreToolUse", type: "command", command: "my-hook.mjs", matcher: "Bash" },
 *   { scope: "project" },
 * )
 * ```
 */
export declare function installHook(
  options: import("./api-types.d.mts").AddHookOptions,
  target?: import("./api-types.d.mts").PersistTarget,
): Promise<import("./api-types.d.mts").InstallHookResult>

/**
 * Removes a hook from a settings file by event name and array index.
 * Returns `{ removed: false }` if the event or index is not found. The file is not modified when removal fails.
 * When the last hook for an event is removed, the event key is cleaned up from the settings object.
 *
 * @example
 * ```js
 * const { removed } = await uninstallHook("PreToolUse", 0, { scope: "project" })
 * ```
 */
export declare function uninstallHook(
  eventName: string,
  index: number,
  target?: import("./api-types.d.mts").PersistTarget,
): Promise<import("./api-types.d.mts").UninstallHookResult>

/**
 * Returns all hook entries configured in the given scope's settings file.
 * This is the programmatic equivalent of `claude-hooks list`.
 * Returns an empty `hooks` array if no hooks are configured or the settings file does not exist.
 *
 * @example
 * ```js
 * const { filePath, hooks } = await listHookEntries("project")
 * for (const { eventName, index, entry } of hooks) {
 *   console.log(`${eventName}#${index}`, entry)
 * }
 * ```
 */
export declare function listHookEntries(
  scope: import("./settings-io.mjs").SettingsScope,
): Promise<{
  filePath: string
  hooks: import("./hooks-store.mjs").HookEntry[]
}>

/**
 * Returns all hook entries from a project directory's `.claude/settings.json`.
 * This is a directory-based alternative to {@link listHookEntries} that does not rely on
 * git root detection or scope resolution — you provide the project directory directly.
 * Returns an empty `hooks` array if no hooks are configured or the settings file does not exist.
 *
 * @param projectDir - Absolute path to the project root directory
 *
 * @example
 * ```js
 * const { filePath, hooks } = await getHooksForProjectDir("/path/to/my-project")
 * for (const { eventName, index, entry } of hooks) {
 *   console.log(`${eventName}#${index}`, entry)
 * }
 * ```
 */
export declare function getHooksForProjectDir(projectDir: string): Promise<{
  filePath: string
  hooks: import("./hooks-store.mjs").HookEntry[]
}>

/**
 * Validates and saves a hook configuration to a project directory's `.claude/settings.json`.
 * This is a directory-based alternative to {@link installHook} that does not rely on
 * git root detection or scope resolution — you provide the project directory directly.
 * Creates the `.claude/` directory and `settings.json` file if they don't exist.
 *
 * @param projectDir - Absolute path to the project root directory
 * @param options - Hook configuration options (validated via {@link addHookConfig})
 * @throws {Error} If validation fails (the settings file is not modified on validation errors).
 *
 * @example
 * ```js
 * await saveHookToProjectDir("/path/to/my-project", {
 *   event: "PreToolUse",
 *   type: "command",
 *   command: "node ./hooks/check.mjs",
 *   matcher: "Bash",
 * })
 * ```
 */
export declare function saveHookToProjectDir(
  projectDir: string,
  options: import("./api-types.d.mts").AddHookOptions,
): Promise<import("./api-types.d.mts").InstallHookResult>

/**
 * Removes a hook from a project directory's `.claude/settings.json` by event name and index.
 * This is a directory-based alternative to {@link uninstallHook} that does not rely on
 * git root detection or scope resolution.
 * Returns `{ removed: false }` if the event or index is not found. The file is not modified when removal fails.
 *
 * @param projectDir - Absolute path to the project root directory
 * @param eventName - Hook event name (e.g. `"PreToolUse"`)
 * @param index - Index of the hook entry within the event's array
 *
 * @example
 * ```js
 * const { removed } = await removeHookFromProjectDir("/path/to/my-project", "PreToolUse", 0)
 * ```
 */
export declare function removeHookFromProjectDir(
  projectDir: string,
  eventName: string,
  index: number,
): Promise<import("./api-types.d.mts").UninstallHookResult>

/**
 * Tests a single hook handler by spawning it as a child process with input on stdin.
 * Only `type: "command"` handlers can be tested locally — prompt, agent, and http handlers
 * return `{ skipped: true }` with an explanation in `reason`.
 *
 * @example
 * ```js
 * const result = await testHook({
 *   event: "PreToolUse",
 *   handler: { type: "command", command: "node ./hooks/my-hook.mjs" },
 * })
 * console.log(result.exitCode, result.stdout)
 * ```
 */
export declare function testHook(
  options: import("./api-types.d.mts").TestHookOptions,
): Promise<import("./api-types.d.mts").TestHookResult>

/**
 * Returns the markdown documentation for a hook event, or `null` if the event name is unknown.
 * The markdown includes Config, Input, and Output sections with field tables and TypeScript type examples.
 *
 * @example
 * ```js
 * const docs = getDocs("PreToolUse")
 * if (docs) console.log(docs) // "# PreToolUse\n\nRuns before tool calls..."
 * ```
 */
export declare function getDocs(eventName: string): string | null

/**
 * Returns an array of all hook event names that have documentation available.
 * Contains all 26 event names (e.g. `["ConfigChange", "CwdChanged", ..., "WorktreeRemove"]`).
 */
export declare function getAvailableDocs(): string[]

/**
 * Creates a hook script file with a starter template that includes `HookHandler.for("EventName")`.
 * For JS/TS files (`.ts`, `.mjs`, `.js`, `.tsx`, `.mts`), generates a typed template using `@obibring/claude-hooks-cli/handler`.
 * For other languages (`.py`, `.sh`, `.bash`, `.zsh`), generates a basic stdin-reading template.
 * Returns `{ created: false }` if the file already exists and `overwrite` is not set.
 *
 * @example
 * ```js
 * const { created, runnerCommand } = await scaffoldHookFile({
 *   event: "PreToolUse",
 *   filePath: "./hooks/check-bash.ts",
 * })
 * // runnerCommand: 'npx tsx "/absolute/path/hooks/check-bash.ts"'
 * ```
 */
export declare function scaffoldHookFile(
  options: import("./api-types.d.mts").ScaffoldOptions,
): Promise<import("./api-types.d.mts").ScaffoldResult>

/**
 * Builds a synthetic hook input object for testing. Contains realistic placeholder values
 * for all fields the hook event expects (e.g. `tool_name` and `tool_input` for tool events,
 * `prompt` for UserPromptSubmit, `model` and `source` for SessionStart).
 *
 * @param eventName - Hook event name (e.g. `"PreToolUse"`, `"SessionStart"`)
 * @param overrides - Optional fields to merge into (and override) the synthetic input
 *
 * @example
 * ```js
 * const input = buildSyntheticInput("PreToolUse", { tool_name: "Write" })
 * // { hook_event_name: "PreToolUse", tool_name: "Write", tool_input: { command: "echo test" }, ... }
 * ```
 */
export declare function buildSyntheticInput(
  eventName: string,
  overrides?: Record<string, unknown>,
): Record<string, unknown>

/**
 * Discovers all Claude Code skills available for the given project directories.
 *
 * Resolution algorithm (mirrors the `skills()` shell function):
 * 1. For each provided directory, look for `<dir>/.claude/skills/`
 * 2. If `recursive` is true, walk up parent directories for additional `.claude/skills/` dirs
 * 3. Always include `~/.claude/skills/` (user-level skills)
 * 4. If `includePlugins` is true, include skills from installed Claude Code plugins
 *
 * @param dirs - Absolute path(s) to project directories
 * @param options - Discovery options
 * @returns Map of absolute SKILL.md paths to parsed skill definition objects
 *
 * @example
 * ```js
 * const skills = discoverSkills("/path/to/project", { recursive: true, includePlugins: true })
 * for (const [path, skill] of Object.entries(skills)) {
 *   console.log(skill.name, Object.keys(skill.references).length, "references")
 * }
 * ```
 */
export declare function discoverSkills(
  dirs: string | string[],
  options?: import("./api-types.d.mts").DiscoverSkillsOptions,
): Record<string, import("./api-types.d.mts").SkillDefinition>

/**
 * Parses YAML-like frontmatter from a SKILL.md file's raw contents.
 * Returns the parsed frontmatter (with known boolean fields coerced) and the remaining markdown body.
 * Known boolean fields (`disable-model-invocation`, `user-invocable`) are parsed as `true`/`false`.
 */
export declare function parseFrontmatter(raw: string): {
  frontmatter: import("./api-types.d.mts").SkillFrontmatter
  contents: string
}

/**
 * Validates a skill frontmatter object against the known Claude Code skill schema.
 * `name` and `description` are required fields. Returns errors for missing/invalid fields
 * and warnings for unrecognized keys.
 *
 * @param frontmatter - The frontmatter object to validate
 * @param options - Pass `extraProperties` to suppress warnings for custom keys
 *
 * @example
 * ```js
 * const result = validateSkillFrontmatter({ name: "my-skill" })
 * // result.success === false
 * // result.errors === { description: "missing" }
 * ```
 */
export declare function validateSkillFrontmatter(
  frontmatter: Record<string, unknown>,
  options?: import("./api-types.d.mts").ValidateSkillOptions,
): import("./api-types.d.mts").ValidateSkillResult

/** Zod schema for validating skill frontmatter. `name` and `description` are required. */
export declare const SkillFrontmatterSchema: import("zod/v4").z.ZodObject<any>

export { ClaudeHooks } from "./api-types.d.mts"
