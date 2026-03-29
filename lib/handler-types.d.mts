import type { z } from "zod/v4"

import type { PreToolUseInputSchema } from "../hooks/PreToolUse.mjs"
import type { PermissionRequestInputSchema } from "../hooks/PermissionRequest.mjs"
import type { PostToolUseInputSchema } from "../hooks/PostToolUse.mjs"
import type { PostToolUseFailureInputSchema } from "../hooks/PostToolUseFailure.mjs"
import type { UserPromptSubmitInputSchema } from "../hooks/UserPromptSubmit.mjs"
import type { NotificationInputSchema } from "../hooks/Notification.mjs"
import type { StopInputSchema } from "../hooks/Stop.mjs"
import type { SubagentStartInputSchema } from "../hooks/SubagentStart.mjs"
import type { SubagentStopInputSchema } from "../hooks/SubagentStop.mjs"
import type { PreCompactInputSchema } from "../hooks/PreCompact.mjs"
import type { PostCompactInputSchema } from "../hooks/PostCompact.mjs"
import type { SessionStartInputSchema } from "../hooks/SessionStart.mjs"
import type { SessionEndInputSchema } from "../hooks/SessionEnd.mjs"
import type { SetupInputSchema } from "../hooks/Setup.mjs"
import type { TeammateIdleInputSchema } from "../hooks/TeammateIdle.mjs"
import type { TaskCreatedInputSchema } from "../hooks/TaskCreated.mjs"
import type { TaskCompletedInputSchema } from "../hooks/TaskCompleted.mjs"
import type { ConfigChangeInputSchema } from "../hooks/ConfigChange.mjs"
import type { WorktreeCreateInputSchema } from "../hooks/WorktreeCreate.mjs"
import type { WorktreeRemoveInputSchema } from "../hooks/WorktreeRemove.mjs"
import type { InstructionsLoadedInputSchema } from "../hooks/InstructionsLoaded.mjs"
import type { ElicitationInputSchema } from "../hooks/Elicitation.mjs"
import type { ElicitationResultInputSchema } from "../hooks/ElicitationResult.mjs"
import type { StopFailureInputSchema } from "../hooks/StopFailure.mjs"
import type { CwdChangedInputSchema } from "../hooks/CwdChanged.mjs"
import type { FileChangedInputSchema } from "../hooks/FileChanged.mjs"

// ---- Output interfaces with JSDoc hover docs ----

/** Universal output fields available to all hooks. */
export interface BaseHookOutput {
  /** Set to false to stop Claude entirely. The stopReason message will be displayed. If omitted or true, Claude continues normally. */
  continue?: boolean
  /** Message displayed to the user when continue is false. Example: "Hook blocked execution: unsafe operation detected." */
  stopReason?: string
  /** When true, hides this hook's stdout from verbose mode output. Useful for hooks that return JSON control data you don't want cluttering the terminal. */
  suppressOutput?: boolean
  /** Warning or info message shown to the user in the Claude Code UI. Does not affect Claude's behavior — purely for user visibility. */
  systemMessage?: string
  /** Context string injected into Claude's conversation. Claude will see this as additional information when formulating its next response. */
  additionalContext?: string
}

/** PreToolUse hookSpecificOutput fields. */
export interface PreToolUseHookSpecificOutput {
  /** Controls whether the tool call proceeds. "allow" lets it run, "deny" blocks it, "ask" falls through to the user permission prompt. */
  permissionDecision?: "allow" | "deny" | "ask"
  /** Explanation shown to the model when permissionDecision is "deny". Helps Claude understand why the tool was blocked. */
  permissionDecisionReason?: string
  /** When true, auto-approves all future uses of this tool for the rest of the session. Since v2.0.76. */
  autoAllow?: boolean
  /** Modified tool input that replaces the original. For AskUserQuestion, can include {question, answer} to auto-respond. Since v2.1.85. */
  updatedInput?: Record<string, unknown>
}

/** PreToolUse output — can control permission decisions and modify tool input. */
export interface PreToolUseOutput extends BaseHookOutput {
  /** Hook-specific output for PreToolUse. Controls permission decisions and can modify tool input. */
  hookSpecificOutput?: PreToolUseHookSpecificOutput
}

/** PermissionRequest decision object. */
export interface PermissionRequestDecision {
  /** Permission decision. "allow" grants the permission, "deny" blocks it. */
  behavior: "allow" | "deny"
}

/** PermissionRequest output — can allow or deny the permission request. */
export interface PermissionRequestOutput extends BaseHookOutput {
  /** Hook-specific output for PermissionRequest. Contains the permission decision. */
  hookSpecificOutput?: { /** The permission decision. */ decision?: PermissionRequestDecision }
}

/** PostToolUse output — can block Claude from continuing. */
export interface PostToolUseOutput extends BaseHookOutput {
  /** Set to "block" to stop Claude from continuing after this tool call. */
  decision?: "block"
}

/** PostToolUseFailure output — base fields only. */
export interface PostToolUseFailureOutput extends BaseHookOutput {}

/** UserPromptSubmit output — can modify the user's prompt before Claude processes it. */
export interface UserPromptSubmitOutput extends BaseHookOutput {
  /** Modified prompt text that replaces the original. Claude will see this instead of what the user typed. */
  prompt?: string
}

/** Notification output — base fields only. */
export interface NotificationOutput extends BaseHookOutput {}

/** Stop output — can block to re-engage Claude. */
export interface StopOutput extends BaseHookOutput {
  /** Set to "block" to re-engage Claude for another turn after it finished responding. */
  decision?: "block"
}

/** SubagentStart output — base fields only. */
export interface SubagentStartOutput extends BaseHookOutput {}

/** SubagentStop output — can block execution after subagent completion. */
export interface SubagentStopOutput extends BaseHookOutput {
  /** Set to "block" to stop execution after subagent completion. */
  decision?: "block"
}

/** PreCompact output — base fields only. */
export interface PreCompactOutput extends BaseHookOutput {}
/** PostCompact output — base fields only. */
export interface PostCompactOutput extends BaseHookOutput {}
/** SessionStart output — base fields only. */
export interface SessionStartOutput extends BaseHookOutput {}
/** SessionEnd output — base fields only. */
export interface SessionEndOutput extends BaseHookOutput {}
/** Setup output — base fields only. */
export interface SetupOutput extends BaseHookOutput {}
/** TeammateIdle output — base fields only. */
export interface TeammateIdleOutput extends BaseHookOutput {}
/** TaskCreated output — base fields only. */
export interface TaskCreatedOutput extends BaseHookOutput {}
/** TaskCompleted output — base fields only. */
export interface TaskCompletedOutput extends BaseHookOutput {}

/** ConfigChange output — can block execution after config change. */
export interface ConfigChangeOutput extends BaseHookOutput {
  /** Set to "block" to stop execution after config change. */
  decision?: "block"
}

/** WorktreeCreate output — base fields only. */
export interface WorktreeCreateOutput extends BaseHookOutput {}
/** WorktreeRemove output — base fields only. */
export interface WorktreeRemoveOutput extends BaseHookOutput {}
/** InstructionsLoaded output — base fields only. */
export interface InstructionsLoadedOutput extends BaseHookOutput {}

/** Elicitation hookSpecificOutput fields. */
export interface ElicitationHookSpecificOutput {
  /** Controls the elicitation response. "accept" sends the content, "decline" rejects, "cancel" aborts. */
  action?: "accept" | "decline" | "cancel"
  /** Response content to send back (shape depends on requested_schema). */
  content?: unknown
}

/** Elicitation output — can control MCP elicitation responses. */
export interface ElicitationOutput extends BaseHookOutput {
  /** Hook-specific output for Elicitation. Controls the response sent back to the MCP server. */
  hookSpecificOutput?: ElicitationHookSpecificOutput
}

/** ElicitationResult hookSpecificOutput fields. */
export interface ElicitationResultHookSpecificOutput {
  /** Override the user's response. "accept" sends replacement content, "decline" rejects, "cancel" aborts. */
  action?: "accept" | "decline" | "cancel"
  /** Replacement response content. */
  content?: unknown
}

/** ElicitationResult output — can override the user's elicitation response. */
export interface ElicitationResultOutput extends BaseHookOutput {
  /** Hook-specific output for ElicitationResult. Can override the user's response before it reaches the MCP server. */
  hookSpecificOutput?: ElicitationResultHookSpecificOutput
}

/** StopFailure output — base fields only. */
export interface StopFailureOutput extends BaseHookOutput {}
/** CwdChanged output — base fields only. */
export interface CwdChangedOutput extends BaseHookOutput {}
/** FileChanged output — base fields only. */
export interface FileChangedOutput extends BaseHookOutput {}

// ---- HookIOMap ----

/**
 * Maps each hook event name to its strongly-typed Input and Output types.
 * Used by `HookHandler<E>` to resolve the correct types based on the event name.
 */
export interface HookIOMap {
  PreToolUse: { input: z.infer<typeof PreToolUseInputSchema>; output: PreToolUseOutput }
  PermissionRequest: { input: z.infer<typeof PermissionRequestInputSchema>; output: PermissionRequestOutput }
  PostToolUse: { input: z.infer<typeof PostToolUseInputSchema>; output: PostToolUseOutput }
  PostToolUseFailure: { input: z.infer<typeof PostToolUseFailureInputSchema>; output: PostToolUseFailureOutput }
  UserPromptSubmit: { input: z.infer<typeof UserPromptSubmitInputSchema>; output: UserPromptSubmitOutput }
  Notification: { input: z.infer<typeof NotificationInputSchema>; output: NotificationOutput }
  Stop: { input: z.infer<typeof StopInputSchema>; output: StopOutput }
  SubagentStart: { input: z.infer<typeof SubagentStartInputSchema>; output: SubagentStartOutput }
  SubagentStop: { input: z.infer<typeof SubagentStopInputSchema>; output: SubagentStopOutput }
  PreCompact: { input: z.infer<typeof PreCompactInputSchema>; output: PreCompactOutput }
  PostCompact: { input: z.infer<typeof PostCompactInputSchema>; output: PostCompactOutput }
  SessionStart: { input: z.infer<typeof SessionStartInputSchema>; output: SessionStartOutput }
  SessionEnd: { input: z.infer<typeof SessionEndInputSchema>; output: SessionEndOutput }
  Setup: { input: z.infer<typeof SetupInputSchema>; output: SetupOutput }
  TeammateIdle: { input: z.infer<typeof TeammateIdleInputSchema>; output: TeammateIdleOutput }
  TaskCreated: { input: z.infer<typeof TaskCreatedInputSchema>; output: TaskCreatedOutput }
  TaskCompleted: { input: z.infer<typeof TaskCompletedInputSchema>; output: TaskCompletedOutput }
  ConfigChange: { input: z.infer<typeof ConfigChangeInputSchema>; output: ConfigChangeOutput }
  WorktreeCreate: { input: z.infer<typeof WorktreeCreateInputSchema>; output: WorktreeCreateOutput }
  WorktreeRemove: { input: z.infer<typeof WorktreeRemoveInputSchema>; output: WorktreeRemoveOutput }
  InstructionsLoaded: { input: z.infer<typeof InstructionsLoadedInputSchema>; output: InstructionsLoadedOutput }
  Elicitation: { input: z.infer<typeof ElicitationInputSchema>; output: ElicitationOutput }
  ElicitationResult: { input: z.infer<typeof ElicitationResultInputSchema>; output: ElicitationResultOutput }
  StopFailure: { input: z.infer<typeof StopFailureInputSchema>; output: StopFailureOutput }
  CwdChanged: { input: z.infer<typeof CwdChangedInputSchema>; output: CwdChangedOutput }
  FileChanged: { input: z.infer<typeof FileChangedInputSchema>; output: FileChangedOutput }
}

/** All valid hook event names. */
export type HookEventName = keyof HookIOMap

// ---- Tool input types for PreToolUse/PostToolUse/PostToolUseFailure/PermissionRequest ----

/** Bash tool input — executes shell commands. */
export interface BashToolInput {
  /** The shell command to execute. */
  command: string
  /** Optional description of what the command does. */
  description?: string
  /** Optional timeout in milliseconds. */
  timeout?: number
  /** Whether to run the command in the background. */
  run_in_background?: boolean
}

/** Write tool input — creates or overwrites a file. */
export interface WriteToolInput {
  /** Absolute path to the file to write. */
  file_path: string
  /** Content to write to the file. */
  content: string
}

/** Edit tool input — replaces a string in an existing file. */
export interface EditToolInput {
  /** Absolute path to the file to edit. */
  file_path: string
  /** Text to find and replace. */
  old_string: string
  /** Replacement text. */
  new_string: string
  /** Whether to replace all occurrences. */
  replace_all?: boolean
}

/** Read tool input — reads file contents. */
export interface ReadToolInput {
  /** Absolute path to the file to read. */
  file_path: string
  /** Optional line number to start reading from. */
  offset?: number
  /** Optional number of lines to read. */
  limit?: number
}

/** Glob tool input — finds files matching a glob pattern. */
export interface GlobToolInput {
  /** Glob pattern to match files against (e.g. "**\/*.ts"). */
  pattern: string
  /** Optional directory to search in. Defaults to current working directory. */
  path?: string
}

/** Grep tool input — searches file contents with regular expressions. */
export interface GrepToolInput {
  /** Regular expression pattern to search for. */
  pattern: string
  /** Optional file or directory to search in. */
  path?: string
  /** Optional glob pattern to filter files (e.g. "*.ts"). */
  glob?: string
  /** Output mode: "content", "files_with_matches", or "count". Defaults to "files_with_matches". */
  output_mode?: "content" | "files_with_matches" | "count"
  /** Case insensitive search. */
  "-i"?: boolean
  /** Enable multiline matching. */
  multiline?: boolean
}

/** WebFetch tool input — fetches and processes web content. */
export interface WebFetchToolInput {
  /** URL to fetch content from. */
  url: string
  /** Prompt to run on the fetched content. */
  prompt?: string
}

/** WebSearch tool input — searches the web. */
export interface WebSearchToolInput {
  /** Search query. */
  query: string
  /** Optional: only include results from these domains. */
  allowed_domains?: string[]
  /** Optional: exclude results from these domains. */
  blocked_domains?: string[]
}

/** Agent tool input — spawns a subagent. */
export interface AgentToolInput {
  /** The task for the agent to perform. */
  prompt: string
  /** Short description of the task. */
  description?: string
  /** Type of specialized agent to use (e.g. "Explore"). */
  subagent_type?: string
  /** Optional model alias to override the default (e.g. "sonnet"). */
  model?: string
}

/** AskUserQuestion tool input — asks the user one to four multiple-choice questions. */
export interface AskUserQuestionToolInput {
  /** Questions to present, each with a question string, short header, options array, and optional multiSelect flag. */
  questions: Array<{
    /** The question text. */
    question: string
    /** Short header for the question. */
    header?: string
    /** Options to choose from. */
    options?: Array<{ label: string }>
    /** Whether multiple options can be selected. */
    multiSelect?: boolean
  }>
  /** Optional: maps question text to the selected option label. Supply via updatedInput to answer programmatically. */
  answers?: Record<string, string>
}

/**
 * Maps tool names to their strongly-typed tool_input shapes.
 * Used by `getToolInput()` to return the correct type based on the tool name.
 */
export interface ToolInputMap {
  Bash: BashToolInput
  Write: WriteToolInput
  Edit: EditToolInput
  Read: ReadToolInput
  Glob: GlobToolInput
  Grep: GrepToolInput
  WebFetch: WebFetchToolInput
  WebSearch: WebSearchToolInput
  Agent: AgentToolInput
  AskUserQuestion: AskUserQuestionToolInput
}

/** Hook events that receive tool_name and tool_input. */
type ToolEventHooks = "PreToolUse" | "PostToolUse" | "PostToolUseFailure" | "PermissionRequest"

/** Hook events that have access to CLAUDE_ENV_FILE. */
type EnvFileEvents = "SessionStart" | "CwdChanged" | "FileChanged"

/**
 * Resolves the return type of `getEnv()` based on the hook event and env var name.
 * `CLAUDE_ENV_FILE` returns a descriptive error type for hooks that don't receive it.
 */
type EnvVarReturnType<
  E extends keyof HookIOMap,
  N extends import("../schemas/enums.mjs").ClaudeEnvVarName,
> = N extends "CLAUDE_ENV_FILE"
  ? E extends EnvFileEvents
    ? string | undefined
    : undefined | `CLAUDE_ENV_FILE is not available in "${E & string}" hooks. It is only available in: SessionStart, CwdChanged, FileChanged.`
  : string | undefined

/**
 * Strongly-typed handler for Claude Code hook scripts.
 *
 * Provides typed input parsing and output emission based on the hook event name
 * passed to the constructor. Methods that call `process.exit()` return `never`
 * so code after them is correctly flagged as unreachable.
 *
 * @example
 * ```ts
 * const handler = new HookHandler("PreToolUse")
 * const input = handler.parseInput()
 * // input.tool_name is typed as string
 * // input.nonExistent would be a TS error
 *
 * handler.exit("success", {
 *   hookSpecificOutput: { permissionDecision: "deny", permissionDecisionReason: "blocked" }
 * })
 * ```
 */
export declare class HookHandler<E extends keyof HookIOMap> {
  /** The hook event name this handler is bound to. */
  readonly event: E

  protected constructor(event: E)

  /**
   * Creates a hook handler with the correct type for the given event name.
   * Returns a handler interface specific to the event — with only the methods
   * and env vars that apply to that hook type.
   *
   * @example
   * ```ts
   * const handler = HookHandler.for("PreToolUse")
   * // handler has getToolInput(), getEnv() without CLAUDE_ENV_FILE
   *
   * const handler2 = HookHandler.for("SessionStart")
   * // handler2 has getEnv("CLAUDE_ENV_FILE"), no getToolInput()
   * ```
   */
  static for<E extends keyof import("./handlers/index.d.mts").HookHandlerMap>(
    event: E,
  ): import("./handlers/index.d.mts").HookHandlerMap[E]

  /**
   * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
   * Results are cached — can be called multiple times without performance penalty.
   * Exits with code 2 if stdin is empty, not valid JSON, or fails schema validation.
   */
  parseInput(): HookIOMap[E]["input"]


  /**
   * Reads a Claude Code environment variable by name.
   * Returns the value from `process.env`, or `undefined` if not set.
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
  getEnv<N extends import("../schemas/enums.mjs").ClaudeEnvVarName>(
    name: N,
  ): EnvVarReturnType<E, N>

  /**
   * Returns the strongly-typed tool_input if the input's `tool_name` matches,
   * or `null` if it doesn't match.
   *
   * Use this to branch on tool names:
   * ```ts
   * const handler = new HookHandler("PreToolUse")
   * const input = handler.parseInput()
   *
   * const bash = handler.getToolInput("Bash", input)
   * if (bash) {
   *   // bash.command is typed as string
   *   if (bash.command.includes("rm -rf")) { ... }
   * }
   *
   * const edit = handler.getToolInput("Edit", input)
   * if (edit) {
   *   // edit.file_path, edit.old_string, edit.new_string are typed
   * }
   * ```
   *
   * Only available on tool-event hooks: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest.
   */
  getToolInput<T extends keyof ToolInputMap>(
    toolName: T,
    input: HookIOMap[E]["input"],
  ): E extends ToolEventHooks
    ? ToolInputMap[T] | null
    : `getToolInput() is only available for tool-event hooks (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest). "${E & string}" is not a tool-event hook.`

  /**
   * Exits the hook script. Code after this call is unreachable.
   *
   * - `exit("success")` — pass through, no output (exit code 0)
   * - `exit("success", output)` — write JSON output to stdout (exit code 0)
   * - `exit("error", message)` — write error to stderr, fed back to model (exit code 2)
   *
   * @example
   * ```ts
   * handler.exit("success")
   * handler.exit("success", { additionalContext: "info for Claude" })
   * handler.exit("error", "Operation not allowed")
   * ```
   */
  exit(status: "success"): never
  exit(status: "success", output: HookIOMap[E]["output"]): never
  exit(status: "error", message: string): never
}
