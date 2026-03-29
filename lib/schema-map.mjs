import {
  PreToolUseInputSchema,
  PreToolUseOutputSchema,
} from "../hooks/PreToolUse.mjs"
import {
  PermissionRequestInputSchema,
  PermissionRequestOutputSchema,
} from "../hooks/PermissionRequest.mjs"
import {
  PostToolUseInputSchema,
  PostToolUseOutputSchema,
} from "../hooks/PostToolUse.mjs"
import {
  PostToolUseFailureInputSchema,
  PostToolUseFailureOutputSchema,
} from "../hooks/PostToolUseFailure.mjs"
import {
  UserPromptSubmitInputSchema,
  UserPromptSubmitOutputSchema,
} from "../hooks/UserPromptSubmit.mjs"
import {
  NotificationInputSchema,
  NotificationOutputSchema,
} from "../hooks/Notification.mjs"
import { StopInputSchema, StopOutputSchema } from "../hooks/Stop.mjs"
import {
  SubagentStartInputSchema,
  SubagentStartOutputSchema,
} from "../hooks/SubagentStart.mjs"
import {
  SubagentStopInputSchema,
  SubagentStopOutputSchema,
} from "../hooks/SubagentStop.mjs"
import {
  PreCompactInputSchema,
  PreCompactOutputSchema,
} from "../hooks/PreCompact.mjs"
import {
  PostCompactInputSchema,
  PostCompactOutputSchema,
} from "../hooks/PostCompact.mjs"
import {
  SessionStartInputSchema,
  SessionStartOutputSchema,
} from "../hooks/SessionStart.mjs"
import {
  SessionEndInputSchema,
  SessionEndOutputSchema,
} from "../hooks/SessionEnd.mjs"
import { SetupInputSchema, SetupOutputSchema } from "../hooks/Setup.mjs"
import {
  TeammateIdleInputSchema,
  TeammateIdleOutputSchema,
} from "../hooks/TeammateIdle.mjs"
import {
  TaskCreatedInputSchema,
  TaskCreatedOutputSchema,
} from "../hooks/TaskCreated.mjs"
import {
  TaskCompletedInputSchema,
  TaskCompletedOutputSchema,
} from "../hooks/TaskCompleted.mjs"
import {
  ConfigChangeInputSchema,
  ConfigChangeOutputSchema,
} from "../hooks/ConfigChange.mjs"
import {
  WorktreeCreateInputSchema,
  WorktreeCreateOutputSchema,
} from "../hooks/WorktreeCreate.mjs"
import {
  WorktreeRemoveInputSchema,
  WorktreeRemoveOutputSchema,
} from "../hooks/WorktreeRemove.mjs"
import {
  InstructionsLoadedInputSchema,
  InstructionsLoadedOutputSchema,
} from "../hooks/InstructionsLoaded.mjs"
import {
  ElicitationInputSchema,
  ElicitationOutputSchema,
} from "../hooks/Elicitation.mjs"
import {
  ElicitationResultInputSchema,
  ElicitationResultOutputSchema,
} from "../hooks/ElicitationResult.mjs"
import {
  StopFailureInputSchema,
  StopFailureOutputSchema,
} from "../hooks/StopFailure.mjs"
import {
  CwdChangedInputSchema,
  CwdChangedOutputSchema,
} from "../hooks/CwdChanged.mjs"
import {
  FileChangedInputSchema,
  FileChangedOutputSchema,
} from "../hooks/FileChanged.mjs"

/**
 * Runtime map of hook event names to their zod input/output schema pairs.
 * Used by HookHandler for runtime validation.
 */
export const HOOK_SCHEMA_MAP = /** @type {const} */ ({
  PreToolUse: {
    inputSchema: PreToolUseInputSchema,
    outputSchema: PreToolUseOutputSchema,
  },
  PermissionRequest: {
    inputSchema: PermissionRequestInputSchema,
    outputSchema: PermissionRequestOutputSchema,
  },
  PostToolUse: {
    inputSchema: PostToolUseInputSchema,
    outputSchema: PostToolUseOutputSchema,
  },
  PostToolUseFailure: {
    inputSchema: PostToolUseFailureInputSchema,
    outputSchema: PostToolUseFailureOutputSchema,
  },
  UserPromptSubmit: {
    inputSchema: UserPromptSubmitInputSchema,
    outputSchema: UserPromptSubmitOutputSchema,
  },
  Notification: {
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  Stop: { inputSchema: StopInputSchema, outputSchema: StopOutputSchema },
  SubagentStart: {
    inputSchema: SubagentStartInputSchema,
    outputSchema: SubagentStartOutputSchema,
  },
  SubagentStop: {
    inputSchema: SubagentStopInputSchema,
    outputSchema: SubagentStopOutputSchema,
  },
  PreCompact: {
    inputSchema: PreCompactInputSchema,
    outputSchema: PreCompactOutputSchema,
  },
  PostCompact: {
    inputSchema: PostCompactInputSchema,
    outputSchema: PostCompactOutputSchema,
  },
  SessionStart: {
    inputSchema: SessionStartInputSchema,
    outputSchema: SessionStartOutputSchema,
  },
  SessionEnd: {
    inputSchema: SessionEndInputSchema,
    outputSchema: SessionEndOutputSchema,
  },
  Setup: { inputSchema: SetupInputSchema, outputSchema: SetupOutputSchema },
  TeammateIdle: {
    inputSchema: TeammateIdleInputSchema,
    outputSchema: TeammateIdleOutputSchema,
  },
  TaskCreated: {
    inputSchema: TaskCreatedInputSchema,
    outputSchema: TaskCreatedOutputSchema,
  },
  TaskCompleted: {
    inputSchema: TaskCompletedInputSchema,
    outputSchema: TaskCompletedOutputSchema,
  },
  ConfigChange: {
    inputSchema: ConfigChangeInputSchema,
    outputSchema: ConfigChangeOutputSchema,
  },
  WorktreeCreate: {
    inputSchema: WorktreeCreateInputSchema,
    outputSchema: WorktreeCreateOutputSchema,
  },
  WorktreeRemove: {
    inputSchema: WorktreeRemoveInputSchema,
    outputSchema: WorktreeRemoveOutputSchema,
  },
  InstructionsLoaded: {
    inputSchema: InstructionsLoadedInputSchema,
    outputSchema: InstructionsLoadedOutputSchema,
  },
  Elicitation: {
    inputSchema: ElicitationInputSchema,
    outputSchema: ElicitationOutputSchema,
  },
  ElicitationResult: {
    inputSchema: ElicitationResultInputSchema,
    outputSchema: ElicitationResultOutputSchema,
  },
  StopFailure: {
    inputSchema: StopFailureInputSchema,
    outputSchema: StopFailureOutputSchema,
  },
  CwdChanged: {
    inputSchema: CwdChangedInputSchema,
    outputSchema: CwdChangedOutputSchema,
  },
  FileChanged: {
    inputSchema: FileChangedInputSchema,
    outputSchema: FileChangedOutputSchema,
  },
})
