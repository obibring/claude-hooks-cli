import { existsSync } from "node:fs"
import { writeFile, mkdir } from "node:fs/promises"
import { resolve, extname, relative, dirname } from "node:path"

/**
 * Wraps a file path in the correct runtime invocation based on extension.
 * @param {string} ext - Lowercase file extension (e.g. ".ts")
 * @param {string} resolved - Absolute file path
 * @returns {string} Command string with appropriate runner
 */
function wrapWithRunner(ext, resolved) {
  switch (ext) {
    case ".ts":
    case ".tsx":
    case ".mts":
      return `npx tsx "${resolved}"`
    case ".js":
    case ".mjs":
    case ".cjs":
      return `node "${resolved}"`
    case ".py":
      return `python3 "${resolved}"`
    case ".sh":
    case ".bash":
      return `bash "${resolved}"`
    case ".zsh":
      return `zsh "${resolved}"`
    default:
      return `"${resolved}"`
  }
}

/**
 * If the user provides a bare file path as their command, wrap it in
 * the correct runtime invocation. Otherwise return the command as-is.
 *
 * @param {string} command - User-provided command string
 * @param {string} [cwd] - Working directory for resolving relative paths
 * @returns {string} Resolved command string
 */
export function resolveCommand(command, cwd = process.cwd()) {
  const trimmed = command.trim()

  // If it looks like a compound command (has spaces + flags, pipes, &&, etc.)
  // don't try to resolve it — return as-is
  if (/[|&;]/.test(trimmed)) {
    return trimmed
  }

  // Check if the entire string (possibly quoted) is a single file path
  const unquoted = trimmed.replace(/^["']|["']$/g, "")
  const resolved = resolve(cwd, unquoted)
  const ext = extname(resolved).toLowerCase()

  if (!existsSync(resolved)) {
    // Not a file path — return original command as-is
    return trimmed
  }

  return wrapWithRunner(ext, resolved)
}

/**
 * Parses a command string as a file path for --create mode.
 * Returns info needed to create the file, or an error.
 *
 * @param {string} command - User-provided command string
 * @param {string} [cwd] - Working directory for resolving relative paths
 * @returns {{ resolved: string, relativePath: string, ext: string, runnerCommand: string } | { error: string }}
 */
export function parseCommandAsFile(command, cwd = process.cwd()) {
  const trimmed = command.trim()
  const unquoted = trimmed.replace(/^["']|["']$/g, "")
  const resolved = resolve(cwd, unquoted)
  const ext = extname(resolved).toLowerCase()

  if (!ext) {
    return {
      error: "File path must have an extension (e.g. .ts, .js, .py, .sh)",
    }
  }

  const relativePath = relative(cwd, resolved)
  const runnerCommand = wrapWithRunner(ext, resolved)

  return { resolved, relativePath, ext, runnerCommand }
}

import { BASIC_FILE_TEMPLATES } from "./hook-templates.mjs"

/**
 * Creates a hook command file with a starter template.
 *
 * @param {string} resolved - Absolute file path
 * @param {string} ext - Lowercase file extension
 * @returns {Promise<void>}
 */
export async function createCommandFile(resolved, ext) {
  const dir = dirname(resolved)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  const template = BASIC_FILE_TEMPLATES[ext] || `# Hook script\n`
  await writeFile(resolved, template, "utf-8")
}
