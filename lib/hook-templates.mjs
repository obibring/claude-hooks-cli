/**
 * Hook script file templates. Pure module — no Node.js APIs.
 * Used by the CLI's scaffolding and available to browser consumers
 * for generating hook file contents.
 */

/**
 * Templates that use the HookHandler class from this package.
 * These produce files with `import { HookHandler } from "@obibring/claude-hooks-cli/handler"`.
 * @type {Record<string, (event: string) => string>}
 */
export const HOOK_HANDLER_TEMPLATES = {
  ".ts": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
  ".tsx": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
`,
  ".mts": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
`,
  ".js": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
  ".mjs": (
    event,
  ) => `import { HookHandler } from "@obibring/claude-hooks-cli/handler"

const handler = HookHandler.for("${event}")
const input = handler.input

// Your hook logic here
// handler.approve()
// handler.reject("reason")
`,
}

/**
 * Basic starter templates for hook scripts (without HookHandler).
 * These produce files that read stdin directly.
 * @type {Record<string, string>}
 */
export const BASIC_FILE_TEMPLATES = {
  ".ts": `import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
// console.log(JSON.stringify({ additionalContext: "..." }))
`,
  ".tsx": `import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
`,
  ".mts": `import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
`,
  ".js": `import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
// console.log(JSON.stringify({ additionalContext: "..." }))
`,
  ".mjs": `import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
// console.log(JSON.stringify({ additionalContext: "..." }))
`,
  ".cjs": `const { readFileSync } = require("node:fs")

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"))

// Your hook logic here
// console.log(JSON.stringify({ additionalContext: "..." }))
`,
  ".py": `import sys
import json

input_data = json.load(sys.stdin)

# Your hook logic here
# print(json.dumps({"additionalContext": "..."}))
`,
  ".sh": `#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

# Your hook logic here
# echo '{"additionalContext": "..."}'
`,
  ".bash": `#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

# Your hook logic here
`,
  ".zsh": `#!/usr/bin/env zsh
set -euo pipefail

INPUT=$(cat)

# Your hook logic here
`,
}

/**
 * Generates a hook script file contents for the given event and extension.
 * Prefers the HookHandler template for JS/TS files, falls back to the basic template.
 *
 * @param {string} event - Hook event name (e.g. "PreToolUse")
 * @param {string} ext - File extension including dot (e.g. ".ts", ".mjs", ".py")
 * @returns {string | null} The file contents, or null if the extension is not supported
 */
export function generateHookScript(event, ext) {
  const handlerTemplate = HOOK_HANDLER_TEMPLATES[ext]
  if (handlerTemplate) return handlerTemplate(event)
  const basicTemplate = BASIC_FILE_TEMPLATES[ext]
  if (basicTemplate) return basicTemplate
  return null
}

/**
 * Returns all supported file extensions.
 * @returns {string[]}
 */
export function getSupportedExtensions() {
  return [
    ...new Set([
      ...Object.keys(HOOK_HANDLER_TEMPLATES),
      ...Object.keys(BASIC_FILE_TEMPLATES),
    ]),
  ]
}
