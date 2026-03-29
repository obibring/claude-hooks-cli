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

/** Handler with CLAUDE_ENV_FILE access. */
interface EnvFileHandler<E extends keyof HookIOMap> extends Omit<BaseHandler<E>, "getEnv"> {
  /** Reads a Claude Code environment variable. Includes CLAUDE_ENV_FILE for this hook event. */
  getEnv(name: EnvFileEnvVars): string | undefined
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
