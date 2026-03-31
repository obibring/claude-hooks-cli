import { describe, it, expect } from "vitest"
import { realpathSync } from "node:fs"
import { runCommand } from "../../lib/run-command.mjs"

describe("runCommand", () => {
  it("runs a command and captures stdout", async () => {
    const result = await runCommand('echo "hello"', "")
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("hello")
    expect(result.stderr).toBe("")
  })

  it("captures non-zero exit codes", async () => {
    const result = await runCommand("exit 2", "")
    expect(result.exitCode).toBe(2)
  })

  it("pipes stdin data to the command", async () => {
    const input = JSON.stringify({ foo: "bar" })
    const result = await runCommand("cat", input)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe(input)
  })

  it("accepts custom environment variables", async () => {
    const result = await runCommand("echo $MY_VAR", "", {
      env: { MY_VAR: "hello" },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("hello")
  })

  it("respects cwd option", async () => {
    const result = await runCommand("pwd", "", { cwd: "/tmp" })
    const expected = realpathSync("/tmp")
    expect(result.stdout.trim()).toBe(expected)
  })

  it("captures stderr output", async () => {
    const result = await runCommand("echo err >&2", "")
    expect(result.stderr).toContain("err")
  })

  it("sets CLAUDE_PROJECT_DIR", async () => {
    const result = await runCommand("echo $CLAUDE_PROJECT_DIR", "")
    expect(result.stdout.trim()).not.toBe("")
  })

  it("timeout kills long-running command", async () => {
    const result = await Promise.race([
      runCommand("sleep 10", "", { timeout: 500 }),
      new Promise<{ exitCode: number }>((resolve) =>
        setTimeout(() => resolve({ exitCode: -999 }), 3000),
      ),
    ])
    expect(result.exitCode).not.toBe(0)
    expect(result.exitCode).not.toBe(-999)
  })

  it("captures both stdout and stderr", async () => {
    const result = await runCommand("echo out && echo err >&2", "")
    expect(result.stdout).toContain("out")
    expect(result.stderr).toContain("err")
  })
})
