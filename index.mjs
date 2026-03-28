// Re-export schemas (enums, base schemas, matchers, config builders, output)
export * from "./schemas/index.mjs"

// Re-export all per-hook schemas (Config, Input, Output, Matcher for each event).
// Hook files may re-export matcher schemas that are also in schemas/ — TS
// resolves these to the same binding so the duplicate export is harmless at
// runtime, but tsc --declaration needs an explicit re-export to avoid
// ambiguity errors. We re-export hooks second so their narrower per-hook
// types take precedence in auto-complete.
export {
  // ConfigChange
  ConfigChangeConfigSchema,
  ConfigChangeInputSchema,
  ConfigChangeOutputSchema,

  // CwdChanged
  CwdChangedConfigSchema,
  CwdChangedInputSchema,
  CwdChangedOutputSchema,

  // Elicitation
  ElicitationConfigSchema,
  ElicitationInputSchema,
  ElicitationOutputSchema,
  ElicitationHookSpecificOutputSchema,

  // ElicitationResult
  ElicitationResultConfigSchema,
  ElicitationResultInputSchema,
  ElicitationResultOutputSchema,
  ElicitationResultHookSpecificOutputSchema,
  ElicitationResultMatcherSchema,

  // FileChanged
  FileChangedConfigSchema,
  FileChangedInputSchema,
  FileChangedOutputSchema,

  // InstructionsLoaded
  InstructionsLoadedConfigSchema,
  InstructionsLoadedInputSchema,
  InstructionsLoadedOutputSchema,

  // Notification
  NotificationConfigSchema,
  NotificationInputSchema,
  NotificationOutputSchema,
  NotificationMatcherExportSchema,

  // PermissionRequest
  PermissionRequestConfigSchema,
  PermissionRequestInputSchema,
  PermissionRequestOutputSchema,
  PermissionRequestHookSpecificOutputSchema,
  PermissionRequestMatcherSchema,

  // PostCompact
  PostCompactConfigSchema,
  PostCompactInputSchema,
  PostCompactOutputSchema,
  PostCompactMatcherSchema,

  // PostToolUse
  PostToolUseConfigSchema,
  PostToolUseInputSchema,
  PostToolUseOutputSchema,
  PostToolUseMatcherSchema,

  // PostToolUseFailure
  PostToolUseFailureConfigSchema,
  PostToolUseFailureInputSchema,
  PostToolUseFailureOutputSchema,
  PostToolUseFailureMatcherSchema,

  // PreCompact
  PreCompactConfigSchema,
  PreCompactInputSchema,
  PreCompactOutputSchema,
  PreCompactMatcherSchema,

  // PreToolUse
  PreToolUseConfigSchema,
  PreToolUseInputSchema,
  PreToolUseOutputSchema,
  PreToolUseHookSpecificOutputSchema,
  PreToolUseMatcherSchema,

  // SessionEnd
  SessionEndConfigSchema,
  SessionEndInputSchema,
  SessionEndOutputSchema,

  // SessionStart
  SessionStartConfigSchema,
  SessionStartInputSchema,
  SessionStartOutputSchema,

  // Setup
  SetupConfigSchema,
  SetupInputSchema,
  SetupOutputSchema,

  // Stop
  StopConfigSchema,
  StopInputSchema,
  StopOutputSchema,

  // StopFailure
  StopFailureConfigSchema,
  StopFailureInputSchema,
  StopFailureOutputSchema,

  // SubagentStart
  SubagentStartConfigSchema,
  SubagentStartInputSchema,
  SubagentStartOutputSchema,
  SubagentStartMatcherSchema,

  // SubagentStop
  SubagentStopConfigSchema,
  SubagentStopInputSchema,
  SubagentStopOutputSchema,
  SubagentStopMatcherSchema,

  // TaskCompleted
  TaskCompletedConfigSchema,
  TaskCompletedInputSchema,
  TaskCompletedOutputSchema,

  // TaskCreated
  TaskCreatedConfigSchema,
  TaskCreatedInputSchema,
  TaskCreatedOutputSchema,

  // TeammateIdle
  TeammateIdleConfigSchema,
  TeammateIdleInputSchema,
  TeammateIdleOutputSchema,

  // UserPromptSubmit
  UserPromptSubmitConfigSchema,
  UserPromptSubmitInputSchema,
  UserPromptSubmitOutputSchema,

  // WorktreeCreate
  WorktreeCreateConfigSchema,
  WorktreeCreateInputSchema,
  WorktreeCreateOutputSchema,

  // WorktreeRemove
  WorktreeRemoveConfigSchema,
  WorktreeRemoveInputSchema,
  WorktreeRemoveOutputSchema,
} from "./hooks/index.mjs"
