# Programmatic API Implementation Plan

> **For agentic workers:** REQUIRED: Use
> superpowers:subagent-driven-development (if subagents available) or
> superpowers:executing-plans to implement this plan. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose every CLI capability as importable programmatic
functions so consumers can
`import { claudeHooks } from "@obibring/claude-hooks-cli"` and perform
add/remove/list/test/docs/scaffold operations without any interactive
prompts or CLI parsing.

**Architecture:** Extract the business logic from each CLI flow module
into pure, non-interactive functions in a new `lib/api.mjs` file. The
CLI flows (`add-hook.mjs`, `remove-hook.mjs`, etc.) become thin
wrappers that call the API functions and add `@clack/prompts`
interactivity. A single facade object (`claudeHooks`) re-exports all
API functions grouped by domain. Also export `command-resolver.mjs`,
`hook-metadata.mjs`, and `docs-map.mjs` which are currently CLI-only.

**Tech Stack:** JavaScript (ESM/mjs), Zod v4 validation, JSDoc types,
vitest for testing

---

## Gap Analysis: What's Exported vs. What's CLI-Only

### Already exported (no changes needed)

- `getSettingsPath`, `readSettings`, `writeSettings` (via
  `./settings`)
- `getHooksObject`, `addHook`, `removeHook`, `listHooks` (via
  `./store`)
- `getHooks`, `saveHook`, `deleteHook` (via `./manager`)
- `HookHandler` class (via `./handler`)
- All Zod schemas (via `./schemas`, `./hooks`)

### CLI-only today (need to expose)

| Module                     | Functions                                                                 | What blocks programmatic use                                                                                  |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `lib/add-hook.mjs`         | `addHookFlow()`                                                           | Uses `@clack/prompts` for all interaction; non-interactive path partially works but still calls `clack.log.*` |
| `lib/remove-hook.mjs`      | `removeHookFlow()`                                                        | Uses `@clack/prompts` for selection and confirmation                                                          |
| `lib/list-hooks.mjs`       | `listHooksFlow()`                                                         | Uses `clack.log.*` for display                                                                                |
| `lib/test-hook.mjs`        | `testHookFlow()`, `buildSyntheticInput()`, `runCommand()`                 | Interactive hook selection; `buildSyntheticInput` and `runCommand` are pure but unexported                    |
| `lib/command-resolver.mjs` | `resolveCommand()`, `parseCommandAsFile()`, `createCommandFile()`         | Already pure functions - just not re-exported from index                                                      |
| `lib/hook-metadata.mjs`    | `HOOK_METADATA`, `getHookMeta()`, `HOOK_EVENT_NAMES`, `HANDLER_TYPE_INFO` | Already pure - just not re-exported from index                                                                |
| `lib/docs-map.mjs`         | `HOOK_DOCS_MAP`                                                           | Already pure - just not re-exported from index                                                                |

## Design Decisions

1. **New file `lib/api.mjs`** - contains all programmatic API
   functions. No `@clack/prompts` dependency.
2. **Facade object** - `claudeHooks` groups everything logically
   (e.g., `claudeHooks.add()`, `claudeHooks.test()`, etc.)
3. **`addHook` programmatic function** - takes a plain options object
   (event, type, command/prompt/url, matcher, timeout, etc.) and
   returns the config entry + saves to disk. No prompts. Validates
   with Zod.
4. **`testHook` programmatic function** - takes an event name + hook
   entry (or scope + event + index) and returns
   `{ exitCode, stdout, stderr }`. No prompts.
5. **Type declarations** - add `lib/api-types.d.mts` for precise TS
   types, following the HookHandler Dual-File Rule pattern.
6. **New export paths** - `./api` for the facade, `./metadata` for
   hook metadata, `./commands` for command-resolver, `./docs` for
   docs-map.

## Chunk 1: Extract Pure Functions and New Exports

### Task 1: Export hook-metadata, command-resolver, and docs-map

These three modules are already pure (no `@clack/prompts` dependency)
but aren't exported from `package.json` or `index.mjs`. This is the
simplest win.

**Files:**

- Modify: `package.json` (add export paths)
- Modify: `index.mjs` (add re-exports)

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/exports.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("package exports", () => {
  it("exports hook metadata from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HOOK_METADATA).toBeDefined()
    expect(Array.isArray(mod.HOOK_METADATA)).toBe(true)
    expect(mod.HOOK_METADATA.length).toBe(26)
    expect(mod.getHookMeta).toBeTypeOf("function")
    expect(mod.HOOK_EVENT_NAMES).toBeDefined()
    expect(mod.HANDLER_TYPE_INFO).toBeDefined()
  })

  it("exports command resolver from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.resolveCommand).toBeTypeOf("function")
    expect(mod.parseCommandAsFile).toBeTypeOf("function")
    expect(mod.createCommandFile).toBeTypeOf("function")
  })

  it("exports docs map from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.HOOK_DOCS_MAP).toBeDefined()
    expect(typeof mod.HOOK_DOCS_MAP).toBe("object")
    expect(mod.HOOK_DOCS_MAP["PreToolUse"]).toBeTypeOf("string")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/exports.test.ts` Expected: FAIL -
properties not found on module

- [ ] **Step 3: Add re-exports to index.mjs**

Add to `index.mjs` after the existing hooks-manager re-export:

```js
// Re-export hook metadata for programmatic use
export {
  HOOK_METADATA,
  getHookMeta,
  HOOK_EVENT_NAMES,
  HANDLER_TYPE_INFO,
} from "./lib/hook-metadata.mjs"

// Re-export command resolver utilities
export {
  resolveCommand,
  parseCommandAsFile,
  createCommandFile,
} from "./lib/command-resolver.mjs"

// Re-export documentation map
export { HOOK_DOCS_MAP } from "./lib/docs-map.mjs"
```

- [ ] **Step 4: Add export paths to package.json**

Add these entries to the `"exports"` field in `package.json`:

```json
"./metadata": {
  "import": {
    "types": "./dist/lib/hook-metadata.d.mts",
    "default": "./lib/hook-metadata.mjs"
  }
},
"./commands": {
  "import": {
    "types": "./dist/lib/command-resolver.d.mts",
    "default": "./lib/command-resolver.mjs"
  }
},
"./docs": {
  "import": {
    "types": "./dist/lib/docs-map.d.mts",
    "default": "./lib/docs-map.mjs"
  }
}
```

Also add to `"files"` array:

```json
"lib/hook-metadata.mjs",
"lib/command-resolver.mjs",
"lib/docs-map.mjs"
```

(Note: `lib/**/*.mjs` is already in files, so these are already
included - but explicit entries make intent clear. Check if the glob
already covers it and skip if redundant.)

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test -- __tests__/api/exports.test.ts` Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add __tests__/api/exports.test.ts index.mjs package.json
git commit -m "feat: export hook-metadata, command-resolver, and docs-map from package root"
```

---

### Task 2: Extract `buildSyntheticInput` from test-hook.mjs

The `buildSyntheticInput` function in `test-hook.mjs` is pure logic
with no `@clack/prompts` dependency, but it's not exported. Extract it
so the programmatic API can use it.

**Files:**

- Create: `lib/synthetic-input.mjs`
- Modify: `lib/test-hook.mjs` (import from new module instead of
  inline)

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/synthetic-input.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("buildSyntheticInput", () => {
  it("builds base input with hook_event_name", async () => {
    const { buildSyntheticInput } =
      await import("../../lib/synthetic-input.mjs")
    const input = buildSyntheticInput("SessionStart")
    expect(input.hook_event_name).toBe("SessionStart")
    expect(input.session_id).toBeTypeOf("string")
    expect(input.cwd).toBeTypeOf("string")
    expect(input.permission_mode).toBe("default")
  })

  it("includes tool fields for PreToolUse", async () => {
    const { buildSyntheticInput } =
      await import("../../lib/synthetic-input.mjs")
    const input = buildSyntheticInput("PreToolUse")
    expect(input.tool_name).toBe("Bash")
    expect(input.tool_input).toEqual({ command: "echo test" })
    expect(input.tool_use_id).toBe("test-tu-1")
  })

  it("includes prompt field for UserPromptSubmit", async () => {
    const { buildSyntheticInput } =
      await import("../../lib/synthetic-input.mjs")
    const input = buildSyntheticInput("UserPromptSubmit")
    expect(input.prompt).toBe("test prompt")
  })

  it("allows overriding fields", async () => {
    const { buildSyntheticInput } =
      await import("../../lib/synthetic-input.mjs")
    const input = buildSyntheticInput("PreToolUse", {
      tool_name: "Write",
      cwd: "/my/project",
    })
    expect(input.tool_name).toBe("Write")
    expect(input.cwd).toBe("/my/project")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/synthetic-input.test.ts` Expected:
FAIL - module not found

- [ ] **Step 3: Create lib/synthetic-input.mjs**

Move the `buildSyntheticInput` function from `lib/test-hook.mjs` into
`lib/synthetic-input.mjs`. Add an optional `overrides` parameter for
programmatic use:

```js
/**
 * Builds a minimal synthetic input object for testing hooks.
 * Pure function — no I/O, no prompts.
 *
 * @param {string} eventName - Hook event name
 * @param {Record<string, unknown>} [overrides] - Override any field in the synthetic input
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

  // (same extras map as currently in test-hook.mjs)
  const extras = {
    PreToolUse: {
      tool_name: "Bash",
      tool_input: { command: "echo test" },
      tool_use_id: "test-tu-1",
    },
    // ... all 26 events, same as current test-hook.mjs lines 103-202
  }

  return { ...base, ...(extras[eventName] || {}), ...overrides }
}
```

- [ ] **Step 4: Update test-hook.mjs to import from
      synthetic-input.mjs**

Replace the inline `buildSyntheticInput` in `lib/test-hook.mjs` with:

```js
import { buildSyntheticInput } from "./synthetic-input.mjs"
```

Remove the `buildSyntheticInput` function body and the `getHookMeta`
import (if no longer used).

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test -- __tests__/api/synthetic-input.test.ts` Expected:
PASS

- [ ] **Step 6: Run existing tests to verify no regression**

Run: `bun run test` Expected: All existing tests pass

- [ ] **Step 7: Commit**

```bash
git add lib/synthetic-input.mjs lib/test-hook.mjs __tests__/api/synthetic-input.test.ts
git commit -m "refactor: extract buildSyntheticInput into lib/synthetic-input.mjs"
```

---

### Task 3: Extract `runCommand` from test-hook.mjs

The `runCommand` function spawns a shell command with JSON on stdin.
Extract it so the programmatic test API can reuse it.

**Files:**

- Create: `lib/run-command.mjs`
- Modify: `lib/test-hook.mjs` (import from new module)

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/run-command.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("runCommand", () => {
  it("runs a command and captures output", async () => {
    const { runCommand } = await import("../../lib/run-command.mjs")
    const result = await runCommand('echo "hello"', '{"test": true}')
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("hello")
  })

  it("captures non-zero exit codes", async () => {
    const { runCommand } = await import("../../lib/run-command.mjs")
    const result = await runCommand("exit 2", "")
    expect(result.exitCode).toBe(2)
  })

  it("pipes stdin data to the command", async () => {
    const { runCommand } = await import("../../lib/run-command.mjs")
    const result = await runCommand("cat", '{"foo":"bar"}')
    expect(result.exitCode).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({ foo: "bar" })
  })

  it("accepts custom environment variables", async () => {
    const { runCommand } = await import("../../lib/run-command.mjs")
    const result = await runCommand("echo $MY_VAR", "", {
      env: { MY_VAR: "hello" },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("hello")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/run-command.test.ts` Expected:
FAIL - module not found

- [ ] **Step 3: Create lib/run-command.mjs**

Extract and enhance the `runCommand` function from
`lib/test-hook.mjs`:

```js
import { spawn } from "node:child_process"

/**
 * Runs a shell command with data on stdin.
 * Pure function — no prompts, no interactive I/O.
 *
 * @param {string} command - Shell command string
 * @param {string} stdinData - Data to pipe to stdin
 * @param {object} [options]
 * @param {Record<string, string>} [options.env] - Additional environment variables
 * @param {number} [options.timeout] - Timeout in ms (default: 10000)
 * @param {string} [options.cwd] - Working directory
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
export function runCommand(command, stdinData, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: options.cwd,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: options.cwd || process.cwd(),
        ...options.env,
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

    if (options.timeout) {
      setTimeout(() => {
        child.kill("SIGTERM")
      }, options.timeout)
    }

    child.stdin.write(stdinData)
    child.stdin.end()
  })
}
```

- [ ] **Step 4: Update test-hook.mjs to import from run-command.mjs**

Replace the inline `runCommand` function in `lib/test-hook.mjs` with:

```js
import { runCommand } from "./run-command.mjs"
```

Remove the `spawn` import and the `runCommand` function body.

- [ ] **Step 5: Run all tests to verify no regression**

Run: `bun run test` Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add lib/run-command.mjs lib/test-hook.mjs __tests__/api/run-command.test.ts
git commit -m "refactor: extract runCommand into lib/run-command.mjs"
```

---

## Chunk 2: Build the Programmatic API

### Task 4: Create `lib/api.mjs` with `addHookConfig` function

This is the core of the programmatic API. A non-interactive function
that takes explicit options and produces a validated hook config
entry, then optionally saves it.

**Files:**

- Create: `lib/api.mjs`
- Test: `__tests__/api/add-hook-config.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/add-hook-config.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("addHookConfig", () => {
  it("builds a command handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: 'echo "hello"',
    })
    expect(result.eventName).toBe("PreToolUse")
    expect(result.configEntry.hooks[0].type).toBe("command")
    expect(result.configEntry.hooks[0].command).toBe('echo "hello"')
  })

  it("builds a prompt handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "Stop",
      type: "prompt",
      prompt: "Should Claude stop?",
      model: "claude-haiku-4-5-20251001",
    })
    expect(result.eventName).toBe("Stop")
    expect(result.configEntry.hooks[0].type).toBe("prompt")
    expect(result.configEntry.hooks[0].prompt).toContain(
      "Should Claude stop?",
    )
  })

  it("builds an http handler config entry", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PostToolUse",
      type: "http",
      url: "https://example.com/webhook",
      headers: { Authorization: "Bearer $TOKEN" },
      allowedEnvVars: ["TOKEN"],
    })
    expect(result.configEntry.hooks[0].type).toBe("http")
    expect(result.configEntry.hooks[0].url).toBe(
      "https://example.com/webhook",
    )
    expect(result.configEntry.hooks[0].headers.Authorization).toBe(
      "Bearer $TOKEN",
    )
  })

  it("includes matcher when provided", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "my-script.sh",
      matcher: "Bash",
    })
    expect(result.configEntry.matcher).toBe("Bash")
  })

  it("includes optional fields", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    const result = addHookConfig({
      event: "PreToolUse",
      type: "command",
      command: "my-script.sh",
      timeout: 10000,
      async: true,
      statusMessage: "Checking...",
      if: "Bash(git *)",
    })
    const handler = result.configEntry.hooks[0]
    expect(handler.timeout).toBe(10000)
    expect(handler.async).toBe(true)
    expect(handler.statusMessage).toBe("Checking...")
    expect(handler.if).toBe("Bash(git *)")
  })

  it("throws on unknown event name", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({
        event: "FakeEvent",
        type: "command",
        command: "echo",
      }),
    ).toThrow(/unknown hook event/i)
  })

  it("throws when command handler is missing command", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({ event: "PreToolUse", type: "command" }),
    ).toThrow(/command.*required/i)
  })

  it("throws when FileChanged is missing required matcher", async () => {
    const { addHookConfig } = await import("../../lib/api.mjs")
    expect(() =>
      addHookConfig({
        event: "FileChanged",
        type: "command",
        command: "echo",
      }),
    ).toThrow(/matcher.*required/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/add-hook-config.test.ts` Expected:
FAIL - module not found

- [ ] **Step 3: Create lib/api.mjs with addHookConfig**

```js
/**
 * Programmatic API for claude-hooks-cli.
 * No interactive prompts — all functions take explicit options and return results.
 */

import {
  getHookMeta,
  HOOK_METADATA,
  HOOK_EVENT_NAMES,
  HANDLER_TYPE_INFO,
} from "./hook-metadata.mjs"
import { resolveCommand } from "./command-resolver.mjs"

/**
 * @typedef {object} AddHookOptions
 * @property {string} event - Hook event name (e.g. "PreToolUse")
 * @property {"command" | "prompt" | "agent" | "http"} type - Handler type
 * @property {string} [command] - Command string (required for type: "command")
 * @property {string} [prompt] - Prompt string (required for type: "prompt" | "agent")
 * @property {string} [url] - URL string (required for type: "http")
 * @property {string} [matcher] - Matcher pattern
 * @property {number} [timeout] - Timeout in ms
 * @property {boolean} [async] - Run asynchronously
 * @property {boolean} [asyncRewake] - Async with rewake on failure
 * @property {boolean} [once] - Fire once per session
 * @property {string} [statusMessage] - Spinner status message
 * @property {string} [if] - Conditional execution rule
 * @property {string} [model] - Model for prompt handlers
 * @property {Record<string, string>} [headers] - HTTP headers (http type only)
 * @property {string[]} [allowedEnvVars] - Allowed env vars for header interpolation (http type only)
 * @property {boolean} [autoPromptSuffix] - Append JSON response instructions to prompt (default: true)
 */

/**
 * @typedef {object} AddHookResult
 * @property {string} eventName
 * @property {{ matcher?: string, hooks: Array<Record<string, unknown>> }} configEntry
 */

const PROMPT_HOOK_SUFFIX =
  '\n\nRespond with JSON: {"ok": true} to allow stopping, or {"ok": false, "reason": "your explanation"} to continue working.'

/**
 * Builds a validated hook config entry from explicit options.
 * Does NOT write to disk — use with `saveHook()` to persist.
 *
 * @param {AddHookOptions} options
 * @returns {AddHookResult}
 * @throws {Error} on invalid options
 */
export function addHookConfig(options) {
  const { event, type } = options

  // Validate event name
  const meta = getHookMeta(event)
  if (!meta) {
    throw new Error(
      `Unknown hook event: "${event}". Valid events: ${HOOK_EVENT_NAMES.join(", ")}`,
    )
  }

  // Validate handler type
  if (!meta.handlerTypes.includes(type)) {
    throw new Error(
      `Handler type "${type}" is not supported for ${event}. Supported: ${meta.handlerTypes.join(", ")}`,
    )
  }

  // Validate required primary field
  const handlerInfo = HANDLER_TYPE_INFO[type]
  const primaryField = handlerInfo.requiredFields[0]
  const primaryValue =
    primaryField === "command"
      ? options.command
      : primaryField === "url"
        ? options.url
        : options.prompt

  if (!primaryValue) {
    throw new Error(
      `${primaryField} is required for handler type "${type}"`,
    )
  }

  // Validate required matcher (FileChanged)
  if (meta.matcherRequired && !options.matcher) {
    throw new Error(
      `Matcher is required for ${event} (${meta.matcherDescription})`,
    )
  }

  // Build handler object
  /** @type {Record<string, unknown>} */
  const handler = { type }

  if (type === "command") {
    handler.command = resolveCommand(primaryValue)
  } else if (type === "http") {
    handler.url = primaryValue
    if (options.headers) handler.headers = options.headers
    if (options.allowedEnvVars)
      handler.allowedEnvVars = options.allowedEnvVars
  } else if (type === "prompt") {
    let prompt = primaryValue
    if (options.autoPromptSuffix !== false) {
      prompt += PROMPT_HOOK_SUFFIX
    }
    handler.prompt = prompt
    if (options.model) handler.model = options.model
  } else {
    // agent
    handler.prompt = primaryValue
  }

  // Apply optional fields
  if (options.timeout !== undefined) handler.timeout = options.timeout
  if (options.async !== undefined) handler.async = options.async
  if (options.asyncRewake !== undefined)
    handler.asyncRewake = options.asyncRewake
  if (options.once !== undefined && meta.supportsOnce)
    handler.once = options.once
  if (options.statusMessage)
    handler.statusMessage = options.statusMessage
  if (options.if && meta.supportsIf) handler.if = options.if

  // Build config entry
  /** @type {Record<string, unknown>} */
  const configEntry = {}
  if (options.matcher) {
    configEntry.matcher = options.matcher
  }
  configEntry.hooks = [handler]

  return { eventName: event, configEntry }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/add-hook-config.test.ts` Expected:
PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/add-hook-config.test.ts
git commit -m "feat: add addHookConfig() programmatic API function"
```

---

### Task 5: Add `testHook` programmatic function to `lib/api.mjs`

Non-interactive hook testing: spawn a command handler with synthetic
or custom input, return result.

**Files:**

- Modify: `lib/api.mjs`
- Test: `__tests__/api/test-hook.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/test-hook.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("testHook", () => {
  it("runs a command handler and returns result", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: {
        type: "command",
        command: 'echo \'{"additionalContext":"hi"}\'',
      },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("additionalContext")
  })

  it("pipes synthetic input to stdin", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "cat" },
    })
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.hook_event_name).toBe("PreToolUse")
    expect(parsed.tool_name).toBe("Bash")
  })

  it("uses custom input when provided", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "PreToolUse",
      handler: { type: "command", command: "cat" },
      input: { hook_event_name: "PreToolUse", custom: true },
    })
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.custom).toBe(true)
  })

  it("skips non-command handlers", async () => {
    const { testHook } = await import("../../lib/api.mjs")
    const result = await testHook({
      event: "Stop",
      handler: { type: "prompt", prompt: "Should stop?" },
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toMatch(/command/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/test-hook.test.ts` Expected: FAIL

- [ ] **Step 3: Add testHook to lib/api.mjs**

Add below `addHookConfig`:

```js
import { buildSyntheticInput } from "./synthetic-input.mjs"
import { runCommand } from "./run-command.mjs"

/**
 * @typedef {object} TestHookOptions
 * @property {string} event - Hook event name
 * @property {Record<string, unknown>} handler - Handler object (from configEntry.hooks[n])
 * @property {Record<string, unknown>} [input] - Custom input (overrides synthetic)
 * @property {Record<string, string>} [env] - Additional env vars
 * @property {number} [timeout] - Timeout in ms
 */

/**
 * @typedef {object} TestHookResult
 * @property {number} exitCode
 * @property {string} stdout
 * @property {string} stderr
 * @property {boolean} [skipped]
 * @property {string} [reason]
 */

/**
 * Tests a single hook handler by running it with synthetic or custom input.
 * Only command handlers can be tested locally.
 *
 * @param {TestHookOptions} options
 * @returns {Promise<TestHookResult>}
 */
export async function testHook(options) {
  const { event, handler, input, env, timeout } = options

  if (handler.type !== "command") {
    return {
      exitCode: -1,
      stdout: "",
      stderr: "",
      skipped: true,
      reason: `Only command handlers can be tested locally (got: ${handler.type})`,
    }
  }

  const syntheticInput = input || buildSyntheticInput(event)
  const result = await runCommand(
    /** @type {string} */ (handler.command),
    JSON.stringify(syntheticInput),
    { env, timeout },
  )

  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/test-hook.test.ts` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/test-hook.test.ts
git commit -m "feat: add testHook() programmatic API function"
```

---

### Task 6: Add `getDocs` and `listHookEntries` to `lib/api.mjs`

Programmatic wrappers for docs lookup and structured hook listing (not
formatted for terminal).

**Files:**

- Modify: `lib/api.mjs`
- Test: `__tests__/api/docs-and-list.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/docs-and-list.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { writeFileSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("getDocs", () => {
  it("returns markdown docs for a valid event", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("PreToolUse")
    expect(docs).toContain("# PreToolUse")
    expect(docs).toContain("tool_name")
  })

  it("returns null for unknown event", async () => {
    const { getDocs } = await import("../../lib/api.mjs")
    const docs = getDocs("FakeEvent")
    expect(docs).toBeNull()
  })

  it("lists all available event names", async () => {
    const { getAvailableDocs } = await import("../../lib/api.mjs")
    const names = getAvailableDocs()
    expect(names).toContain("PreToolUse")
    expect(names).toContain("Stop")
    expect(names.length).toBe(26)
  })
})

describe("listHookEntries", () => {
  it("returns structured hook entries for a scope", async () => {
    const { listHookEntries } = await import("../../lib/api.mjs")
    // This reads from disk - uses whatever is in project settings.
    // We test the shape, not specific content.
    const result = await listHookEntries("project")
    expect(result).toHaveProperty("filePath")
    expect(Array.isArray(result.hooks)).toBe(true)
    for (const hook of result.hooks) {
      expect(hook).toHaveProperty("eventName")
      expect(hook).toHaveProperty("index")
      expect(hook).toHaveProperty("entry")
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/docs-and-list.test.ts` Expected:
FAIL

- [ ] **Step 3: Add getDocs, getAvailableDocs, and listHookEntries to
      lib/api.mjs**

```js
import { HOOK_DOCS_MAP } from "./docs-map.mjs"
import { getHooks } from "./hooks-manager.mjs"

/**
 * Returns the markdown documentation for a hook event.
 *
 * @param {string} eventName
 * @returns {string | null}
 */
export function getDocs(eventName) {
  return HOOK_DOCS_MAP[eventName] || null
}

/**
 * Returns an array of all event names that have documentation.
 *
 * @returns {string[]}
 */
export function getAvailableDocs() {
  return Object.keys(HOOK_DOCS_MAP)
}

/**
 * Returns all hook entries for a given scope as structured data.
 * This is the programmatic equivalent of `claude-hooks list`.
 *
 * @param {"user" | "project" | "local"} scope
 * @returns {Promise<{ filePath: string, hooks: Array<{ eventName: string, index: number, entry: object }> }>}
 */
export async function listHookEntries(scope) {
  return getHooks(scope)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/docs-and-list.test.ts` Expected:
PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/docs-and-list.test.ts
git commit -m "feat: add getDocs(), getAvailableDocs(), listHookEntries() to programmatic API"
```

---

### Task 7: Add `installHook` and `uninstallHook` to `lib/api.mjs`

Convenience wrappers that combine `addHookConfig` + `saveHook` and
`deleteHook` into single calls.

**Files:**

- Modify: `lib/api.mjs`
- Test: `__tests__/api/install-uninstall.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/install-uninstall.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { execSync } from "node:child_process"

describe("installHook / uninstallHook", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cch-test-${Date.now()}`)
    mkdirSync(join(tempDir, ".claude"), { recursive: true })
    writeFileSync(
      join(tempDir, ".claude", "settings.json"),
      JSON.stringify({}, null, 2),
    )
    // Initialize a git repo so getSettingsPath("project") resolves correctly
    execSync("git init", { cwd: tempDir })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("installs a hook and reads it back", async () => {
    const { installHook, listHookEntries } =
      await import("../../lib/api.mjs")
    const { getSettingsPath } =
      await import("../../lib/settings-io.mjs")

    // Use direct file path instead of scope to avoid git root detection
    const filePath = join(tempDir, ".claude", "settings.json")
    const result = await installHook(
      {
        event: "PreToolUse",
        type: "command",
        command: 'echo "test"',
        matcher: "Bash",
      },
      { filePath },
    )

    expect(result.filePath).toBe(filePath)
    expect(result.eventName).toBe("PreToolUse")

    // Verify it was written
    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe(
      'echo "test"',
    )
  })

  it("uninstalls a hook by event and index", async () => {
    const { installHook, uninstallHook } =
      await import("../../lib/api.mjs")

    const filePath = join(tempDir, ".claude", "settings.json")

    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 1" },
      { filePath },
    )
    await installHook(
      { event: "PreToolUse", type: "command", command: "echo 2" },
      { filePath },
    )

    const result = await uninstallHook("PreToolUse", 0, { filePath })
    expect(result.removed).toBe(true)

    const settings = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(settings.hooks.PreToolUse).toHaveLength(1)
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe(
      'echo "2"',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/install-uninstall.test.ts`
Expected: FAIL

- [ ] **Step 3: Add installHook and uninstallHook to lib/api.mjs**

```js
import { readSettings, writeSettings } from "./settings-io.mjs"
import {
  addHook as addHookToStore,
  removeHook as removeHookFromStore,
} from "./hooks-store.mjs"
import { saveHook, deleteHook } from "./hooks-manager.mjs"

/**
 * @typedef {object} PersistTarget
 * @property {string} [filePath] - Direct path to settings file (overrides scope)
 * @property {"user" | "project" | "local"} [scope] - Settings scope (default: "project")
 */

/**
 * Builds a hook config and saves it to a settings file in one call.
 * Combines addHookConfig() + saveHook().
 *
 * @param {AddHookOptions} options - Hook configuration options
 * @param {PersistTarget} [target] - Where to save (filePath or scope)
 * @returns {Promise<{ filePath: string, eventName: string, configEntry: object }>}
 */
export async function installHook(options, target = {}) {
  const { eventName, configEntry } = addHookConfig(options)

  if (target.filePath) {
    const settings = await readSettings(target.filePath)
    addHookToStore(settings, eventName, configEntry)
    await writeSettings(target.filePath, settings)
    return { filePath: target.filePath, eventName, configEntry }
  }

  const scope = target.scope || "project"
  const { filePath } = await saveHook(scope, eventName, configEntry)
  return { filePath, eventName, configEntry }
}

/**
 * Removes a hook from a settings file by event name and index.
 *
 * @param {string} eventName
 * @param {number} index
 * @param {PersistTarget} [target]
 * @returns {Promise<{ filePath: string, removed: boolean }>}
 */
export async function uninstallHook(eventName, index, target = {}) {
  if (target.filePath) {
    const settings = await readSettings(target.filePath)
    const removed = removeHookFromStore(settings, eventName, index)
    if (removed) {
      await writeSettings(target.filePath, settings)
    }
    return { filePath: target.filePath, removed }
  }

  const scope = target.scope || "project"
  return deleteHook(scope, eventName, index)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/install-uninstall.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/install-uninstall.test.ts
git commit -m "feat: add installHook() and uninstallHook() programmatic API functions"
```

---

### Task 8: Add `scaffoldHookFile` to `lib/api.mjs`

Programmatic file creation for hook scripts (what `--create` does in
the CLI).

**Files:**

- Modify: `lib/api.mjs`
- Test: `__tests__/api/scaffold.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/scaffold.test.ts`:

```ts
import { describe, it, expect, afterEach } from "vitest"
import { existsSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("scaffoldHookFile", () => {
  const files: string[] = []

  afterEach(() => {
    for (const f of files) {
      if (existsSync(f)) rmSync(f, { force: true })
    }
    files.length = 0
  })

  it("creates a TypeScript hook file with HookHandler template", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.ts`)
    files.push(filePath)

    const result = await scaffoldHookFile({
      event: "PreToolUse",
      filePath,
    })

    expect(result.created).toBe(true)
    expect(result.runnerCommand).toContain("npx")
    expect(result.runnerCommand).toContain("tsx")
    expect(existsSync(filePath)).toBe(true)

    const content = readFileSync(filePath, "utf-8")
    expect(content).toContain("HookHandler")
    expect(content).toContain("PreToolUse")
  })

  it("creates a JavaScript hook file", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.mjs`)
    files.push(filePath)

    const result = await scaffoldHookFile({
      event: "PostToolUse",
      filePath,
    })

    expect(result.created).toBe(true)
    expect(result.runnerCommand).toContain("node")
  })

  it("returns created: false if file already exists", async () => {
    const { scaffoldHookFile } = await import("../../lib/api.mjs")
    const filePath = join(tmpdir(), `test-hook-${Date.now()}.ts`)
    files.push(filePath)

    // Create first
    await scaffoldHookFile({ event: "PreToolUse", filePath })
    // Try again
    const result = await scaffoldHookFile({
      event: "PreToolUse",
      filePath,
    })
    expect(result.created).toBe(false)
    expect(result.runnerCommand).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/scaffold.test.ts` Expected: FAIL

- [ ] **Step 3: Add scaffoldHookFile to lib/api.mjs**

```js
import { existsSync } from "node:fs"
import { extname } from "node:path"
import {
  createCommandFile,
  parseCommandAsFile,
} from "./command-resolver.mjs"

/**
 * @typedef {object} ScaffoldOptions
 * @property {string} event - Hook event name (for template generation)
 * @property {string} filePath - Absolute path for the hook file
 * @property {boolean} [overwrite] - Overwrite existing file (default: false)
 */

/**
 * Creates a hook script file with a starter template.
 * The template uses HookHandler with the correct event name.
 *
 * @param {ScaffoldOptions} options
 * @returns {Promise<{ created: boolean, filePath: string, runnerCommand: string }>}
 */
export async function scaffoldHookFile(options) {
  const { event, filePath, overwrite = false } = options

  const parsed = parseCommandAsFile(filePath)
  if ("error" in parsed) {
    throw new Error(parsed.error)
  }

  const { resolved, ext, runnerCommand } = parsed

  if (existsSync(resolved) && !overwrite) {
    return { created: false, filePath: resolved, runnerCommand }
  }

  await createCommandFile(resolved, ext)
  return { created: true, filePath: resolved, runnerCommand }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/scaffold.test.ts` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/scaffold.test.ts
git commit -m "feat: add scaffoldHookFile() programmatic API function"
```

---

## Chunk 3: Facade, Exports, and Type Declarations

### Task 9: Create the `claudeHooks` facade object

A single importable object that groups all API functions by domain.

**Files:**

- Modify: `lib/api.mjs`
- Test: `__tests__/api/facade.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/facade.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("claudeHooks facade", () => {
  it("exposes all API methods", async () => {
    const { claudeHooks } = await import("../../lib/api.mjs")

    // Hook management
    expect(claudeHooks.addHookConfig).toBeTypeOf("function")
    expect(claudeHooks.install).toBeTypeOf("function")
    expect(claudeHooks.uninstall).toBeTypeOf("function")
    expect(claudeHooks.list).toBeTypeOf("function")

    // Testing
    expect(claudeHooks.test).toBeTypeOf("function")
    expect(claudeHooks.buildSyntheticInput).toBeTypeOf("function")

    // Docs
    expect(claudeHooks.getDocs).toBeTypeOf("function")
    expect(claudeHooks.getAvailableDocs).toBeTypeOf("function")

    // Scaffolding
    expect(claudeHooks.scaffold).toBeTypeOf("function")

    // Metadata
    expect(claudeHooks.metadata).toBeDefined()
    expect(claudeHooks.metadata.events).toBeDefined()
    expect(claudeHooks.metadata.getEvent).toBeTypeOf("function")
    expect(claudeHooks.metadata.eventNames).toBeDefined()
    expect(claudeHooks.metadata.handlerTypes).toBeDefined()

    // Settings I/O (re-exported for convenience)
    expect(claudeHooks.settings.getPath).toBeTypeOf("function")
    expect(claudeHooks.settings.read).toBeTypeOf("function")
    expect(claudeHooks.settings.write).toBeTypeOf("function")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/facade.test.ts` Expected: FAIL

- [ ] **Step 3: Add the facade to lib/api.mjs**

Add at the bottom of `lib/api.mjs`:

```js
import {
  getSettingsPath,
  readSettings,
  writeSettings,
} from "./settings-io.mjs"
import {
  HANDLER_TYPE_INFO,
  HOOK_METADATA,
  HOOK_EVENT_NAMES,
} from "./hook-metadata.mjs"

/**
 * Facade object grouping all programmatic API functions.
 * Import as: `import { claudeHooks } from "@obibring/claude-hooks-cli/api"`
 */
export const claudeHooks = {
  // Hook management
  addHookConfig,
  install: installHook,
  uninstall: uninstallHook,
  list: listHookEntries,

  // Testing
  test: testHook,
  buildSyntheticInput,

  // Docs
  getDocs,
  getAvailableDocs,

  // Scaffolding
  scaffold: scaffoldHookFile,

  // Metadata (read-only)
  metadata: {
    events: HOOK_METADATA,
    getEvent: getHookMeta,
    eventNames: HOOK_EVENT_NAMES,
    handlerTypes: HANDLER_TYPE_INFO,
  },

  // Settings I/O
  settings: {
    getPath: getSettingsPath,
    read: readSettings,
    write: writeSettings,
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- __tests__/api/facade.test.ts` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api.mjs __tests__/api/facade.test.ts
git commit -m "feat: add claudeHooks facade object"
```

---

### Task 10: Wire up exports in package.json and index.mjs

Add the `./api` export path and re-export from root.

**Files:**

- Modify: `package.json`
- Modify: `index.mjs`

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/package-exports.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("package root exports", () => {
  it("exports claudeHooks from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.claudeHooks).toBeDefined()
    expect(mod.claudeHooks.install).toBeTypeOf("function")
  })

  it("exports all API functions individually from root", async () => {
    const mod = await import("../../index.mjs")
    expect(mod.addHookConfig).toBeTypeOf("function")
    expect(mod.installHook).toBeTypeOf("function")
    expect(mod.uninstallHook).toBeTypeOf("function")
    expect(mod.listHookEntries).toBeTypeOf("function")
    expect(mod.testHook).toBeTypeOf("function")
    expect(mod.getDocs).toBeTypeOf("function")
    expect(mod.getAvailableDocs).toBeTypeOf("function")
    expect(mod.scaffoldHookFile).toBeTypeOf("function")
    expect(mod.buildSyntheticInput).toBeTypeOf("function")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __tests__/api/package-exports.test.ts` Expected:
FAIL

- [ ] **Step 3: Add exports to index.mjs**

Add to `index.mjs`:

```js
// Re-export programmatic API
export {
  claudeHooks,
  addHookConfig,
  installHook,
  uninstallHook,
  listHookEntries,
  testHook,
  getDocs,
  getAvailableDocs,
  scaffoldHookFile,
} from "./lib/api.mjs"

// Re-export buildSyntheticInput for test utilities
export { buildSyntheticInput } from "./lib/synthetic-input.mjs"
```

- [ ] **Step 4: Add export path to package.json**

Add to `"exports"`:

```json
"./api": {
  "import": {
    "types": "./dist/lib/api.d.mts",
    "default": "./lib/api.mjs"
  }
}
```

Add `"lib/api.mjs"` and `"lib/synthetic-input.mjs"` and
`"lib/run-command.mjs"` to `"files"` array (if not already covered by
`"lib/**/*.mjs"` glob — check and skip if redundant).

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test -- __tests__/api/package-exports.test.ts` Expected:
PASS

- [ ] **Step 6: Run all tests**

Run: `bun run test` Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add index.mjs package.json __tests__/api/package-exports.test.ts
git commit -m "feat: export programmatic API from package root and ./api path"
```

---

### Task 11: Add TypeScript declarations for the API

Following the project's HookHandler Dual-File Rule pattern, create
type declarations for the API.

**Files:**

- Create: `lib/api-types.d.mts`
- Create: `lib/api.d.mts`

- [ ] **Step 1: Create lib/api-types.d.mts**

```ts
import type { HookMeta, HandlerType } from "./hook-metadata.mjs"
import type { HookEntry } from "./hooks-store.mjs"
import type { SettingsScope } from "./settings-io.mjs"

export interface AddHookOptions {
  event: string
  type: "command" | "prompt" | "agent" | "http"
  command?: string
  prompt?: string
  url?: string
  matcher?: string
  timeout?: number
  async?: boolean
  asyncRewake?: boolean
  once?: boolean
  statusMessage?: string
  if?: string
  model?: string
  headers?: Record<string, string>
  allowedEnvVars?: string[]
  autoPromptSuffix?: boolean
}

export interface AddHookResult {
  eventName: string
  configEntry: {
    matcher?: string
    hooks: Array<Record<string, unknown>>
  }
}

export interface PersistTarget {
  filePath?: string
  scope?: SettingsScope
}

export interface InstallHookResult {
  filePath: string
  eventName: string
  configEntry: object
}

export interface UninstallHookResult {
  filePath: string
  removed: boolean
}

export interface TestHookOptions {
  event: string
  handler: Record<string, unknown>
  input?: Record<string, unknown>
  env?: Record<string, string>
  timeout?: number
}

export interface TestHookResult {
  exitCode: number
  stdout: string
  stderr: string
  skipped?: boolean
  reason?: string
}

export interface ScaffoldOptions {
  event: string
  filePath: string
  overwrite?: boolean
}

export interface ScaffoldResult {
  created: boolean
  filePath: string
  runnerCommand: string
}

export interface ClaudeHooksMetadata {
  events: HookMeta[]
  getEvent: (name: string) => HookMeta | undefined
  eventNames: string[]
  handlerTypes: Record<
    string,
    { label: string; description: string; requiredFields: string[] }
  >
}

export interface ClaudeHooksSettings {
  getPath: (scope: SettingsScope) => string
  read: (filePath: string) => Promise<Record<string, unknown>>
  write: (
    filePath: string,
    settings: Record<string, unknown>,
  ) => Promise<void>
}

export interface ClaudeHooks {
  addHookConfig: (options: AddHookOptions) => AddHookResult
  install: (
    options: AddHookOptions,
    target?: PersistTarget,
  ) => Promise<InstallHookResult>
  uninstall: (
    eventName: string,
    index: number,
    target?: PersistTarget,
  ) => Promise<UninstallHookResult>
  list: (
    scope: SettingsScope,
  ) => Promise<{ filePath: string; hooks: HookEntry[] }>

  test: (options: TestHookOptions) => Promise<TestHookResult>
  buildSyntheticInput: (
    eventName: string,
    overrides?: Record<string, unknown>,
  ) => Record<string, unknown>

  getDocs: (eventName: string) => string | null
  getAvailableDocs: () => string[]

  scaffold: (options: ScaffoldOptions) => Promise<ScaffoldResult>

  metadata: ClaudeHooksMetadata
  settings: ClaudeHooksSettings
}
```

- [ ] **Step 2: Create lib/api.d.mts**

```ts
export type {
  AddHookOptions,
  AddHookResult,
  PersistTarget,
  InstallHookResult,
  UninstallHookResult,
  TestHookOptions,
  TestHookResult,
  ScaffoldOptions,
  ScaffoldResult,
  ClaudeHooks,
  ClaudeHooksMetadata,
  ClaudeHooksSettings,
} from "./api-types.d.mts"

export declare function addHookConfig(
  options: import("./api-types.d.mts").AddHookOptions,
): import("./api-types.d.mts").AddHookResult
export declare function installHook(
  options: import("./api-types.d.mts").AddHookOptions,
  target?: import("./api-types.d.mts").PersistTarget,
): Promise<import("./api-types.d.mts").InstallHookResult>
export declare function uninstallHook(
  eventName: string,
  index: number,
  target?: import("./api-types.d.mts").PersistTarget,
): Promise<import("./api-types.d.mts").UninstallHookResult>
export declare function listHookEntries(
  scope: import("./settings-io.mjs").SettingsScope,
): Promise<{
  filePath: string
  hooks: import("./hooks-store.mjs").HookEntry[]
}>
export declare function testHook(
  options: import("./api-types.d.mts").TestHookOptions,
): Promise<import("./api-types.d.mts").TestHookResult>
export declare function getDocs(eventName: string): string | null
export declare function getAvailableDocs(): string[]
export declare function scaffoldHookFile(
  options: import("./api-types.d.mts").ScaffoldOptions,
): Promise<import("./api-types.d.mts").ScaffoldResult>

export declare const claudeHooks: import("./api-types.d.mts").ClaudeHooks
```

- [ ] **Step 3: Update build script in package.json**

Add copy commands for the new declaration files to the `"build"`
script:

```
cp lib/api-types.d.mts dist/lib/api-types.d.mts && cp lib/api.d.mts dist/lib/api.d.mts
```

- [ ] **Step 4: Run build to verify types compile**

Run: `bun run build` Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add lib/api-types.d.mts lib/api.d.mts package.json
git commit -m "feat: add TypeScript declarations for programmatic API"
```

---

### Task 12: Run full test suite and lint

Final verification that everything works together.

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `bun run test` Expected: All tests pass (both existing handler
tests and new API tests)

- [ ] **Step 2: Run lint**

Run: `bun run lint` Expected: Clean or auto-fixed

- [ ] **Step 3: Run build**

Run: `bun run build` Expected: No errors, dist/ updated with all new
.d.mts files

- [ ] **Step 4: Verify the API works end-to-end**

Create a quick smoke test script (don't commit):

```js
// /tmp/smoke.mjs
import { claudeHooks } from "./index.mjs"

// List available events
console.log("Events:", claudeHooks.metadata.eventNames.length)

// Build a config
const config = claudeHooks.addHookConfig({
  event: "PreToolUse",
  type: "command",
  command: 'echo "hello"',
  matcher: "Bash",
})
console.log("Config:", JSON.stringify(config, null, 2))

// Get docs
const docs = claudeHooks.getDocs("PreToolUse")
console.log("Docs available:", !!docs)

// Build synthetic input
const input = claudeHooks.buildSyntheticInput("PreToolUse")
console.log("Synthetic input:", JSON.stringify(input, null, 2))
```

Run: `node /tmp/smoke.mjs` Expected: Clean output, no errors

- [ ] **Step 5: Final commit if any lint changes**

```bash
git add -A && git commit -m "chore: lint fixes"
```

---

## Summary of New Files

| File                      | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `lib/api.mjs`             | All programmatic API functions + `claudeHooks` facade |
| `lib/api-types.d.mts`     | TypeScript type declarations for API                  |
| `lib/api.d.mts`           | Re-export declarations                                |
| `lib/synthetic-input.mjs` | Extracted `buildSyntheticInput` (from test-hook.mjs)  |
| `lib/run-command.mjs`     | Extracted `runCommand` (from test-hook.mjs)           |
| `__tests__/api/*.test.ts` | Tests for all new API functions                       |

## Summary of Modified Files

| File                | Change                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `index.mjs`         | Add re-exports for API, metadata, command-resolver, docs-map              |
| `package.json`      | Add `./api`, `./metadata`, `./commands`, `./docs` export paths            |
| `lib/test-hook.mjs` | Import from `synthetic-input.mjs` and `run-command.mjs` instead of inline |

## Consumer Usage After Implementation

```js
// Full facade
import { claudeHooks } from "@obibring/claude-hooks-cli/api"

// Install a hook
await claudeHooks.install(
  {
    event: "PreToolUse",
    type: "command",
    command: "node ./hooks/check-bash.mjs",
    matcher: "Bash",
  },
  { scope: "project" },
)

// List hooks
const { hooks } = await claudeHooks.list("project")

// Test a hook
const result = await claudeHooks.test({
  event: "PreToolUse",
  handler: hooks[0].entry.hooks[0],
})

// Get docs
const docs = claudeHooks.getDocs("PreToolUse")

// Scaffold a new hook file
await claudeHooks.scaffold({
  event: "PostToolUse",
  filePath: "./hooks/post-tool.ts",
})

// Or import individual functions
import {
  installHook,
  testHook,
  getDocs,
  HOOK_METADATA,
  buildSyntheticInput,
} from "@obibring/claude-hooks-cli"
```
