import { describe, it, expect } from "vitest"
import { buildInput, runScript } from "./test-utils.js"

function makeScript(toolName: string): string {
  return `
    import { HookHandler } from './lib/handler.mjs';
    const handler = new HookHandler('PreToolUse');
    const input = handler.parseInput();
    const toolInput = handler.getToolInput('${toolName}', input);
    process.stdout.write(JSON.stringify(toolInput));
    handler.exit("success");
  `
}

describe("HookHandler.getToolInput()", () => {
  it("returns Bash tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Bash",
      tool_input: { command: "npm test", description: "Run tests", timeout: 120000 },
    }
    const result = await runScript(makeScript("Bash"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.command).toBe("npm test")
    expect(parsed.description).toBe("Run tests")
    expect(parsed.timeout).toBe(120000)
  })

  it("returns Edit tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Edit",
      tool_input: { file_path: "/tmp/file.ts", old_string: "foo", new_string: "bar", replace_all: true },
    }
    const result = await runScript(makeScript("Edit"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.file_path).toBe("/tmp/file.ts")
    expect(parsed.old_string).toBe("foo")
    expect(parsed.new_string).toBe("bar")
    expect(parsed.replace_all).toBe(true)
  })

  it("returns Write tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Write",
      tool_input: { file_path: "/tmp/file.ts", content: "hello" },
    }
    const result = await runScript(makeScript("Write"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.file_path).toBe("/tmp/file.ts")
    expect(parsed.content).toBe("hello")
  })

  it("returns Read tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Read",
      tool_input: { file_path: "/tmp/file.ts", offset: 10, limit: 50 },
    }
    const result = await runScript(makeScript("Read"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.file_path).toBe("/tmp/file.ts")
    expect(parsed.offset).toBe(10)
    expect(parsed.limit).toBe(50)
  })

  it("returns Glob tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Glob",
      tool_input: { pattern: "**/*.ts", path: "/src" },
    }
    const result = await runScript(makeScript("Glob"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.pattern).toBe("**/*.ts")
    expect(parsed.path).toBe("/src")
  })

  it("returns Grep tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Grep",
      tool_input: { pattern: "TODO.*fix", path: "/src", output_mode: "content", "-i": true },
    }
    const result = await runScript(makeScript("Grep"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.pattern).toBe("TODO.*fix")
    expect(parsed.output_mode).toBe("content")
    expect(parsed["-i"]).toBe(true)
  })

  it("returns WebFetch tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "WebFetch",
      tool_input: { url: "https://example.com", prompt: "Extract the API" },
    }
    const result = await runScript(makeScript("WebFetch"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.url).toBe("https://example.com")
    expect(parsed.prompt).toBe("Extract the API")
  })

  it("returns WebSearch tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "WebSearch",
      tool_input: { query: "react hooks", allowed_domains: ["reactjs.org"] },
    }
    const result = await runScript(makeScript("WebSearch"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.query).toBe("react hooks")
    expect(parsed.allowed_domains).toEqual(["reactjs.org"])
  })

  it("returns Agent tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Agent",
      tool_input: { prompt: "Find API endpoints", subagent_type: "Explore" },
    }
    const result = await runScript(makeScript("Agent"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.prompt).toBe("Find API endpoints")
    expect(parsed.subagent_type).toBe("Explore")
  })

  it("returns AskUserQuestion tool_input when tool_name matches", async () => {
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "AskUserQuestion",
      tool_input: {
        questions: [{ question: "Which framework?", header: "Framework", options: [{ label: "React" }] }],
      },
    }
    const result = await runScript(makeScript("AskUserQuestion"), JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.questions[0].question).toBe("Which framework?")
    expect(parsed.questions[0].options[0].label).toBe("React")
  })

  it("returns null when tool_name does not match", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      const handler = new HookHandler('PreToolUse');
      const input = handler.parseInput();
      const toolInput = handler.getToolInput('Edit', input);
      process.stdout.write(JSON.stringify({ result: toolInput }));
      handler.exit("success");
    `
    const input = {
      ...buildInput("PreToolUse"),
      tool_name: "Bash",
      tool_input: { command: "echo test" },
    }
    const result = await runScript(script, JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.result).toBe(null)
  })

  it("works with PostToolUse event", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      const handler = new HookHandler('PostToolUse');
      const input = handler.parseInput();
      const toolInput = handler.getToolInput('Bash', input);
      process.stdout.write(JSON.stringify(toolInput));
      handler.exit("success");
    `
    const input = {
      ...buildInput("PostToolUse"),
      tool_name: "Bash",
      tool_input: { command: "ls -la" },
    }
    const result = await runScript(script, JSON.stringify(input))

    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.command).toBe("ls -la")
  })
})
