import { spawn } from "node:child_process"
import * as clack from "@clack/prompts"
import { listAllHooks, getSettingsPath, readSettings } from "./settings.mjs"
import { getHookMeta } from "./hook-metadata.mjs"

/**
 * Interactive flow to test a hook by running its command handlers
 * with a synthetic JSON input on stdin.
 *
 * @param {"user" | "project" | "local"} scope
 * @returns {Promise<void>}
 */
export async function testHookFlow(scope) {
  const filePath = getSettingsPath(scope)
  const settings = await readSettings(filePath)
  const hooks = listAllHooks(settings)

  if (hooks.length === 0) {
    clack.log.info(`No hooks configured in ${scope} settings`)
    return
  }

  const choice = await clack.select({
    message: "Select a hook to test:",
    options: hooks.map(({ eventName, index, entry }) => {
      const e = /** @type {Record<string, unknown>} */ (entry)
      const matcher = e.matcher ? ` [${e.matcher}]` : ""
      const handlers = /** @type {unknown[]} */ (e.hooks || [])
      const types = handlers
        .map((h) => /** @type {Record<string, unknown>} */ (h).type)
        .join(", ")
      return {
        value: `${eventName}::${index}`,
        label: `${eventName}#${index}${matcher}`,
        hint: `handlers: ${types}`,
      }
    }),
  })

  if (clack.isCancel(choice)) return

  const [evName, idxStr] = /** @type {string} */ (choice).split("::")
  const idx = Number(idxStr)
  const hookEntry = hooks.find((h) => h.eventName === evName && h.index === idx)
  if (!hookEntry) return

  const meta = getHookMeta(evName)
  const entry = /** @type {Record<string, unknown>} */ (hookEntry.entry)
  const handlers = /** @type {Array<Record<string, unknown>>} */ (
    entry.hooks || []
  )

  // Build synthetic input
  const syntheticInput = buildSyntheticInput(evName, meta)

  clack.log.info(`Testing ${evName}#${idx} with synthetic input...`)
  clack.log.message(JSON.stringify(syntheticInput, null, 2))

  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i]

    if (handler.type !== "command") {
      clack.log.warn(
        `Skipping handler ${i} (type: ${handler.type}) — only command handlers can be tested locally`,
      )
      continue
    }

    const command = /** @type {string} */ (handler.command)
    clack.log.step(`Running handler ${i}: ${command}`)

    const s = clack.spinner()
    s.start("Executing...")

    try {
      const result = await runCommand(command, JSON.stringify(syntheticInput))
      s.stop("Done")

      if (result.exitCode !== 0) {
        clack.log.error(`Exit code: ${result.exitCode}`)
      } else {
        clack.log.success(`Exit code: ${result.exitCode}`)
      }

      if (result.stdout.trim()) {
        clack.log.message(`stdout:\n${result.stdout}`)
      }
      if (result.stderr.trim()) {
        clack.log.warn(`stderr:\n${result.stderr}`)
      }
    } catch (err) {
      s.stop("Failed")
      clack.log.error(`Error: ${err.message}`)
    }
  }
}

/**
 * Builds a minimal synthetic input object for testing.
 * @param {string} eventName
 * @param {import("./hook-metadata.mjs").HookMeta | undefined} meta
 * @returns {Record<string, unknown>}
 */
function buildSyntheticInput(eventName, meta) {
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

  return { ...base, ...(extras[eventName] || {}) }
}

/**
 * Runs a shell command with JSON on stdin.
 * @param {string} command
 * @param {string} stdinData
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
function runCommand(command, stdinData) {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: process.cwd(),
      },
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (d) => {
      stdout += d
    })
    child.stderr.on("data", (d) => {
      stderr += d
    })

    child.on("error", reject)
    child.on("close", (exitCode) => {
      resolve({ exitCode: exitCode ?? 1, stdout, stderr })
    })

    child.stdin.write(stdinData)
    child.stdin.end()
  })
}
