export namespace HookSchemas {
  namespace ConfigChange {
    export { ConfigChangeConfigSchema as Config }
    export { ConfigChangeInputSchema as Input }
    export { ConfigChangeOutputSchema as Output }
    export { ConfigChangeMatcherSchema as Matcher }
  }
  namespace CwdChanged {
    export { CwdChangedConfigSchema as Config }
    export { CwdChangedInputSchema as Input }
    export { CwdChangedOutputSchema as Output }
    export { CwdChangedMatcherSchema as Matcher }
  }
  namespace Elicitation {
    export { ElicitationConfigSchema as Config }
    export { ElicitationInputSchema as Input }
    export { ElicitationOutputSchema as Output }
    export { ElicitationMatcherSchema as Matcher }
    export { ElicitationHookSpecificOutputSchema as HookSpecificOutput }
  }
  namespace ElicitationResult {
    export { ElicitationResultConfigSchema as Config }
    export { ElicitationResultInputSchema as Input }
    export { ElicitationResultOutputSchema as Output }
    export { ElicitationResultMatcherSchema as Matcher }
    export { ElicitationResultHookSpecificOutputSchema as HookSpecificOutput }
  }
  namespace FileChanged {
    export { FileChangedConfigSchema as Config }
    export { FileChangedInputSchema as Input }
    export { FileChangedOutputSchema as Output }
    export { FileChangedMatcherSchema as Matcher }
  }
  namespace InstructionsLoaded {
    export { InstructionsLoadedConfigSchema as Config }
    export { InstructionsLoadedInputSchema as Input }
    export { InstructionsLoadedOutputSchema as Output }
    export { InstructionsLoadedMatcherSchema as Matcher }
  }
  namespace Notification {
    export { NotificationConfigSchema as Config }
    export { NotificationInputSchema as Input }
    export { NotificationOutputSchema as Output }
    export { NotificationMatcherExportSchema as Matcher }
  }
  namespace PermissionRequest {
    export { PermissionRequestConfigSchema as Config }
    export { PermissionRequestInputSchema as Input }
    export { PermissionRequestOutputSchema as Output }
    export { PermissionRequestMatcherSchema as Matcher }
    export { PermissionRequestHookSpecificOutputSchema as HookSpecificOutput }
  }
  namespace PostCompact {
    export { PostCompactConfigSchema as Config }
    export { PostCompactInputSchema as Input }
    export { PostCompactOutputSchema as Output }
    export { PostCompactMatcherSchema as Matcher }
  }
  namespace PostToolUse {
    export { PostToolUseConfigSchema as Config }
    export { PostToolUseInputSchema as Input }
    export { PostToolUseOutputSchema as Output }
    export { PostToolUseMatcherSchema as Matcher }
  }
  namespace PostToolUseFailure {
    export { PostToolUseFailureConfigSchema as Config }
    export { PostToolUseFailureInputSchema as Input }
    export { PostToolUseFailureOutputSchema as Output }
    export { PostToolUseFailureMatcherSchema as Matcher }
  }
  namespace PreCompact {
    export { PreCompactConfigSchema as Config }
    export { PreCompactInputSchema as Input }
    export { PreCompactOutputSchema as Output }
    export { PreCompactMatcherSchema as Matcher }
  }
  namespace PreToolUse {
    export { PreToolUseConfigSchema as Config }
    export { PreToolUseInputSchema as Input }
    export { PreToolUseOutputSchema as Output }
    export { PreToolUseMatcherSchema as Matcher }
    export { PreToolUseHookSpecificOutputSchema as HookSpecificOutput }
  }
  namespace SessionEnd {
    export { SessionEndConfigSchema as Config }
    export { SessionEndInputSchema as Input }
    export { SessionEndOutputSchema as Output }
    export { SessionEndMatcherSchema as Matcher }
  }
  namespace SessionStart {
    export { SessionStartConfigSchema as Config }
    export { SessionStartInputSchema as Input }
    export { SessionStartOutputSchema as Output }
    export { SessionStartMatcherSchema as Matcher }
  }
  namespace Setup {
    export { SetupConfigSchema as Config }
    export { SetupInputSchema as Input }
    export { SetupOutputSchema as Output }
    export { SetupMatcherSchema as Matcher }
  }
  namespace Stop {
    export { StopConfigSchema as Config }
    export { StopInputSchema as Input }
    export { StopOutputSchema as Output }
    export { StopMatcherSchema as Matcher }
  }
  namespace StopFailure {
    export { StopFailureConfigSchema as Config }
    export { StopFailureInputSchema as Input }
    export { StopFailureOutputSchema as Output }
    export { StopFailureMatcherSchema as Matcher }
  }
  namespace SubagentStart {
    export { SubagentStartConfigSchema as Config }
    export { SubagentStartInputSchema as Input }
    export { SubagentStartOutputSchema as Output }
    export { SubagentStartMatcherSchema as Matcher }
  }
  namespace SubagentStop {
    export { SubagentStopConfigSchema as Config }
    export { SubagentStopInputSchema as Input }
    export { SubagentStopOutputSchema as Output }
    export { SubagentStopMatcherSchema as Matcher }
  }
  namespace TaskCompleted {
    export { TaskCompletedConfigSchema as Config }
    export { TaskCompletedInputSchema as Input }
    export { TaskCompletedOutputSchema as Output }
    export { TaskCompletedMatcherSchema as Matcher }
  }
  namespace TaskCreated {
    export { TaskCreatedConfigSchema as Config }
    export { TaskCreatedInputSchema as Input }
    export { TaskCreatedOutputSchema as Output }
    export { TaskCreatedMatcherSchema as Matcher }
  }
  namespace TeammateIdle {
    export { TeammateIdleConfigSchema as Config }
    export { TeammateIdleInputSchema as Input }
    export { TeammateIdleOutputSchema as Output }
    export { TeammateIdleMatcherSchema as Matcher }
  }
  namespace UserPromptSubmit {
    export { UserPromptSubmitConfigSchema as Config }
    export { UserPromptSubmitInputSchema as Input }
    export { UserPromptSubmitOutputSchema as Output }
    export { UserPromptSubmitMatcherSchema as Matcher }
  }
  namespace WorktreeCreate {
    export { WorktreeCreateConfigSchema as Config }
    export { WorktreeCreateInputSchema as Input }
    export { WorktreeCreateOutputSchema as Output }
    export { WorktreeCreateMatcherSchema as Matcher }
  }
  namespace WorktreeRemove {
    export { WorktreeRemoveConfigSchema as Config }
    export { WorktreeRemoveInputSchema as Input }
    export { WorktreeRemoveOutputSchema as Output }
    export { WorktreeRemoveMatcherSchema as Matcher }
  }
}
import { ConfigChangeConfigSchema } from "./ConfigChange.mjs"
import { ConfigChangeInputSchema } from "./ConfigChange.mjs"
import { ConfigChangeOutputSchema } from "./ConfigChange.mjs"
import { ConfigChangeMatcherSchema } from "./ConfigChange.mjs"
import { CwdChangedConfigSchema } from "./CwdChanged.mjs"
import { CwdChangedInputSchema } from "./CwdChanged.mjs"
import { CwdChangedOutputSchema } from "./CwdChanged.mjs"
import { CwdChangedMatcherSchema } from "./CwdChanged.mjs"
import { ElicitationConfigSchema } from "./Elicitation.mjs"
import { ElicitationInputSchema } from "./Elicitation.mjs"
import { ElicitationOutputSchema } from "./Elicitation.mjs"
import { ElicitationMatcherSchema } from "./Elicitation.mjs"
import { ElicitationHookSpecificOutputSchema } from "./Elicitation.mjs"
import { ElicitationResultConfigSchema } from "./ElicitationResult.mjs"
import { ElicitationResultInputSchema } from "./ElicitationResult.mjs"
import { ElicitationResultOutputSchema } from "./ElicitationResult.mjs"
import { ElicitationResultMatcherSchema } from "./ElicitationResult.mjs"
import { ElicitationResultHookSpecificOutputSchema } from "./ElicitationResult.mjs"
import { FileChangedConfigSchema } from "./FileChanged.mjs"
import { FileChangedInputSchema } from "./FileChanged.mjs"
import { FileChangedOutputSchema } from "./FileChanged.mjs"
import { FileChangedMatcherSchema } from "./FileChanged.mjs"
import { InstructionsLoadedConfigSchema } from "./InstructionsLoaded.mjs"
import { InstructionsLoadedInputSchema } from "./InstructionsLoaded.mjs"
import { InstructionsLoadedOutputSchema } from "./InstructionsLoaded.mjs"
import { InstructionsLoadedMatcherSchema } from "./InstructionsLoaded.mjs"
import { NotificationConfigSchema } from "./Notification.mjs"
import { NotificationInputSchema } from "./Notification.mjs"
import { NotificationOutputSchema } from "./Notification.mjs"
import { NotificationMatcherExportSchema } from "./Notification.mjs"
import { PermissionRequestConfigSchema } from "./PermissionRequest.mjs"
import { PermissionRequestInputSchema } from "./PermissionRequest.mjs"
import { PermissionRequestOutputSchema } from "./PermissionRequest.mjs"
import { PermissionRequestMatcherSchema } from "./PermissionRequest.mjs"
import { PermissionRequestHookSpecificOutputSchema } from "./PermissionRequest.mjs"
import { PostCompactConfigSchema } from "./PostCompact.mjs"
import { PostCompactInputSchema } from "./PostCompact.mjs"
import { PostCompactOutputSchema } from "./PostCompact.mjs"
import { PostCompactMatcherSchema } from "./PostCompact.mjs"
import { PostToolUseConfigSchema } from "./PostToolUse.mjs"
import { PostToolUseInputSchema } from "./PostToolUse.mjs"
import { PostToolUseOutputSchema } from "./PostToolUse.mjs"
import { PostToolUseMatcherSchema } from "./PostToolUse.mjs"
import { PostToolUseFailureConfigSchema } from "./PostToolUseFailure.mjs"
import { PostToolUseFailureInputSchema } from "./PostToolUseFailure.mjs"
import { PostToolUseFailureOutputSchema } from "./PostToolUseFailure.mjs"
import { PostToolUseFailureMatcherSchema } from "./PostToolUseFailure.mjs"
import { PreCompactConfigSchema } from "./PreCompact.mjs"
import { PreCompactInputSchema } from "./PreCompact.mjs"
import { PreCompactOutputSchema } from "./PreCompact.mjs"
import { PreCompactMatcherSchema } from "./PreCompact.mjs"
import { PreToolUseConfigSchema } from "./PreToolUse.mjs"
import { PreToolUseInputSchema } from "./PreToolUse.mjs"
import { PreToolUseOutputSchema } from "./PreToolUse.mjs"
import { PreToolUseMatcherSchema } from "./PreToolUse.mjs"
import { PreToolUseHookSpecificOutputSchema } from "./PreToolUse.mjs"
import { SessionEndConfigSchema } from "./SessionEnd.mjs"
import { SessionEndInputSchema } from "./SessionEnd.mjs"
import { SessionEndOutputSchema } from "./SessionEnd.mjs"
import { SessionEndMatcherSchema } from "./SessionEnd.mjs"
import { SessionStartConfigSchema } from "./SessionStart.mjs"
import { SessionStartInputSchema } from "./SessionStart.mjs"
import { SessionStartOutputSchema } from "./SessionStart.mjs"
import { SessionStartMatcherSchema } from "./SessionStart.mjs"
import { SetupConfigSchema } from "./Setup.mjs"
import { SetupInputSchema } from "./Setup.mjs"
import { SetupOutputSchema } from "./Setup.mjs"
import { SetupMatcherSchema } from "./Setup.mjs"
import { StopConfigSchema } from "./Stop.mjs"
import { StopInputSchema } from "./Stop.mjs"
import { StopOutputSchema } from "./Stop.mjs"
import { StopMatcherSchema } from "./Stop.mjs"
import { StopFailureConfigSchema } from "./StopFailure.mjs"
import { StopFailureInputSchema } from "./StopFailure.mjs"
import { StopFailureOutputSchema } from "./StopFailure.mjs"
import { StopFailureMatcherSchema } from "./StopFailure.mjs"
import { SubagentStartConfigSchema } from "./SubagentStart.mjs"
import { SubagentStartInputSchema } from "./SubagentStart.mjs"
import { SubagentStartOutputSchema } from "./SubagentStart.mjs"
import { SubagentStartMatcherSchema } from "./SubagentStart.mjs"
import { SubagentStopConfigSchema } from "./SubagentStop.mjs"
import { SubagentStopInputSchema } from "./SubagentStop.mjs"
import { SubagentStopOutputSchema } from "./SubagentStop.mjs"
import { SubagentStopMatcherSchema } from "./SubagentStop.mjs"
import { TaskCompletedConfigSchema } from "./TaskCompleted.mjs"
import { TaskCompletedInputSchema } from "./TaskCompleted.mjs"
import { TaskCompletedOutputSchema } from "./TaskCompleted.mjs"
import { TaskCompletedMatcherSchema } from "./TaskCompleted.mjs"
import { TaskCreatedConfigSchema } from "./TaskCreated.mjs"
import { TaskCreatedInputSchema } from "./TaskCreated.mjs"
import { TaskCreatedOutputSchema } from "./TaskCreated.mjs"
import { TaskCreatedMatcherSchema } from "./TaskCreated.mjs"
import { TeammateIdleConfigSchema } from "./TeammateIdle.mjs"
import { TeammateIdleInputSchema } from "./TeammateIdle.mjs"
import { TeammateIdleOutputSchema } from "./TeammateIdle.mjs"
import { TeammateIdleMatcherSchema } from "./TeammateIdle.mjs"
import { UserPromptSubmitConfigSchema } from "./UserPromptSubmit.mjs"
import { UserPromptSubmitInputSchema } from "./UserPromptSubmit.mjs"
import { UserPromptSubmitOutputSchema } from "./UserPromptSubmit.mjs"
import { UserPromptSubmitMatcherSchema } from "./UserPromptSubmit.mjs"
import { WorktreeCreateConfigSchema } from "./WorktreeCreate.mjs"
import { WorktreeCreateInputSchema } from "./WorktreeCreate.mjs"
import { WorktreeCreateOutputSchema } from "./WorktreeCreate.mjs"
import { WorktreeCreateMatcherSchema } from "./WorktreeCreate.mjs"
import { WorktreeRemoveConfigSchema } from "./WorktreeRemove.mjs"
import { WorktreeRemoveInputSchema } from "./WorktreeRemove.mjs"
import { WorktreeRemoveOutputSchema } from "./WorktreeRemove.mjs"
import { WorktreeRemoveMatcherSchema } from "./WorktreeRemove.mjs"
//# sourceMappingURL=index.d.mts.map
