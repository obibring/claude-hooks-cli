import { describe, it, expect } from "vitest"
import { buildInput, runHandler, HOOK_OUTPUTS } from "./test-utils.js"
import { ElicitationOutputSchema } from "../../hooks/Elicitation.mjs"

const EVENT = "Elicitation"

describe(`HookHandler("${EVENT}")`, () => {
  it("parses valid input and returns all fields", async () => {
    const input = buildInput(EVENT)
    const result = await runHandler(EVENT, input, null)

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stderr)
    expect(parsed.hook_event_name).toBe(EVENT)
    expect(parsed.mcp_server_name).toBe("test-server")
    expect(parsed.message).toBe("Test?")
    expect(parsed.mode).toBe("text")
    expect(parsed.url).toBe("http://localhost")
    expect(parsed.elicitation_id).toBe("e-1")
  })

  it("emits valid output that passes output schema", async () => {
    const input = buildInput(EVENT)
    const output = HOOK_OUTPUTS[EVENT]
    const result = await runHandler(EVENT, input, output)

    expect(result.exitCode).toBe(0)
    const emitted = JSON.parse(result.stdout)
    const parsed = ElicitationOutputSchema.safeParse(emitted)
    expect(parsed.success).toBe(true)
    expect(emitted.hookSpecificOutput.action).toBe("accept")
  })

  it("emits empty output successfully", async () => {
    const input = buildInput(EVENT)
    const result = await runHandler(EVENT, input, {})

    expect(result.exitCode).toBe(0)
    const emitted = JSON.parse(result.stdout)
    const parsed = ElicitationOutputSchema.safeParse(emitted)
    expect(parsed.success).toBe(true)
  })

  it("exits with code 2 on invalid input", async () => {
    const result = await runHandler(EVENT, { invalid: true }, null)
    expect(result.exitCode).toBe(2)
  })
})
