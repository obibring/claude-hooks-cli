import type {
  HookIOMap,
  ToolInputMap,
  BaseHookOutput,
  PreToolUseOutput,
  PermissionRequestOutput,
  PostToolUseOutput,
  PostToolUseFailureOutput,
  UserPromptSubmitOutput,
  NotificationOutput,
  StopOutput,
  SubagentStartOutput,
  SubagentStopOutput,
  PreCompactOutput,
  PostCompactOutput,
  SessionStartOutput,
  SessionEndOutput,
  SetupOutput,
  TeammateIdleOutput,
  TaskCreatedOutput,
  TaskCompletedOutput,
  ConfigChangeOutput,
  WorktreeCreateOutput,
  WorktreeRemoveOutput,
  InstructionsLoadedOutput,
  ElicitationOutput,
  ElicitationResultOutput,
  StopFailureOutput,
  CwdChangedOutput,
  FileChangedOutput,
} from "../handler-types.d.mts"

// ---- Env var types per hook category ----

/** Env vars available to all hooks. */
type BaseEnvVars =
  | "CLAUDE_PROJECT_DIR"
  | "CLAUDE_CODE_REMOTE"
  | "CLAUDE_PLUGIN_ROOT"
  | "CLAUDE_SKILL_DIR"
  | "CLAUDE_PLUGIN_DATA"
  | "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS"

/** Env vars available to SessionStart, CwdChanged, FileChanged (includes CLAUDE_ENV_FILE). */
type EnvFileEnvVars = BaseEnvVars | "CLAUDE_ENV_FILE"

/**
 * Options for env-file hook handlers (SessionStart, CwdChanged, FileChanged).
 * Allows injecting custom file I/O functions for testing or custom environments.
 */
export interface EnvFileHandlerOptions {
  /** Custom function to read a file. If provided, used instead of node:fs readFileSync when reading the env file. */
  readFile?: (filename: string) => string
  /** Custom function to write a file. */
  writeFile?: (filename: string, contents: string, options: { encoding: "utf-8" }) => void
}

// ---- Base handler interface (shared methods) ----

/** Base interface for non-tool, non-env-file hooks. */
interface BaseHandler<E extends keyof HookIOMap> {
  /** The hook event name this handler is bound to. */
  readonly event: E

  /**
   * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
   * Results are cached — can be called multiple times without performance penalty.
   */
  parseInput(): HookIOMap[E]["input"]

  /**
   * Reads a Claude Code environment variable by name.
   * Only accepts env var names available to this hook event.
   *
   * Available variables:
   *
   * - `CLAUDE_PROJECT_DIR` — Project root directory. Available to **all hooks**.
   *   Always set. Wrap in quotes for paths with spaces.
   *
   * - `CLAUDE_PLUGIN_ROOT` — Plugin's root directory, for scripts bundled with
   *   a plugin. **Only available in plugin hooks.** Not set in project or user hooks.
   *
   * - `CLAUDE_CODE_REMOTE` — Set to `"true"` when running in remote web
   *   environments (e.g. claude.ai/code). **Not set in local CLI sessions.**
   *   Check for `=== "true"` rather than truthiness.
   *
   * - `CLAUDE_SKILL_DIR` — Skill's own directory, for scripts bundled with a
   *   skill. **Only available in skill hooks.** Since v2.1.69.
   *
   * - `CLAUDE_PLUGIN_DATA` — Plugin's persistent data directory that survives
   *   plugin updates. **Only available in plugin hooks.** Since v2.1.78.
   *
   * - `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` — Override SessionEnd hook
   *   timeout in milliseconds. Prior to v2.1.74, SessionEnd hooks were killed
   *   after 1.5s regardless of configured timeout. Now respects the hook's
   *   `timeout` value, or this env var if set. Since v2.1.74.
   */
  getEnv(name: BaseEnvVars): string | undefined

  /**
   * Exits the hook script. Code after this call is unreachable.
   *
   * - `exit("success")` — pass through, no output (exit code 0)
   * - `exit("success", output)` — write JSON output to stdout (exit code 0)
   * - `exit("error", message)` — write error to stderr, fed back to model (exit code 2)
   */
  exit(status: "success"): never
  exit(status: "success", output: HookIOMap[E]["output"]): never
  exit(status: "error", message: string): never
}

/** Handler with CLAUDE_ENV_FILE access and getEnvFileVars(). */
interface EnvFileHandler<E extends keyof HookIOMap> extends Omit<
  BaseHandler<E>,
  "getEnv"
> {
  /**
   * Reads a Claude Code environment variable by name.
   * This hook event has access to CLAUDE_ENV_FILE in addition to the base variables.
   *
   * Available variables:
   *
   * - `CLAUDE_PROJECT_DIR` — Project root directory. Available to **all hooks**.
   *   Always set. Wrap in quotes for paths with spaces.
   *
   * - `CLAUDE_ENV_FILE` — File path for persisting environment variables for
   *   subsequent Bash commands. Use append (`>>`) to preserve variables from
   *   other hooks. **Only available in SessionStart, CwdChanged, and FileChanged hooks.**
   *
   * - `CLAUDE_PLUGIN_ROOT` — Plugin's root directory, for scripts bundled with
   *   a plugin. **Only available in plugin hooks.** Not set in project or user hooks.
   *
   * - `CLAUDE_CODE_REMOTE` — Set to `"true"` when running in remote web
   *   environments (e.g. claude.ai/code). **Not set in local CLI sessions.**
   *   Check for `=== "true"` rather than truthiness.
   *
   * - `CLAUDE_SKILL_DIR` — Skill's own directory, for scripts bundled with a
   *   skill. **Only available in skill hooks.** Since v2.1.69.
   *
   * - `CLAUDE_PLUGIN_DATA` — Plugin's persistent data directory that survives
   *   plugin updates. **Only available in plugin hooks.** Since v2.1.78.
   *
   * - `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` — Override SessionEnd hook
   *   timeout in milliseconds. Prior to v2.1.74, SessionEnd hooks were killed
   *   after 1.5s regardless of configured timeout. Now respects the hook's
   *   `timeout` value, or this env var if set. Since v2.1.74.
   */
  getEnv(name: EnvFileEnvVars): string | undefined

  /**
   * Reads and parses the CLAUDE_ENV_FILE into a key-value object.
   *
   * Only available for SessionStart, CwdChanged, and FileChanged hooks — these
   * are the only events where Claude Code sets the CLAUDE_ENV_FILE env var.
   *
   * Parses the file by splitting lines, stripping comments (`#` and inline `#`),
   * extracting `VAR_NAME=value` pairs, and unwrapping matched quotes from values.
   * Subsequent lines with the same key override earlier ones.
   *
   * Results are cached — call multiple times without performance penalty.
   * Pass `{ force: true }` to re-read the file from disk (result is still
   * cached for subsequent non-force calls).
   *
   * Returns an empty object if CLAUDE_ENV_FILE is not set or the file doesn't exist.
   *
   * @example
   * ```ts
   * const handler = HookHandler.for("SessionStart")
   * const vars = handler.getEnvFileVars()
   * console.log(vars.MY_VAR) // string or undefined
   *
   * // Force re-read from disk:
   * const fresh = handler.getEnvFileVars({ force: true })
   * ```
   */
  getEnvFileVars(options?: { force?: boolean }): Record<string, string>

  /**
   * Writes all environment variables to the CLAUDE_ENV_FILE, replacing its contents.
   *
   * Only available for SessionStart, CwdChanged, and FileChanged hooks.
   * Uses the custom `writeFile` function from constructor options if provided,
   * otherwise uses node:fs writeFileSync.
   *
   * Invalidates the cached env file vars so subsequent `getEnvFileVars()` calls
   * re-read from disk.
   *
   * @example
   * ```ts
   * const handler = HookHandler.for("SessionStart")
   * handler.writeEnvFile({ MY_VAR: "hello", OTHER: "world" })
   * // CLAUDE_ENV_FILE now contains:
   * // MY_VAR=hello
   * // OTHER=world
   * ```
   */
  writeEnvFile(vars: Record<string, string>): void

  /**
   * Appends a single environment variable to the CLAUDE_ENV_FILE.
   *
   * Only available for SessionStart, CwdChanged, and FileChanged hooks.
   * Uses the custom `writeFile` function from constructor options if provided
   * (reads existing content first, then writes the full content with the appended var),
   * otherwise uses node:fs appendFileSync.
   *
   * Invalidates the cached env file vars so subsequent `getEnvFileVars()` calls
   * re-read from disk.
   *
   * @example
   * ```ts
   * const handler = HookHandler.for("SessionStart")
   * handler.appendToEnvFile("MY_VAR", "hello")
   * handler.appendToEnvFile("OTHER", "world")
   * ```
   */
  appendToEnvFile(variableName: string, value: string): void
}

/** Handler with getToolInput() for tool event hooks. */
interface ToolEventHandler<E extends keyof HookIOMap> extends BaseHandler<E> {
  /**
   * Returns the strongly-typed tool_input if `input.tool_name` matches, or `null` if not.
   *
   * @example
   * ```ts
   * const bash = handler.getToolInput("Bash", input)
   * if (bash) {
   *   console.log(bash.command) // typed as string
   * }
   * ```
   */
  getToolInput<T extends keyof ToolInputMap>(
    toolName: T,
    input: HookIOMap[E]["input"],
  ): ToolInputMap[T] | null
}

// ---- Per-hook handler interfaces ----

// Tool event hooks (have getToolInput)
export interface PreToolUseHookHandler extends ToolEventHandler<"PreToolUse"> {}
export interface PermissionRequestHookHandler extends ToolEventHandler<"PermissionRequest"> {}
export interface PostToolUseHookHandler extends ToolEventHandler<"PostToolUse"> {}
export interface PostToolUseFailureHookHandler extends ToolEventHandler<"PostToolUseFailure"> {}

// All-handler hooks (no getToolInput, no CLAUDE_ENV_FILE)
export interface UserPromptSubmitHookHandler extends BaseHandler<"UserPromptSubmit"> {}
export interface StopHookHandler extends BaseHandler<"Stop"> {}
export interface SubagentStopHookHandler extends BaseHandler<"SubagentStop"> {}
export interface TaskCreatedHookHandler extends BaseHandler<"TaskCreated"> {}
export interface TaskCompletedHookHandler extends BaseHandler<"TaskCompleted"> {}

// Command+HTTP hooks (no getToolInput, no CLAUDE_ENV_FILE)
export interface NotificationHookHandler extends BaseHandler<"Notification"> {}
export interface SubagentStartHookHandler extends BaseHandler<"SubagentStart"> {}
export interface PostCompactHookHandler extends BaseHandler<"PostCompact"> {}
export interface StopFailureHookHandler extends BaseHandler<"StopFailure"> {}
export interface ConfigChangeHookHandler extends BaseHandler<"ConfigChange"> {}
export interface WorktreeCreateHookHandler extends BaseHandler<"WorktreeCreate"> {}
export interface WorktreeRemoveHookHandler extends BaseHandler<"WorktreeRemove"> {}
export interface InstructionsLoadedHookHandler extends BaseHandler<"InstructionsLoaded"> {}
export interface ElicitationHookHandler extends BaseHandler<"Elicitation"> {}
export interface ElicitationResultHookHandler extends BaseHandler<"ElicitationResult"> {}
export interface TeammateIdleHookHandler extends BaseHandler<"TeammateIdle"> {}
export interface SetupHookHandler extends BaseHandler<"Setup"> {}

// Command+HTTP hooks with CLAUDE_ENV_FILE access
export interface SessionStartHookHandler extends EnvFileHandler<"SessionStart"> {}
export interface CwdChangedHookHandler extends EnvFileHandler<"CwdChanged"> {}
export interface FileChangedHookHandler extends EnvFileHandler<"FileChanged"> {}

// Command+HTTP hooks (no CLAUDE_ENV_FILE)
export interface SessionEndHookHandler extends BaseHandler<"SessionEnd"> {}
export interface PreCompactHookHandler extends BaseHandler<"PreCompact"> {}

// ---- Handler map: event name → handler type ----

/**
 * Maps each hook event name to the options type accepted by HookHandler.for().
 * Only env-file hooks (SessionStart, CwdChanged, FileChanged) accept options.
 */
export interface HookHandlerOptionsMap {
  PreToolUse: never
  PermissionRequest: never
  PostToolUse: never
  PostToolUseFailure: never
  UserPromptSubmit: never
  Notification: never
  Stop: never
  SubagentStart: never
  SubagentStop: never
  PreCompact: never
  PostCompact: never
  SessionStart: EnvFileHandlerOptions
  SessionEnd: never
  Setup: never
  TeammateIdle: never
  TaskCreated: never
  TaskCompleted: never
  ConfigChange: never
  WorktreeCreate: never
  WorktreeRemove: never
  InstructionsLoaded: never
  Elicitation: never
  ElicitationResult: never
  StopFailure: never
  CwdChanged: EnvFileHandlerOptions
  FileChanged: EnvFileHandlerOptions
}

/** Maps each hook event name to its specific handler interface. */
export interface HookHandlerMap {
  PreToolUse: PreToolUseHookHandler
  PermissionRequest: PermissionRequestHookHandler
  PostToolUse: PostToolUseHookHandler
  PostToolUseFailure: PostToolUseFailureHookHandler
  UserPromptSubmit: UserPromptSubmitHookHandler
  Notification: NotificationHookHandler
  Stop: StopHookHandler
  SubagentStart: SubagentStartHookHandler
  SubagentStop: SubagentStopHookHandler
  PreCompact: PreCompactHookHandler
  PostCompact: PostCompactHookHandler
  SessionStart: SessionStartHookHandler
  SessionEnd: SessionEndHookHandler
  Setup: SetupHookHandler
  TeammateIdle: TeammateIdleHookHandler
  TaskCreated: TaskCreatedHookHandler
  TaskCompleted: TaskCompletedHookHandler
  ConfigChange: ConfigChangeHookHandler
  WorktreeCreate: WorktreeCreateHookHandler
  WorktreeRemove: WorktreeRemoveHookHandler
  InstructionsLoaded: InstructionsLoadedHookHandler
  Elicitation: ElicitationHookHandler
  ElicitationResult: ElicitationResultHookHandler
  StopFailure: StopFailureHookHandler
  CwdChanged: CwdChangedHookHandler
  FileChanged: FileChangedHookHandler
}
