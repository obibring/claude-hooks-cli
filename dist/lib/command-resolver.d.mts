/**
 * If the user provides a bare file path as their command, wrap it in
 * the correct runtime invocation. Otherwise return the command as-is.
 *
 * @param {string} command - User-provided command string
 * @param {string} [cwd] - Working directory for resolving relative paths
 * @returns {string} Resolved command string
 */
export function resolveCommand(command: string, cwd?: string): string;
/**
 * Parses a command string as a file path for --create mode.
 * Returns info needed to create the file, or an error.
 *
 * @param {string} command - User-provided command string
 * @param {string} [cwd] - Working directory for resolving relative paths
 * @returns {{ resolved: string, relativePath: string, ext: string, runnerCommand: string } | { error: string }}
 */
export function parseCommandAsFile(command: string, cwd?: string): {
    resolved: string;
    relativePath: string;
    ext: string;
    runnerCommand: string;
} | {
    error: string;
};
/**
 * Creates a hook command file with a starter template.
 *
 * @param {string} resolved - Absolute file path
 * @param {string} ext - Lowercase file extension
 * @returns {Promise<void>}
 */
export function createCommandFile(resolved: string, ext: string): Promise<void>;
//# sourceMappingURL=command-resolver.d.mts.map