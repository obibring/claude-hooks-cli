import type { SettingsScope } from "./settings-io.mjs"
import type { HookEntry } from "./hooks-store.mjs"

/** Metadata describing a single Claude Code hook event's capabilities and constraints. */
export interface HookMeta {
  /** Hook event name (e.g. `"PreToolUse"`, `"SessionStart"`). */
  name: string
  /** Short human-readable description of when this hook fires. */
  description: string
  /** Handler types supported by this event (e.g. `["command", "prompt", "agent", "http"]`). */
  handlerTypes: ("command" | "prompt" | "agent" | "http")[]
  /** Whether this hook supports a `matcher` field to filter which events trigger it. */
  hasMatcher: boolean
  /** Whether the matcher is required (true only for `FileChanged`). */
  matcherRequired: boolean
  /** The input field that the matcher matches against (e.g. `"tool_name"`, `"source"`), or `null` if no matcher. */
  matcherField: string | null
  /** Human-readable description of what the matcher matches, or `null` if no matcher. */
  matcherDescription: string | null
  /** Fixed enum values for the matcher (e.g. `["manual", "auto"]` for PreCompact), or `null` if the matcher is free-form/regex. */
  matcherValues: string[] | null
  /** Whether the hook supports the `once` option (fire only once per session). */
  supportsOnce: boolean
  /** Whether the hook supports the `if` conditional (only evaluated on tool events). */
  supportsIf: boolean
  /** Default timeout in milliseconds (typically 5000, but 30000 for Setup). */
  defaultTimeout: number
  /** Whether this hook requires an experimental feature flag to be enabled. */
  experimental: boolean
  /** Environment variable needed for experimental hooks (e.g. `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"`), or `null`. */
  experimentalFlag: string | null
}

/** Describes a handler type's label, description, and required fields for the CLI. */
export interface HandlerTypeInfo {
  /** Display label (e.g. `"Command"`, `"Prompt"`). */
  label: string
  /** Human-readable description of how this handler type works. */
  description: string
  /** Fields that must be provided (e.g. `["command"]` for command handlers, `["url"]` for http). */
  requiredFields: string[]
}

/**
 * Options for building a hook configuration entry.
 *
 * @example
 * ```js
 * addHookConfig({
 *   event: "PreToolUse",
 *   type: "command",
 *   command: "node ./hooks/check-bash.mjs",
 *   matcher: "Bash",
 *   timeout: 10000,
 * })
 * ```
 */
export interface AddHookOptions {
  /** Hook event name (e.g. `"PreToolUse"`, `"Stop"`, `"SessionStart"`). Must be one of the 26 valid event names. */
  event: string
  /** Handler type. Determines which primary field is required (`command`, `prompt`, or `url`). */
  type: "command" | "prompt" | "agent" | "http"
  /** Shell command to run. Required when `type` is `"command"`. Bare file paths are auto-wrapped with the appropriate runner (e.g. `npx tsx` for `.ts`). */
  command?: string
  /** Prompt text sent to Claude. Required when `type` is `"prompt"` or `"agent"`. For prompt handlers, a JSON response format suffix is appended by default (see `autoPromptSuffix`). */
  prompt?: string
  /** URL to POST hook JSON to. Required when `type` is `"http"`. Routed through Claude Code's sandbox proxy. */
  url?: string
  /** Matcher pattern to filter which events trigger this hook. The pattern meaning depends on the event (e.g. regex for `tool_name`, pipe-separated basenames for `FileChanged`). */
  matcher?: string
  /** Maximum execution time in milliseconds. Overrides the event's default timeout (typically 5000ms). */
  timeout?: number
  /** When `true`, the hook runs in the background without blocking Claude Code. */
  async?: boolean
  /** When `true`, runs async but wakes the model if the hook exits with code 2 (blocking error). */
  asyncRewake?: boolean
  /** When `true`, the hook fires only once per session. Only effective on events that support `once` (e.g. `SessionStart`, `SessionEnd`). */
  once?: boolean
  /** Custom message shown in the Claude Code spinner while the hook is running. */
  statusMessage?: string
  /** Conditional execution rule using permission rule syntax (e.g. `"Bash(git *)"`, `"Edit(*.ts)"`). Only evaluated on tool events (`PreToolUse`, `PostToolUse`, etc.). */
  if?: string
  /** Model to use for prompt handlers (e.g. `"claude-haiku-4-5-20251001"`). Only used when `type` is `"prompt"`. */
  model?: string
  /** HTTP headers to include in the request. Values support `$ENV_VAR` interpolation. Only used when `type` is `"http"`. */
  headers?: Record<string, string>
  /** Environment variable names allowed for `$VAR` interpolation in HTTP headers. Only used when `type` is `"http"`. */
  allowedEnvVars?: string[]
  /**
   * Whether to auto-append JSON response format instructions to prompt hooks.
   * Defaults to `true`. Set to `false` if your prompt already includes its own response format instructions.
   * Only applies when `type` is `"prompt"`.
   */
  autoPromptSuffix?: boolean
}

/** Result from {@link addHookConfig}. Contains the validated hook configuration ready to be persisted. */
export interface AddHookResult {
  /** The validated hook event name. */
  eventName: string
  /** The complete configuration entry, ready to be added to `settings.hooks[eventName]`. */
  configEntry: {
    /** Matcher pattern, if one was provided. */
    matcher?: string
    /** Array of handler objects (always exactly one element from `addHookConfig`). */
    hooks: Array<Record<string, unknown>>
  }
}

/**
 * Specifies where to persist hook changes. Provide either `filePath` for direct file access,
 * or `scope` to use Claude Code's standard settings resolution.
 *
 * @example
 * ```js
 * // By scope (resolves to the correct settings.json)
 * { scope: "project" }
 *
 * // By direct file path
 * { filePath: "/path/to/.claude/settings.json" }
 * ```
 */
export interface PersistTarget {
  /** Direct path to a settings JSON file. When provided, takes precedence over `scope`. */
  filePath?: string
  /** Settings scope: `"user"` (~/.claude/settings.json), `"project"` (.claude/settings.json), or `"local"` (.claude/settings.local.json). Defaults to `"project"`. */
  scope?: SettingsScope
}

/** Result from {@link installHook}. */
export interface InstallHookResult {
  /** Absolute path to the settings file that was written. */
  filePath: string
  /** The hook event name that was installed. */
  eventName: string
  /** The configuration entry that was added to the settings file. */
  configEntry: object
}

/** Result from {@link uninstallHook}. */
export interface UninstallHookResult {
  /** Absolute path to the settings file that was (or would have been) modified. */
  filePath: string
  /** `true` if the hook was found and removed, `false` if the event/index was not found. */
  removed: boolean
}

/**
 * Options for testing a hook handler by running it locally with synthetic input.
 *
 * @example
 * ```js
 * testHook({
 *   event: "PreToolUse",
 *   handler: { type: "command", command: "node ./hooks/my-hook.mjs" },
 *   env: { MY_TOKEN: "test-value" },
 *   timeout: 5000,
 * })
 * ```
 */
export interface TestHookOptions {
  /** Hook event name. Used to build synthetic input if `input` is not provided. */
  event: string
  /** The handler object to test (typically from `configEntry.hooks[0]`). Only `type: "command"` handlers can be tested locally. */
  handler: Record<string, unknown>
  /** Custom input object piped to the handler's stdin as JSON. When omitted, synthetic input is generated based on the event name. */
  input?: Record<string, unknown>
  /** Additional environment variables set in the handler's process. Merged with the current `process.env`. */
  env?: Record<string, string>
  /** Maximum execution time in milliseconds. The handler process is killed with SIGTERM if exceeded. */
  timeout?: number
}

/** Result from {@link testHook}. */
export interface TestHookResult {
  /** Process exit code. `0` for success, `2` for blocking error, `-1` if skipped. */
  exitCode: number
  /** Everything the handler wrote to stdout (typically JSON output for Claude Code). */
  stdout: string
  /** Everything the handler wrote to stderr (typically diagnostic/debug messages). */
  stderr: string
  /** `true` when the handler was not executed (e.g. non-command handler types). Check `reason` for details. */
  skipped?: boolean
  /** Human-readable explanation of why the handler was skipped. */
  reason?: string
}

/**
 * Options for scaffolding a new hook script file with a starter template.
 *
 * @example
 * ```js
 * scaffoldHookFile({
 *   event: "PreToolUse",
 *   filePath: "./hooks/check-bash.ts",
 * })
 * ```
 */
export interface ScaffoldOptions {
  /** Hook event name. Used to generate a template with `HookHandler.for("EventName")`. */
  event: string
  /** Path for the new hook script file. The extension determines the template language and runner (`.ts`, `.mjs`, `.py`, `.sh`, etc.). */
  filePath: string
  /** When `true`, overwrites an existing file. Defaults to `false` (returns `created: false` if the file exists). */
  overwrite?: boolean
}

/** Result from {@link scaffoldHookFile}. */
export interface ScaffoldResult {
  /** `true` if a new file was written, `false` if the file already existed and `overwrite` was not set. */
  created: boolean
  /** Absolute resolved path to the hook script file. */
  filePath: string
  /** The shell command to invoke this file (e.g. `'npx tsx "/path/to/hook.ts"'`). Use this as the `command` value in hook config. */
  runnerCommand: string
}

/**
 * Hook metadata accessors. Provides read-only access to the registry of all 26 Claude Code hook events
 * and their capabilities.
 */
export interface ClaudeHooksMetadata {
  /** Array of all 26 hook event metadata objects. */
  events: HookMeta[]
  /** Looks up metadata for a specific hook event by name. Returns `undefined` if the event name is unknown. */
  getEvent: (name: string) => HookMeta | undefined
  /** Array of all valid hook event names (e.g. `["PreToolUse", "PostToolUse", ...]`). */
  eventNames: string[]
  /** Map of handler type names to their descriptions and required fields. Keys: `"command"`, `"prompt"`, `"agent"`, `"http"`. */
  handlerTypes: Record<string, HandlerTypeInfo>
}

/**
 * Low-level settings file I/O. Read and write Claude Code `settings.json` files directly.
 */
export interface ClaudeHooksSettings {
  /**
   * Resolves the absolute path to a settings file for the given scope.
   * - `"user"` → `~/.claude/settings.json`
   * - `"project"` → `<git-root>/.claude/settings.json`
   * - `"local"` → `<git-root>/.claude/settings.local.json`
   */
  getPath: (scope: SettingsScope) => string
  /** Reads and JSON-parses a settings file. Returns `{}` if the file does not exist. */
  read: (filePath: string) => Promise<Record<string, unknown>>
  /** Writes a settings object to a JSON file with 2-space indent. Creates parent directories if needed. */
  write: (filePath: string, settings: Record<string, unknown>) => Promise<void>
}

/**
 * The main programmatic API facade for claude-hooks-cli.
 * Groups all operations into a single importable object.
 *
 * @example
 * ```js
 * import { claudeHooks } from "@obibring/claude-hooks-cli/api"
 *
 * // Install a hook
 * await claudeHooks.install({
 *   event: "PreToolUse",
 *   type: "command",
 *   command: "node ./hooks/check-bash.mjs",
 *   matcher: "Bash",
 * }, { scope: "project" })
 *
 * // List all hooks
 * const { hooks } = await claudeHooks.list("project")
 *
 * // Test a hook
 * const result = await claudeHooks.test({
 *   event: "PreToolUse",
 *   handler: hooks[0].entry.hooks[0],
 * })
 * ```
 */
export interface ClaudeHooks {
  /**
   * Builds a validated hook configuration entry from explicit options.
   * Does NOT write to disk — pass the result to `install()` or use with the `saveHook()` function to persist.
   * @throws {Error} If the event name, handler type, or required fields are invalid.
   */
  addHookConfig: (options: AddHookOptions) => AddHookResult

  /**
   * Builds a hook command string for running a script file, using the same format
   * as the CLI's interactive "Add a hook" flow. Relative paths are prefixed with
   * `$CLAUDE_PROJECT_DIR` so the hook resolves correctly at runtime.
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
  buildHookCommand: (runner: "node" | "tsx", filePath: string) => string

  /**
   * Builds and saves a hook configuration in one call.
   * Validates options via `addHookConfig()`, then writes to the target settings file.
   * @throws {Error} If validation fails (file is not modified on validation errors).
   */
  install: (options: AddHookOptions, target?: PersistTarget) => Promise<InstallHookResult>

  /**
   * Removes a hook from a settings file by event name and array index.
   * Returns `{ removed: false }` if the event or index is not found (file is not modified).
   */
  uninstall: (
    eventName: string,
    index: number,
    target?: PersistTarget,
  ) => Promise<UninstallHookResult>

  /**
   * Returns all hook entries configured in the given scope's settings file.
   * The programmatic equivalent of `claude-hooks list`.
   */
  list: (scope: SettingsScope) => Promise<{ filePath: string; hooks: HookEntry[] }>

  /**
   * Returns all hook entries from a project directory's `.claude/settings.json`.
   * Unlike `list()`, this takes an absolute path to the project root directory
   * rather than relying on git root detection or scope resolution.
   *
   * @param projectDir - Absolute path to the project root directory
   *
   * @example
   * ```js
   * const { hooks } = await claudeHooks.getHooksForProjectDir("/path/to/my-project")
   * ```
   */
  getHooksForProjectDir: (
    projectDir: string,
  ) => Promise<{ filePath: string; hooks: HookEntry[] }>

  /**
   * Validates and saves a hook configuration to a project directory's `.claude/settings.json`.
   * Unlike `install()`, this takes an absolute path to the project root directory
   * rather than relying on git root detection or scope resolution.
   *
   * @param projectDir - Absolute path to the project root directory
   * @param options - Hook configuration options (same as `addHookConfig()`)
   * @throws {Error} If validation fails (the settings file is not modified on validation errors).
   *
   * @example
   * ```js
   * await claudeHooks.saveHookToProjectDir("/path/to/my-project", {
   *   event: "PreToolUse",
   *   type: "command",
   *   command: "node ./hooks/check.mjs",
   * })
   * ```
   */
  saveHookToProjectDir: (
    projectDir: string,
    options: AddHookOptions,
  ) => Promise<InstallHookResult>

  /**
   * Removes a hook from a project directory's `.claude/settings.json` by event name and index.
   * Unlike `uninstall()`, this takes an absolute path to the project root directory
   * rather than relying on git root detection or scope resolution.
   *
   * @param projectDir - Absolute path to the project root directory
   * @param eventName - Hook event name (e.g. `"PreToolUse"`)
   * @param index - Index of the hook entry within the event's array
   */
  removeHookFromProjectDir: (
    projectDir: string,
    eventName: string,
    index: number,
  ) => Promise<UninstallHookResult>

  /**
   * Tests a single hook handler by spawning it as a child process with synthetic (or custom) input on stdin.
   * Only `type: "command"` handlers can be tested locally — other types return `{ skipped: true }`.
   */
  test: (options: TestHookOptions) => Promise<TestHookResult>

  /**
   * Builds a synthetic hook input object for testing. Contains realistic placeholder values
   * for all fields the hook event expects (e.g. `tool_name`, `tool_input` for tool events).
   * @param eventName - Hook event name (e.g. `"PreToolUse"`)
   * @param overrides - Optional fields to merge/override in the synthetic input
   */
  buildSyntheticInput: (
    eventName: string,
    overrides?: Record<string, unknown>,
  ) => Record<string, unknown>

  /**
   * Returns the markdown documentation for a hook event, or `null` if the event name is unknown.
   * The markdown includes Config, Input, Output sections with field tables and TypeScript examples.
   */
  getDocs: (eventName: string) => string | null

  /**
   * Returns an array of all hook event names that have documentation available.
   * Equivalent to `Object.keys(HOOK_DOCS_MAP)`.
   */
  getAvailableDocs: () => string[]

  /**
   * Creates a hook script file with a starter template that includes `HookHandler.for("EventName")`.
   * For JS/TS files, generates a typed template. For other languages (.py, .sh), generates a basic stdin-reading template.
   * Returns `{ created: false }` if the file already exists and `overwrite` is not set.
   */
  scaffold: (options: ScaffoldOptions) => Promise<ScaffoldResult>

  /** Hook metadata: event definitions, handler types, and event names. */
  metadata: ClaudeHooksMetadata

  /** Low-level settings file I/O for reading and writing Claude Code settings.json files. */
  settings: ClaudeHooksSettings
}
