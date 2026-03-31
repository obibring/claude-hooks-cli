export namespace HOOK_SCHEMA_MAP {
  namespace PreToolUse {
    export { PreToolUseInputSchema as inputSchema }
    export { PreToolUseOutputSchema as outputSchema }
  }
  namespace PermissionRequest {
    export { PermissionRequestInputSchema as inputSchema }
    export { PermissionRequestOutputSchema as outputSchema }
  }
  namespace PostToolUse {
    export { PostToolUseInputSchema as inputSchema }
    export { PostToolUseOutputSchema as outputSchema }
  }
  namespace PostToolUseFailure {
    export { PostToolUseFailureInputSchema as inputSchema }
    export { PostToolUseFailureOutputSchema as outputSchema }
  }
  namespace UserPromptSubmit {
    export { UserPromptSubmitInputSchema as inputSchema }
    export { UserPromptSubmitOutputSchema as outputSchema }
  }
  namespace Notification {
    export { NotificationInputSchema as inputSchema }
    export { NotificationOutputSchema as outputSchema }
  }
  namespace Stop {
    export { StopInputSchema as inputSchema }
    export { StopOutputSchema as outputSchema }
  }
  namespace SubagentStart {
    export { SubagentStartInputSchema as inputSchema }
    export { SubagentStartOutputSchema as outputSchema }
  }
  namespace SubagentStop {
    export { SubagentStopInputSchema as inputSchema }
    export { SubagentStopOutputSchema as outputSchema }
  }
  namespace PreCompact {
    export { PreCompactInputSchema as inputSchema }
    export { PreCompactOutputSchema as outputSchema }
  }
  namespace PostCompact {
    export { PostCompactInputSchema as inputSchema }
    export { PostCompactOutputSchema as outputSchema }
  }
  namespace SessionStart {
    export { SessionStartInputSchema as inputSchema }
    export { SessionStartOutputSchema as outputSchema }
  }
  namespace SessionEnd {
    export { SessionEndInputSchema as inputSchema }
    export { SessionEndOutputSchema as outputSchema }
  }
  namespace Setup {
    export { SetupInputSchema as inputSchema }
    export { SetupOutputSchema as outputSchema }
  }
  namespace TeammateIdle {
    export { TeammateIdleInputSchema as inputSchema }
    export { TeammateIdleOutputSchema as outputSchema }
  }
  namespace TaskCreated {
    export { TaskCreatedInputSchema as inputSchema }
    export { TaskCreatedOutputSchema as outputSchema }
  }
  namespace TaskCompleted {
    export { TaskCompletedInputSchema as inputSchema }
    export { TaskCompletedOutputSchema as outputSchema }
  }
  namespace ConfigChange {
    export { ConfigChangeInputSchema as inputSchema }
    export { ConfigChangeOutputSchema as outputSchema }
  }
  namespace WorktreeCreate {
    export { WorktreeCreateInputSchema as inputSchema }
    export { WorktreeCreateOutputSchema as outputSchema }
  }
  namespace WorktreeRemove {
    export { WorktreeRemoveInputSchema as inputSchema }
    export { WorktreeRemoveOutputSchema as outputSchema }
  }
  namespace InstructionsLoaded {
    export { InstructionsLoadedInputSchema as inputSchema }
    export { InstructionsLoadedOutputSchema as outputSchema }
  }
  namespace Elicitation {
    export { ElicitationInputSchema as inputSchema }
    export { ElicitationOutputSchema as outputSchema }
  }
  namespace ElicitationResult {
    export { ElicitationResultInputSchema as inputSchema }
    export { ElicitationResultOutputSchema as outputSchema }
  }
  namespace StopFailure {
    export { StopFailureInputSchema as inputSchema }
    export { StopFailureOutputSchema as outputSchema }
  }
  namespace CwdChanged {
    export { CwdChangedInputSchema as inputSchema }
    export { CwdChangedOutputSchema as outputSchema }
  }
  namespace FileChanged {
    export { FileChangedInputSchema as inputSchema }
    export { FileChangedOutputSchema as outputSchema }
  }
}
import { PreToolUseInputSchema } from "../hooks/PreToolUse.mjs"
import { PreToolUseOutputSchema } from "../hooks/PreToolUse.mjs"
import { PermissionRequestInputSchema } from "../hooks/PermissionRequest.mjs"
import { PermissionRequestOutputSchema } from "../hooks/PermissionRequest.mjs"
import { PostToolUseInputSchema } from "../hooks/PostToolUse.mjs"
import { PostToolUseOutputSchema } from "../hooks/PostToolUse.mjs"
import { PostToolUseFailureInputSchema } from "../hooks/PostToolUseFailure.mjs"
import { PostToolUseFailureOutputSchema } from "../hooks/PostToolUseFailure.mjs"
import { UserPromptSubmitInputSchema } from "../hooks/UserPromptSubmit.mjs"
import { UserPromptSubmitOutputSchema } from "../hooks/UserPromptSubmit.mjs"
import { NotificationInputSchema } from "../hooks/Notification.mjs"
import { NotificationOutputSchema } from "../hooks/Notification.mjs"
import { StopInputSchema } from "../hooks/Stop.mjs"
import { StopOutputSchema } from "../hooks/Stop.mjs"
import { SubagentStartInputSchema } from "../hooks/SubagentStart.mjs"
import { SubagentStartOutputSchema } from "../hooks/SubagentStart.mjs"
import { SubagentStopInputSchema } from "../hooks/SubagentStop.mjs"
import { SubagentStopOutputSchema } from "../hooks/SubagentStop.mjs"
import { PreCompactInputSchema } from "../hooks/PreCompact.mjs"
import { PreCompactOutputSchema } from "../hooks/PreCompact.mjs"
import { PostCompactInputSchema } from "../hooks/PostCompact.mjs"
import { PostCompactOutputSchema } from "../hooks/PostCompact.mjs"
import { SessionStartInputSchema } from "../hooks/SessionStart.mjs"
import { SessionStartOutputSchema } from "../hooks/SessionStart.mjs"
import { SessionEndInputSchema } from "../hooks/SessionEnd.mjs"
import { SessionEndOutputSchema } from "../hooks/SessionEnd.mjs"
import { SetupInputSchema } from "../hooks/Setup.mjs"
import { SetupOutputSchema } from "../hooks/Setup.mjs"
import { TeammateIdleInputSchema } from "../hooks/TeammateIdle.mjs"
import { TeammateIdleOutputSchema } from "../hooks/TeammateIdle.mjs"
import { TaskCreatedInputSchema } from "../hooks/TaskCreated.mjs"
import { TaskCreatedOutputSchema } from "../hooks/TaskCreated.mjs"
import { TaskCompletedInputSchema } from "../hooks/TaskCompleted.mjs"
import { TaskCompletedOutputSchema } from "../hooks/TaskCompleted.mjs"
import { ConfigChangeInputSchema } from "../hooks/ConfigChange.mjs"
import { ConfigChangeOutputSchema } from "../hooks/ConfigChange.mjs"
import { WorktreeCreateInputSchema } from "../hooks/WorktreeCreate.mjs"
import { WorktreeCreateOutputSchema } from "../hooks/WorktreeCreate.mjs"
import { WorktreeRemoveInputSchema } from "../hooks/WorktreeRemove.mjs"
import { WorktreeRemoveOutputSchema } from "../hooks/WorktreeRemove.mjs"
import { InstructionsLoadedInputSchema } from "../hooks/InstructionsLoaded.mjs"
import { InstructionsLoadedOutputSchema } from "../hooks/InstructionsLoaded.mjs"
import { ElicitationInputSchema } from "../hooks/Elicitation.mjs"
import { ElicitationOutputSchema } from "../hooks/Elicitation.mjs"
import { ElicitationResultInputSchema } from "../hooks/ElicitationResult.mjs"
import { ElicitationResultOutputSchema } from "../hooks/ElicitationResult.mjs"
import { StopFailureInputSchema } from "../hooks/StopFailure.mjs"
import { StopFailureOutputSchema } from "../hooks/StopFailure.mjs"
import { CwdChangedInputSchema } from "../hooks/CwdChanged.mjs"
import { CwdChangedOutputSchema } from "../hooks/CwdChanged.mjs"
import { FileChangedInputSchema } from "../hooks/FileChanged.mjs"
import { FileChangedOutputSchema } from "../hooks/FileChanged.mjs"
//# sourceMappingURL=schema-map.d.mts.map
