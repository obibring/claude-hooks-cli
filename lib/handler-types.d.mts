import type { z } from "zod/v4"

import type { PreToolUseInputSchema, PreToolUseOutputSchema } from "../hooks/PreToolUse.mjs"
import type { PermissionRequestInputSchema, PermissionRequestOutputSchema } from "../hooks/PermissionRequest.mjs"
import type { PostToolUseInputSchema, PostToolUseOutputSchema } from "../hooks/PostToolUse.mjs"
import type { PostToolUseFailureInputSchema, PostToolUseFailureOutputSchema } from "../hooks/PostToolUseFailure.mjs"
import type { UserPromptSubmitInputSchema, UserPromptSubmitOutputSchema } from "../hooks/UserPromptSubmit.mjs"
import type { NotificationInputSchema, NotificationOutputSchema } from "../hooks/Notification.mjs"
import type { StopInputSchema, StopOutputSchema } from "../hooks/Stop.mjs"
import type { SubagentStartInputSchema, SubagentStartOutputSchema } from "../hooks/SubagentStart.mjs"
import type { SubagentStopInputSchema, SubagentStopOutputSchema } from "../hooks/SubagentStop.mjs"
import type { PreCompactInputSchema, PreCompactOutputSchema } from "../hooks/PreCompact.mjs"
import type { PostCompactInputSchema, PostCompactOutputSchema } from "../hooks/PostCompact.mjs"
import type { SessionStartInputSchema, SessionStartOutputSchema } from "../hooks/SessionStart.mjs"
import type { SessionEndInputSchema, SessionEndOutputSchema } from "../hooks/SessionEnd.mjs"
import type { SetupInputSchema, SetupOutputSchema } from "../hooks/Setup.mjs"
import type { TeammateIdleInputSchema, TeammateIdleOutputSchema } from "../hooks/TeammateIdle.mjs"
import type { TaskCreatedInputSchema, TaskCreatedOutputSchema } from "../hooks/TaskCreated.mjs"
import type { TaskCompletedInputSchema, TaskCompletedOutputSchema } from "../hooks/TaskCompleted.mjs"
import type { ConfigChangeInputSchema, ConfigChangeOutputSchema } from "../hooks/ConfigChange.mjs"
import type { WorktreeCreateInputSchema, WorktreeCreateOutputSchema } from "../hooks/WorktreeCreate.mjs"
import type { WorktreeRemoveInputSchema, WorktreeRemoveOutputSchema } from "../hooks/WorktreeRemove.mjs"
import type { InstructionsLoadedInputSchema, InstructionsLoadedOutputSchema } from "../hooks/InstructionsLoaded.mjs"
import type { ElicitationInputSchema, ElicitationOutputSchema } from "../hooks/Elicitation.mjs"
import type { ElicitationResultInputSchema, ElicitationResultOutputSchema } from "../hooks/ElicitationResult.mjs"
import type { StopFailureInputSchema, StopFailureOutputSchema } from "../hooks/StopFailure.mjs"
import type { CwdChangedInputSchema, CwdChangedOutputSchema } from "../hooks/CwdChanged.mjs"
import type { FileChangedInputSchema, FileChangedOutputSchema } from "../hooks/FileChanged.mjs"

/**
 * Maps each hook event name to its strongly-typed Input and Output types.
 * Used by `HookHandler<E>` to resolve the correct types based on the event name.
 */
export interface HookIOMap {
  PreToolUse: { input: z.infer<typeof PreToolUseInputSchema>; output: z.infer<typeof PreToolUseOutputSchema> }
  PermissionRequest: { input: z.infer<typeof PermissionRequestInputSchema>; output: z.infer<typeof PermissionRequestOutputSchema> }
  PostToolUse: { input: z.infer<typeof PostToolUseInputSchema>; output: z.infer<typeof PostToolUseOutputSchema> }
  PostToolUseFailure: { input: z.infer<typeof PostToolUseFailureInputSchema>; output: z.infer<typeof PostToolUseFailureOutputSchema> }
  UserPromptSubmit: { input: z.infer<typeof UserPromptSubmitInputSchema>; output: z.infer<typeof UserPromptSubmitOutputSchema> }
  Notification: { input: z.infer<typeof NotificationInputSchema>; output: z.infer<typeof NotificationOutputSchema> }
  Stop: { input: z.infer<typeof StopInputSchema>; output: z.infer<typeof StopOutputSchema> }
  SubagentStart: { input: z.infer<typeof SubagentStartInputSchema>; output: z.infer<typeof SubagentStartOutputSchema> }
  SubagentStop: { input: z.infer<typeof SubagentStopInputSchema>; output: z.infer<typeof SubagentStopOutputSchema> }
  PreCompact: { input: z.infer<typeof PreCompactInputSchema>; output: z.infer<typeof PreCompactOutputSchema> }
  PostCompact: { input: z.infer<typeof PostCompactInputSchema>; output: z.infer<typeof PostCompactOutputSchema> }
  SessionStart: { input: z.infer<typeof SessionStartInputSchema>; output: z.infer<typeof SessionStartOutputSchema> }
  SessionEnd: { input: z.infer<typeof SessionEndInputSchema>; output: z.infer<typeof SessionEndOutputSchema> }
  Setup: { input: z.infer<typeof SetupInputSchema>; output: z.infer<typeof SetupOutputSchema> }
  TeammateIdle: { input: z.infer<typeof TeammateIdleInputSchema>; output: z.infer<typeof TeammateIdleOutputSchema> }
  TaskCreated: { input: z.infer<typeof TaskCreatedInputSchema>; output: z.infer<typeof TaskCreatedOutputSchema> }
  TaskCompleted: { input: z.infer<typeof TaskCompletedInputSchema>; output: z.infer<typeof TaskCompletedOutputSchema> }
  ConfigChange: { input: z.infer<typeof ConfigChangeInputSchema>; output: z.infer<typeof ConfigChangeOutputSchema> }
  WorktreeCreate: { input: z.infer<typeof WorktreeCreateInputSchema>; output: z.infer<typeof WorktreeCreateOutputSchema> }
  WorktreeRemove: { input: z.infer<typeof WorktreeRemoveInputSchema>; output: z.infer<typeof WorktreeRemoveOutputSchema> }
  InstructionsLoaded: { input: z.infer<typeof InstructionsLoadedInputSchema>; output: z.infer<typeof InstructionsLoadedOutputSchema> }
  Elicitation: { input: z.infer<typeof ElicitationInputSchema>; output: z.infer<typeof ElicitationOutputSchema> }
  ElicitationResult: { input: z.infer<typeof ElicitationResultInputSchema>; output: z.infer<typeof ElicitationResultOutputSchema> }
  StopFailure: { input: z.infer<typeof StopFailureInputSchema>; output: z.infer<typeof StopFailureOutputSchema> }
  CwdChanged: { input: z.infer<typeof CwdChangedInputSchema>; output: z.infer<typeof CwdChangedOutputSchema> }
  FileChanged: { input: z.infer<typeof FileChangedInputSchema>; output: z.infer<typeof FileChangedOutputSchema> }
}

/** All valid hook event names. */
export type HookEventName = keyof HookIOMap

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
 * handler.emitOutput({
 *   hookSpecificOutput: { permissionDecision: "deny", permissionDecisionReason: "blocked" }
 * })
 * ```
 */
export declare class HookHandler<E extends keyof HookIOMap> {
  /** The hook event name this handler is bound to. */
  readonly event: E

  constructor(event: E)

  /**
   * Reads stdin synchronously, JSON-parses it, and validates against the hook's input schema.
   * Exits with code 2 if stdin is empty, not valid JSON, or fails schema validation.
   */
  parseInput(): HookIOMap[E]["input"]

  /**
   * Writes JSON output to stdout and exits with code 0.
   * Code after this call is unreachable.
   */
  emitOutput(output: HookIOMap[E]["output"]): never

  /**
   * Writes an error message to stderr and exits with code 2 (blocking error).
   * The message is fed back to the Claude model.
   * Code after this call is unreachable.
   */
  emitBlockingError(message: string): never

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
   * Exits silently with code 0 (no output — hook passes through).
   * Code after this call is unreachable.
   */
  exit(): never
}
