import { spawn } from "node:child_process"
import { resolve } from "node:path"

const PROJECT_ROOT = resolve(import.meta.dirname, "../..")

/**
 * Common base fields for all hook inputs.
 */
export const BASE_INPUT = {
  session_id: "test-session-123",
  transcript_path: "/tmp/test-transcript.json",
  cwd: "/tmp/test-cwd",
  permission_mode: "default" as const,
}

/**
 * Hook-specific input fields for all 26 hooks.
 */
export const HOOK_SPECIFIC_INPUTS: Record<string, Record<string, unknown>> = {
  PreToolUse: {
    tool_name: "Bash",
    tool_input: { command: "echo test" },
    tool_use_id: "tu-1",
  },
  PermissionRequest: {
    tool_name: "Bash",
    tool_input: { command: "echo test" },
  },
  PostToolUse: {
    tool_name: "Bash",
    tool_input: { command: "echo test" },
    tool_use_id: "tu-1",
    tool_response: "test output",
  },
  PostToolUseFailure: {
    tool_name: "Bash",
    tool_input: { command: "echo test" },
    tool_use_id: "tu-1",
    error: "test error",
    is_interrupt: false,
  },
  UserPromptSubmit: { prompt: "test prompt" },
  Notification: {
    notification_type: "permission_prompt",
    message: "Test notification",
    title: "Test",
  },
  Stop: { last_assistant_message: "Test response", stop_hook_active: false },
  SubagentStart: { agent_id: "agent-1", agent_type: "Bash" },
  SubagentStop: {
    agent_id: "agent-1",
    agent_type: "Bash",
    last_assistant_message: "Done",
    agent_transcript_path: "/tmp/test.json",
    stop_hook_active: false,
  },
  PreCompact: { trigger: "manual" },
  PostCompact: { trigger: "manual", compact_summary: "Test summary" },
  SessionStart: { model: "claude-opus-4-6", source: "startup" },
  SessionEnd: { reason: "other" },
  Setup: {},
  TeammateIdle: { teammate_name: "test-teammate", team_name: "test-team" },
  TaskCreated: {
    task_id: "task-1",
    task_subject: "Test",
    task_description: "Test task",
    teammate_name: "test-teammate",
    team_name: "test-team",
  },
  TaskCompleted: {
    task_id: "task-1",
    task_subject: "Test",
    task_description: "Test task",
    teammate_name: "test-teammate",
    team_name: "test-team",
  },
  ConfigChange: {
    file_path: "/test/settings.json",
    source: "project_settings",
  },
  WorktreeCreate: { name: "test-worktree" },
  WorktreeRemove: { worktree_path: "/tmp/test-worktree" },
  InstructionsLoaded: {
    file_path: "/test/CLAUDE.md",
    memory_type: "claude_md",
    load_reason: "session_start",
  },
  Elicitation: {
    mcp_server_name: "test-server",
    message: "Test?",
    mode: "text",
    url: "http://localhost",
    elicitation_id: "e-1",
    requested_schema: {},
  },
  ElicitationResult: {
    mcp_server_name: "test-server",
    user_response: "yes",
    message: "Test?",
    elicitation_id: "e-1",
  },
  StopFailure: {
    error: "unknown",
    error_details: {},
    last_assistant_message: "...",
  },
  CwdChanged: { old_cwd: "/old", new_cwd: "/new" },
  FileChanged: { file_path: ".env", event: "change" },
}

/**
 * Builds a complete valid input object for a hook event.
 */
export function buildInput(eventName: string): Record<string, unknown> {
  return {
    hook_event_name: eventName,
    ...BASE_INPUT,
    ...(HOOK_SPECIFIC_INPUTS[eventName] ?? {}),
  }
}

/**
 * Valid output objects for each hook event that can be parsed by the output schema.
 */
export const HOOK_OUTPUTS: Record<string, Record<string, unknown>> = {
  PreToolUse: {
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: "blocked",
    },
  },
  PermissionRequest: {
    hookSpecificOutput: { decision: { behavior: "allow" } },
  },
  PostToolUse: { decision: "block" },
  PostToolUseFailure: { additionalContext: "error handled" },
  UserPromptSubmit: { prompt: "modified prompt" },
  Notification: {},
  Stop: { decision: "block" },
  SubagentStart: {},
  SubagentStop: { decision: "block" },
  PreCompact: {},
  PostCompact: {},
  SessionStart: {},
  SessionEnd: {},
  Setup: {},
  TeammateIdle: { continue: false, stopReason: "idle" },
  TaskCreated: { continue: false, stopReason: "blocked" },
  TaskCompleted: { additionalContext: "task done" },
  ConfigChange: { decision: "block" },
  WorktreeCreate: {},
  WorktreeRemove: {},
  InstructionsLoaded: { additionalContext: "loaded" },
  Elicitation: { hookSpecificOutput: { action: "accept" } },
  ElicitationResult: { hookSpecificOutput: { action: "decline" } },
  StopFailure: { systemMessage: "rate limited" },
  CwdChanged: {},
  FileChanged: {},
}

export interface RunHandlerResult {
  exitCode: number
  stdout: string
  stderr: string
}

/**
 * Spawns a Node.js child process that runs a handler script.
 * The script is a one-liner that imports HookHandler, parses input,
 * and emits the provided output.
 *
 * @param eventName - Hook event name
 * @param input - JSON object to pipe to stdin
 * @param output - Output object to emit (if null, calls handler.exit())
 */
export function runHandler(
  eventName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown> | null,
): Promise<RunHandlerResult> {
  const outputExpr = output === null ? "handler.exit()" : `handler.emitOutput(${JSON.stringify(output)})`

  const script = `
    import { HookHandler } from './lib/handler.mjs';
    const handler = new HookHandler('${eventName}');
    const input = handler.parseInput();
    process.stderr.write(JSON.stringify(input));
    ${outputExpr};
  `

  return new Promise((resolve, reject) => {
    const child = spawn("node", ["--input-type=module", "-e", script], {
      cwd: PROJECT_ROOT,
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString()
    })
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString()
    })

    child.on("error", reject)
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr })
    })

    child.stdin.write(JSON.stringify(input))
    child.stdin.end()
  })
}
