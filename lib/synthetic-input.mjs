/**
 * Builds a minimal synthetic input object for testing hooks.
 *
 * @param {string} eventName - Hook event name (e.g. "PreToolUse", "SessionStart")
 * @param {Record<string, unknown>} [overrides] - Optional fields to merge/override
 * @returns {Record<string, unknown>}
 */
export function buildSyntheticInput(eventName, overrides = {}) {
  const base = {
    hook_event_name: eventName,
    session_id: "test-session-" + Date.now(),
    transcript_path: "/tmp/test-transcript.json",
    cwd: process.cwd(),
    permission_mode: "default",
  }

  // Add minimal hook-specific fields so the script doesn't crash
  const extras = {
    PreToolUse: {
      tool_name: "Bash",
      tool_input: { command: "echo test" },
      tool_use_id: "test-tu-1",
    },
    PermissionRequest: {
      tool_name: "Bash",
      tool_input: { command: "echo test" },
    },
    PostToolUse: {
      tool_name: "Bash",
      tool_input: { command: "echo test" },
      tool_use_id: "test-tu-1",
      tool_response: "test output",
    },
    PostToolUseFailure: {
      tool_name: "Bash",
      tool_input: { command: "echo test" },
      tool_use_id: "test-tu-1",
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
    SubagentStart: { agent_id: "test-agent-1", agent_type: "Bash" },
    SubagentStop: {
      agent_id: "test-agent-1",
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
      task_id: "test-task-1",
      task_subject: "Test",
      task_description: "Test task",
      teammate_name: "test-teammate",
      team_name: "test-team",
    },
    TaskCompleted: {
      task_id: "test-task-1",
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
      elicitation_id: "test-e-1",
      requested_schema: {},
    },
    ElicitationResult: {
      mcp_server_name: "test-server",
      user_response: "yes",
      message: "Test?",
      elicitation_id: "test-e-1",
    },
    StopFailure: {
      error: "unknown",
      error_details: {},
      last_assistant_message: "...",
    },
    CwdChanged: { old_cwd: "/old", new_cwd: process.cwd() },
    FileChanged: { file_path: ".env", event: "change" },
  }

  return {
    ...base,
    .../** @type {Record<string, Record<string, unknown>>} */ (
      extras[eventName] || {}
    ),
    ...overrides,
  }
}
