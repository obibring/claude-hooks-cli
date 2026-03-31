import {
  ConfigChangeConfigSchema,
  ConfigChangeInputSchema,
  ConfigChangeOutputSchema,
  ConfigChangeMatcherSchema,
} from "./ConfigChange.mjs"
import {
  CwdChangedConfigSchema,
  CwdChangedInputSchema,
  CwdChangedOutputSchema,
  CwdChangedMatcherSchema,
} from "./CwdChanged.mjs"
import {
  ElicitationConfigSchema,
  ElicitationInputSchema,
  ElicitationOutputSchema,
  ElicitationMatcherSchema,
  ElicitationHookSpecificOutputSchema,
} from "./Elicitation.mjs"
import {
  ElicitationResultConfigSchema,
  ElicitationResultInputSchema,
  ElicitationResultOutputSchema,
  ElicitationResultMatcherSchema,
  ElicitationResultHookSpecificOutputSchema,
} from "./ElicitationResult.mjs"
import {
  FileChangedConfigSchema,
  FileChangedInputSchema,
  FileChangedOutputSchema,
  FileChangedMatcherSchema,
} from "./FileChanged.mjs"
import {
  InstructionsLoadedConfigSchema,
  InstructionsLoadedInputSchema,
  InstructionsLoadedOutputSchema,
  InstructionsLoadedMatcherSchema,
} from "./InstructionsLoaded.mjs"
import {
  NotificationConfigSchema,
  NotificationInputSchema,
  NotificationOutputSchema,
  NotificationMatcherExportSchema,
} from "./Notification.mjs"
import {
  PermissionRequestConfigSchema,
  PermissionRequestInputSchema,
  PermissionRequestOutputSchema,
  PermissionRequestMatcherSchema,
  PermissionRequestHookSpecificOutputSchema,
} from "./PermissionRequest.mjs"
import {
  PostCompactConfigSchema,
  PostCompactInputSchema,
  PostCompactOutputSchema,
  PostCompactMatcherSchema,
} from "./PostCompact.mjs"
import {
  PostToolUseConfigSchema,
  PostToolUseInputSchema,
  PostToolUseOutputSchema,
  PostToolUseMatcherSchema,
} from "./PostToolUse.mjs"
import {
  PostToolUseFailureConfigSchema,
  PostToolUseFailureInputSchema,
  PostToolUseFailureOutputSchema,
  PostToolUseFailureMatcherSchema,
} from "./PostToolUseFailure.mjs"
import {
  PreCompactConfigSchema,
  PreCompactInputSchema,
  PreCompactOutputSchema,
  PreCompactMatcherSchema,
} from "./PreCompact.mjs"
import {
  PreToolUseConfigSchema,
  PreToolUseInputSchema,
  PreToolUseOutputSchema,
  PreToolUseMatcherSchema,
  PreToolUseHookSpecificOutputSchema,
} from "./PreToolUse.mjs"
import {
  SessionEndConfigSchema,
  SessionEndInputSchema,
  SessionEndOutputSchema,
  SessionEndMatcherSchema,
} from "./SessionEnd.mjs"
import {
  SessionStartConfigSchema,
  SessionStartInputSchema,
  SessionStartOutputSchema,
  SessionStartMatcherSchema,
} from "./SessionStart.mjs"
import {
  SetupConfigSchema,
  SetupInputSchema,
  SetupOutputSchema,
  SetupMatcherSchema,
} from "./Setup.mjs"
import {
  StopConfigSchema,
  StopInputSchema,
  StopOutputSchema,
  StopMatcherSchema,
} from "./Stop.mjs"
import {
  StopFailureConfigSchema,
  StopFailureInputSchema,
  StopFailureOutputSchema,
  StopFailureMatcherSchema,
} from "./StopFailure.mjs"
import {
  SubagentStartConfigSchema,
  SubagentStartInputSchema,
  SubagentStartOutputSchema,
  SubagentStartMatcherSchema,
} from "./SubagentStart.mjs"
import {
  SubagentStopConfigSchema,
  SubagentStopInputSchema,
  SubagentStopOutputSchema,
  SubagentStopMatcherSchema,
} from "./SubagentStop.mjs"
import {
  TaskCompletedConfigSchema,
  TaskCompletedInputSchema,
  TaskCompletedOutputSchema,
  TaskCompletedMatcherSchema,
} from "./TaskCompleted.mjs"
import {
  TaskCreatedConfigSchema,
  TaskCreatedInputSchema,
  TaskCreatedOutputSchema,
  TaskCreatedMatcherSchema,
} from "./TaskCreated.mjs"
import {
  TeammateIdleConfigSchema,
  TeammateIdleInputSchema,
  TeammateIdleOutputSchema,
  TeammateIdleMatcherSchema,
} from "./TeammateIdle.mjs"
import {
  UserPromptSubmitConfigSchema,
  UserPromptSubmitInputSchema,
  UserPromptSubmitOutputSchema,
  UserPromptSubmitMatcherSchema,
} from "./UserPromptSubmit.mjs"
import {
  WorktreeCreateConfigSchema,
  WorktreeCreateInputSchema,
  WorktreeCreateOutputSchema,
  WorktreeCreateMatcherSchema,
} from "./WorktreeCreate.mjs"
import {
  WorktreeRemoveConfigSchema,
  WorktreeRemoveInputSchema,
  WorktreeRemoveOutputSchema,
  WorktreeRemoveMatcherSchema,
} from "./WorktreeRemove.mjs"

/**
 * Map of hook event names to their Zod schemas.
 * Each entry has Config, Input, Output, and optionally Matcher and HookSpecificOutput.
 */
export const HookSchemas = {
  ConfigChange: {
    Config: ConfigChangeConfigSchema,
    Input: ConfigChangeInputSchema,
    Output: ConfigChangeOutputSchema,
    Matcher: ConfigChangeMatcherSchema,
  },
  CwdChanged: {
    Config: CwdChangedConfigSchema,
    Input: CwdChangedInputSchema,
    Output: CwdChangedOutputSchema,
    Matcher: CwdChangedMatcherSchema,
  },
  Elicitation: {
    Config: ElicitationConfigSchema,
    Input: ElicitationInputSchema,
    Output: ElicitationOutputSchema,
    Matcher: ElicitationMatcherSchema,
    HookSpecificOutput: ElicitationHookSpecificOutputSchema,
  },
  ElicitationResult: {
    Config: ElicitationResultConfigSchema,
    Input: ElicitationResultInputSchema,
    Output: ElicitationResultOutputSchema,
    Matcher: ElicitationResultMatcherSchema,
    HookSpecificOutput: ElicitationResultHookSpecificOutputSchema,
  },
  FileChanged: {
    Config: FileChangedConfigSchema,
    Input: FileChangedInputSchema,
    Output: FileChangedOutputSchema,
    Matcher: FileChangedMatcherSchema,
  },
  InstructionsLoaded: {
    Config: InstructionsLoadedConfigSchema,
    Input: InstructionsLoadedInputSchema,
    Output: InstructionsLoadedOutputSchema,
    Matcher: InstructionsLoadedMatcherSchema,
  },
  Notification: {
    Config: NotificationConfigSchema,
    Input: NotificationInputSchema,
    Output: NotificationOutputSchema,
    Matcher: NotificationMatcherExportSchema,
  },
  PermissionRequest: {
    Config: PermissionRequestConfigSchema,
    Input: PermissionRequestInputSchema,
    Output: PermissionRequestOutputSchema,
    Matcher: PermissionRequestMatcherSchema,
    HookSpecificOutput: PermissionRequestHookSpecificOutputSchema,
  },
  PostCompact: {
    Config: PostCompactConfigSchema,
    Input: PostCompactInputSchema,
    Output: PostCompactOutputSchema,
    Matcher: PostCompactMatcherSchema,
  },
  PostToolUse: {
    Config: PostToolUseConfigSchema,
    Input: PostToolUseInputSchema,
    Output: PostToolUseOutputSchema,
    Matcher: PostToolUseMatcherSchema,
  },
  PostToolUseFailure: {
    Config: PostToolUseFailureConfigSchema,
    Input: PostToolUseFailureInputSchema,
    Output: PostToolUseFailureOutputSchema,
    Matcher: PostToolUseFailureMatcherSchema,
  },
  PreCompact: {
    Config: PreCompactConfigSchema,
    Input: PreCompactInputSchema,
    Output: PreCompactOutputSchema,
    Matcher: PreCompactMatcherSchema,
  },
  PreToolUse: {
    Config: PreToolUseConfigSchema,
    Input: PreToolUseInputSchema,
    Output: PreToolUseOutputSchema,
    Matcher: PreToolUseMatcherSchema,
    HookSpecificOutput: PreToolUseHookSpecificOutputSchema,
  },
  SessionEnd: {
    Config: SessionEndConfigSchema,
    Input: SessionEndInputSchema,
    Output: SessionEndOutputSchema,
    Matcher: SessionEndMatcherSchema,
  },
  SessionStart: {
    Config: SessionStartConfigSchema,
    Input: SessionStartInputSchema,
    Output: SessionStartOutputSchema,
    Matcher: SessionStartMatcherSchema,
  },
  Setup: {
    Config: SetupConfigSchema,
    Input: SetupInputSchema,
    Output: SetupOutputSchema,
    Matcher: SetupMatcherSchema,
  },
  Stop: {
    Config: StopConfigSchema,
    Input: StopInputSchema,
    Output: StopOutputSchema,
    Matcher: StopMatcherSchema,
  },
  StopFailure: {
    Config: StopFailureConfigSchema,
    Input: StopFailureInputSchema,
    Output: StopFailureOutputSchema,
    Matcher: StopFailureMatcherSchema,
  },
  SubagentStart: {
    Config: SubagentStartConfigSchema,
    Input: SubagentStartInputSchema,
    Output: SubagentStartOutputSchema,
    Matcher: SubagentStartMatcherSchema,
  },
  SubagentStop: {
    Config: SubagentStopConfigSchema,
    Input: SubagentStopInputSchema,
    Output: SubagentStopOutputSchema,
    Matcher: SubagentStopMatcherSchema,
  },
  TaskCompleted: {
    Config: TaskCompletedConfigSchema,
    Input: TaskCompletedInputSchema,
    Output: TaskCompletedOutputSchema,
    Matcher: TaskCompletedMatcherSchema,
  },
  TaskCreated: {
    Config: TaskCreatedConfigSchema,
    Input: TaskCreatedInputSchema,
    Output: TaskCreatedOutputSchema,
    Matcher: TaskCreatedMatcherSchema,
  },
  TeammateIdle: {
    Config: TeammateIdleConfigSchema,
    Input: TeammateIdleInputSchema,
    Output: TeammateIdleOutputSchema,
    Matcher: TeammateIdleMatcherSchema,
  },
  UserPromptSubmit: {
    Config: UserPromptSubmitConfigSchema,
    Input: UserPromptSubmitInputSchema,
    Output: UserPromptSubmitOutputSchema,
    Matcher: UserPromptSubmitMatcherSchema,
  },
  WorktreeCreate: {
    Config: WorktreeCreateConfigSchema,
    Input: WorktreeCreateInputSchema,
    Output: WorktreeCreateOutputSchema,
    Matcher: WorktreeCreateMatcherSchema,
  },
  WorktreeRemove: {
    Config: WorktreeRemoveConfigSchema,
    Input: WorktreeRemoveInputSchema,
    Output: WorktreeRemoveOutputSchema,
    Matcher: WorktreeRemoveMatcherSchema,
  },
}
