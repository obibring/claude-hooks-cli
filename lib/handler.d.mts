// Re-export all types from the hand-authored declarations.
// This file ensures that importing from handler.mjs resolves to the
// precise generic signatures (including conditional return types)
// rather than the looser types tsc infers from the JSDoc in handler.mjs.
export { HookHandler, HookIOMap, HookEventName, type EnvVarReturnType } from "./handler-types.d.mts"
