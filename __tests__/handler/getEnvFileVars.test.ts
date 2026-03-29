import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { writeFileSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { buildInput, runScript } from "./test-utils.js"

const EVENT = "SessionStart"
const TMP_DIR = join(tmpdir(), "cch-test-" + Date.now())

function makeScript(envFilePath: string, options?: string): string {
  const optStr = options ? `, ${options}` : ""
  return `
    import { HookHandler } from './lib/handler.mjs';
    const handler = new HookHandler('${EVENT}');
    handler.parseInput();
    const vars = handler.getEnvFileVars(${optStr});
    process.stdout.write(JSON.stringify(vars));
    handler.exit("success");
  `
}

describe("HookHandler.getEnvFileVars()", () => {
  const envFilePath = join(TMP_DIR, "env-file")

  beforeAll(() => {
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it("parses simple KEY=value pairs", async () => {
    writeFileSync(envFilePath, "FOO=bar\nBAZ=qux\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })

  it("strips comment lines and inline comments", async () => {
    writeFileSync(
      envFilePath,
      "# This is a comment\nFOO=bar # inline comment\n# Another comment\nBAZ=qux\n",
      "utf-8",
    )
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })

  it("unwraps matched double quotes", async () => {
    writeFileSync(envFilePath, 'FOO="hello world"\n', "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("hello world")
  })

  it("unwraps matched single quotes", async () => {
    writeFileSync(envFilePath, "FOO='hello world'\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("hello world")
  })

  it("keeps unmatched quotes", async () => {
    writeFileSync(envFilePath, 'FOO="hello\nBAR=world"\n', "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe('"hello')
    expect(vars.BAR).toBe('world"')
  })

  it("later lines override earlier ones", async () => {
    writeFileSync(envFilePath, "FOO=first\nFOO=second\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("second")
  })

  it("skips lines without valid VAR_NAME=value structure", async () => {
    writeFileSync(
      envFilePath,
      "VALID=yes\n123INVALID=no\n=nokey\njust text\nALSO_VALID=ok\n",
      "utf-8",
    )
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.VALID).toBe("yes")
    expect(vars.ALSO_VALID).toBe("ok")
    expect(vars["123INVALID"]).toBeUndefined()
    expect(vars[""]).toBeUndefined()
  })

  it("returns empty object when CLAUDE_ENV_FILE is not set", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {})

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars).toEqual({})
  })

  it("returns empty object when file does not exist", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: "/nonexistent/path/env-file",
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars).toEqual({})
  })

  it("handles empty lines and whitespace", async () => {
    writeFileSync(
      envFilePath,
      "\n  \n  FOO = bar  \n\n  BAZ=  qux  \n\n",
      "utf-8",
    )
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })
})
