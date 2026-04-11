// @ts-check

/**
 * @param {string} [statusMessage = "Re-reading CLAUDE.md"] - The status message to use.
 * @returns {import("../../hooks/PostCompact.mjs").PostCompactConfig}
 */
export function rereadClaudeMdHook(statusMessage = "Re-reading CLAUDE.md") {
  return {
    hooks: [
      {
        type: "command",
        command: `echo "Re-read CLAUDE.md`,
        statusMessage,
      },
    ],
  }
}
