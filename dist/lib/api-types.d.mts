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

/** A reference file within a skill directory (any file other than SKILL.md). */
export interface SkillReference {
  /** Absolute path to the reference file on disk. */
  path: string
  /** Filename (e.g. `"animations.md"`, `"config.json"`). */
  name: string
  /** File contents as a UTF-8 string. */
  contents: string
}

/**
 * Parsed YAML frontmatter from a SKILL.md file. Known Claude Code skill
 * properties are typed explicitly; additional custom fields are captured
 * via the index signature.
 *
 * @see https://code.claude.com/docs/en/skills
 */
export interface SkillFrontmatter {
  /** Skill name as shown in the UI and used for `/skill-name` invocation. */
  name?: string
  /** Human-readable description of when and how to use this skill. */
  description?: string
  /** When `true`, the skill must be explicitly invoked by the user via `/command`. Claude cannot trigger it autonomously. */
  "disable-model-invocation"?: boolean
  /** Hint shown during autocomplete to indicate expected arguments (e.g. `"[issue-number]"`, `"[filename] [format]"`). */
  "argument-hint"?: string
  /** When `false`, hides the `/command` for this skill from the UI. Defaults to `true`. */
  "user-invocable"?: boolean
  /** Comma-separated list of tools the skill is allowed to use, or `"..."` for all tools. */
  "allowed-tools"?: string
  /** Effort level for skill execution. */
  effort?: "low" | "medium" | "high" | "max" | "auto"
  /** Model to use for this skill. `"opusplan"` uses Opus for planning + Sonnet for execution. */
  model?: "opus" | "sonnet" | "haiku" | "inherit" | "sonnet[1m]" | "opus[1m]" | "opusplan"
  /** Execution context. `"fork"` runs the skill in a forked conversation context. */
  context?: "fork"
  /** Agent type to use for skill execution (e.g. `"Explore"`, `"Plan"`, `"general-purpose"`). */
  agent?: string
  /** License information for the skill. */
  license?: string
  /** Any additional custom frontmatter fields. */
  [key: string]: string | boolean | undefined
}

/**
 * A parsed Claude Code skill definition. Represents a single skill directory
 * containing a `SKILL.md` file and optional reference files.
 */
export interface SkillDefinition {
  /** Absolute path to the `SKILL.md` file on disk. */
  path: string
  /** Skill name (from frontmatter `name` field, or directory name as fallback). */
  name: string
  /** Plugin name if this is a plugin skill (e.g. `"superpowers"`), `undefined` for local/user skills. */
  pluginName: string | undefined
  /** Parsed frontmatter with typed known fields and an index signature for custom fields. */
  frontmatter: SkillFrontmatter
  /** The markdown content below the frontmatter delimiter. */
  contents: string
  /** Map of absolute file paths to reference file objects. Includes all non-hidden files in the skill directory except `SKILL.md`. */
  references: Record<string, SkillReference>
}

/**
 * Options for {@link discoverSkills}.
 */
export interface DiscoverSkillsOptions {
  /** When `true`, walks up parent directories from each provided path looking for additional `.claude/skills/` directories. Always includes `~/.claude/skills/`. */
  recursive?: boolean
  /** When `true`, includes skills from installed Claude Code plugins (reads `~/.claude/plugins/installed_plugins.json`). */
  includePlugins?: boolean
}

/**
 * Options for {@link validateSkillFrontmatter}.
 */
export interface ValidateSkillOptions {
  /** Additional property names to treat as known. Suppresses warnings for these keys. */
  extraProperties?: string[]
}

/**
 * Result from {@link validateSkillFrontmatter}.
 */
export interface ValidateSkillResult {
  /** `true` when there are no errors (warnings do not affect success). */
  success: boolean
  /** Map of unrecognized frontmatter keys to warning messages. */
  warnings: Record<string, string>
  /** Map of missing or invalid frontmatter keys to error messages (e.g. `"missing"` for required fields). */
  errors: Record<string, string>
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
 * Directory-scoped API for managing Claude Code hooks and skills.
 * All instance methods operate on the directory passed to the constructor.
 *
 * @example
 * ```js
 * import { ClaudeProject } from "@obibring/claude-hooks-cli/api"
 *
 * const hooks = new ClaudeProject("/path/to/my-project")
 * await hooks.install({ event: "PreToolUse", type: "command", command: "echo" })
 * const { hooks: entries } = await hooks.getHooks()
 * ```
 */
export declare class ClaudeProject {
  /**
   * @param dir - Absolute path to the project directory. Must exist and be a directory.
   * @throws {Error} If the path does not exist or is not a directory.
   */
  constructor(dir: string)

  /** The absolute path to the project directory this instance operates on. */
  readonly dir: string
  /** The resolved path to `.claude/settings.json` for this project. */
  readonly settingsPath: string

  /**
   * Returns `true` if this project directory has a `.claude` directory.
   */
  hasClaudeDirectory(): boolean

  // ---- Hook config building ----

  /**
   * Builds a validated hook config entry from explicit options.
   * Does NOT write to disk — use `install()` to persist.
   * @throws {Error} If the event name, handler type, or required fields are invalid.
   */
  addHookConfig(options: AddHookOptions): AddHookResult

  /**
   * Builds a hook command string for running a script file, using the same format
   * as the CLI's interactive "Add a hook" flow.
   * @param runner - `"node"` for JavaScript, `"tsx"` for TypeScript
   * @param filePath - Path to the script (absolute or relative to project root)
   * @throws {Error} If runner is invalid or filePath is empty.
   */
  buildHookCommand(runner: "node" | "tsx", filePath: string): string

  // ---- Hook management ----

  /**
   * Returns all hook entries from this project's `.claude/settings.json`.
   */
  getHooks(): Promise<{ filePath: string; hooks: HookEntry[] }>

  /**
   * Validates and saves a hook configuration to this project's `.claude/settings.json`.
   * Creates the `.claude` directory if it does not exist.
   * @throws {Error} If validation fails (the settings file is not modified).
   */
  install(options: AddHookOptions): Promise<InstallHookResult>

  /**
   * Removes a hook from this project's `.claude/settings.json` by event name and index.
   * Returns `{ removed: false }` if the event or index is not found.
   */
  uninstall(eventName: string, index: number): Promise<UninstallHookResult>

  // ---- Testing ----

  /**
   * Tests a single hook handler by spawning it as a child process with synthetic or custom input.
   * Only `type: "command"` handlers can be tested locally.
   */
  test(options: TestHookOptions): Promise<TestHookResult>

  /**
   * Builds a synthetic hook input object for testing.
   * @param eventName - Hook event name (e.g. `"PreToolUse"`)
   * @param overrides - Optional fields to merge/override in the synthetic input
   */
  buildSyntheticInput(
    eventName: string,
    overrides?: Record<string, unknown>,
  ): Record<string, unknown>

  // ---- Docs ----

  /** Returns markdown documentation for a hook event, or `null` if unknown. */
  getDocs(eventName: string): string | null

  /** Returns all event names that have documentation. */
  getAvailableDocs(): string[]

  // ---- Scaffolding ----

  /**
   * Creates a hook script file with a starter template.
   * Returns `{ created: false }` if the file already exists and `overwrite` is not set.
   */
  scaffold(options: ScaffoldOptions): Promise<ScaffoldResult>

  // ---- Skills ----

  /**
   * Discovers all skills available for this project directory.
   * Always includes `~/.claude/skills/`. Optionally walks parent directories and includes plugins.
   */
  discoverSkills(options?: DiscoverSkillsOptions): Record<string, SkillDefinition>

  /**
   * Validates a skill frontmatter object. Returns errors for missing/invalid fields
   * and warnings for unrecognized keys.
   */
  validateSkillFrontmatter(
    frontmatter: Record<string, unknown>,
    options?: ValidateSkillOptions,
  ): ValidateSkillResult

  // ---- Static ----

  /** Zod schema for validating skill frontmatter. `name` and `description` are required. */
  static SkillFrontmatterSchema: import("zod/v4").z.ZodObject<any>

  /** Hook metadata registry: events, handler types, event names. */
  static metadata: ClaudeHooksMetadata
}
