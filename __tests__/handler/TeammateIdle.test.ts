import { describe, it, expect } from "vitest"
import { buildInput, runHandler, HOOK_OUTPUTS } from "./test-utils.js"
import { TeammateIdleOutputSchema } from "../../hooks/TeammateIdle.mjs"

const EVENT = "TeammateIdle"

describe(`HookHandler("${EVENT}")`, () => {
  it("parses valid input and returns all fields", async () => {
    const input = buildInput(EVENT)
    const result = await runHandler(EVENT, input, null)

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stderr)
    expect(parsed.hook_event_name).toBe(EVENT)
    expect(parsed.teammate_name).toBe("test-teammate")
    expect(parsed.team_name).toBe("test-team")
  })

  it("emits valid output that passes output schema", async () => {
    const input = buildInput(EVENT)
    const output = HOOK_OUTPUTS[EVENT]
    const result = await runHandler(EVENT, input, output)

    expect(result.exitCode).toBe(0)
    const emitted = JSON.parse(result.stdout)
    const parsed = TeammateIdleOutputSchema.safeParse(emitted)
    expect(parsed.success).toBe(true)
    expect(emitted.continue).toBe(false)
    expect(emitted.stopReason).toBe("idle")
  })

  it("emits empty output successfully", async () => {
    const input = buildInput(EVENT)
    const result = await runHandler(EVENT, input, {})

    expect(result.exitCode).toBe(0)
    const emitted = JSON.parse(result.stdout)
    const parsed = TeammateIdleOutputSchema.safeParse(emitted)
    expect(parsed.success).toBe(true)
  })

  it("exits with code 2 on invalid input", async () => {
    const result = await runHandler(EVENT, { invalid: true }, null)
    expect(result.exitCode).toBe(2)
  })
})
