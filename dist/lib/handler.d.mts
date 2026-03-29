// Re-export all types from the hand-authored declarations.
// This file overrides tsc-generated handler.d.mts in dist/ via the build
// copy step, ensuring imports of handler.mjs resolve to the precise
// generic signatures (including conditional return types and ToolInputMap).
export {
  HookHandler,
  HookIOMap,
  HookEventName,
  ToolInputMap,
  BashToolInput,
  WriteToolInput,
  EditToolInput,
  ReadToolInput,
  GlobToolInput,
  GrepToolInput,
  WebFetchToolInput,
  WebSearchToolInput,
  AgentToolInput,
  AskUserQuestionToolInput,
  type EnvVarReturnType,
} from "./handler-types.d.mts"
