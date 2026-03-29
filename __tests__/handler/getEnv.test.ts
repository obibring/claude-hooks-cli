import { describe, it, expect } from "vitest"
import { buildInput, runScript } from "./test-utils.js"

const EVENT = "Stop"

function makeScript(envVarName: string): string {
  return `
    import { HookHandler } from './lib/handler.mjs';
    const handler = new HookHandler('${EVENT}');
    handler.parseInput();
    const val = handler.getEnv('${envVarName}');
    process.stdout.write(JSON.stringify({ value: val ?? null }));
    handler.exit();
  `
}

describe("HookHandler.getEnv()", () => {
  it("reads CLAUDE_PROJECT_DIR from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_PROJECT_DIR"),
      input,
      { CLAUDE_PROJECT_DIR: "/my/project" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("/my/project")
  })

  it("reads CLAUDE_ENV_FILE from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_ENV_FILE"),
      input,
      { CLAUDE_ENV_FILE: "/tmp/env-file" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("/tmp/env-file")
  })

  it("reads CLAUDE_CODE_REMOTE from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_CODE_REMOTE"),
      input,
      { CLAUDE_CODE_REMOTE: "true" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("true")
  })

  it("reads CLAUDE_PLUGIN_ROOT from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_PLUGIN_ROOT"),
      input,
      { CLAUDE_PLUGIN_ROOT: "/plugins/my-plugin" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("/plugins/my-plugin")
  })

  it("reads CLAUDE_SKILL_DIR from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_SKILL_DIR"),
      input,
      { CLAUDE_SKILL_DIR: "/skills/my-skill" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("/skills/my-skill")
  })

  it("reads CLAUDE_PLUGIN_DATA from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_PLUGIN_DATA"),
      input,
      { CLAUDE_PLUGIN_DATA: "/data/my-plugin" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("/data/my-plugin")
  })

  it("reads CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS from process.env", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS"),
      input,
      { CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS: "5000" },
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe("5000")
  })

  it("returns null when env var is not set", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(
      makeScript("CLAUDE_PLUGIN_ROOT"),
      input,
      {},
    )

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.value).toBe(null)
  })
})
