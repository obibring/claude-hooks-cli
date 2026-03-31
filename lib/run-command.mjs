import { spawn } from "node:child_process"

/**
 * Runs a shell command with data on stdin.
 * @param {string} command - Shell command string
 * @param {string} stdinData - Data to pipe to stdin
 * @param {object} [options]
 * @param {Record<string, string>} [options.env] - Additional environment variables
 * @param {number} [options.timeout] - Timeout in ms
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
