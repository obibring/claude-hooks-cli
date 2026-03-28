import { existsSync } from "node:fs"
import { resolve, extname } from "node:path"

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
      // Unknown extension — assume executable
      return `"${resolved}"`
  }
}
