// @ts-check

/**
 * @param {string} [formatter = "prettier --fix"] - The formatter to use.
 * @returns {import("../../hooks/PostToolUse.mjs").PostToolUseConfig}
 */
export function formatFileHook(formatter = "prettier --write") {
  return {
    matcher: "Edit|Write",
    hooks: [
      {
        type: "command",
        command: `jq -r '.tool_input.file_path' | xargs ${formatter}`,
        statusMessage: `Formatting file with "${formatter}"`,
      },
    ],
  }
}
